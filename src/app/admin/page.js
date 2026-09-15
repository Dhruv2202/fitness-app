import Link from "next/link";
import { redirect } from "next/navigation";
import AdminSection from "@/components/AdminSection";
import PhotoFiller from "@/components/PhotoFiller";
import { getAdminUser } from "@/lib/admin";
import { getPlaces, getAllEvents, getProducts } from "@/lib/data";
import { iconForType } from "@/lib/icons";
import {
  deleteManyPlaces,
  deleteManyProducts,
  deleteManyEvents,
} from "@/app/admin/actions";

export const metadata = { title: "Admin" };

const pillPrimary =
  "rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-brand-ink";
const pillSecondary =
  "rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink";

export default async function AdminPage() {
  const admin = await getAdminUser();
  if (!admin) redirect("/profile");

  const [places, events, products] = await Promise.all([
    getPlaces(),
    getAllEvents(),
    getProducts(),
  ]);

  return (
    <div className="px-4 pb-8 pt-6">
      <h1 className="text-2xl font-bold text-ink">Manage content</h1>
      <p className="mt-1 text-sm text-muted">
        Everything here is live in the app as soon as you save it. Use Select to
        remove several at once.
      </p>

      <AdminSection
        title="Events"
        items={events.map((event) => ({
          id: event.id,
          node: (
            <>
              <span className="flex-1 text-sm font-medium text-ink">
                {event.name}
              </span>
              <span className="text-xs text-muted">{event.event_date}</span>
            </>
          ),
        }))}
        editHref="/admin/events"
        deleteAction={deleteManyEvents}
        emptyText="No events yet. Add the first one."
        actions={
          <Link href="/admin/events/new" className={pillPrimary}>
            + Add event
          </Link>
        }
      />

      <AdminSection
        title="Shop products"
        items={products.map((product) => ({
          id: product.id,
          node: (
            <>
              {product.photo_url ? (
                <img src={product.photo_url} alt="" loading="lazy" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
              ) : (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-lg">💪</span>
              )}
              <span className="flex-1 truncate text-sm font-medium text-ink">{product.name}</span>
              <span className="shrink-0 text-xs text-muted">{product.brand}</span>
            </>
          ),
        }))}
        editHref="/admin/products"
        deleteAction={deleteManyProducts}
        emptyText="No products yet."
        actions={
          <>
            <Link href="/admin/products/import" className={pillSecondary}>
              ⬆ Several
            </Link>
            <Link href="/admin/products/new" className={pillPrimary}>
              + Add
            </Link>
          </>
        }
      />

      <AdminSection
        title="Places"
        items={places.map((place) => ({
          id: place.id,
          node: (
            <>
              {place.photo_url ? (
                <img src={place.photo_url} alt="" loading="lazy" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
              ) : (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-lg">{iconForType(place.type)}</span>
              )}
              <span className="flex-1 truncate text-sm font-medium text-ink">{place.name}</span>
              {!place.photo_url && (<span className="shrink-0 text-xs text-muted">no photo</span>)}
            </>
          ),
        }))}
        editHref="/admin/places"
        deleteAction={deleteManyPlaces}
        emptyText="No places yet."
        actions={
          <>
            <Link href="/admin/places/import" className={pillSecondary}>
              📍 Links
            </Link>
            <Link href="/admin/import" className={pillSecondary}>
              ⬆ CSV
            </Link>
            <Link href="/admin/places/new" className={pillPrimary}>
              + Add
            </Link>
          </>
        }
      />

      <PhotoFiller />
    </div>
  );
}
