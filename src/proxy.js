import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

function hasSessionCookie(request) {
  return request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith("sb-"));
}

export async function proxy(request) {
  let response = NextResponse.next({ request });

  // Signed-out visitors have no session to refresh, so skip the round trip to
  // the auth server. It costs ~200ms and runs on every single request.
  if (!hasSessionCookie(request)) return response;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refreshes the session cookie if it's expired. Required for Server
  // Components, which can't write cookies themselves.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
