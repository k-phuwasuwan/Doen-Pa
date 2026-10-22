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
  /** `browserCache` is honored only when no session cookie changes ride on the response. */
  function finish(response: NextResponse, browserCache?: string) {
    const cookies = pending.cookies.getAll();
    for (const cookie of cookies) response.cookies.set(cookie);
    if (browserCache && !cookies.length) {
      response.headers.set("Cache-Control", browserCache);
    } else {
      response.headers.set("Cache-Control", "private, no-store");
      response.headers.set("Pragma", "no-cache");
      response.headers.set("Expires", "0");
    }
    response.headers.set("Referrer-Policy", "no-referrer");
    return response;
  }
  return { supabase, finish };
}
