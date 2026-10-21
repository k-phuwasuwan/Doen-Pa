import { NextResponse, type NextRequest } from "next/server";
import { createRouteClient } from "@/lib/supabase/route";
import { safeAuthNext, postAuthDestination } from "@/lib/auth/redirects";
import { ensureAccountProfile } from "@/lib/auth/server";

export async function GET(request: NextRequest) {
  const { supabase, finish } = createRouteClient(request);
  const code = request.nextUrl.searchParams.get("code");
  const next = safeAuthNext(request.nextUrl.searchParams.get("next"));
  if (code) {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && data.user) {
        await ensureAccountProfile(supabase, data.user.id);
        return finish(NextResponse.redirect(new URL(postAuthDestination(next, data.user.user_metadata.profile_setup_pending === true), request.nextUrl.origin), 303));
      }
    } catch {
      // Show a recoverable error without reflecting provider errors or tokens.
    }
  }
  return finish(NextResponse.redirect(new URL("/login?error=link", request.nextUrl.origin), 303));
}
