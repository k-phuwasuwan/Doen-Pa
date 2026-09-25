"use client";

import { useState, type FormEvent } from "react";
import { Eye, EyeOff, LogIn } from "lucide-react";

const UNAVAILABLE_MESSAGE = "ระบบเข้าสู่ระบบยังไม่เปิดใช้งานในขณะนี้";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(UNAVAILABLE_MESSAGE);
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="login-email" className="sr-only">อีเมล</label>
          <input id="login-email" name="email" type="email" autoComplete="email" required placeholder="Email" className="glass-input min-h-14 w-full px-5 text-base text-brand-800 placeholder:text-brand-800/45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600" />
        </div>
        <div className="relative">
          <label htmlFor="login-password" className="sr-only">รหัสผ่าน</label>
          <input id="login-password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required placeholder="Password" className="glass-input min-h-14 w-full px-5 pr-14 text-base text-brand-800 placeholder:text-brand-800/45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600" />
          <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"} className="absolute inset-y-0 right-2 flex w-11 items-center justify-center rounded-xl text-brand-800/60 hover:text-brand-800 focus-visible:outline-2 focus-visible:outline-brand-600">
            {showPassword ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
        <button type="submit" className="glass-button mt-2 flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl px-5 text-lg font-semibold transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600">
          <LogIn className="h-5 w-5" aria-hidden="true" />
          เข้าสู่ระบบ
        </button>
      </form>

      <div className="my-7 flex items-center gap-4" aria-hidden="true">
        <div className="h-px flex-1 bg-brand-700/15" />
        <span className="text-xs text-brand-800/55">หรือ</span>
        <div className="h-px flex-1 bg-brand-700/15" />
      </div>

      <button type="button" onClick={() => setNotice(UNAVAILABLE_MESSAGE)} className="liquid-glass flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl px-5 text-base font-medium text-brand-800 transition-colors hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white font-bold text-blue-600" aria-hidden="true">G</span>
        Continue with Google
      </button>
      <p role="status" aria-live="polite" className="mt-5 min-h-5 text-center text-sm text-brand-700">{notice}</p>
    </>
  );
}
