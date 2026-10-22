import { AuthPanel } from "@/components/auth/AuthPanel";
import { LoginForm } from "@/components/auth/LoginForm";
import { requireAuthUser } from "@/lib/auth/server";

export default async function ResetPasswordPage() {
  await requireAuthUser("/reset-password");
  return <AuthPanel title="ตั้งรหัสผ่านใหม่" description="ตั้งรหัสผ่านใหม่สำหรับบัญชีของคุณ" backHref="/login">
    <LoginForm mode="reset-password" />
  </AuthPanel>;
}
