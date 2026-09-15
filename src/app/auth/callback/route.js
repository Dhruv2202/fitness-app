import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=link_expired`);
  }

  if (next) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  // Someone arriving through an emailed link skips the signup questions, so
  // send them to fill those in if we still don't know who they are.
  const userId = data?.user?.id;
  if (userId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .maybeSingle();

    if (!profile?.full_name) {
      return NextResponse.redirect(`${origin}/profile/edit?welcome=1`);
    }
  }

  return NextResponse.redirect(`${origin}/profile`);
}
