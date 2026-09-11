"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      }
    );

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-neutral-900">Check your email</h1>
        <p className="mt-2 text-sm text-neutral-600">
          If an account exists for {email}, we've sent a link to reset your
          password.
        </p>
        <Link href="/login" className="mt-4 block text-sm text-emerald-600">
          ← Back to log in
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-neutral-900">Reset password</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Enter your email and we'll send you a reset link.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
        />

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 rounded-full bg-emerald-600 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </form>

      <Link href="/login" className="mt-4 block text-center text-sm text-neutral-500">
        ← Back to log in
      </Link>
    </div>
  );
}
