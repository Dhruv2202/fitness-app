import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";
import { sampleEvents, sampleProducts } from "@/data/sampleData";
import { realPlaces } from "@/data/realPlaces";

function formatClickTime(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  if (!user) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <span className="text-4xl">👤</span>
        <h1 className="mt-3 text-xl font-bold text-neutral-900">
          Log in to see your profile
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Once you have an account, your saved places, registered events and
          order history will show up here.
        </p>
        <Link
          href="/login"
          className="mt-5 rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white"
        >
          Log in
        </Link>
        <Link href="/signup" className="mt-3 text-sm text-neutral-500">
          Don't have an account? Sign up
        </Link>
      </div>
    );
  }

  const { data: favouriteRows } = await supabase
    .from("favourites")
    .select("place_id")
    .eq("user_id", user.id);

  const favouritePlaces = (favouriteRows ?? [])
    .map((row) => realPlaces.find((g) => g.id === row.place_id))
    .filter(Boolean);

  const { data: registrationRows } = await supabase
    .from("event_registrations")
    .select("event_id")
    .eq("user_id", user.id);

  const registeredEvents = (registrationRows ?? [])
    .map((row) => sampleEvents.find((e) => e.id === row.event_id))
    .filter(Boolean);

  const { data: clickRows } = await supabase
    .from("product_clicks")
    .select("product_id, clicked_at")
    .eq("user_id", user.id)
    .order("clicked_at", { ascending: false })
    .limit(20);

  const clickHistory = (clickRows ?? [])
    .map((row) => {
      const product = sampleProducts.find((p) => p.id === row.product_id);
      return product ? { ...product, clickedAt: row.clicked_at } : null;
    })
    .filter(Boolean);

  return (
    <div className="p-4">
      <div className="text-center">
        <span className="text-4xl">👤</span>
        <p className="mt-2 text-sm text-neutral-600">{user.email}</p>
        <LogoutButton />
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-semibold text-neutral-900">
          Saved places ({favouritePlaces.length})
        </h2>
        {favouritePlaces.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-400">
            Nothing saved yet — tap the heart on a place in Discover.
          </p>
        ) : (
          <div className="mt-2 flex flex-col gap-2">
            {favouritePlaces.map((place) => (
              <Link
                key={place.id}
                href={`/place/${place.id}`}
                className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3"
              >
                <span className="text-xl">{place.icon}</span>
                <span className="text-sm font-medium text-neutral-900">
                  {place.name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-semibold text-neutral-900">
          Registered events ({registeredEvents.length})
        </h2>
        {registeredEvents.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-400">
            No registrations yet — mark yourself registered on an event page.
          </p>
        ) : (
          <div className="mt-2 flex flex-col gap-2">
            {registeredEvents.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="flex flex-col rounded-xl border border-neutral-200 bg-white p-3"
              >
                <span className="text-sm font-medium text-neutral-900">
                  {event.name}
                </span>
                <span className="text-xs text-neutral-500">
                  {event.venue}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-semibold text-neutral-900">
          Click history ({clickHistory.length})
        </h2>
        {clickHistory.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-400">
            No clicks yet — tap "Buy" on a product in Shop.
          </p>
        ) : (
          <div className="mt-2 flex flex-col gap-2">
            {clickHistory.map((click, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-3"
              >
                <div>
                  <span className="text-xs font-medium text-neutral-400">
                    {click.brand}
                  </span>
                  <p className="text-sm font-medium text-neutral-900">
                    {click.name}
                  </p>
                </div>
                <span className="text-xs text-neutral-400">
                  {formatClickTime(click.clickedAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
