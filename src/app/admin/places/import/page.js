import { redirect } from "next/navigation";
import BulkPlaces from "@/components/BulkPlaces";
import { getAdminUser } from "@/lib/admin";

export const metadata = { title: "Add places from links" };

// Resolving short links and querying OpenStreetMap takes longer than a
// normal request.
export const maxDuration = 60;

export default async function ImportPlacesPage() {
  const admin = await getAdminUser();
  if (!admin) redirect("/profile");

  return <BulkPlaces />;
}
