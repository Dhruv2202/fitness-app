"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOptionalUser } from "@/lib/auth";
import { GENDER_OPTIONS } from "@/lib/profile";

function textOrNull(value) {
  const trimmed = (value ?? "").toString().trim();
  return trimmed === "" ? null : trimmed;
}

export async function saveProfile(formData) {
  const user = await getOptionalUser();
  if (!user) redirect("/login");

  const gender = textOrNull(formData.get("gender"));
  const dateOfBirth = textOrNull(formData.get("date_of_birth"));

  // A date of birth in the future, or implying an age over 120, is a typo.
  if (dateOfBirth) {
    const born = new Date(dateOfBirth);
    const years = (Date.now() - born.getTime()) / (365.25 * 24 * 3600 * 1000);
    if (Number.isNaN(born.getTime()) || years < 0 || years > 120) {
      throw new Error("Please check the date of birth");
    }
  }

  const values = {
    id: user.id,
    full_name: textOrNull(formData.get("full_name")),
    date_of_birth: dateOfBirth,
    gender: GENDER_OPTIONS.some((o) => o.value === gender) ? gender : null,
    phone: textOrNull(formData.get("phone")),
    updated_at: new Date().toISOString(),
  };

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").upsert(values);
  if (error) throw new Error(error.message);

  revalidatePath("/profile");

  if (textOrNull(formData.get("redirect_to_profile"))) redirect("/profile");
}
