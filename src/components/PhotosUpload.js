"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/compressImage";

const MAX = 8;

export default function PhotosUpload({ name, initialPhotos = [] }) {
  const [photos, setPhotos] = useState(initialPhotos.filter(Boolean));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [pasted, setPasted] = useState("");

  async function handleFiles(event) {
    const files = [...(event.target.files ?? [])];
    if (!files.length) return;

    setError("");
    setBusy(true);

    const supabase = createClient();
    const added = [];

    for (const file of files.slice(0, MAX - photos.length)) {
      try {
        const compressed = await compressImage(file);
        const isJpeg = compressed !== file;
        const path = `${crypto.randomUUID()}.${isJpeg ? "jpg" : file.name.split(".").pop()}`;

        const { error: uploadError } = await supabase.storage
          .from("photos")
          .upload(path, compressed, {
            upsert: false,
            contentType: isJpeg ? "image/jpeg" : file.type,
          });

        if (uploadError) {
          setError(uploadError.message);
          continue;
        }

        const { data } = supabase.storage.from("photos").getPublicUrl(path);
        added.push(data.publicUrl);
      } catch (e) {
        setError(e.message);
      }
    }

    setPhotos((current) => [...current, ...added].slice(0, MAX));
    setBusy(false);
    event.target.value = "";
  }

  function addPasted() {
    const url = pasted.trim();
    if (!url) return;
    setPhotos((current) =>
      current.includes(url) ? current : [...current, url].slice(0, MAX)
    );
    setPasted("");
  }

  const move = (from, to) =>
    setPhotos((current) => {
      if (to < 0 || to >= current.length) return current;
      const next = [...current];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });

  return (
    <div>
      <label className="text-xs font-semibold text-ink">
        Photos ({photos.length}/{MAX})
      </label>
      <p className="mt-0.5 text-xs text-muted">
        The first one is the cover. The card shows them as a slideshow.
      </p>

      {photos.length > 0 && (
        <div className="mt-2 flex flex-col gap-2">
          {photos.map((url, i) => (
            <div
              key={url}
              className="flex items-center gap-2 rounded-xl border border-line bg-surface p-2"
            >
              <img
                src={url}
                alt=""
                className="h-14 w-20 shrink-0 rounded-lg object-cover"
              />
              <span className="min-w-0 flex-1 truncate text-[11px] text-muted">
                {i === 0 ? "Cover · " : ""}
                {url.split("/").pop()}
              </span>
              <button
                type="button"
                onClick={() => move(i, i - 1)}
                disabled={i === 0}
                aria-label="Move up"
                className="press rounded-lg border border-line px-2 py-1 text-xs text-ink disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => setPhotos(photos.filter((p) => p !== url))}
                aria-label="Remove"
                className="press rounded-lg border border-line px-2 py-1 text-xs text-rose-500"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        disabled={busy || photos.length >= MAX}
        className="mt-2 w-full text-xs text-muted file:mr-3 file:rounded-full file:border-0 file:bg-surface-2 file:px-3 file:py-1.5 file:text-xs file:font-semibold"
      />

      <div className="mt-2 flex gap-2">
        <input
          type="text"
          value={pasted}
          onChange={(e) => setPasted(e.target.value)}
          placeholder="...or paste an image link"
          className="min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 py-2 text-xs text-ink outline-none placeholder:text-muted focus:border-brand"
        />
        <button
          type="button"
          onClick={addPasted}
          className="press rounded-xl border border-line px-3 py-2 text-xs font-semibold text-ink"
        >
          Add
        </button>
      </div>

      {busy && <p className="mt-1 text-xs text-muted">Uploading...</p>}
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}

      <input type="hidden" name={name} value={JSON.stringify(photos)} />
      {/* Kept in step so the list query's cover image keeps working. */}
      <input type="hidden" name="photo_url" value={photos[0] ?? ""} />
    </div>
  );
}
