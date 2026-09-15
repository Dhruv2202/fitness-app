"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GENDER_OPTIONS } from "@/lib/profile";

const inputClass =
  "w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink outline-none placeholder:text-muted focus:border-brand";

export default function SignupPage() {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("undisclosed");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function sendCode(e) {
    e?.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
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
    setStep("details");
  }

  async function saveDetails(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return setError("Your session expired. Please start again.");
    }

    const { error: saveError } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: fullName.trim() || null,
      date_of_birth: dateOfBirth || null,
      gender,
      phone: phone.trim() || null,
    });

    setLoading(false);
    if (saveError) return setError(saveError.message);

    router.push("/profile");
    router.refresh();
  }

  return (
    <div className="px-4 pb-8 pt-6">
      <h1 className="text-2xl font-bold text-ink">
        {step === "details" ? "About you" : "Create your account"}
      </h1>
      <p className="mt-1 text-sm text-muted">
        {step === "email" && "We'll email you a code to confirm it's you."}
        {step === "code" && `Enter the 6-digit code sent to ${email}.`}
        {step === "details" && "This helps us tailor what we show you."}
      </p>

      {step === "email" && (
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
            {loading ? "Sending code..." : "Send me a code"}
          </button>
        </form>
      )}

      {step === "code" && (
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
            {loading ? "Checking..." : "Verify"}
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

      {step === "details" && (
        <form onSubmit={saveDetails} className="mt-5 flex flex-col gap-3">
          <label className="block">
            <span className="text-xs font-semibold text-ink">Full name</span>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
              className={`mt-1 ${inputClass}`}
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-ink">
              Date of birth
            </span>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className={`mt-1 ${inputClass}`}
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-ink">Gender</span>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className={`mt-1 ${inputClass}`}
            >
              {GENDER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-ink">
              Phone (optional)
            </span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98100 12345"
              className={`mt-1 ${inputClass}`}
            />
          </label>

          {error && <p className="text-sm text-rose-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="press mt-1 rounded-xl bg-brand py-2.5 text-sm font-semibold text-brand-ink disabled:opacity-60"
          >
            {loading ? "Saving..." : "Finish"}
          </button>
        </form>
      )}

      {step !== "details" && (
        <p className="mt-5 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brand">
            Log in
          </Link>
        </p>
      )}
    </div>
  );
}
