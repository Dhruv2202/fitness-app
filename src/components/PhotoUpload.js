"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/compressImage";

export default function PhotoUpload({ name, initialUrl }) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);

    const compressed = await compressImage(file);
    const isJpeg = compressed !== file;

    const supabase = createClient();
    const extension = isJpeg ? "jpg" : file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("photos")
      .upload(path, compressed, {
        upsert: false,
        contentType: isJpeg ? "image/jpeg" : file.type,
      });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("photos").getPublicUrl(path);

    setUrl(publicUrl);
    setUploading(false);
  }

  return (
    <div>
      <label className="text-xs font-semibold text-neutral-700">Photo</label>

      {url && (
        <img
          src={url}
          alt="Preview"
          className="mt-1 h-32 w-full rounded-xl object-cover"
        />
      )}

      <input
        type="file"
        accept="image/*"
        onChange={handleFile}
        disabled={uploading}
        className="mt-2 w-full text-xs text-neutral-600 file:mr-3 file:rounded-full file:border-0 file:bg-neutral-200 file:px-3 file:py-1.5 file:text-xs file:font-semibold"
      />

      {uploading && (
        <p className="mt-1 text-xs text-neutral-500">Uploading...</p>
      )}
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}

      <input type="hidden" name={name} value={url} />
    </div>
  );
}
