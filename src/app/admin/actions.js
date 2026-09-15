"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/admin";
import { normalizeUrl } from "@/lib/url";
import { fetchProductMeta, fetchPlaceMeta } from "@/lib/scrape";
import { parseMapsUrl, resolveMapsUrl } from "@/lib/maps";
import { enrichFromCoords } from "@/lib/enrich";

// Kept small so a batch finishes inside the hosting time limit.
const MAX_BATCH = 8;

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
    website: textOrNull(formData.get("website")),
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

  let found;
  try {
    found = await placeFromLink(link);
  } catch (e) {
    // An unreachable or blocked site must not take the whole page down.
    return { error: `Couldn't reach that link (${e.message}).` };
  }

  if (!found) {
    return {
      error:
        "Couldn't read that link. Paste a Google Maps share link, or the business's own website address.",
    };
  }

  const filled = ["address", "phone", "timings", "photo_url", "website"].filter(
    (k) => found[k]
  );

  return { place: found, filled };
}

const isMapsLink = (link) => /google\.[a-z.]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps/i.test(link);

// Accepts either a Google Maps link or the business's own website, and takes
// whatever each can give. A Maps link is authoritative for position; a website
// usually carries the address, phone, hours and a usable photo.
async function placeFromLink(link) {
  if (isMapsLink(link)) {
    const resolved = await resolveMapsUrl(link);
    const found = parseMapsUrl(resolved);
    if (found.lat === null) return null;

    const extra = await enrichFromCoords(found.lat, found.lon, found.name);

    // Only take a phone, address or hours when the name actually matched.
    // A nearby shop's phone number is worse than no phone number.
    return {
      ...found,
      area: extra.area ?? null,
      address: extra.confident ? (extra.address ?? null) : null,
      phone: extra.confident ? (extra.phone ?? null) : null,
      timings: extra.confident ? (extra.timings ?? null) : null,
      photo_url: null,
      website: null,
      matched: Boolean(extra.confident),
      from: "maps",
    };
  }

  const site = await fetchPlaceMeta(link);

  // A site that publishes its own coordinates lets us fill the gaps from
  // OpenStreetMap too.
  let extra = {};
  if (site.lat !== null && site.lon !== null) {
    extra = await enrichFromCoords(site.lat, site.lon, site.name);
  }

  return {
    name: site.name,
    lat: site.lat,
    lon: site.lon,
    area: site.area ?? extra.area ?? null,
    address: site.address ?? (extra.confident ? extra.address : null),
    phone: site.phone ?? (extra.confident ? extra.phone : null),
    timings: site.timings ?? (extra.confident ? extra.timings : null),
    photo_url: await storeImage(site.image),
    website: site.website ?? null,
    matched: Boolean(site.address || site.phone),
    from: "website",
  };
}

export async function lookupMapsLinks(_prevState, formData) {
  const admin = await getAdminUser();
  if (!admin) return { error: "Not authorised" };

  const links = (formData.get("urls") ?? "")
    .toString()
    .split(/[\s,]+/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (links.length === 0) return { error: "Paste at least one link" };

  const capped = links.slice(0, MAX_BATCH);
  const settled = await Promise.allSettled(
    capped.map((link) => placeFromLink(link))
  );

  return {
    places: settled
      .map((r) => (r.status === "fulfilled" ? r.value : null))
      .filter(Boolean),
    failed: settled
      .map((r, i) =>
        r.status === "rejected" || r.value === null ? capped[i] : null
      )
      .filter(Boolean),
    skipped: links.length > MAX_BATCH ? links.length - MAX_BATCH : 0,
  };
}

export async function deleteManyPlaces(formData) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("Not authorised");

  const ids = JSON.parse(formData.get("ids") ?? "[]");
  if (!Array.isArray(ids) || ids.length === 0) throw new Error("Nothing selected");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("places")
    .delete()
    .in("id", ids)
    .select("id");

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) {
    throw new Error("Nothing was removed. Your account may lack permission.");
  }

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deleteManyProducts(formData) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("Not authorised");

  const ids = JSON.parse(formData.get("ids") ?? "[]");
  if (!Array.isArray(ids) || ids.length === 0) throw new Error("Nothing selected");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .delete()
    .in("id", ids)
    .select("id");

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) {
    throw new Error("Nothing was removed. Your account may lack permission.");
  }

  revalidatePath("/shop");
  revalidatePath("/admin");
}

