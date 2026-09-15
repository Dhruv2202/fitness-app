"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/admin";
import { normalizeUrl } from "@/lib/url";
import { fetchProductMeta } from "@/lib/scrape";
import { parseMapsUrl, resolveMapsUrl } from "@/lib/maps";

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

// Copies a remote image into our own storage. Hotlinking a brand's CDN breaks
// the moment they move or remove the file.
async function storeImage(imageUrl) {
  if (!imageUrl) return null;

  try {
    const res = await fetch(imageUrl);
    if (!res.ok) return null;

    const type = res.headers.get("content-type") ?? "image/jpeg";
    if (!type.startsWith("image/")) return null;

    const extension = type.includes("png")
      ? "png"
      : type.includes("webp")
        ? "webp"
        : "jpg";

    const supabase = await createClient();
    const path = `${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage
      .from("photos")
      .upload(path, await res.arrayBuffer(), { contentType: type });

    if (error) return null;
    return supabase.storage.from("photos").getPublicUrl(path).data.publicUrl;
  } catch {
    // A missing image is not worth failing the whole lookup over.
    return null;
  }
}

export async function lookupMapsLink(_prevState, formData) {
  const admin = await getAdminUser();
  if (!admin) return { error: "Not authorised" };

  const link = textOrNull(formData.get("maps_url"));
  if (!link) return { error: "Paste a Google Maps link first" };

  const resolved = await resolveMapsUrl(link);
  const found = parseMapsUrl(resolved);

  if (found.lat === null) {
    return {
      error:
        "Couldn't find coordinates in that link. Open the place in Google Maps and copy the link from the address bar.",
    };
  }

  return { place: found };
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

export async function lookupProduct(_prevState, formData) {
  const admin = await getAdminUser();
  if (!admin) return { error: "Not authorised" };

  const link = textOrNull(formData.get("lookup_url"));
  if (!link) return { error: "Paste a product link first" };

  let meta;
  try {
    meta = await fetchProductMeta(link);
  } catch (e) {
    return { error: e.message };
  }

  return { product: { ...meta, photo_url: await storeImage(meta.image) } };
}

// Kept small so a batch finishes inside the hosting time limit.
const MAX_BATCH = 8;

export async function lookupProducts(_prevState, formData) {
  const admin = await getAdminUser();
  if (!admin) return { error: "Not authorised" };

  const links = (formData.get("urls") ?? "")
    .toString()
    .split(/[\s,]+/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (links.length === 0) return { error: "Paste at least one link" };

  const capped = links.slice(0, MAX_BATCH);

  // In parallel, so the wait is the slowest page rather than the sum of them.
  const settled = await Promise.allSettled(
    capped.map(async (link) => {
      const meta = await fetchProductMeta(link);
      return { ...meta, photo_url: await storeImage(meta.image) };
    })
  );

  return {
    products: settled
      .map((r, i) => (r.status === "fulfilled" ? r.value : null))
      .filter(Boolean),
    failed: settled
      .map((r, i) => (r.status === "rejected" ? capped[i] : null))
      .filter(Boolean),
    skipped: links.length > MAX_BATCH ? links.length - MAX_BATCH : 0,
  };
}

export async function importProducts(formData) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("Not authorised");

  const rows = JSON.parse(formData.get("products") ?? "[]");
  const values = rows
    .filter((row) => row?.name && row?.brand && row?.buy_url)
    .map((row) => ({
      brand: String(row.brand).slice(0, 120),
      name: String(row.name).slice(0, 250),
      price: row.price ?? null,
      buy_url: normalizeUrl(row.buy_url),
      photo_url: row.photo_url ?? null,
    }))
    .filter((row) => row.buy_url);

  if (values.length === 0) throw new Error("Nothing to add");

  const supabase = await createClient();
  const { error } = await supabase.from("products").insert(values);
  if (error) throw new Error(error.message);

  revalidatePath("/shop");
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
