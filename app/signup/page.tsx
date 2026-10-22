import { redirect } from "next/navigation";
import { AuthPanel } from "@/components/auth/AuthPanel";
import { LoginForm } from "@/components/auth/LoginForm";
import { getAuthUser } from "@/lib/auth/server";
import { safeAuthNext, postAuthDestination } from "@/lib/auth/redirects";

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeAuthNext((await searchParams).next);
  const user = await getAuthUser();
  if (user) redirect(postAuthDestination(next, user.needsProfileSetup === true));
  return <AuthPanel title="เริ่มบันทึกกับ Doen Pa" description="สมัครด้วยอีเมล แล้วยืนยันบัญชีเพื่อเริ่มต้น" backHref={"/login?next=" + encodeURIComponent(next)}>
    <LoginForm mode="signup" next={next} />
  </AuthPanel>;
}
