export function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <div className="h-24 w-full animate-pulse bg-neutral-200" />
      <div className="p-3">
        <div className="h-4 w-2/3 animate-pulse rounded bg-neutral-200" />
        <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-neutral-100" />
      </div>
    </div>
  );
}

export function SkeletonList({ title, count = 5 }) {
  return (
    <div className="p-4">
      <div className="h-7 w-40 animate-pulse rounded bg-neutral-200" />
      <div className="mt-2 h-4 w-56 animate-pulse rounded bg-neutral-100" />
      <span className="sr-only">Loading {title}</span>

      <div className="mt-6 flex flex-col gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
