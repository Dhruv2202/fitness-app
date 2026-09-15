import { getProducts } from "@/lib/data";

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-neutral-900">Shop</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Supplements & gear, straight from the brands
      </p>

      <div className="mt-4 flex flex-col gap-3">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3"
          >
            {product.photo_url ? (
              <img
                src={product.photo_url}
                alt={product.name}
                className="h-16 w-16 shrink-0 rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-2xl">
                💪
              </div>
            )}

            <div className="flex-1">
              <span className="text-xs font-medium text-neutral-400">
                {product.brand}
              </span>
              <p className="font-semibold text-neutral-900">{product.name}</p>
              {product.price && (
                <p className="text-sm text-neutral-700">{product.price}</p>
              )}
            </div>

            <a
              href={`/api/buy/${product.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Buy
            </a>
          </div>
        ))}

        {products.length === 0 && (
          <p className="mt-6 text-center text-sm text-neutral-400">
            No products listed yet.
          </p>
        )}
      </div>
    </div>
  );
}