export async function deleteManyEvents(formData) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("Not authorised");

  const ids = JSON.parse(formData.get("ids") ?? "[]");
  if (!Array.isArray(ids) || ids.length === 0) throw new Error("Nothing selected");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .delete()
    .in("id", ids)
    .select("id");

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) {
    throw new Error("Nothing was removed. Your account may lack permission.");
  }

  revalidatePath("/events");
  revalidatePath("/admin");
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
      photo_url: row.photo_url ?? null,
      website: row.website ?? null,
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
  // .select() makes the deleted rows come back. Without it a blocked delete
  // looks identical to a successful one: no error, nothing removed.
  const { data, error } = await supabase
    .from("places")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) {
    throw new Error(
      "That place was not removed. Your account may no longer have permission."
    );
  }

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
  // .select() makes the deleted rows come back. Without it a blocked delete
  // looks identical to a successful one: no error, nothing removed.
  const { data, error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) {
    throw new Error(
      "That product was not removed. Your account may no longer have permission."
    );
  }

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
  // .select() makes the deleted rows come back. Without it a blocked delete
  // looks identical to a successful one: no error, nothing removed.
  const { data, error } = await supabase
    .from("events")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) {
    throw new Error(
      "That event was not removed. Your account may no longer have permission."
    );
  }

  revalidatePath("/events");
  revalidatePath("/admin");
  redirect("/admin");
}

// A few places at a time, so one slow site can't push the whole batch past the
// hosting time limit. Press the button again for the next few.
const PHOTO_BATCH = 4;

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${label} took too long`)), ms)
    ),
  ]);
}

// Fills in photos for places that have a website but no picture yet, by reading
// the site's own preview image. Nothing is overwritten: a place that already
// has a photo is left alone.
export async function fillPhotos(_prevState) {
  const admin = await getAdminUser();
  if (!admin) return { error: "Not authorised" };

  const supabase = await createClient();

  const { data: pending, error: readError } = await supabase
    .from("places")
    .select("id, name, website")
    .not("website", "is", null)
    .is("photo_url", null)
    .order("id")
    .limit(PHOTO_BATCH);

  if (readError) return { error: readError.message };

  // "Nothing to do" has two very different causes, and saying the wrong one
  // hides a real problem — an import that dropped the website column reads
  // exactly like a job well done.
  if (!pending?.length) {
    const { count: withSite } = await supabase
      .from("places")
      .select("id", { count: "exact", head: true })
      .not("website", "is", null);

    return {
      done: 0,
      failed: [],
      remaining: 0,
      message:
        withSite
          ? `All ${withSite} place${withSite === 1 ? "" : "s"} with a website already have a photo.`
          : "No place has a website yet, so there is nothing to fetch. Add a website to a place, or include a website column in your CSV.",
    };
  }

  const results = await Promise.allSettled(
    pending.map(async (place) => {
      const meta = await withTimeout(fetchPlaceMeta(place.website), 12000, "The site");
      if (!meta.image) throw new Error("no preview image on the page");

      const stored = await withTimeout(storeImage(meta.image), 12000, "The image");
      if (!stored) throw new Error("the image couldn't be saved");

      // .select() so a blocked write shows up — a refused update returns no
      // error and no rows.
      const { data, error } = await supabase
        .from("places")
        .update({ photo_url: stored })
        .eq("id", place.id)
        .select("id");

      if (error) throw new Error(error.message);
      if (!data?.length) throw new Error("the database refused the update");
      return place.name;
    })
  );

  const done = results.filter((r) => r.status === "fulfilled").length;
  const failed = results
    .map((r, i) => (r.status === "rejected" ? `${pending[i].name}: ${r.reason.message}` : null))
    .filter(Boolean);

  const { count } = await supabase
    .from("places")
    .select("id", { count: "exact", head: true })
    .not("website", "is", null)
    .is("photo_url", null);

  revalidatePath("/");
  revalidatePath("/admin");

  return { done, failed, remaining: count ?? 0 };
}
