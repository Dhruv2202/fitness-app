"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import SubmitButton from "@/components/SubmitButton";
import { lookupMapsLinks, importPlaces } from "@/app/admin/actions";
import { PLACE_TYPES } from "@/lib/icons";

export default function BulkPlaces() {
  const [state, lookupAction, looking] = useActionState(lookupMapsLinks, {});
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (state?.places) {
      setRows(state.places.map((p) => ({ ...p, type: p.type ?? "Gym" })));
    }
  }, [state]);

  function update(index, field, value) {
    setRows((current) =>
      current.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  }

  function remove(index) {
    setRows((current) => current.filter((_, i) => i !== index));
  }

  return (
    <div className="px-4 pb-8 pt-6">
      <Link href="/admin" className="text-sm text-muted">
        ← Back to admin
      </Link>

      <h1 className="mt-2 text-xl font-bold text-ink">
        Add places from links
      </h1>
      <p className="mt-1 text-sm text-muted">
        Paste links, one per line — Google Maps share links, or the gyms' own
        websites. Maps gives the location, a website usually gives a photo.
        Up to 8 at a time.
      </p>

      <form action={lookupAction} className="mt-4 flex flex-col gap-2">
        <textarea
          name="urls"
          rows={7}
          placeholder={"https://maps.app.goo.gl/...\nhttps://maps.app.goo.gl/...\nhttps://www.google.com/maps/place/..."}
          className="w-full rounded-xl border border-line bg-surface px-3 py-2 font-mono text-xs text-ink outline-none placeholder:text-muted focus:border-brand"
        />
        <button
          type="submit"
          disabled={looking}
          className="press rounded-xl bg-ink py-2.5 text-sm font-semibold text-app disabled:opacity-60"
        >
          {looking ? "Looking up..." : "Look up all"}
        </button>
      </form>

      {state?.error && (
        <p className="mt-3 text-sm text-rose-500">{state.error}</p>
      )}

      {state?.failed?.length > 0 && (
        <div className="mt-3 rounded-xl border border-line bg-surface-2 p-3">
          <p className="text-xs font-semibold text-ink">
            Couldn't read {state.failed.length} link
            {state.failed.length === 1 ? "" : "s"}
          </p>
          {state.failed.map((link) => (
            <p key={link} className="mt-1 break-all text-xs text-muted">
              {link}
            </p>
          ))}
        </div>
      )}

      {state?.skipped > 0 && (
        <p className="mt-2 text-xs text-muted">
          {state.skipped} left out — run them in the next batch.
        </p>
      )}

      {rows.length > 0 && (
        <>
          <h2 className="mt-6 text-sm font-semibold text-ink">
            Check these, then add ({rows.length})
          </h2>
          <p className="mt-1 text-xs text-muted">
            Anything blank couldn&apos;t be found — type it in yourself.
          </p>

          <div className="mt-2 flex flex-col gap-3">
            {rows.map((row, i) => (
              <div
                key={i}
                className="rounded-2xl border border-line bg-surface p-3"
              >
                <div className="flex items-start gap-2">
                  {row.photo_url && (
                    <img
                      src={row.photo_url}
                      alt=""
                      className="h-10 w-10 shrink-0 rounded-lg object-cover"
                    />
                  )}
                  <input
                    value={row.name ?? ""}
                    onChange={(e) => update(i, "name", e.target.value)}
                    placeholder="Name"
                    className="flex-1 bg-transparent text-sm font-semibold text-ink outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    aria-label="Remove"
                    className="press h-6 w-6 shrink-0 rounded-full border border-line text-xs text-muted"
                  >
                    ✕
                  </button>
                </div>

                <select
                  value={row.type}
                  onChange={(e) => update(i, "type", e.target.value)}
                  className="mt-1 rounded-lg border border-line bg-surface px-2 py-1 text-xs text-ink outline-none"
                >
                  {PLACE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>

                <div className="mt-2 flex flex-col gap-1">
                  <input
                    value={row.area ?? ""}
                    onChange={(e) => update(i, "area", e.target.value)}
                    placeholder="Area"
                    className="bg-transparent text-xs text-muted outline-none"
                  />
                  <input
                    value={row.address ?? ""}
                    onChange={(e) => update(i, "address", e.target.value)}
                    placeholder="Address"
                    className="bg-transparent text-xs text-muted outline-none"
                  />
                  <input
                    value={row.phone ?? ""}
                    onChange={(e) => update(i, "phone", e.target.value)}
                    placeholder="Phone"
                    className="bg-transparent text-xs text-muted outline-none"
                  />
                  <input
                    value={row.timings ?? ""}
                    onChange={(e) => update(i, "timings", e.target.value)}
                    placeholder="Timings"
                    className="bg-transparent text-xs text-muted outline-none"
                  />
                </div>

                <p className="mt-2 text-[11px] text-muted">
                  {row.lat != null
                    ? `📍 ${row.lat.toFixed(5)}, ${row.lon.toFixed(5)}`
                    : "⚠️ No location — add coordinates before it can show in distance sorting"}
                  {row.matched ? " · details found" : ""}
                </p>
              </div>
            ))}
          </div>

          <form action={importPlaces} className="mt-4 flex flex-col">
            <input type="hidden" name="places" value={JSON.stringify(rows)} />
            <SubmitButton
              label={`Add ${rows.length} place${rows.length === 1 ? "" : "s"}`}
              pendingLabel="Adding..."
            />
          </form>
        </>
      )}
    </div>
  );
}
