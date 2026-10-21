import { NextResponse, type NextRequest } from "next/server";
import { createRouteClient } from "@/lib/supabase/route";
import { safeAuthNext, postAuthDestination } from "@/lib/auth/redirects";
import { ensureAccountProfile } from "@/lib/auth/server";

const actions = new Set(["login", "signup", "logout", "forgot-password", "reset-password", "resend", "complete-profile-setup"]);

function authError(code: string | undefined) {
  if (code === "invalid_credentials") return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
  if (code === "email_not_confirmed") return "กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ";
  if (code === "over_request_rate_limit" || code === "over_email_send_rate_limit") return "ทำรายการบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่";
  if (code === "email_address_not_authorized" || code === "email_address_invalid") return "ยังส่งอีเมลไปยังที่อยู่นี้ไม่ได้ กรุณาติดต่อผู้ดูแล";
  if (code === "weak_password") return "รหัสผ่านยังไม่ปลอดภัยพอ กรุณาใช้รหัสผ่านที่ยาวและคาดเดายากขึ้น";
  if (code === "same_password") return "กรุณาใช้รหัสผ่านใหม่ที่ต่างจากเดิม";
  return "ทำรายการไม่สำเร็จ กรุณาลองใหม่อีกครั้ง";
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;
  const { supabase, finish } = createRouteClient(request);
  const reply = (body: { error?: string; message?: string; next?: string }, status = 200) => finish(NextResponse.json(body, { status }));
  if (!actions.has(action)) return reply({ error: "ไม่พบรายการที่ต้องการ" }, 404);
  // Same-origin JSON requests only, including logout and password updates.
  if (request.headers.get("origin") !== request.nextUrl.origin || !request.headers.get("content-type")?.startsWith("application/json")) {
    return reply({ error: "คำขอไม่ถูกต้อง กรุณาโหลดหน้าใหม่" }, 403);
  }
  let body: Record<string, unknown>;
  try {
    const data: unknown = await request.json();
    if (!data || typeof data !== "object" || Array.isArray(data)) return reply({ error: "ข้อมูลไม่ถูกต้อง" }, 400);
    body = data as Record<string, unknown>;
  } catch {
    return reply({ error: "ข้อมูลไม่ถูกต้อง" }, 400);
  }
  const next = safeAuthNext(body.next);
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const callback = new URL("/auth/callback", request.nextUrl.origin);
  callback.searchParams.set("next", next);

  try {
    if (action === "logout") {
      const { error } = await supabase.auth.signOut({ scope: "local" });
      return error ? reply({ error: authError(error.code) }, 400) : reply({ next: "/profile" });
    }
    if (action === "complete-profile-setup") {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) return reply({ error: "กรุณาเข้าสู่ระบบอีกครั้งก่อนบันทึก" }, 401);
      const { data: profile, error: profileError } = await supabase.from("profiles").select("name,username").eq("user_id", user.id).single();
      if (profileError) return reply({ error: "ตรวจสอบโปรไฟล์ไม่สำเร็จ กรุณาลองบันทึกอีกครั้ง" }, 503);
      if (!profile.name.trim() || !/^[a-zA-Z0-9_]{3,20}$/.test(profile.username)) {
        return reply({ error: "กรุณาบันทึกชื่อและชื่อผู้ใช้ก่อนดำเนินการต่อ" }, 400);
      }
      const { error } = await supabase.auth.updateUser({ data: { profile_setup_pending: false } });
      return error ? reply({ error: "ตั้งค่าโปรไฟล์ไม่สำเร็จ กรุณาลองบันทึกอีกครั้ง" }, 503) : reply({ next: "/search" });
    }
    if (action !== "reset-password" && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)) {
      return reply({ error: "กรุณากรอกอีเมลให้ถูกต้อง" }, 400);
    }
    if (["signup", "reset-password"].includes(action) && (password.length < 8 || password.length > 72)) {
      return reply({ error: "กรุณาใช้รหัสผ่าน 8–72 ตัวอักษร" }, 400);
    }
    if (action === "login") {
      if (!password || password.length > 1024) return reply({ error: "กรุณากรอกรหัสผ่าน" }, 400);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) return reply({ error: authError(error?.code) }, 400);
      try {
        await ensureAccountProfile(supabase, data.user.id);
      } catch {
        await supabase.auth.signOut({ scope: "local" });
        return reply({ error: "เตรียมโปรไฟล์ไม่สำเร็จ กรุณาเข้าสู่ระบบอีกครั้ง" }, 503);
      }
      return reply({ next: postAuthDestination(next, data.user.user_metadata.profile_setup_pending === true) });
    }
    if (action === "signup") {
      const { data, error } = await supabase.auth.signUp({ email, password, options: {
        emailRedirectTo: callback.toString(), data: { profile_setup_pending: true },
      } });
      if (error) return reply({ error: authError(error.code) }, 400);
      if (data.session && data.user) {
        await ensureAccountProfile(supabase, data.user.id);
        return reply({ next: postAuthDestination(next, data.user.user_metadata.profile_setup_pending === true) });
      }
      return reply({ message: "ตรวจสอบอีเมลของคุณ แล้วเปิดลิงก์เพื่อยืนยันบัญชี หากสมัครไว้แล้วให้เข้าสู่ระบบหรือรีเซ็ตรหัสผ่าน" });
    }
    if (action === "resend") {
      const { error } = await supabase.auth.resend({ type: "signup", email, options: { emailRedirectTo: callback.toString() } });
      if (error) return reply({ error: authError(error.code) }, 400);
      return reply({ message: "หากบัญชียังรอยืนยัน ระบบจะส่งลิงก์ยืนยันใหม่ให้ กรุณาตรวจสอบอีเมลและโฟลเดอร์สแปม" });
    }
    if (action === "forgot-password") {
      callback.searchParams.set("next", "/reset-password");
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: callback.toString() });
      if (error) return reply({ error: authError(error.code) }, 400);
      return reply({ message: "หากอีเมลนี้มีบัญชีอยู่ คุณจะได้รับลิงก์สำหรับตั้งรหัสผ่านใหม่" });
    }
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return reply({ error: "ลิงก์หมดอายุแล้ว กรุณาขอลิงก์ตั้งรหัสผ่านใหม่" }, 401);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return reply({ error: authError(error.code) }, 400);
    await supabase.auth.signOut({ scope: "local" });
    return reply({ next: "/login?updated=1" });
  } catch {
    return reply({ error: "เชื่อมต่อไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" }, 503);
  }
}
