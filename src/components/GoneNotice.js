import Link from "next/link";

// Shown instead of redirecting when a record has just been deleted. Redirecting
// while the page is being re-rendered after the delete surfaces as a crash.
export default function GoneNotice({ what }) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-6 text-center">
      <span className="text-4xl">🗑️</span>
      <h1 className="mt-3 text-lg font-bold text-ink">{what} deleted</h1>
      <p className="mt-2 text-sm text-muted">It&apos;s no longer in the app.</p>
      <Link
        href="/admin"
        className="press mt-5 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-brand-ink"
      >
        Back to manage content
      </Link>
    </div>
  );
}
