import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";
import PageHeader from "@/components/PageHeader";
import { iconForType } from "@/lib/icons";

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
      <div className="px-4 pb-6 pt-5">
        <PageHeader title="Profile" />

        <div className="card-shadow mt-8 rounded-2xl border border-line bg-surface p-6 text-center">
          <span className="photo-placeholder mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl">
            👤
          </span>
          <h2 className="mt-4 text-lg font-bold text-ink">
            Log in to see your profile
          </h2>
          <p className="mt-2 text-sm text-muted">
            Your saved places, registered events and shop activity will show up
            here.
          </p>
          <Link
            href="/login"
            className="press mt-5 block rounded-xl bg-brand py-2.5 text-sm font-semibold text-brand-ink"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="mt-3 block text-sm font-medium text-brand"
          >
            Create an account
          </Link>
        </div>
      </div>
    );
  }

  const { data: favouriteRows } = await supabase
    .from("favourites")
    .select("place_id")
    .eq("user_id", user.id);

  const favouriteIds = (favouriteRows ?? []).map((row) => row.place_id);
  const { data: favouritePlaceRows } = favouriteIds.length
    ? await supabase
        .from("places")
        .select("id, name, type")
        .in("id", favouriteIds)
    : { data: [] };
  const favouritePlaces = favouritePlaceRows ?? [];

  const { data: registrationRows } = await supabase
    .from("event_registrations")
    .select("event_id")
    .eq("user_id", user.id);

  const registeredIds = (registrationRows ?? []).map((row) => row.event_id);
  const { data: registeredEventRows } = registeredIds.length
    ? await supabase
        .from("events")
        .select("id, name, venue")
        .in("id", registeredIds)
    : { data: [] };
  const registeredEvents = registeredEventRows ?? [];

  const isAdmin = Boolean(
    (
      await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle()
    ).data
  );

  const { data: clickRows } = await supabase
    .from("product_clicks")
    .select("product_id, clicked_at")
    .eq("user_id", user.id)
    .order("clicked_at", { ascending: false })
    .limit(20);

  const clickedIds = [...new Set((clickRows ?? []).map((r) => r.product_id))];
  const { data: clickedProducts } = clickedIds.length
    ? await supabase
        .from("products")
        .select("id, brand, name")
        .in("id", clickedIds)
    : { data: [] };

  const clickHistory = (clickRows ?? [])
    .map((row) => {
      const product = (clickedProducts ?? []).find(
        (p) => p.id === row.product_id
      );
      return product ? { ...product, clickedAt: row.clicked_at } : null;
    })
    .filter(Boolean);

  return (
    <div className="px-4 pb-6 pt-5">
      <PageHeader title="Profile" />

      <div className="card-shadow mt-4 flex items-center gap-3 rounded-2xl border border-line bg-surface p-4">
        <span className="photo-placeholder flex h-12 w-12 items-center justify-center rounded-full text-xl">
          👤
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">
            {user.email}
          </p>
          <p className="text-xs text-muted">Signed in</p>
        </div>
        <LogoutButton />
      </div>

      {isAdmin && (
        <Link
          href="/admin"
          className="press mt-3 block rounded-xl bg-ink py-2.5 text-center text-sm font-semibold text-app"
        >
          ⚙️ Manage content
        </Link>
      )}

      <div className="mt-8">
        <h2 className="text-sm font-semibold text-ink">
          Saved places ({favouritePlaces.length})
        </h2>
        {favouritePlaces.length === 0 ? (
          <p className="mt-2 text-sm text-muted">
            Nothing saved yet — tap the heart on a place in Discover.
          </p>
        ) : (
          <div className="mt-2 flex flex-col gap-2">
            {favouritePlaces.map((place) => (
              <Link
                key={place.id}
                href={`/place/${place.id}`}
                className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3"
              >
                <span className="text-xl">{iconForType(place.type)}</span>
                <span className="text-sm font-medium text-ink">
                  {place.name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-semibold text-ink">
          Registered events ({registeredEvents.length})
        </h2>
        {registeredEvents.length === 0 ? (
          <p className="mt-2 text-sm text-muted">
            No registrations yet — mark yourself registered on an event page.
          </p>
        ) : (
          <div className="mt-2 flex flex-col gap-2">
            {registeredEvents.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="flex flex-col rounded-xl border border-line bg-surface p-3"
              >
                <span className="text-sm font-medium text-ink">
                  {event.name}
                </span>
                <span className="text-xs text-muted">
                  {event.venue}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-semibold text-ink">
          Click history ({clickHistory.length})
        </h2>
        {clickHistory.length === 0 ? (
          <p className="mt-2 text-sm text-muted">
            No clicks yet — tap "Buy" on a product in Shop.
          </p>
        ) : (
          <div className="mt-2 flex flex-col gap-2">
            {clickHistory.map((click, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-line bg-surface p-3"
              >
                <div>
                  <span className="text-xs font-medium text-muted">
                    {click.brand}
                  </span>
                  <p className="text-sm font-medium text-ink">
                    {click.name}
                  </p>
                </div>
                <span className="text-xs text-muted">
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
