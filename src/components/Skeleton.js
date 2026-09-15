export function SkeletonCard() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3">
      <div className="h-14 w-14 shrink-0 animate-pulse rounded-xl bg-surface-2" />
      <div className="flex-1">
        <div className="h-4 w-2/3 animate-pulse rounded bg-surface-2" />
        <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-surface-2" />
        <div className="mt-2 h-4 w-24 animate-pulse rounded bg-surface-2" />
      </div>
    </div>
  );
}

export function SkeletonList({ title, count = 5 }) {
  return (
    <div className="px-4 pb-6 pt-5">
      <div className="h-7 w-40 animate-pulse rounded bg-surface-2" />
      <div className="mt-2 h-4 w-56 animate-pulse rounded bg-surface-2" />
      <span className="sr-only">Loading {title}</span>

      <div className="mt-6 flex flex-col gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
