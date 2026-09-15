import Link from "next/link";
import PhotoUpload from "@/components/PhotoUpload";
import { saveEvent, deleteEvent } from "@/app/admin/actions";

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

export default function EventForm({ event }) {
  return (
    <div className="p-4">
      <Link href="/admin" className="text-sm text-neutral-500">
        ← Back to admin
      </Link>

      <h1 className="mt-2 text-xl font-bold text-neutral-900">
        {event ? "Edit event" : "Add an event"}
      </h1>

      <form action={saveEvent} className="mt-4 flex flex-col gap-3">
        {event && <input type="hidden" name="id" value={event.id} />}

        <Field label="Name *" name="name" defaultValue={event?.name} />
        <Field
          label="Date *"
          name="event_date"
          type="date"
          defaultValue={event?.event_date}
        />

        <PhotoUpload name="photo_url" initialUrl={event?.photo_url} />

        <Field
          label="Type"
          name="type"
          defaultValue={event?.type}
          placeholder="Marathon / Tournament / Wellness"
        />
        <Field label="Venue" name="venue" defaultValue={event?.venue} />
        <Field
          label="Organiser"
          name="organiser"
          defaultValue={event?.organiser}
        />
        <Field
          label="Registration link"
          name="registration_url"
          defaultValue={event?.registration_url}
          placeholder="https://..."
        />

        <label className="block">
          <span className="text-xs font-semibold text-neutral-700">
            Description
          </span>
          <textarea
            name="description"
            defaultValue={event?.description ?? ""}
            rows={4}
            className={inputClass}
          />
        </label>

        <button
          type="submit"
          className="mt-2 rounded-full bg-emerald-600 py-2.5 text-sm font-semibold text-white"
        >
          {event ? "Save changes" : "Add event"}
        </button>
      </form>

      {event && (
        <form action={deleteEvent} className="mt-3">
          <input type="hidden" name="id" value={event.id} />
          <button
            type="submit"
            className="w-full rounded-full border border-rose-300 py-2.5 text-sm font-semibold text-rose-600"
          >
            Delete this event
          </button>
        </form>
      )}
    </div>
  );
}
