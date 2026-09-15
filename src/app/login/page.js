"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push("/profile");
    router.refresh();
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-ink">Log in</h1>
      <p className="mt-1 text-sm text-muted">
        Welcome back.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm outline-none focus:border-brand"
        />
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm outline-none focus:border-brand"
        />

        {error && <p className="text-sm text-rose-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 rounded-full bg-brand py-2.5 text-sm font-semibold text-brand-ink disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>

      <Link
        href="/forgot-password"
        className="mt-3 block text-center text-sm text-muted"
      >
        Forgot password?
      </Link>

      <p className="mt-4 text-center text-sm text-muted">
        Don't have an account?{" "}
        <Link href="/signup" className="font-semibold text-brand">
          Sign up
        </Link>
      </p>
    </div>
  );
}
