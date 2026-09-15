"use client";

import { useFormStatus } from "react-dom";

export default function SubmitButton({ label, pendingLabel }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 rounded-full bg-brand py-2.5 text-sm font-semibold text-brand-ink disabled:opacity-60"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
