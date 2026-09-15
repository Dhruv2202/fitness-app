"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import SubmitButton from "@/components/SubmitButton";
import { lookupProducts, importProducts } from "@/app/admin/actions";

export default function BulkProducts() {
  const [state, lookupAction, looking] = useActionState(lookupProducts, {});
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (state?.products) setRows(state.products);
  }, [state]);

  function update(index, field, value) {
    setRows((current) =>
      current.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  }

  function remove(index) {
    setRows((current) => current.filter((_, i) => i !== index));
  }

  return (
    <div className="px-4 pb-8 pt-6">
      <Link href="/admin" className="text-sm text-muted">
        ← Back to admin
      </Link>

      <h1 className="mt-2 text-xl font-bold text-ink">Add several products</h1>
      <p className="mt-1 text-sm text-muted">
        Paste product links, one per line. We&apos;ll read each page for the
        name, price and photo. Up to 8 at a time.
      </p>

      <form action={lookupAction} className="mt-4 flex flex-col gap-2">
        <textarea
          name="urls"
          rows={6}
          placeholder={"https://www.muscleblaze.com/...\nhttps://nutrabay.com/...\nhttps://www.boldfit.in/..."}
          className="w-full rounded-xl border border-line bg-surface px-3 py-2 font-mono text-xs text-ink outline-none placeholder:text-muted focus:border-brand"
        />
        <button
          type="submit"
          disabled={looking}
          className="press rounded-xl bg-ink py-2.5 text-sm font-semibold text-app disabled:opacity-60"
        >
          {looking ? "Fetching all..." : "Fetch details"}
        </button>
      </form>

      {state?.error && (
        <p className="mt-3 text-sm text-rose-500">{state.error}</p>
      )}

      {state?.failed?.length > 0 && (
        <div className="mt-3 rounded-xl border border-line bg-surface-2 p-3">
          <p className="text-xs font-semibold text-ink">
            Couldn&apos;t read {state.failed.length} link
            {state.failed.length === 1 ? "" : "s"}
          </p>
          {state.failed.map((link) => (
            <p key={link} className="mt-1 break-all text-xs text-muted">
              {link}
            </p>
          ))}
          <p className="mt-2 text-xs text-muted">
            Add these one at a time instead.
          </p>
        </div>
      )}

      {state?.skipped > 0 && (
        <p className="mt-2 text-xs text-muted">
          {state.skipped} link{state.skipped === 1 ? "" : "s"} left out — run
          them in the next batch.
        </p>
      )}

      {rows.length > 0 && (
        <>
          <h2 className="mt-6 text-sm font-semibold text-ink">
            Check these, then add ({rows.length})
          </h2>

          <div className="mt-2 flex flex-col gap-3">
            {rows.map((row, i) => (
              <div
                key={i}
                className="rounded-2xl border border-line bg-surface p-3"
              >
                <div className="flex gap-3">
                  {row.photo_url ? (
                    <img
                      src={row.photo_url}
                      alt=""
                      className="h-14 w-14 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="photo-placeholder flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-xl">
                      💪
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <input
                      value={row.brand ?? ""}
                      onChange={(e) => update(i, "brand", e.target.value)}
                      placeholder="Brand"
                      className="w-full bg-transparent text-[11px] font-semibold uppercase tracking-wide text-muted outline-none"
                    />
                    <input
                      value={row.name ?? ""}
                      onChange={(e) => update(i, "name", e.target.value)}
                      placeholder="Product name"
                      className="w-full bg-transparent text-sm font-semibold text-ink outline-none"
                    />
                    <input
                      value={row.price ?? ""}
                      onChange={(e) => update(i, "price", e.target.value)}
                      placeholder="Price (add it yourself if blank)"
                      className="w-full bg-transparent text-sm text-ink outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => remove(i)}
                    aria-label="Remove"
                    className="press h-7 w-7 shrink-0 rounded-full border border-line text-xs text-muted"
                  >
                    ✕
                  </button>
                </div>

                <p className="mt-2 break-all text-[11px] text-muted">
                  {row.buy_url}
                </p>
              </div>
            ))}
          </div>

          <form action={importProducts} className="mt-4 flex flex-col">
            <input
              type="hidden"
              name="products"
              value={JSON.stringify(rows)}
            />
            <SubmitButton
              label={`Add ${rows.length} product${rows.length === 1 ? "" : "s"}`}
              pendingLabel="Adding..."
            />
          </form>
        </>
      )}
    </div>
  );
}
