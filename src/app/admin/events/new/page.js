import { redirect } from "next/navigation";
import EventForm from "@/components/EventForm";
import { getAdminUser } from "@/lib/admin";

export const metadata = { title: "Add event" };

export default async function NewEventPage() {
  const admin = await getAdminUser();
  if (!admin) redirect("/profile");

  return <EventForm />;
}
