"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

// Deliberately not window.confirm: plenty of mobile and in-app browsers
// suppress it, and a suppressed dialog returns false, which silently cancelled
// the delete with no feedback at all.
export default function DeleteButton({ label, confirmText }) {
  const { pending } = useFormStatus();
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 5000);
    return () => clearTimeout(t);
  }, [armed]);

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        className="press w-full rounded-full border border-line py-2.5 text-sm font-semibold text-rose-500"
      >
        {label}
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-rose-400/40 bg-rose-500/10 p-3">
      <p className="text-xs text-ink">{confirmText}</p>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={() => setArmed(false)}
          className="press flex-1 rounded-full border border-line bg-surface py-2 text-sm font-semibold text-ink"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending}
          className="press flex-1 rounded-full bg-rose-500 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Deleting..." : "Yes, delete"}
        </button>
      </div>
    </div>
  );
}
