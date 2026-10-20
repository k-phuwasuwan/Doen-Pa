import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { loginHref } from "./redirects";
import type { User } from "@/types";

export async function ensureAccountProfile(supabase: SupabaseClient, userId: string) {
  const { error } = await supabase.from("profiles").upsert({ user_id: userId }, { onConflict: "user_id", ignoreDuplicates: true });
  if (error) throw new Error("Could not initialize account profile");
}

/** Request-scoped only: never cache an authenticated identity across requests. */
export const getAuthUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    if (error.name === "AuthSessionMissingError" || error.status === 401 || error.status === 403) return null;
    throw new Error("ตรวจสอบการเข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่");
  }
  if (!user) return null;
  const { data: profile, error: profileError } = await supabase.from("profiles")
    .select("name, username, bio").eq("user_id", user.id).maybeSingle();
  if (profileError) throw new Error("โหลดโปรไฟล์ไม่สำเร็จ กรุณาลองใหม่");
  return { id: user.id, name: profile?.name ?? "ผู้ใช้ใหม่", username: profile?.username ?? "new_hiker", bio: profile?.bio ?? "" };
});

export async function requireAuthUser(next: string) {
  const user = await getAuthUser();
  if (!user) redirect(loginHref(next));
  return user;
}
