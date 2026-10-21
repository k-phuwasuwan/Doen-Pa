import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { loginHref } from "./redirects";
import { loadAccountData } from "@/lib/account/server";

export async function ensureAccountProfile(supabase: SupabaseClient, userId: string) {
  const { error } = await supabase.from("profiles").upsert({ user_id: userId }, { onConflict: "user_id", ignoreDuplicates: true });
  if (error) throw new Error("Could not initialize account profile");
}

/** Request-scoped only: never cache an authenticated identity across requests. */
export const getAuthAccount = cache(async () => {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    if (error.name === "AuthSessionMissingError" || error.status === 401 || error.status === 403) return null;
    throw new Error("ตรวจสอบการเข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่");
  }
  if (!user) return null;
  return loadAccountData(supabase, user.id, user.user_metadata.profile_setup_pending === true);
});

export const getAuthUser = cache(async () => (await getAuthAccount())?.user ?? null);

export async function requireAuthUser(next: string) {
  const user = await getAuthUser();
  if (!user) redirect(loginHref(next));
  return user;
}
