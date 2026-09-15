export default function Loading() {
  return (
    <div>
      <div className="h-44 w-full animate-pulse bg-surface-2" />
      <div className="px-4">
        <div className="-mt-6 rounded-2xl border border-line bg-surface p-4">
          <div className="h-6 w-2/3 animate-pulse rounded bg-surface-2" />
          <div className="mt-2 h-4 w-1/3 animate-pulse rounded bg-surface-2" />
          <div className="mt-4 flex gap-2.5">
            <div className="h-10 flex-1 animate-pulse rounded-xl bg-surface-2" />
            <div className="h-10 flex-1 animate-pulse rounded-xl bg-surface-2" />
          </div>
        </div>
      </div>
    </div>
  );
}
