import { AuthPanel } from "@/components/auth/AuthPanel";
import { LoginForm } from "@/components/auth/LoginForm";

export default function ForgotPasswordPage() {
  return <AuthPanel title="ลืมรหัสผ่าน" description="กรอกอีเมลที่สมัครไว้ เพื่อรับลิงก์ตั้งรหัสผ่านใหม่" backHref="/login">
    <LoginForm mode="forgot-password" />
  </AuthPanel>;
}
