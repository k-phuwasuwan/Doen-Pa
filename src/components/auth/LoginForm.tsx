"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { notifyAuthChanged } from "@/lib/auth/browser";

type Mode = "login" | "signup" | "forgot-password" | "reset-password";
const labels: Record<Mode, string> = {
  login: "เข้าสู่ระบบ", signup: "สมัครสมาชิก", "forgot-password": "ส่งลิงก์ตั้งรหัสผ่านใหม่", "reset-password": "บันทึกรหัสผ่านใหม่",
};

export function LoginForm({ mode = "login", next = "/passport", initialNotice = "" }: { mode?: Mode; next?: string; initialNotice?: string }) {
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState(initialNotice);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [canResend, setCanResend] = useState(false);
  const hasPassword = mode !== "forgot-password";
  const isNewPassword = mode === "signup" || mode === "reset-password";
  const query = "?next=" + encodeURIComponent(next);

  async function submit(action: string, password?: string) {
    if (busy) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/auth/" + action, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, next }),
      });
      const result: { error?: string; message?: string; next?: string } = await response.json();
      if (!response.ok || result.error) {
        setError(result.error ?? "ทำรายการไม่สำเร็จ กรุณาลองใหม่");
        if (mode === "login") setCanResend(true);
      } else if (result.next) {
        notifyAuthChanged();
        // A full request consumes fresh SSR cookies and discards cached personal UI.
        window.location.assign(result.next);
        return;
      } else {
        setNotice(result.message ?? "ทำรายการสำเร็จ");
        if (mode === "signup") setCanResend(true);
      }
    } catch {
      setError("เชื่อมต่อไม่สำเร็จ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่");
    }
    setBusy(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const password = fields.get("password")?.toString();
    if (isNewPassword && password !== fields.get("confirmPassword")) {
      setError("รหัสผ่านทั้งสองช่องไม่ตรงกัน");
      return;
    }
    void submit(mode, password);
  }

  const inputClass = "glass-input min-h-14 w-full px-5 text-base text-brand-800 placeholder:text-brand-800/55 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:opacity-60";
  const linkClass = "inline-flex min-h-11 items-center rounded-xl px-2 text-sm font-medium text-brand-700 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-brand-600";

  return <>
    <form onSubmit={handleSubmit} className="mt-7 space-y-4" aria-busy={busy}>
      {mode !== "reset-password" && <div>
        <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-brand-800">อีเมล</label>
        <input id="login-email" name="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} disabled={busy} className={inputClass} />
      </div>}
      {hasPassword && <div>
        <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-brand-800">{isNewPassword ? "รหัสผ่านใหม่" : "รหัสผ่าน"}</label>
        <div className="relative">
          <input id="login-password" name="password" type={showPassword ? "text" : "password"} autoComplete={isNewPassword ? "new-password" : "current-password"} required minLength={isNewPassword ? 8 : undefined} maxLength={isNewPassword ? 72 : 1024} disabled={busy} aria-describedby={isNewPassword ? "password-help" : undefined} className={inputClass + " pr-14"} />
          <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"} aria-pressed={showPassword} className="absolute inset-y-0 right-2 flex w-11 items-center justify-center rounded-xl text-brand-800/75 focus-visible:outline-2 focus-visible:outline-brand-600">
            {showPassword ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
        {isNewPassword && <p id="password-help" className="mt-1.5 text-xs text-brand-800/75">ใช้รหัสผ่าน 8–72 ตัวอักษร และหลีกเลี่ยงรหัสที่ใช้กับบัญชีอื่น</p>}
      </div>}
      {isNewPassword && <div>
        <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium text-brand-800">ยืนยันรหัสผ่านใหม่</label>
        <input id="confirm-password" name="confirmPassword" type={showPassword ? "text" : "password"} autoComplete="new-password" required minLength={8} maxLength={72} disabled={busy} className={inputClass} />
      </div>}
      <p role="alert" className="text-sm text-red-700">{error}</p>
      <p role="status" aria-live="polite" className="text-sm text-brand-800">{notice}</p>
      <button type="submit" disabled={busy} className="glass-button flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl px-4 text-base font-semibold disabled:cursor-wait disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600">
        <LogIn className="h-5 w-5" aria-hidden="true" />{busy ? "กำลังดำเนินการ…" : labels[mode]}
      </button>
    </form>
    {canResend && <button type="button" disabled={busy || !email} onClick={() => void submit("resend")} className={linkClass + " mt-2 disabled:opacity-60"}>ส่งอีเมลยืนยันอีกครั้ง</button>}
    <div className="mt-4 flex flex-wrap items-center justify-between gap-1">
      {mode === "login" ? <>
        <Link href={"/signup" + query} className={linkClass}>สมัครสมาชิก</Link>
        <Link href={"/forgot-password" + query} className={linkClass}>ลืมรหัสผ่าน</Link>
      </> : <Link href={"/login" + query} className={linkClass}>กลับไปเข้าสู่ระบบ</Link>}
    </div>
  </>;
}
