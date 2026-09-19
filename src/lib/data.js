import { createPublicClient } from "@/lib/supabase/public";

// Only the fields the list actually renders. Fetching every column meant
// sending roughly four times more data than the cards use.
const LIST_FIELDS = "id, name, type, area, fee, rating, photo_url, lat, lon";

// Supabase caps a single response at 1000 rows, so pull pages until exhausted.
// Without this, places beyond the first 1000 would silently disappear.
const PAGE_SIZE = 1000;

export async function getPlaces() {
  const supabase = createPublicClient();
  const places = [];

  for (let page = 0; ; page++) {
    const { data, error } = await supabase
      .from("places")
      .select(LIST_FIELDS)
      .order("name")
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

    if (error || !data?.length) break;
    places.push(...data);
    if (data.length < PAGE_SIZE) break;
  }

  return places;
}

// getPlaces trims to the columns the cards render. The export must not use it:
// an import writes back every column it read, so a field missing here would be
// wiped from every place on the next round trip.
export async function getPlacesForExport() {
  const supabase = createPublicClient();
  const places = [];

  for (let page = 0; ; page++) {
    const { data, error } = await supabase
      .from("places")
      .select("*")
      .order("id")
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

    if (error || !data?.length) break;
    places.push(...data);
    if (data.length < PAGE_SIZE) break;
  }

  return places;
}

export async function getPlace(id) {
  if (!/^\d+$/.test(id)) return null;
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("places")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data;
}

// The audience is in India, so "today" must be IST. Using UTC would keep an
// event listed as upcoming for five and a half hours after it finished.
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

function today() {
  return new Date(Date.now() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

export async function getUpcomingEvents() {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("events")
    .select("id, name, event_date, venue, organiser, type, photo_url")
    .gte("event_date", today())
    .order("event_date");
  return data ?? [];
}

export async function getAllEvents() {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: false });
  return data ?? [];
}

export async function getEvent(id) {
  if (!/^\d+$/.test(id)) return null;
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data;
}

export async function getProducts() {
  const supabase = createPublicClient();
  const { data } = await supabase.from("products").select("*").order("id");
  return data ?? [];
}

export async function getProduct(id) {
  if (!/^\d+$/.test(id)) return null;
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data;
}
