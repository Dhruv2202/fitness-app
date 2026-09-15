import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Reads public content (places, events, products) without touching cookies.
// Staying cookie-free is what lets those pages be cached and served instantly
// instead of being rebuilt on every visit.
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
