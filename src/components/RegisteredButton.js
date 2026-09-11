"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function RegisteredButton({
  eventId,
  userId,
  initiallyRegistered,
}) {
  const [isRegistered, setIsRegistered] = useState(initiallyRegistered);
  const [loading, setLoading] = useState(false);

  if (!userId) {
    return (
      <Link
        href="/login"
        className="w-full rounded-full border border-neutral-300 py-2.5 text-center text-sm font-semibold text-neutral-600"
      >
        Log in to track your registration
      </Link>
    );
  }

  async function toggleRegistered() {
    setLoading(true);
    const supabase = createClient();

    if (isRegistered) {
      await supabase
        .from("event_registrations")
        .delete()
        .eq("user_id", userId)
        .eq("event_id", eventId);
    } else {
      await supabase
        .from("event_registrations")
        .insert({ user_id: userId, event_id: eventId });
    }

    setIsRegistered(!isRegistered);
    setLoading(false);
  }

  return (
    <button
      onClick={toggleRegistered}
      disabled={loading}
      className={`w-full rounded-full border py-2.5 text-sm font-semibold disabled:opacity-60 ${
        isRegistered
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-neutral-300 text-neutral-600"
      }`}
    >
      {isRegistered ? "✓ I'm registered" : "Mark as registered"}
    </button>
  );
}
