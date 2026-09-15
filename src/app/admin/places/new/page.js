import { redirect } from "next/navigation";
import PlaceForm from "@/components/PlaceForm";
import { getAdminUser } from "@/lib/admin";

export const metadata = { title: "Add place" };

export default async function NewPlacePage() {
  const admin = await getAdminUser();
  if (!admin) redirect("/profile");

  return <PlaceForm />;
}
