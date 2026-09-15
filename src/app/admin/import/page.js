import { redirect } from "next/navigation";
import BulkImport from "@/components/BulkImport";
import { getAdminUser } from "@/lib/admin";
import { getPlaces } from "@/lib/data";

export const metadata = { title: "Import places" };

export default async function ImportPage() {
  const admin = await getAdminUser();
  if (!admin) redirect("/profile");

  const places = await getPlaces();
  return <BulkImport existingNames={places.map((p) => p.name)} />;
}
