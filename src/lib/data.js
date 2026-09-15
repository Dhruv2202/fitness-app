import { createPublicClient } from "@/lib/supabase/public";

// Only the fields the list actually renders. Fetching every column meant
// sending roughly four times more data than the cards use.
const LIST_FIELDS = "id, name, type, area, fee, rating, photo_url, lat, lon";

export async function getPlaces() {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("places")
    .select(LIST_FIELDS)
    .order("name");
  return data ?? [];
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

function today() {
  return new Date().toISOString().slice(0, 10);
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
