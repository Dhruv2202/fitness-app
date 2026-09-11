import Link from "next/link";
import { sampleEvents } from "@/data/sampleData";
import RegisteredButton from "@/components/RegisteredButton";
import { createClient } from "@/lib/supabase/server";

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
  const event = sampleEvents.find((e) => String(e.id) === id);
  return { title: event?.name ?? "Event not found" };
}

export default async function EventDetailPage({ params }) {
  const { id } = await params;
  const event = sampleEvents.find((e) => String(e.id) === id);

  if (!event) {
    return (
      <div className="p-4">
        <p className="text-sm text-neutral-500">Event not found.</p>
        <Link href="/events" className="mt-2 text-sm text-emerald-600">
          ← Back to Events
        </Link>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initiallyRegistered = false;
  if (user) {
    const { data } = await supabase
      .from("event_registrations")
      .select("id")
      .eq("user_id", user.id)
      .eq("event_id", event.id)
      .maybeSingle();
    initiallyRegistered = Boolean(data);
  }

  return (
    <div className="p-4">
      <Link href="/events" className="block text-sm text-neutral-500">
        ← Back to Events
      </Link>

      <span className="mt-3 inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
        {event.type}
      </span>
      <h1 className="mt-2 text-xl font-bold text-neutral-900">
        {event.name}
      </h1>

      <p className="mt-3 text-sm text-neutral-600">
        📅 {formatDate(event.date)}
      </p>
      <p className="mt-1 text-sm text-neutral-600">📍 {event.venue}</p>
      <p className="mt-1 text-sm text-neutral-400">
        Organised by {event.organiser}
      </p>

      <p className="mt-4 text-sm leading-relaxed text-neutral-700">
        {event.description}
      </p>

      <div className="mt-6 flex flex-col gap-3">
        <a
          href={event.registrationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full rounded-full bg-emerald-600 py-2.5 text-center text-sm font-semibold text-white"
        >
          Register on organiser's site ↗
        </a>
        <RegisteredButton
          eventId={event.id}
          userId={user?.id ?? null}
          initiallyRegistered={initiallyRegistered}
        />
      </div>
    </div>
  );
}
