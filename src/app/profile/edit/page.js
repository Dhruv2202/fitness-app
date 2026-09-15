import { redirect } from "next/navigation";
import ProfileDetailsForm from "@/components/ProfileDetailsForm";
import { getOptionalUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Your details" };

export default async function EditProfilePage() {
  const user = await getOptionalUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return <ProfileDetailsForm profile={profile} email={user.email} />;
}
