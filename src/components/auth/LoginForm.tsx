"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Eye, EyeOff, LogIn, MailCheck, UserPlus } from "lucide-react";
import { notifyAuthChanged } from "@/lib/auth/browser";

type Mode = "login" | "signup" | "forgot-password" | "reset-password";
const labels: Record<Mode, string> = {
  login: "เข้าสู่ระบบ", signup: "สมัครสมาชิก", "forgot-password": "ส่งลิงก์ตั้งรหัสผ่านใหม่", "reset-password": "บันทึกรหัสผ่านใหม่",
};

const RESEND_COOLDOWN_SECONDS = 60;
const RESEND_COOLDOWN_KEY = "doen-pa-resend-until";
const RECOVERY_COOLDOWN_KEY = "doen-pa-recovery-until";

function readCooldownSeconds(key: string) {
  try {
    const until = Number(window.localStorage.getItem(key));
    return Number.isFinite(until) ? Math.min(RESEND_COOLDOWN_SECONDS, Math.max(0, Math.ceil((until - Date.now()) / 1000))) : 0;
  } catch {
    return 0;
  }
}

function startCooldown(key: string, setCooldown: (seconds: number) => void) {
  try {
    window.localStorage.setItem(key, String(Date.now() + RESEND_COOLDOWN_SECONDS * 1000));
  } catch {
    // The in-page timer still applies when storage is unavailable.
  }
  setCooldown(RESEND_COOLDOWN_SECONDS);
}

export function LoginForm({ mode = "login", next = "/passport", initialNotice = "" }: { mode?: Mode; next?: string; initialNotice?: string }) {
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState(initialNotice);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [canResend, setCanResend] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const hasPassword = mode !== "forgot-password";
  const isNewPassword = mode === "signup" || mode === "reset-password";
  const cooldownKey = mode === "forgot-password" ? RECOVERY_COOLDOWN_KEY : RESEND_COOLDOWN_KEY;
  const query = "?next=" + encodeURIComponent(next);

  useEffect(() => {
    if (mode === "reset-password") return;
    // Read after hydration so server and client markup match; deferred to keep setState out of the effect body.
    const timer = window.setTimeout(() => {
      const remaining = readCooldownSeconds(cooldownKey);
      if (remaining <= 0) return;
      setCooldown(remaining);
      if (mode !== "forgot-password") setCanResend(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [mode, cooldownKey]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  async function submit(action: string, password?: string) {
    if (busy || ((action === "resend" || action === "forgot-password") && cooldown > 0)) return;
    if (action === "resend") startCooldown(cooldownKey, setCooldown);
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
        if (action !== "signup" && action !== "forgot-password" && action !== "resend") {
          setNotice(result.message ?? "ทำรายการสำเร็จ");
        }
        if (mode === "signup") {
          setCanResend(true);
          if (action === "signup") startCooldown(cooldownKey, setCooldown);
        }
        if (action === "forgot-password") startCooldown(cooldownKey, setCooldown);
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
  const linkClass = "inline-flex min-h-11 items-center rounded-xl px-2 text-sm font-medium text-brand-700 focus-visible:outline-2 focus-visible:outline-brand-600";

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
        {mode === "login" && <div className="mt-1 flex justify-end">
          <Link href={"/forgot-password" + query} className={linkClass + " hover:text-brand-900"}>ลืมรหัสผ่าน</Link>
        </div>}
      </div>}
      {isNewPassword && <div>
        <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium text-brand-800">ยืนยันรหัสผ่านใหม่</label>
        <input id="confirm-password" name="confirmPassword" type={showPassword ? "text" : "password"} autoComplete="new-password" required minLength={8} maxLength={72} disabled={busy} className={inputClass} />
      </div>}
      <p role="alert" className="text-sm text-red-700">{error}</p>
      {notice && <p role="status" aria-live="polite" className="text-sm text-brand-800">{notice}</p>}
      <button type="submit" disabled={busy || (mode === "forgot-password" && cooldown > 0)} className="glass-button flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl px-4 text-base font-semibold disabled:cursor-wait disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600">
        <LogIn className="h-5 w-5" aria-hidden="true" />{busy ? "กำลังดำเนินการ…" : mode === "forgot-password" && cooldown > 0 ? `ส่งอีเมลอีกครั้งได้ใน ${cooldown} วินาที` : labels[mode]}
      </button>
    </form>
    {canResend && <button type="button" disabled={busy || !email || cooldown > 0} onClick={() => void submit("resend")} className="site-top-nav-surface mt-3 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border border-brand-700/15 px-5 text-base font-semibold text-brand-800 backdrop-blur-xl transition-colors hover:border-brand-500 hover:text-brand-900 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-brand-700/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600">
      <MailCheck className="h-5 w-5" aria-hidden="true" />{cooldown > 0 ? `ส่งอีเมลอีกครั้งได้ใน ${cooldown} วินาที` : "ส่งอีเมลยืนยันอีกครั้ง"}
    </button>}
    {mode === "login" && <div className="mt-3">
      <Link href={"/signup" + query} className="site-top-nav-surface flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border border-brand-700/15 px-5 text-base font-semibold text-brand-800 backdrop-blur-xl transition-colors hover:border-brand-500 hover:text-brand-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600">
        <UserPlus className="h-5 w-5" aria-hidden="true" />สมัครสมาชิก
      </Link>
    </div>}
    {mode === "reset-password" && <div className="mt-4">
      <Link href={"/login" + query} className={linkClass + " underline underline-offset-4"}>กลับไปเข้าสู่ระบบ</Link>
    </div>}
  </>;
}
