"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import PhotoUpload from "@/components/PhotoUpload";
import SubmitButton from "@/components/SubmitButton";
import DeleteButton from "@/components/DeleteButton";
import { savePlace, deletePlace, lookupMapsLink } from "@/app/admin/actions";
import { PLACE_TYPES } from "@/lib/icons";

const inputClass =
  "mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-muted focus:border-brand";

function Field({ label, name, value, onChange, type = "text", placeholder }) {
  return (
    <label className="block flex-1">
      <span className="text-xs font-semibold text-ink">{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClass}
      />
    </label>
  );
}

export default function PlaceForm({ place }) {
  const [name, setName] = useState(place?.name ?? "");
  const [area, setArea] = useState(place?.area ?? "");
  const [address, setAddress] = useState(place?.address ?? "");
  const [phone, setPhone] = useState(place?.phone ?? "");
  const [fee, setFee] = useState(place?.fee ?? "");
  const [timings, setTimings] = useState(place?.timings ?? "");
  const [rating, setRating] = useState(place?.rating ?? "");
  const [amenities, setAmenities] = useState(
    place?.amenities?.join(", ") ?? ""
  );
  const [lat, setLat] = useState(place?.lat ?? "");
  const [lon, setLon] = useState(place?.lon ?? "");
  const [photoUrl, setPhotoUrl] = useState(place?.photo_url ?? "");

  const [state, lookupAction, looking] = useActionState(lookupMapsLink, {});

  // Fill in everything the lookup managed to find. Existing values are kept,
  // so running this on a record you've already edited never wipes your work.
  useEffect(() => {
    const found = state?.place;
    if (!found) return;

    const fillIfEmpty = (setter, value) => {
      if (value === null || value === undefined || value === "") return;
      setter((current) => current || String(value));
    };

    fillIfEmpty(setName, found.name);
    fillIfEmpty(setArea, found.area);
    fillIfEmpty(setAddress, found.address);
    fillIfEmpty(setPhone, found.phone);
    fillIfEmpty(setTimings, found.timings);
    fillIfEmpty(setLat, found.lat);
    fillIfEmpty(setLon, found.lon);
    if (found.photo_url) setPhotoUrl(found.photo_url);
  }, [state]);

  return (
    <div className="px-4 pb-8 pt-6">
      <Link href="/admin" className="text-sm text-muted">
        ← Back to admin
      </Link>

      <h1 className="mt-2 text-xl font-bold text-ink">
        {place ? "Edit place" : "Add a place"}
      </h1>

      <form
        action={lookupAction}
        className="card-shadow mt-4 rounded-2xl border border-line bg-surface p-3"
      >
        <label className="block text-xs font-semibold text-ink">
          Paste a link
        </label>
        <p className="mt-0.5 text-xs text-muted">
          A Google Maps share link gives the location. The gym's own website
          usually gives a photo, and sometimes the address and phone.
        </p>
        <input
          type="text"
          name="maps_url"
          placeholder="Maps link or the gym's website"
          className={inputClass}
        />
        <button
          type="submit"
          disabled={looking}
          className="press mt-2 w-full rounded-xl bg-ink py-2 text-sm font-semibold text-app disabled:opacity-60"
        >
          {looking ? "Reading link..." : "Get location"}
        </button>
        {state?.error && (
          <p className="mt-2 text-xs text-rose-500">{state.error}</p>
        )}
        {state?.place && !state.error && (
          <p className="mt-2 text-xs text-brand">
            {state.filled?.length
              ? `Found: ${state.filled
                  .map((f) => (f === "photo_url" ? "photo" : f))
                  .join(", ")}. Check below.`
              : "Found the location only — everything else needs typing in."}
          </p>
        )}
      </form>

      <form action={savePlace} className="mt-4 flex flex-col gap-3">
        {place && <input type="hidden" name="id" value={place.id} />}

        <Field label="Name *" name="name" value={name} onChange={setName} />

        <label className="block">
          <span className="text-xs font-semibold text-ink">Type</span>
          <select
            name="type"
            defaultValue={place?.type ?? "Gym"}
            className={inputClass}
          >
            {PLACE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <PhotoUpload key={photoUrl} name="photo_url" initialUrl={photoUrl} />

        <Field
          label="Area"
          name="area"
          value={area}
          onChange={setArea}
          placeholder="e.g. Saket"
        />
        <Field
          label="Address"
          name="address"
          value={address}
          onChange={setAddress}
        />
        <Field
          label="Phone"
          name="phone"
          value={phone}
          onChange={setPhone}
          placeholder="+919810012345"
        />
        <Field
          label="Membership fee"
          name="fee"
          value={fee}
          onChange={setFee}
          placeholder="₹2,000/mo"
        />
        <Field
          label="Timings"
          name="timings"
          value={timings}
          onChange={setTimings}
          placeholder="6:00 AM – 10:00 PM, all days"
        />
        <Field
          label="Rating (0–5)"
          name="rating"
          value={rating}
          onChange={setRating}
          placeholder="4.5"
        />
        <Field
          label="Amenities (comma separated)"
          name="amenities"
          value={amenities}
          onChange={setAmenities}
          placeholder="Parking, AC, Locker Rooms"
        />

        <div className="flex gap-3">
          <Field label="Latitude" name="lat" value={lat} onChange={setLat} />
          <Field label="Longitude" name="lon" value={lon} onChange={setLon} />
        </div>

        <SubmitButton
          label={place ? "Save changes" : "Add place"}
          pendingLabel={place ? "Saving..." : "Adding..."}
        />
      </form>

      {place && (
        <form action={deletePlace} className="mt-3">
          <input type="hidden" name="id" value={place.id} />
          <DeleteButton
            label="Delete this place"
            confirmText={`Delete "${place.name}"? This cannot be undone.`}
          />
        </form>
      )}
    </div>
  );
}
