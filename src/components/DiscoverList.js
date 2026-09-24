"use client";

import { useState } from "react";
import Link from "next/link";
import CardPhotos from "@/components/CardPhotos";
import PageHeader from "@/components/PageHeader";
import { distanceInKm, formatDistance } from "@/lib/distance";
import { iconForType } from "@/lib/icons";

export default function DiscoverList({ places }) {
  const [query, setQuery] = useState("");
  const [activeType, setActiveType] = useState("All");
  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");

  const types = ["All", ...new Set(places.map((place) => place.type))];

  function useMyLocation() {
    if (!navigator.geolocation) {
      setLocationError("This browser can't share your location.");
      return;
    }

    setLocating(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setLocating(false);
      },
      () => {
        setLocationError("Couldn't get your location. Showing all places A–Z.");
        setLocating(false);
      },
      { timeout: 10000 }
    );
  }

  const filtered = places.filter((place) => {
    const text = `${place.name} ${place.type} ${place.area ?? ""}`.toLowerCase();
    const matchesQuery = text.includes(query.toLowerCase());
    const matchesType = activeType === "All" || place.type === activeType;
    return matchesQuery && matchesType;
  });

  // Places without coordinates still belong in the list; they just can't be
  // ranked, so they follow the ones that can.
  const listed = coords
    ? [...filtered]
        .map((place) => ({
          ...place,
          distance:
            place.lat === null || place.lon === null
              ? null
              : distanceInKm(coords.lat, coords.lon, place.lat, place.lon),
        }))
        .sort((a, b) => {
          if (a.distance === null) return b.distance === null ? 0 : 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        })
    : filtered;

  return (
    <div className="px-4 pb-6 pt-5">
      <PageHeader
        title="Discover"
        subtitle={
          coords ? "Nearest to you first" : "Gyms, spas & studios across Delhi"
        }
      />

      <div className="mt-4 flex gap-2">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted">
            🔍
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, type or area"
            className="w-full rounded-xl border border-line bg-surface py-2.5 pl-9 pr-3 text-sm text-ink outline-none placeholder:text-muted focus:border-brand"
          />
        </div>
        <button
          onClick={useMyLocation}
          disabled={locating || Boolean(coords)}
          aria-label="Sort by nearest to me"
          className={`press flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl border text-base ${
            coords
              ? "border-brand bg-brand-soft"
              : "border-line bg-surface"
          } disabled:opacity-70`}
        >
          {locating ? "…" : "📍"}
        </button>
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {types.map((type) => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={`press shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold ${
              activeType === type
                ? "border-brand bg-brand text-brand-ink"
                : "border-line bg-surface text-muted"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {locationError && (
        <p className="mt-2 text-xs text-muted">{locationError}</p>
      )}

      <p className="mt-4 text-xs font-medium text-muted">
        {listed.length} {listed.length === 1 ? "place" : "places"}
      </p>

      <div className="mt-2 flex flex-col gap-3">
        {listed.map((place) => {
          // photos is the gallery; photo_url is the cover that older rows have.
          const gallery = place.photos?.length
            ? place.photos
            : place.photo_url
              ? [place.photo_url]
              : [];

          return (
          <Link
            key={place.id}
            href={`/place/${place.id}`}
            className="press card-shadow overflow-hidden rounded-2xl border border-line bg-surface"
          >
            <CardPhotos photos={gallery} alt={place.name}>
              {place.distance != null && (
                <span className="absolute right-2 top-2 rounded-full bg-black/65 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
                  {formatDistance(place.distance)}
                </span>
              )}
            </CardPhotos>

            <div className="flex items-center gap-3 p-3">
              {gallery.length === 0 && (
                <span className="photo-placeholder flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-2xl">
                  {iconForType(place.type)}
                </span>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <span className="truncate font-semibold text-ink">
                    {place.name}
                  </span>
                  {place.rating > 0 && (
                    <span className="shrink-0 rounded-md bg-brand px-1.5 py-0.5 text-[11px] font-bold text-brand-ink">
                      {place.rating} ★
                    </span>
                  )}
                </div>

                <p className="truncate text-xs text-muted">
                  {place.type}
                  {place.area ? ` · ${place.area}` : ""}
                </p>

                <div className="mt-1.5 flex items-center gap-2">
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[11px] font-medium ${
                      place.fee
                        ? "bg-brand-soft text-brand"
                        : "bg-surface-2 text-muted"
                    }`}
                  >
                    {place.fee ?? "Fee not listed"}
                  </span>
                  {gallery.length === 0 && place.distance != null && (
                    <span className="text-[11px] font-semibold text-brand">
                      {formatDistance(place.distance)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
          );
        })}

        {listed.length === 0 && (
          <div className="mt-10 text-center">
            <span className="text-3xl">🔍</span>
            <p className="mt-2 text-sm text-muted">
              Nothing matches that search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
