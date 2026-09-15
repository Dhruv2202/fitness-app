"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminSection({
  title,
  items,
  editHref,
  deleteAction,
  actions,
  emptyText,
}) {
  const [selected, setSelected] = useState([]);
  const [picking, setPicking] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // A delete refreshes this list in place rather than navigating, so drop any
  // ids that have just gone.
  useEffect(() => {
    const live = new Set(items.map((i) => i.id));
    setSelected((current) => {
      const kept = current.filter((id) => live.has(id));
      return kept.length === current.length ? current : kept;
    });
    setConfirming(false);
  }, [items]);

  const allSelected = items.length > 0 && selected.length === items.length;

  function toggle(id) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id]
    );
  }

  function leaveSelectMode() {
    setPicking(false);
    setSelected([]);
    setConfirming(false);
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-ink">
          {title} ({items.length})
        </h2>

        <div className="flex gap-2">
          {picking ? (
            <button
              onClick={leaveSelectMode}
              className="press rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-muted"
            >
              Cancel
            </button>
          ) : (
            <>
              {items.length > 0 && (
                <button
                  onClick={() => setPicking(true)}
                  className="press rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink"
                >
                  Select
                </button>
              )}
              {actions}
            </>
          )}
        </div>
      </div>

      {picking && (
        <div className="mt-2 flex items-center justify-between gap-2 rounded-xl border border-line bg-surface p-2.5">
          <button
            onClick={() =>
              setSelected(allSelected ? [] : items.map((i) => i.id))
            }
            className="text-xs font-semibold text-brand"
          >
            {allSelected ? "Clear all" : `Select all ${items.length}`}
          </button>

          <span className="text-xs text-muted">{selected.length} selected</span>

          <form action={deleteAction}>
            <input type="hidden" name="ids" value={JSON.stringify(selected)} />
            {confirming ? (
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="press rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="press rounded-full bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white"
                >
                  Delete {selected.length}?
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                disabled={selected.length === 0}
                className="press rounded-full bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
              >
                Delete
              </button>
            )}
          </form>
        </div>
      )}

      <div className="mt-2 flex flex-col gap-2">
        {items.map((item) => {
          const row = item.node;

          if (picking) {
            return (
              <label
                key={item.id}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-surface p-3"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(item.id)}
                  onChange={() => toggle(item.id)}
                  className="h-4 w-4 shrink-0 accent-emerald-600"
                />
                {row}
              </label>
            );
          }

          return (
            <Link
              key={item.id}
              href={`${editHref}/${item.id}`}
              className="press flex items-center gap-3 rounded-xl border border-line bg-surface p-3"
            >
              {row}
            </Link>
          );
        })}

        {items.length === 0 && (
          <p className="text-sm text-muted">{emptyText}</p>
        )}
      </div>
    </div>
  );
}
