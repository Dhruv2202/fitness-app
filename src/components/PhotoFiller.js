"use client";

import { useActionState } from "react";
import { fillPhotos } from "@/app/admin/actions";

export default function PhotoFiller() {
  const [state, action, pending] = useActionState(fillPhotos, {});

  return (
    <form action={action} className="mt-2">
      <button
        type="submit"
        disabled={pending}
        className="press w-full rounded-xl border border-line bg-surface py-2 text-xs font-semibold text-ink disabled:opacity-60"
      >
        {pending ? "Fetching photos..." : "🖼 Get photos from websites"}
      </button>

      {state?.error && (
        <p className="mt-2 text-xs text-rose-500">{state.error}</p>
      )}

      {state?.message && (
        <p className="mt-2 text-xs text-muted">{state.message}</p>
      )}

      {state?.done !== undefined && !state.message && (
        <div className="mt-2 text-xs">
          <p className="text-brand">
            Added {state.done} photo{state.done === 1 ? "" : "s"}.
            {state.remaining > 0
              ? ` ${state.remaining} still to go — press again.`
              : " That's all of them."}
          </p>
          {state.failed?.length > 0 && (
            <ul className="mt-1 list-disc pl-4 text-muted">
              {state.failed.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </form>
  );
}
