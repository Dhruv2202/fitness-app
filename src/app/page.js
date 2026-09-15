import DiscoverList from "@/components/DiscoverList";
import { getPlaces } from "@/lib/data";

export default async function DiscoverPage() {
  const places = await getPlaces();
  return <DiscoverList places={places} />;
}
