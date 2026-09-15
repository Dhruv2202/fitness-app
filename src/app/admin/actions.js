"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/admin";
import { normalizeUrl } from "@/lib/url";

function textOrNull(value) {
  const trimmed = (value ?? "").toString().trim();
  return trimmed === "" ? null : trimmed;
}

function numberOrNull(value) {
  const trimmed = (value ?? "").toString().trim();
  if (trimmed === "") return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function placeFromForm(formData) {
  const amenities = textOrNull(formData.get("amenities"));
  return {
    name: textOrNull(formData.get("name")),
    type: textOrNull(formData.get("type")) ?? "Gym",
    area: textOrNull(formData.get("area")),
    address: textOrNull(formData.get("address")),
    lat: numberOrNull(formData.get("lat")),
    lon: numberOrNull(formData.get("lon")),
    fee: textOrNull(formData.get("fee")),
    rating: numberOrNull(formData.get("rating")),
    phone: textOrNull(formData.get("phone")),
    timings: textOrNull(formData.get("timings")),
    photo_url: textOrNull(formData.get("photo_url")),
    amenities: amenities
      ? amenities.split(",").map((a) => a.trim()).filter(Boolean)
      : [],
  };
}

export async function savePlace(formData) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("Not authorised");

  const id = textOrNull(formData.get("id"));
  const values = placeFromForm(formData);

  if (!values.name) throw new Error("Name is required");

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("places").update(values).eq("id", id)
    : await supabase.from("places").insert(values);

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

const VALID_TYPES = ["Gym", "Spa", "Yoga Studio", "Activity Centre"];

export async function importPlaces(formData) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("Not authorised");

  const payload = formData.get("places");
  const rows = JSON.parse(payload ?? "[]");
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("Nothing to import");
  }

  const values = rows
    .filter((row) => row?.name)
    .map((row) => ({
      name: String(row.name).slice(0, 200),
      type: VALID_TYPES.includes(row.type) ? row.type : "Gym",
      area: row.area ?? null,
      address: row.address ?? null,
      phone: row.phone ?? null,
      fee: row.fee ?? null,
      timings: row.timings ?? null,
      rating:
        Number.isFinite(row.rating) && row.rating >= 0 && row.rating <= 5
          ? row.rating
          : null,
      lat: Number.isFinite(row.lat) ? row.lat : null,
      lon: Number.isFinite(row.lon) ? row.lon : null,
      amenities: Array.isArray(row.amenities) ? row.amenities : [],
    }));

  const supabase = await createClient();
  const { error } = await supabase.from("places").insert(values);
  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function deletePlace(formData) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("Not authorised");

  const id = textOrNull(formData.get("id"));
  const supabase = await createClient();
  const { error } = await supabase.from("places").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function saveProduct(formData) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("Not authorised");

  const id = textOrNull(formData.get("id"));
  const values = {
    brand: textOrNull(formData.get("brand")),
    name: textOrNull(formData.get("name")),
    price: textOrNull(formData.get("price")),
    buy_url: normalizeUrl(formData.get("buy_url")),
    photo_url: textOrNull(formData.get("photo_url")),
  };

  if (!values.brand) throw new Error("Brand is required");
  if (!values.name) throw new Error("Name is required");
  if (!values.buy_url) throw new Error("Buy link must be a valid web address");

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("products").update(values).eq("id", id)
    : await supabase.from("products").insert(values);

  if (error) throw new Error(error.message);

  revalidatePath("/shop");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function deleteProduct(formData) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("Not authorised");

  const id = textOrNull(formData.get("id"));
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/shop");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function saveEvent(formData) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("Not authorised");

  const id = textOrNull(formData.get("id"));
  const values = {
    name: textOrNull(formData.get("name")),
    event_date: textOrNull(formData.get("event_date")),
    venue: textOrNull(formData.get("venue")),
    organiser: textOrNull(formData.get("organiser")),
    type: textOrNull(formData.get("type")),
    description: textOrNull(formData.get("description")),
    registration_url: normalizeUrl(formData.get("registration_url")),
    photo_url: textOrNull(formData.get("photo_url")),
  };

  if (!values.name) throw new Error("Name is required");
  if (!values.event_date) throw new Error("Date is required");

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("events").update(values).eq("id", id)
    : await supabase.from("events").insert(values);

  if (error) throw new Error(error.message);

  revalidatePath("/events");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function deleteEvent(formData) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("Not authorised");

  const id = textOrNull(formData.get("id"));
  const supabase = await createClient();
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/events");
  revalidatePath("/admin");
  redirect("/admin");
}
