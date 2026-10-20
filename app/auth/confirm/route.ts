import { NextResponse, type NextRequest } from "next/server";
import { createRouteClient } from "@/lib/supabase/route";
import { safeAuthNext } from "@/lib/auth/redirects";
import { ensureAccountProfile } from "@/lib/auth/server";

// Supports SSR email templates using TokenHash, including opening on another device.
export async function GET(request: NextRequest) {
  const { supabase, finish } = createRouteClient(request);
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  if (tokenHash && (type === "email" || type === "signup" || type === "recovery")) {
    try {
      const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
      if (!error && data.user) {
        await ensureAccountProfile(supabase, data.user.id);
        const next = type === "recovery" ? "/reset-password" : safeAuthNext(request.nextUrl.searchParams.get("next"));
        return finish(NextResponse.redirect(new URL(next, request.nextUrl.origin), 303));
      }
    } catch {
      // Invalid, expired, already-used or unavailable confirmation links.
    }
  }
  return finish(NextResponse.redirect(new URL("/login?error=link", request.nextUrl.origin), 303));
}
