import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin";
import { getPlaces, getAllEvents, getProducts } from "@/lib/data";
import { iconForType } from "@/lib/icons";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const admin = await getAdminUser();
  if (!admin) redirect("/profile");

  const [places, events, products] = await Promise.all([
    getPlaces(),
    getAllEvents(),
    getProducts(),
  ]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-neutral-900">Manage content</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Everything here is live in the app as soon as you save it.
      </p>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-900">
          Events ({events.length})
        </h2>
        <Link
          href="/admin/events/new"
          className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
        >
          + Add event
        </Link>
      </div>

      <div className="mt-2 flex flex-col gap-2">
        {events.map((event) => (
          <Link
            key={event.id}
            href={`/admin/events/${event.id}`}
            className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-3"
          >
            <span className="text-sm font-medium text-neutral-900">
              {event.name}
            </span>
            <span className="text-xs text-neutral-400">{event.event_date}</span>
          </Link>
        ))}
        {events.length === 0 && (
          <p className="text-sm text-neutral-400">
            No events yet. Add the first one.
          </p>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-900">
          Shop products ({products.length})
        </h2>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
        >
          + Add product
        </Link>
      </div>

      <div className="mt-2 flex flex-col gap-2">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/admin/products/${product.id}`}
            className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-3"
          >
            <span className="text-sm font-medium text-neutral-900">
              {product.name}
            </span>
            <span className="text-xs text-neutral-400">{product.brand}</span>
          </Link>
        ))}
        {products.length === 0 && (
          <p className="text-sm text-neutral-400">No products yet.</p>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-900">
          Places ({places.length})
        </h2>
        <div className="flex gap-2">
          <Link
            href="/admin/import"
            className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700"
          >
            ⬆ Import
          </Link>
          <Link
            href="/admin/places/new"
            className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
          >
            + Add place
          </Link>
        </div>
      </div>

      <p className="mt-1 text-xs text-neutral-400">
        Tap any place to add a photo, phone number, fee or timings. Use Import to
        add many at once from a spreadsheet.
      </p>

      <div className="mt-2 flex flex-col gap-2">
        {places.map((place) => (
          <Link
            key={place.id}
            href={`/admin/places/${place.id}`}
            className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3"
          >
            {place.photo_url ? (
              <img
                src={place.photo_url}
                alt=""
                className="h-10 w-10 shrink-0 rounded-lg object-cover"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-lg">
                {iconForType(place.type)}
              </span>
            )}
            <span className="flex-1 text-sm font-medium text-neutral-900">
              {place.name}
            </span>
            {!place.photo_url && (
              <span className="text-xs text-neutral-400">no photo</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
