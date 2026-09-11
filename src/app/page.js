"use client";

import { useState } from "react";
import Link from "next/link";
import { realPlaces } from "@/data/realPlaces";

const types = ["All", ...new Set(realPlaces.map((place) => place.type))];

export default function DiscoverPage() {
  const [query, setQuery] = useState("");
  const [activeType, setActiveType] = useState("All");

  const filtered = realPlaces.filter((place) => {
    const text = `${place.name} ${place.type} ${place.area}`.toLowerCase();
    const matchesQuery = text.includes(query.toLowerCase());
    const matchesType = activeType === "All" || place.type === activeType;
    return matchesQuery && matchesType;
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-neutral-900">Discover</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Gyms, spas & studios near you in Delhi
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

      <div className="mt-4 flex flex-col gap-3">
        {filtered.map((place) => (
          <Link
            key={place.id}
            href={`/place/${place.id}`}
            className="flex gap-3 rounded-2xl border border-neutral-200 bg-white p-3"
          >
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-2xl">
              {place.icon}
            </div>
            <div className="flex flex-1 flex-col justify-center">
              <span className="font-semibold text-neutral-900">
                {place.name}
              </span>
              <span className="text-sm text-neutral-500">
                {place.type} · {place.area}
              </span>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-sm text-neutral-700">
                  {place.fee ?? "Fee not listed"}
                </span>
                {place.rating && (
                  <span className="text-sm text-amber-600">
                    ⭐ {place.rating}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}

        {filtered.length === 0 && (
          <p className="mt-6 text-center text-sm text-neutral-400">
            No places match "{query}"
          </p>
        )}
      </div>
    </div>
  );
}
