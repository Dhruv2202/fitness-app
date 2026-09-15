"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Deleting everything in a section is two taps away — select all, then delete.
// That is how a whole table got wiped once, so a sweep of more than this many
// rows has to be typed out before it will run.
const TYPE_TO_CONFIRM_ABOVE = 3;

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
  const [typed, setTyped] = useState("");

  // A delete refreshes this list in place rather than navigating, so drop any
  // ids that have just gone.
  useEffect(() => {
    const live = new Set(items.map((i) => i.id));
    setSelected((current) => {
      const kept = current.filter((id) => live.has(id));
      return kept.length === current.length ? current : kept;
    });
    setConfirming(false);
    setTyped("");
  }, [items]);

  const allSelected = items.length > 0 && selected.length === items.length;

  // Taking out a handful is ordinary admin work. Taking out the whole section
  // is not, so that is the case we slow down.
  const needsTyping = allSelected && items.length > TYPE_TO_CONFIRM_ABOVE;
  const canDelete = selected.length > 0 && (!needsTyping || typed.trim() === String(selected.length));

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
    setTyped("");
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
        <div className="mt-2 rounded-xl border border-line bg-surface p-2.5">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => {
                setSelected(allSelected ? [] : items.map((i) => i.id));
                setConfirming(false);
                setTyped("");
              }}
              className="text-xs font-semibold text-brand"
            >
              {allSelected ? "Clear all" : `Select all ${items.length}`}
            </button>

            <span className="text-xs text-muted">
              {selected.length} selected
            </span>

            <form action={deleteAction}>
              <input type="hidden" name="ids" value={JSON.stringify(selected)} />
              {confirming ? (
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setConfirming(false);
                      setTyped("");
                    }}
                    className="press rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!canDelete}
                    className="press rounded-full bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
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

          {confirming && needsTyping && (
            <div className="mt-2.5 rounded-lg border border-rose-500/40 bg-rose-500/5 p-2.5">
              <p className="text-xs font-semibold text-ink">
                This removes every {title.toLowerCase().replace(/s$/, "")} in
                this section. It cannot be undone.
              </p>
              <p className="mt-1 text-xs text-muted">
                Type{" "}
                <span className="font-bold text-ink">{selected.length}</span> to
                confirm.
              </p>
              <input
                type="text"
                inputMode="numeric"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder={String(selected.length)}
                className="mt-1.5 w-full rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm text-ink outline-none placeholder:text-muted focus:border-rose-500"
              />
            </div>
          )}
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
