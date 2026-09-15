"use client";

import { useFormStatus } from "react-dom";

export default function DeleteButton({ label, confirmText }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
      className="w-full rounded-full border border-rose-300 py-2.5 text-sm font-semibold text-rose-500 disabled:opacity-60"
    >
      {pending ? "Deleting..." : label}
    </button>
  );
}
