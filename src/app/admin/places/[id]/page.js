import { redirect } from "next/navigation";
import GoneNotice from "@/components/GoneNotice";
import PlaceForm from "@/components/PlaceForm";
import { getAdminUser } from "@/lib/admin";
import { getPlace } from "@/lib/data";

export const metadata = { title: "Edit place" };

export default async function EditPlacePage({ params }) {
  const admin = await getAdminUser();
  if (!admin) redirect("/profile");

  const { id } = await params;
  const place = await getPlace(id);
  if (!place) redirect("/admin");

  return <PlaceForm place={place} />;
}
