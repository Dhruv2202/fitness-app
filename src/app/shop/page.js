import PageHeader from "@/components/PageHeader";
import { getProducts } from "@/lib/data";

// Served from cache and refreshed in the background, so visits are instant.
// Admin edits refresh it immediately via revalidatePath.
export const revalidate = 300;

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <div className="px-4 pb-6 pt-5">
      <PageHeader
        title="Shop"
        subtitle="Supplements & gear, straight from the brands"
      />

      <div className="mt-5 flex flex-col gap-3">
        {products.map((product) => (
          <div
            key={product.id}
            className="card-shadow flex items-center gap-3 rounded-2xl border border-line bg-surface p-3"
          >
            {product.photo_url ? (
              <img
                src={product.photo_url}
                alt={product.name}
                className="h-16 w-16 shrink-0 rounded-xl object-cover"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="photo-placeholder flex h-16 w-16 shrink-0 items-center justify-center rounded-xl text-2xl">
                💪
              </div>
            )}

            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                {product.brand}
              </span>
              <p className="font-semibold leading-snug text-ink">
                {product.name}
              </p>
              {product.price && (
                <p className="mt-0.5 text-sm font-medium text-ink">
                  {product.price}
                </p>
              )}
            </div>

            <a
              href={`/api/buy/${product.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="press shrink-0 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-ink"
            >
              Buy
            </a>
          </div>
        ))}

        {products.length === 0 && (
          <div className="mt-12 text-center">
            <span className="text-4xl">🛒</span>
            <p className="mt-3 font-semibold text-ink">No products yet</p>
          </div>
        )}
      </div>

      <p className="mt-6 text-center text-[11px] text-muted">
        Buying takes you to the brand&apos;s own website.
      </p>
    </div>
  );
}
