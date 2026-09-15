import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-6 text-center">
      <span className="text-4xl">🔍</span>
      <h1 className="mt-3 text-lg font-bold text-neutral-900">
        Page not found
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        That page doesn&apos;t exist, or it may have been removed.
      </p>
      <Link
        href="/"
        className="mt-5 rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white"
      >
        Go to Discover
      </Link>
    </div>
  );
}
