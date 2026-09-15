import Link from "next/link";
import PhotoUpload from "@/components/PhotoUpload";
import { savePlace, deletePlace } from "@/app/admin/actions";
import { PLACE_TYPES } from "@/lib/icons";

const inputClass =
  "mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500";

function Field({ label, name, defaultValue, type = "text", placeholder }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-neutral-700">{label}</span>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className={inputClass}
      />
    </label>
  );
}

export default function PlaceForm({ place }) {
  return (
    <div className="p-4">
      <Link href="/admin" className="text-sm text-neutral-500">
        ← Back to admin
      </Link>

      <h1 className="mt-2 text-xl font-bold text-neutral-900">
        {place ? "Edit place" : "Add a place"}
      </h1>

      <form action={savePlace} className="mt-4 flex flex-col gap-3">
        {place && <input type="hidden" name="id" value={place.id} />}

        <Field label="Name *" name="name" defaultValue={place?.name} />

        <label className="block">
          <span className="text-xs font-semibold text-neutral-700">Type</span>
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

        <PhotoUpload name="photo_url" initialUrl={place?.photo_url} />

        <Field
          label="Area"
          name="area"
          defaultValue={place?.area}
          placeholder="e.g. Saket"
        />
        <Field label="Address" name="address" defaultValue={place?.address} />
        <Field
          label="Phone"
          name="phone"
          defaultValue={place?.phone}
          placeholder="+919810012345"
        />
        <Field
          label="Membership fee"
          name="fee"
          defaultValue={place?.fee}
          placeholder="₹2,000/mo"
        />
        <Field
          label="Timings"
          name="timings"
          defaultValue={place?.timings}
          placeholder="6:00 AM – 10:00 PM, all days"
        />
        <Field
          label="Rating (0–5)"
          name="rating"
          type="number"
          defaultValue={place?.rating}
          placeholder="4.5"
        />
        <Field
          label="Amenities (comma separated)"
          name="amenities"
          defaultValue={place?.amenities?.join(", ")}
          placeholder="Parking, AC, Locker Rooms"
        />

        <div className="flex gap-3">
          <Field
            label="Latitude"
            name="lat"
            defaultValue={place?.lat}
            placeholder="28.6315"
          />
          <Field
            label="Longitude"
            name="lon"
            defaultValue={place?.lon}
            placeholder="77.2167"
          />
        </div>
        <p className="text-xs text-neutral-400">
          Coordinates power the &quot;nearest me&quot; sorting. Find them by
          right-clicking the spot in Google Maps and copying the numbers.
        </p>

        <button
          type="submit"
          className="mt-2 rounded-full bg-emerald-600 py-2.5 text-sm font-semibold text-white"
        >
          {place ? "Save changes" : "Add place"}
        </button>
      </form>

      {place && (
        <form action={deletePlace} className="mt-3">
          <input type="hidden" name="id" value={place.id} />
          <button
            type="submit"
            className="w-full rounded-full border border-rose-300 py-2.5 text-sm font-semibold text-rose-600"
          >
            Delete this place
          </button>
        </form>
      )}
    </div>
  );
}
