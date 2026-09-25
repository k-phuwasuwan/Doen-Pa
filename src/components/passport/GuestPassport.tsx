import Link from "next/link";
import { BookOpen, Compass, LogIn } from "lucide-react";

export function GuestPassport() {
  return (
    <div className="mx-auto flex min-h-[calc(100svh-7rem)] max-w-[1280px] flex-col px-4 py-8 sm:px-6 lg:px-8" aria-labelledby="guest-passport-heading">
      <section className="liquid-glass-card flex items-center gap-4 rounded-3xl p-5 sm:p-6" aria-label="พาสปอร์ตผู้เยี่ยมชม">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-600/10 text-brand-700">
          <BookOpen className="h-7 w-7" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-medium text-brand-800/65">Doen Pa Passport</p>
          <h1 id="guest-passport-heading" className="text-xl font-bold text-brand-800 sm:text-2xl">พาสปอร์ตของคุณ</h1>
        </div>
      </section>

      <section className="flex flex-1 flex-col items-center justify-center py-12 text-center sm:py-16" aria-labelledby="guest-empty-heading">
        <div className="liquid-glass-card flex h-32 w-32 items-center justify-center rounded-full sm:h-36 sm:w-36">
          <Compass className="h-14 w-14 text-brand-600" strokeWidth={1.5} aria-hidden="true" />
        </div>
        <h2 id="guest-empty-heading" className="mt-8 text-2xl font-bold text-brand-800 sm:text-3xl">พาสปอร์ตของคุณยังว่างเปล่า</h2>
        <p className="mt-3 max-w-sm text-base text-brand-800/65">
          เข้าสู่ระบบเพื่อเก็บสถานที่ที่เคยไป รูปภาพ และความทรงจำไว้ในพาสปอร์ตของคุณ
        </p>
        <button type="button" disabled aria-describedby="guest-login-note" className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-brand-700/15 bg-white/75 px-7 py-3 font-semibold text-brand-800/65 shadow-glass">
          <LogIn className="h-5 w-5" aria-hidden="true" />
          เข้าสู่ระบบ
        </button>
        <p id="guest-login-note" className="mt-3 text-sm text-brand-800/65">ระบบเข้าสู่ระบบยังไม่เปิดใช้งาน</p>
        <Link href="/passport" className="mt-5 rounded-full px-4 py-2 text-sm font-medium text-brand-700 underline underline-offset-4 transition hover:text-brand-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
          ดูตัวอย่างพาสปอร์ต
        </Link>
      </section>
    </div>
  );
}
