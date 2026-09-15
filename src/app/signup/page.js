"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      router.push("/profile");
      router.refresh();
    } else {
      setNotice("Account created — check your email to confirm it, then log in.");
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-ink">Sign up</h1>
      <p className="mt-1 text-sm text-muted">
        Create an account to save places and events.
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
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (min 6 characters)"
          className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm outline-none focus:border-brand"
        />

        {error && <p className="text-sm text-rose-500">{error}</p>}
        {notice && <p className="text-sm text-brand">{notice}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 rounded-full bg-brand py-2.5 text-sm font-semibold text-brand-ink disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Sign up"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand">
          Log in
        </Link>
      </p>
    </div>
  );
}
