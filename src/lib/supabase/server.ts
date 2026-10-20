import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import { getSupabaseConfig } from "./config";

export async function createClient() {
  const cookieStore = await cookies();
  const requestHeaders = await headers();
  const { url, publishableKey } = getSupabaseConfig();

  // Create one server client per request; never share sessions between users.
  return createServerClient(url, publishableKey, {
    cookieOptions: { sameSite: "lax", secure: requestHeaders.get("x-forwarded-proto") === "https" },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components cannot write cookies. Proxy refreshes them before render.
        }
      },
    },
  });
}
