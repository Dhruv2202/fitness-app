"use client";

export default function Error({ error, retry }) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-6 text-center">
      <span className="text-4xl">😕</span>
      <h1 className="mt-3 text-lg font-bold text-ink">Something went wrong</h1>
      <p className="mt-2 text-sm text-muted">
        We couldn&apos;t finish that. Check your connection and try again.
      </p>

      {/* Showing the reason turns "it broke" into something reportable. */}
      {(error?.message || error?.digest) && (
        <p className="mt-3 max-w-xs break-words rounded-xl bg-surface-2 p-3 text-xs text-muted">
          {error.message}
          {error.digest && (
            <span className="mt-1 block opacity-70">
              Reference: {error.digest}
            </span>
          )}
        </p>
      )}

      <button
        onClick={() => retry()}
        className="press mt-5 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-brand-ink"
      >
        Try again
      </button>
    </div>
  );
}
