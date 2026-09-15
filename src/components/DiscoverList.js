"use client";

import { useState } from "react";
import Link from "next/link";
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
    <div className="p-4">
      <h1 className="text-2xl font-bold text-neutral-900">Discover</h1>
      <p className="mt-1 text-sm text-neutral-500">
        {coords
          ? "Fitness places nearest to you first"
          : "Gyms, spas & studios across Delhi"}
      </p>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name, type or area..."
        className="mt-4 w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
      />

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {types.map((type) => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold ${
              activeType === type
                ? "bg-emerald-600 text-white"
                : "bg-neutral-100 text-neutral-600"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {!coords && (
        <button
          onClick={useMyLocation}
          disabled={locating}
          className="mt-3 w-full rounded-xl border border-emerald-600 py-2.5 text-sm font-semibold text-emerald-700 disabled:opacity-60"
        >
          {locating ? "Finding you..." : "📍 Sort by what's nearest me"}
        </button>
      )}

      {locationError && (
        <p className="mt-2 text-xs text-neutral-500">{locationError}</p>
      )}

      <div className="mt-4 flex flex-col gap-4">
        {listed.map((place) => (
          <Link
            key={place.id}
            href={`/place/${place.id}`}
            className="overflow-hidden rounded-2xl border border-neutral-200 bg-white"
          >
            {place.photo_url ? (
              <img
                src={place.photo_url}
                alt={place.name}
                className="h-40 w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="flex h-24 w-full items-center justify-center bg-emerald-50 text-4xl">
                {iconForType(place.type)}
              </div>
            )}

            <div className="p-3">
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-neutral-900">
                  {place.name}
                </span>
                {place.rating > 0 && (
                  <span className="shrink-0 rounded-md bg-emerald-600 px-1.5 py-0.5 text-xs font-bold text-white">
                    {place.rating} ★
                  </span>
                )}
              </div>

              <span className="text-sm text-neutral-500">
                {place.type}
                {place.area ? ` · ${place.area}` : ""}
              </span>

              <div className="mt-1 flex items-center justify-between">
                <span className="text-sm text-neutral-700">
                  {place.fee ?? "Fee not listed"}
                </span>
                {place.distance != null && (
                  <span className="text-sm font-medium text-emerald-700">
                    {formatDistance(place.distance)}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}

        {listed.length === 0 && (
          <p className="mt-6 text-center text-sm text-neutral-400">
            No places match your search.
          </p>
        )}
      </div>
    </div>
  );
}
