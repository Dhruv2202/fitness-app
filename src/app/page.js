import DiscoverList from "@/components/DiscoverList";
import { getPlaces } from "@/lib/data";

// Served from cache and refreshed in the background, so visits are instant.
// Admin edits refresh it immediately via revalidatePath.
export const revalidate = 300;

export default async function DiscoverPage() {
  const places = await getPlaces();
  return <DiscoverList places={places} />;
}
