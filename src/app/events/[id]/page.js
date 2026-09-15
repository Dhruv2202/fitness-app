import Link from "next/link";
import { notFound } from "next/navigation";
import RegisteredButton from "@/components/RegisteredButton";
import { createClient } from "@/lib/supabase/server";
import { getOptionalUser } from "@/lib/auth";
import { getEvent } from "@/lib/data";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const event = await getEvent(id);
  return { title: event?.name ?? "Event not found" };
}

export default async function EventDetailPage({ params }) {
  const { id } = await params;
  const event = await getEvent(id);

  if (!event) notFound();

  const user = await getOptionalUser();

  let initiallyRegistered = false;
  if (user) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("event_registrations")
      .select("id")
      .eq("user_id", user.id)
      .eq("event_id", event.id)
      .maybeSingle();
    initiallyRegistered = Boolean(data);
  }

  return (
    <div>
      {event.photo_url && (
        <img
          src={event.photo_url}
          alt={event.name}
          className="h-52 w-full object-cover"
        />
      )}

      <div className="p-4">
        <Link href="/events" className="block text-sm text-muted">
          ← Back to Events
        </Link>

        {event.type && (
          <span className="mt-3 inline-block rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-medium text-brand">
            {event.type}
          </span>
        )}
        <h1 className="mt-2 text-xl font-bold text-ink">{event.name}</h1>

        <p className="mt-3 text-sm text-muted">
          📅 {formatDate(event.event_date)}
        </p>
        {event.venue && (
          <p className="mt-1 text-sm text-muted">📍 {event.venue}</p>
        )}
        {event.organiser && (
          <p className="mt-1 text-sm text-muted">
            Organised by {event.organiser}
          </p>
        )}

        {event.description && (
          <p className="mt-4 text-sm leading-relaxed text-ink">
            {event.description}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3">
          {event.registration_url && (
            <a
              href={event.registration_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full rounded-full bg-brand py-2.5 text-center text-sm font-semibold text-brand-ink"
            >
              Register on organiser's site ↗
            </a>
          )}
          <RegisteredButton
            eventId={event.id}
            userId={user?.id ?? null}
            initiallyRegistered={initiallyRegistered}
          />
        </div>
      </div>
    </div>
  );
}
