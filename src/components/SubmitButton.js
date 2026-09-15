"use client";

import { useFormStatus } from "react-dom";

export default function SubmitButton({ label, pendingLabel }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 rounded-full bg-emerald-600 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
