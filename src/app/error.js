"use client";

export default function Error({ error, retry }) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-6 text-center">
      <span className="text-4xl">😕</span>
      <h1 className="mt-3 text-lg font-bold text-neutral-900">
        Something went wrong
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        We couldn&apos;t load this page. Check your connection and try again.
      </p>
      <button
        onClick={() => retry()}
        className="mt-5 rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white"
      >
        Try again
      </button>
    </div>
  );
}
