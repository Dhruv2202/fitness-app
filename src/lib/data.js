import { createClient } from "@/lib/supabase/server";

export async function getPlaces() {
  const supabase = await createClient();
  const { data } = await supabase.from("places").select("*").order("name");
  return data ?? [];
}

export async function getPlace(id) {
  if (!/^\d+$/.test(id)) return null;
  const supabase = await createClient();
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
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .gte("event_date", today())
    .order("event_date");
  return data ?? [];
}

export async function getAllEvents() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: false });
  return data ?? [];
}

export async function getProducts() {
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("*").order("id");
  return data ?? [];
}

export async function getProduct(id) {
  if (!/^\d+$/.test(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data;
}

export async function getEvent(id) {
  if (!/^\d+$/.test(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data;
}
