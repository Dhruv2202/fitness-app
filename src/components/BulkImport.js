"use client";

import { useState } from "react";
import Link from "next/link";
import { parseCsv, rowsToPlaces, IMPORT_COLUMNS } from "@/lib/csv";
import { importPlaces } from "@/app/admin/actions";
import SubmitButton from "@/components/SubmitButton";

const TEMPLATE = `name,type,area,address,phone,fee,timings,rating,lat,lon,amenities,website
Gold's Gym Saket,Gym,Saket,"District Centre, Saket, New Delhi",+919810012345,₹2500/mo,"6:00 AM - 10:00 PM",4.5,28.5245,77.2066,"Parking, AC, Personal Training",https://example.com
Calm Yoga Studio,Yoga Studio,Dwarka,"Sector 12, Dwarka",+919810099999,₹1200/mo,"6:00 AM - 8:00 PM",,,,"Locker Rooms",`;

export default function BulkImport({ existingNames }) {
  const [places, setPlaces] = useState([]);
  const [errors, setErrors] = useState([]);
  const [touched, setTouched] = useState(false);

  const existing = new Set(existingNames.map((n) => n.toLowerCase()));

  function handleText(text) {
    setTouched(true);
    const result = rowsToPlaces(parseCsv(text));
    setPlaces(result.places);
    setErrors(result.errors);
  }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    handleText(await file.text());
  }

  function downloadTemplate() {
    const url = URL.createObjectURL(
      new Blob([TEMPLATE], { type: "text/csv" })
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "places-template.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  const duplicates = places.filter((p) => existing.has(p.name.toLowerCase()));
  const fresh = places.filter((p) => !existing.has(p.name.toLowerCase()));

  return (
    <div className="p-4">
      <Link href="/admin" className="text-sm text-muted">
        ← Back to admin
      </Link>

      <h1 className="mt-2 text-xl font-bold text-ink">
        Import from a spreadsheet
      </h1>
      <p className="mt-1 text-sm text-muted">
        Fill a spreadsheet, export it as CSV, then load it here. Only{" "}
        <strong>name</strong> is required — leave anything else blank.
      </p>

      <button
        onClick={downloadTemplate}
        className="mt-3 w-full rounded-xl border border-line py-2.5 text-sm font-semibold text-ink"
      >
        ⬇ Download template spreadsheet
      </button>

      <p className="mt-3 text-xs text-muted">
        Columns: {IMPORT_COLUMNS.join(", ")}
      </p>

      <label className="mt-4 block text-xs font-semibold text-ink">
        Choose your CSV file
      </label>
      <input
        type="file"
        accept=".csv,text/csv"
        onChange={handleFile}
        className="mt-1 w-full text-xs text-muted file:mr-3 file:rounded-full file:border-0 file:bg-surface-2 file:px-3 file:py-1.5 file:text-xs file:font-semibold"
      />

      <label className="mt-4 block text-xs font-semibold text-ink">
        ...or paste the rows here
      </label>
      <textarea
        rows={5}
        onChange={(e) => handleText(e.target.value)}
        placeholder="name,type,area..."
        className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 font-mono text-xs outline-none focus:border-brand"
      />

      {errors.length > 0 && (
        <div className="mt-3 rounded-xl bg-amber-50 p-3">
          {errors.map((error) => (
            <p key={error} className="text-xs text-amber-800">
              {error}
            </p>
          ))}
        </div>
      )}

      {touched && (
        <div className="mt-4">
          <h2 className="text-sm font-semibold text-ink">
            Ready to add: {fresh.length}
          </h2>

          {duplicates.length > 0 && (
            <p className="mt-1 text-xs text-amber-700">
              {duplicates.length} row(s) match a place you already have and will
              be skipped: {duplicates.map((d) => d.name).join(", ")}
            </p>
          )}

          <div className="mt-2 flex flex-col gap-2">
            {fresh.slice(0, 20).map((place, i) => (
              <div
                key={i}
                className="rounded-xl border border-line bg-surface p-2.5"
              >
                <p className="text-sm font-medium text-ink">
                  {place.name}
                </p>
                <p className="text-xs text-muted">
                  {place.type}
                  {place.area ? ` · ${place.area}` : ""}
                  {place.phone ? ` · ${place.phone}` : ""}
                  {place.fee ? ` · ${place.fee}` : ""}
                  {place.website ? " · 🌐" : ""}
                </p>
              </div>
            ))}
            {fresh.length > 20 && (
              <p className="text-xs text-muted">
                ...and {fresh.length - 20} more
              </p>
            )}
          </div>

          {fresh.length > 0 && (
            <form action={importPlaces} className="mt-4 flex flex-col">
              <input
                type="hidden"
                name="places"
                value={JSON.stringify(fresh)}
              />
              <SubmitButton
                label={`Add ${fresh.length} place${fresh.length === 1 ? "" : "s"}`}
                pendingLabel="Importing..."
              />
            </form>
          )}
        </div>
      )}
    </div>
  );
}
