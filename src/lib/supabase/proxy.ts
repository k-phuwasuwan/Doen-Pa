import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig } from "./config";

export async function updateSession(request: NextRequest) {
  const { url, publishableKey } = getSupabaseConfig();
  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }

        const previousResponse = response;
        response = NextResponse.next({ request });
        // The SDK may write more than once, sending cache headers only on the first write.
        for (const cookie of previousResponse.cookies.getAll()) {
          response.cookies.set(cookie);
        }
        for (const header of ["cache-control", "expires", "pragma"]) {
          const value = previousResponse.headers.get(header);
          if (value) response.headers.set(header, value);
        }
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        for (const [name, value] of Object.entries(headers)) {
          response.headers.set(name, value);
        }
      },
    },
  });

  // Verifies the token and refreshes expired sessions. This is not an access guard:
  // future protected operations must verify the user and rely on database RLS too.
  await supabase.auth.getClaims();

  return response;
}
