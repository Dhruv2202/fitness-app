"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink outline-none placeholder:text-muted focus:border-brand";

export default function LoginPage() {
  const [mode, setMode] = useState("code");
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function done() {
    router.push("/profile");
    router.refresh();
  }

  async function sendCode(e) {
    e?.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // Logging in must not quietly create an account for a mistyped address.
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);
    if (otpError) return setError(otpError.message);
    setStep("code");
  }

  async function verifyCode(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code.trim(),
      type: "email",
    });

    setLoading(false);
    if (verifyError) return setError(verifyError.message);
    done();
  }

  async function passwordLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);
    if (signInError) return setError(signInError.message);
    done();
  }

  return (
    <div className="px-4 pb-8 pt-6">
      <h1 className="text-2xl font-bold text-ink">Log in</h1>
      <p className="mt-1 text-sm text-muted">
        {mode === "code" && step === "email" && "We'll email you a login code."}
        {mode === "code" &&
          step === "code" &&
          `Enter the code sent to ${email}.`}
        {mode === "password" && "Welcome back."}
      </p>

      {mode === "code" && step === "email" && (
        <form onSubmit={sendCode} className="mt-5 flex flex-col gap-3">
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className={inputClass}
          />
          {error && <p className="text-sm text-rose-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="press mt-1 rounded-xl bg-brand py-2.5 text-sm font-semibold text-brand-ink disabled:opacity-60"
          >
            {loading ? "Sending code..." : "Email me a code"}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("password");
              setError("");
            }}
            className="text-sm text-muted"
          >
            Use a password instead
          </button>
        </form>
      )}

      {mode === "code" && step === "code" && (
        <form onSubmit={verifyCode} className="mt-5 flex flex-col gap-3">
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="6-digit code"
            className={`${inputClass} text-center text-lg tracking-[0.4em]`}
          />
          {error && <p className="text-sm text-rose-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="press mt-1 rounded-xl bg-brand py-2.5 text-sm font-semibold text-brand-ink disabled:opacity-60"
          >
            {loading ? "Checking..." : "Log in"}
          </button>
          <button
            type="button"
            onClick={sendCode}
            disabled={loading}
            className="text-sm text-muted"
          >
            Didn&apos;t get it? Send again
          </button>
        </form>
      )}

      {mode === "password" && (
        <form onSubmit={passwordLogin} className="mt-5 flex flex-col gap-3">
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className={inputClass}
          />
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className={inputClass}
          />
          {error && <p className="text-sm text-rose-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="press mt-1 rounded-xl bg-brand py-2.5 text-sm font-semibold text-brand-ink disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("code");
              setError("");
            }}
            className="text-sm text-muted"
          >
            Email me a code instead
          </button>
          <Link
            href="/forgot-password"
            className="text-center text-sm text-muted"
          >
            Forgot password?
          </Link>
        </form>
      )}

      <p className="mt-5 text-center text-sm text-muted">
        New here?{" "}
        <Link href="/signup" className="font-semibold text-brand">
          Create an account
        </Link>
      </p>
    </div>
  );
}
