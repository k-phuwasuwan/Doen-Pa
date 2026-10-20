import { redirect } from "next/navigation";
import { AuthPanel } from "@/components/auth/AuthPanel";
import { LoginForm } from "@/components/auth/LoginForm";
import { getAuthUser } from "@/lib/auth/server";
import { authBackHref, safeAuthNext } from "@/lib/auth/redirects";

export const metadata = { title: "เข้าสู่ระบบ | Doen Pa" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ from?: string; next?: string; error?: string; updated?: string }> }) {
  const params = await searchParams;
  const next = safeAuthNext(params.next ?? (params.from ? "/" + params.from : undefined));
  if (await getAuthUser()) redirect(next);
  const notice = params.error === "link" ? "ลิงก์ไม่ถูกต้องหรือหมดอายุ กรุณาขอลิงก์ใหม่ หรือยืนยันแล้วเข้าสู่ระบบอีกครั้ง" : params.updated === "1" ? "เปลี่ยนรหัสผ่านแล้ว กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่" : "";
  return <AuthPanel title="เข้าสู่ระบบ Doen Pa" description="กลับมาบันทึกความทรงจำจากทุกเส้นทาง" backHref={authBackHref(params.from)}>
    <LoginForm next={next} initialNotice={notice} />
  </AuthPanel>;
}
