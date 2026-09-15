"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import PhotoUpload from "@/components/PhotoUpload";
import SubmitButton from "@/components/SubmitButton";
import DeleteButton from "@/components/DeleteButton";
import { saveProduct, deleteProduct, lookupProduct } from "@/app/admin/actions";

const inputClass =
  "mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-muted focus:border-brand";

function Field({ label, name, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-ink">{label}</span>
      <input
        type="text"
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClass}
      />
    </label>
  );
}

export default function ProductForm({ product }) {
  const [brand, setBrand] = useState(product?.brand ?? "");
  const [name, setName] = useState(product?.name ?? "");
  const [price, setPrice] = useState(product?.price ?? "");
  const [buyUrl, setBuyUrl] = useState(product?.buy_url ?? "");
  const [photoUrl, setPhotoUrl] = useState(product?.photo_url ?? "");

  const [state, lookupAction, looking] = useActionState(lookupProduct, {});

  // When a lookup comes back, fill in anything the page told us.
  useEffect(() => {
    const found = state?.product;
    if (!found) return;
    if (found.name) setName(found.name);
    if (found.brand) setBrand(found.brand);
    if (found.price) setPrice(found.price);
    if (found.buy_url) setBuyUrl(found.buy_url);
    if (found.photo_url) setPhotoUrl(found.photo_url);
  }, [state]);

  return (
    <div className="px-4 pb-8 pt-6">
      <Link href="/admin" className="text-sm text-muted">
        ← Back to admin
      </Link>

      <h1 className="mt-2 text-xl font-bold text-ink">
        {product ? "Edit product" : "Add a product"}
      </h1>

      {!product && (
        <form
          action={lookupAction}
          className="card-shadow mt-4 rounded-2xl border border-line bg-surface p-3"
        >
          <label className="block text-xs font-semibold text-ink">
            Paste a product link
          </label>
          <p className="mt-0.5 text-xs text-muted">
            We&apos;ll pull in the name, price and photo so you don&apos;t have
            to type them.
          </p>
          <input
            type="text"
            name="lookup_url"
            placeholder="https://www.muscleblaze.com/..."
            className={inputClass}
          />
          <button
            type="submit"
            disabled={looking}
            className="press mt-2 w-full rounded-xl bg-ink py-2 text-sm font-semibold text-app disabled:opacity-60"
          >
            {looking ? "Fetching..." : "Fetch details"}
          </button>
          {state?.error && (
            <p className="mt-2 text-xs text-rose-500">{state.error}</p>
          )}
          {state?.product && !state.error && (
            <p className="mt-2 text-xs text-brand">
              Filled in below — check it, then save.
            </p>
          )}
        </form>
      )}

      <form action={saveProduct} className="mt-4 flex flex-col gap-3">
        {product && <input type="hidden" name="id" value={product.id} />}

        <Field
          label="Brand *"
          name="brand"
          value={brand}
          onChange={setBrand}
          placeholder="MuscleBlaze"
        />
        <Field
          label="Product name *"
          name="name"
          value={name}
          onChange={setName}
          placeholder="Biozyme Whey Protein 1kg"
        />
        <Field
          label="Price"
          name="price"
          value={price}
          onChange={setPrice}
          placeholder="₹1,799"
        />

        <PhotoUpload
          key={photoUrl}
          name="photo_url"
          initialUrl={photoUrl}
        />

        <Field
          label="Buy link *"
          name="buy_url"
          value={buyUrl}
          onChange={setBuyUrl}
          placeholder="https://..."
        />
        <p className="text-xs text-muted">
          Paste your affiliate link here once you have one. Until then, link
          straight to the product page on the brand&apos;s own site.
        </p>

        <SubmitButton
          label={product ? "Save changes" : "Add product"}
          pendingLabel={product ? "Saving..." : "Adding..."}
        />
      </form>

      {product && (
        <form action={deleteProduct} className="mt-3">
          <input type="hidden" name="id" value={product.id} />
          <DeleteButton
            label="Delete this product"
            confirmText={`Delete "${product.name}"? This cannot be undone.`}
          />
        </form>
      )}
    </div>
  );
}
