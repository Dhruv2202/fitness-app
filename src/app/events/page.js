import Link from "next/link";
import { sampleEvents } from "@/data/sampleData";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function EventsPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-neutral-900">Events</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Marathons, tournaments & wellness events
      </p>

      <div className="mt-4 flex flex-col gap-3">
        {sampleEvents.map((event) => (
          <Link
            key={event.id}
            href={`/events/${event.id}`}
            className="block rounded-2xl border border-neutral-200 bg-white p-4"
          >
            <span className="inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
              {event.type}
            </span>
            <h2 className="mt-2 font-semibold text-neutral-900">
              {event.name}
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              📅 {formatDate(event.date)}
            </p>
            <p className="text-sm text-neutral-500">📍 {event.venue}</p>
            <p className="mt-1 text-xs text-neutral-400">
              Organised by {event.organiser}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
