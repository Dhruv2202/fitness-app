import Link from "next/link";
import { getUpcomingEvents } from "@/lib/data";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function EventsPage() {
  const events = await getUpcomingEvents();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-neutral-900">Events</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Marathons, tournaments & wellness events
      </p>

      <div className="mt-4 flex flex-col gap-4">
        {events.map((event) => (
          <Link
            key={event.id}
            href={`/events/${event.id}`}
            className="block overflow-hidden rounded-2xl border border-neutral-200 bg-white"
          >
            {event.photo_url && (
              <img
                src={event.photo_url}
                alt={event.name}
                className="h-40 w-full object-cover"
              />
            )}
            <div className="p-4">
              {event.type && (
                <span className="inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                  {event.type}
                </span>
              )}
              <h2 className="mt-2 font-semibold text-neutral-900">
                {event.name}
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                📅 {formatDate(event.event_date)}
              </p>
              {event.venue && (
                <p className="text-sm text-neutral-500">📍 {event.venue}</p>
              )}
              {event.organiser && (
                <p className="mt-1 text-xs text-neutral-400">
                  Organised by {event.organiser}
                </p>
              )}
            </div>
          </Link>
        ))}

        {events.length === 0 && (
          <p className="mt-6 text-center text-sm text-neutral-400">
            No upcoming events listed yet.
          </p>
        )}
      </div>
    </div>
  );
}
