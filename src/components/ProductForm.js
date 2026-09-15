import Link from "next/link";
import PhotoUpload from "@/components/PhotoUpload";
import SubmitButton from "@/components/SubmitButton";
import DeleteButton from "@/components/DeleteButton";
import { saveProduct, deleteProduct } from "@/app/admin/actions";

const inputClass =
  "mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500";

function Field({ label, name, defaultValue, placeholder }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-neutral-700">{label}</span>
      <input
        type="text"
        name={name}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className={inputClass}
      />
    </label>
  );
}

export default function ProductForm({ product }) {
  return (
    <div className="p-4">
      <Link href="/admin" className="text-sm text-neutral-500">
        ← Back to admin
      </Link>

      <h1 className="mt-2 text-xl font-bold text-neutral-900">
        {product ? "Edit product" : "Add a product"}
      </h1>

      <form action={saveProduct} className="mt-4 flex flex-col gap-3">
        {product && <input type="hidden" name="id" value={product.id} />}

        <Field
          label="Brand *"
          name="brand"
          defaultValue={product?.brand}
          placeholder="MuscleBlaze"
        />
        <Field
          label="Product name *"
          name="name"
          defaultValue={product?.name}
          placeholder="Biozyme Whey Protein 1kg"
        />
        <Field
          label="Price"
          name="price"
          defaultValue={product?.price}
          placeholder="₹1,799"
        />

        <PhotoUpload name="photo_url" initialUrl={product?.photo_url} />

        <Field
          label="Buy link *"
          name="buy_url"
          defaultValue={product?.buy_url}
          placeholder="https://..."
        />
        <p className="text-xs text-neutral-400">
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
