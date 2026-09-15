import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { getUpcomingEvents } from "@/lib/data";

// Served from cache and refreshed in the background, so visits are instant.
// Admin edits refresh it immediately via revalidatePath.
export const revalidate = 300;

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function daysAway(dateStr) {
  const days = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days < 30) return `In ${days} days`;
  return null;
}

export default async function EventsPage() {
  const events = await getUpcomingEvents();

  return (
    <div className="px-4 pb-6 pt-5">
      <PageHeader
        title="Events"
        subtitle="Marathons, tournaments & wellness events"
      />

      <div className="mt-5 flex flex-col gap-3">
        {events.map((event) => {
          const soon = daysAway(event.event_date);
          return (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              className="press card-shadow block overflow-hidden rounded-2xl border border-line bg-surface"
            >
              {event.photo_url && (
                <img
                  src={event.photo_url}
                  alt={event.name}
                  className="h-40 w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              )}
              <div className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  {event.type && (
                    <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-[11px] font-semibold text-brand">
                      {event.type}
                    </span>
                  )}
                  {soon && (
                    <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-[11px] font-medium text-muted">
                      {soon}
                    </span>
                  )}
                </div>

                <h2 className="mt-2 font-semibold leading-snug text-ink">
                  {event.name}
                </h2>

                <p className="mt-1.5 text-sm text-muted">
                  📅 {formatDate(event.event_date)}
                </p>
                {event.venue && (
                  <p className="text-sm text-muted">📍 {event.venue}</p>
                )}
              </div>
            </Link>
          );
        })}

        {events.length === 0 && (
          <div className="mt-12 text-center">
            <span className="text-4xl">🏃</span>
            <p className="mt-3 font-semibold text-ink">No events listed yet</p>
            <p className="mt-1 text-sm text-muted">
              Upcoming marathons and tournaments will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
