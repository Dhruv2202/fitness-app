import { redirect } from "next/navigation";
import EventForm from "@/components/EventForm";
import { getAdminUser } from "@/lib/admin";
import { getEvent } from "@/lib/data";

export const metadata = { title: "Edit event" };

export default async function EditEventPage({ params }) {
  const admin = await getAdminUser();
  if (!admin) redirect("/profile");

  const { id } = await params;
  const event = await getEvent(id);
  if (!event) redirect("/admin");

  return <EventForm event={event} />;
}
