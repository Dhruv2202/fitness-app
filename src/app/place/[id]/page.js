import Link from "next/link";
import { notFound } from "next/navigation";
import FavouriteButton from "@/components/FavouriteButton";
import { createClient } from "@/lib/supabase/server";
import { getOptionalUser } from "@/lib/auth";
import { getPlace } from "@/lib/data";
import { iconForType } from "@/lib/icons";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const place = await getPlace(id);
  return { title: place?.name ?? "Place not found" };
}

function DetailRow({ label, value }) {
  return (
    <div className="border-b border-line py-3 last:border-b-0">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-1 text-sm text-ink">{value ?? "Not listed"}</p>
    </div>
  );
}

export default async function PlaceDetailPage({ params }) {
  const { id } = await params;
  const place = await getPlace(id);

  if (!place) notFound();

  const user = await getOptionalUser();

  let initiallySaved = false;
  if (user) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("favourites")
      .select("id")
      .eq("user_id", user.id)
      .eq("place_id", place.id)
      .maybeSingle();
    initiallySaved = Boolean(data);
  }

  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    place.address || `${place.name}, ${place.area ?? "Delhi"}, India`
  )}`;

  return (
    <div className="pb-8">
      <div className="relative">
        {place.photo_url ? (
          <img
            src={place.photo_url}
            alt={place.name}
            className="h-56 w-full object-cover"
          />
        ) : (
          <div className="photo-placeholder flex h-44 w-full items-center justify-center text-6xl">
            {iconForType(place.type)}
          </div>
        )}

        <Link
          href="/"
          aria-label="Back to Discover"
          className="press absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-sm text-white backdrop-blur-sm"
        >
          ←
        </Link>
      </div>

      <div className="px-4">
        {/* relative keeps this above the hero, which creates its own stacking context */}
        <div className="card-shadow relative -mt-6 rounded-2xl border border-line bg-surface p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-xl font-bold leading-tight text-ink">
                {place.name}
              </h1>
              <p className="mt-0.5 text-sm text-muted">
                {place.type}
                {place.area ? ` · ${place.area}` : ""}
              </p>
            </div>
            <FavouriteButton
              placeId={place.id}
              userId={user?.id ?? null}
              initiallySaved={initiallySaved}
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {place.rating > 0 && (
              <span className="rounded-md bg-brand px-2 py-0.5 text-xs font-bold text-brand-ink">
                {place.rating} ★
              </span>
            )}
            <span
              className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                place.fee
                  ? "bg-brand-soft text-brand"
                  : "bg-surface-2 text-muted"
              }`}
            >
              {place.fee ?? "Fee not listed"}
            </span>
          </div>

          <div className="mt-4 flex gap-2.5">
            {place.phone ? (
              <a
                href={`tel:${place.phone}`}
                className="press flex-1 rounded-xl bg-brand py-2.5 text-center text-sm font-semibold text-brand-ink"
              >
                📞 Call
              </a>
            ) : (
              <span className="flex-1 rounded-xl bg-surface-2 py-2.5 text-center text-sm font-semibold text-muted">
                No number listed
              </span>
            )}
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="press flex-1 rounded-xl border border-line bg-surface py-2.5 text-center text-sm font-semibold text-ink"
            >
              🧭 Directions
            </a>
          </div>
        </div>

        {place.website && (
          <a
            href={place.website}
            target="_blank"
            rel="noopener noreferrer"
            className="press mt-3 block rounded-xl border border-line bg-surface py-2.5 text-center text-sm font-semibold text-ink"
          >
            🌐 Visit website
          </a>
        )}

        <div className="mt-4 rounded-2xl border border-line bg-surface px-4">
          <DetailRow label="Timings" value={place.timings} />
          <DetailRow label="Address" value={place.address} />
        </div>

        {place.amenities?.length > 0 && (
          <div className="mt-4">
            <h2 className="text-[11px] font-semibold uppercase tracking-wide text-muted">
              Amenities
            </h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {place.amenities.map((amenity) => (
                <span
                  key={amenity}
                  className="rounded-full border border-line bg-surface px-3 py-1 text-xs text-ink"
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
