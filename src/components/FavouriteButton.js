"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function FavouriteButton({ placeId, userId, initiallySaved }) {
  const [isSaved, setIsSaved] = useState(initiallySaved);
  const [loading, setLoading] = useState(false);

  if (!userId) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-semibold text-muted"
      >
        🤍 Log in to save
      </Link>
    );
  }

  async function toggleFavourite() {
    setLoading(true);
    const supabase = createClient();

    if (isSaved) {
      await supabase
        .from("favourites")
        .delete()
        .eq("user_id", userId)
        .eq("place_id", placeId);
    } else {
      await supabase
        .from("favourites")
        .insert({ user_id: userId, place_id: placeId });
    }

    setIsSaved(!isSaved);
    setLoading(false);
  }

  return (
    <button
      onClick={toggleFavourite}
      disabled={loading}
      className={`press flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold disabled:opacity-60 ${
        isSaved
          ? "border-rose-400/40 bg-rose-500/10 text-rose-500"
          : "border-line bg-surface text-muted"
      }`}
    >
      <span>{isSaved ? "❤️" : "🤍"}</span>
      {isSaved ? "Saved" : "Save"}
    </button>
  );
}
