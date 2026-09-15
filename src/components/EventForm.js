import Link from "next/link";
import PhotoUpload from "@/components/PhotoUpload";
import SubmitButton from "@/components/SubmitButton";
import DeleteButton from "@/components/DeleteButton";
import { saveEvent, deleteEvent } from "@/app/admin/actions";

const inputClass =
  "mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand";

function Field({ label, name, defaultValue, type = "text", placeholder }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-ink">{label}</span>
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
      <Link href="/admin" className="text-sm text-muted">
        ← Back to admin
      </Link>

      <h1 className="mt-2 text-xl font-bold text-ink">
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
          <span className="text-xs font-semibold text-ink">
            Description
          </span>
          <textarea
            name="description"
            defaultValue={event?.description ?? ""}
            rows={4}
            className={inputClass}
          />
        </label>

        <SubmitButton
          label={event ? "Save changes" : "Add event"}
          pendingLabel={event ? "Saving..." : "Adding..."}
        />
      </form>

      {event && (
        <form action={deleteEvent} className="mt-3">
          <input type="hidden" name="id" value={event.id} />
          <DeleteButton
            label="Delete this event"
            confirmText={`Delete "${event.name}"? This cannot be undone.`}
          />
        </form>
      )}
    </div>
  );
}
