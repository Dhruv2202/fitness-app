import Link from "next/link";
import { realPlaces } from "@/data/realPlaces";
import FavouriteButton from "@/components/FavouriteButton";
import { createClient } from "@/lib/supabase/server";

export default async function PlaceDetailPage({ params }) {
  const { id } = await params;
  const place = realPlaces.find((g) => String(g.id) === id);

  if (!place) {
    return (
      <div className="p-4">
        <p className="text-sm text-neutral-500">Place not found.</p>
        <Link href="/" className="mt-2 text-sm text-emerald-600">
          ← Back to Discover
        </Link>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initiallySaved = false;
  if (user) {
    const { data } = await supabase
      .from("favourites")
      .select("id")
      .eq("user_id", user.id)
      .eq("place_id", place.id)
      .maybeSingle();
    initiallySaved = Boolean(data);
  }

  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    place.address || `${place.name}, ${place.area}, Delhi, India`
  )}`;

  return (
    <div>
      <div className="flex h-40 items-center justify-center bg-emerald-100 text-6xl">
        {place.icon}
      </div>

      <div className="p-4">
        <Link href="/" className="text-sm text-neutral-500">
          ← Back to Discover
        </Link>

        <div className="mt-2 flex items-start justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-neutral-900">
              {place.name}
            </h1>
            <p className="text-sm text-neutral-500">
              {place.type} · {place.area}
            </p>
          </div>
          <FavouriteButton
            placeId={place.id}
            userId={user?.id ?? null}
            initiallySaved={initiallySaved}
          />
        </div>

        <div className="mt-3 flex items-center gap-3 text-sm">
          {place.rating && <span className="text-amber-600">⭐ {place.rating}</span>}
          <span className="text-neutral-700">{place.fee ?? "Fee not listed"}</span>
        </div>

        <div className="mt-5 flex gap-3">
          {place.phone ? (
            <a
              href={`tel:${place.phone}`}
              className="flex-1 rounded-full bg-emerald-600 py-2.5 text-center text-sm font-semibold text-white"
            >
              📞 Call
            </a>
          ) : (
            <span className="flex-1 rounded-full bg-neutral-100 py-2.5 text-center text-sm font-semibold text-neutral-400">
              📞 No number listed
            </span>
          )}
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-full border border-neutral-300 py-2.5 text-center text-sm font-semibold text-neutral-700"
          >
            🧭 Directions
          </a>
        </div>

        <div className="mt-6">
          <h2 className="text-sm font-semibold text-neutral-900">Timings</h2>
          <p className="mt-1 text-sm text-neutral-600">
            {place.timings ?? "Not listed"}
          </p>
        </div>

        <div className="mt-4">
          <h2 className="text-sm font-semibold text-neutral-900">Address</h2>
          <p className="mt-1 text-sm text-neutral-600">
            {place.address ?? "Not listed"}
          </p>
        </div>

        {place.amenities.length > 0 && (
          <div className="mt-4">
            <h2 className="text-sm font-semibold text-neutral-900">
              Amenities
            </h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {place.amenities.map((amenity) => (
                <span
                  key={amenity}
                  className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
