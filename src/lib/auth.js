import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

// Returns the signed-in user, or null. Checks for a session cookie first so
// signed-out visitors skip the round trip to the auth server entirely.
export async function getOptionalUser() {
  const cookieStore = await cookies();
  const hasSession = cookieStore
    .getAll()
    .some((cookie) => cookie.name.startsWith("sb-"));

  if (!hasSession) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
