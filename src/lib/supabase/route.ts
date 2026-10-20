import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig } from "./config";

/** Carry every SDK cookie and cache header onto the final JSON/redirect response. */
export function createRouteClient(request: NextRequest) {
  const { url, publishableKey } = getSupabaseConfig();
  const pending = new NextResponse();
  const supabase = createServerClient(url, publishableKey, {
    cookieOptions: { sameSite: "lax", secure: request.nextUrl.protocol === "https:" },
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookies, headers) {
        for (const { name, value, options } of cookies) {
          request.cookies.set(name, value);
          pending.cookies.set(name, value, options);
        }
        for (const [name, value] of Object.entries(headers)) pending.headers.set(name, value);
      },
    },
  });
  function finish(response: NextResponse) {
    for (const cookie of pending.cookies.getAll()) response.cookies.set(cookie);
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    response.headers.set("Referrer-Policy", "no-referrer");
    return response;
  }
  return { supabase, finish };
}
