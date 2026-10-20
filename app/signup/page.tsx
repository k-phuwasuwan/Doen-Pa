import { redirect } from "next/navigation";
import { AuthPanel } from "@/components/auth/AuthPanel";
import { LoginForm } from "@/components/auth/LoginForm";
import { getAuthUser } from "@/lib/auth/server";
import { safeAuthNext } from "@/lib/auth/redirects";

export const metadata = { title: "สมัครสมาชิก | Doen Pa" };
export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeAuthNext((await searchParams).next);
  if (await getAuthUser()) redirect(next);
  return <AuthPanel title="เริ่มบันทึกกับ Doen Pa" description="สมัครด้วยอีเมล แล้วยืนยันบัญชีเพื่อเริ่มต้น" backHref={"/login?next=" + encodeURIComponent(next)}>
    <LoginForm mode="signup" next={next} />
  </AuthPanel>;
}
