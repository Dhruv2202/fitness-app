import { redirect } from "next/navigation";
import PlaceForm from "@/components/PlaceForm";
import { getAdminUser } from "@/lib/admin";

export const metadata = { title: "Add place" };

export default async function NewPlacePage({ searchParams }) {
  const admin = await getAdminUser();
  if (!admin) redirect("/profile");

  const { area, type, saved } = await searchParams;

  return (
    <PlaceForm
      defaultArea={typeof area === "string" ? area : ""}
      defaultType={typeof type === "string" ? type : "Gym"}
      justSaved={typeof saved === "string" ? saved : ""}
    />
  );
}
