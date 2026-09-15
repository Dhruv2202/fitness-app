export default function Loading() {
  return (
    <div>
      <div className="h-40 w-full animate-pulse bg-neutral-200" />
      <div className="p-4">
        <div className="h-6 w-2/3 animate-pulse rounded bg-neutral-200" />
        <div className="mt-2 h-4 w-1/3 animate-pulse rounded bg-neutral-100" />
        <div className="mt-5 flex gap-3">
          <div className="h-10 flex-1 animate-pulse rounded-full bg-neutral-200" />
          <div className="h-10 flex-1 animate-pulse rounded-full bg-neutral-100" />
        </div>
        <div className="mt-6 h-4 w-1/4 animate-pulse rounded bg-neutral-200" />
        <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-neutral-100" />
      </div>
    </div>
  );
}
