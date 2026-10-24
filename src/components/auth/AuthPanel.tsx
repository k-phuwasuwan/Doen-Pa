import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { InkStamp } from "@/components/ui/InkStamp";

/** Auth screens: a passport cover on wide screens, the form alone on phones. */
export function AuthPanel({ title, description, backHref, children }: { title: string; description: string; backHref: string; children: ReactNode }) {
  return <div className="relative min-h-svh lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
    <aside className="passport-data-page relative m-4 hidden overflow-hidden rounded-[2rem] p-10 text-white lg:flex lg:flex-col lg:justify-between" aria-hidden="true">
      <div className="relative mt-14">
        <div className="flex items-center gap-2.5 text-lg font-bold">
          <Image src="/icon.svg" alt="" width={36} height={36} unoptimized loading="eager" className="rounded-xl bg-white/90" />
          Doen Pa
        </div>
        <InkStamp top="พาสปอร์ตนักเดินป่า" bottom="DOEN PA ★ THAILAND" center="77" sub="จังหวัด" seed="auth" light className="mt-10 h-44 w-44" />
        <p className="mt-8 max-w-md text-[1.75rem] font-bold leading-snug">ทุกยอดเขาที่เคยไป เก็บไว้ใน<span className="whitespace-nowrap">พาสปอร์ต</span>เล่มเดียว</p>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/65">บันทึกวันที่ รูปภาพ และความทรงจำ แล้วดูเส้นทางของคุณบนแผนที่</p>
      </div>
      <p className="mrz-line relative text-xs text-white/25">P&lt;THA&lt;&lt;DOEN&lt;PA&lt;&lt;HIKING&lt;PASSPORT&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</p>
    </aside>

    <Link href={backHref} className="absolute left-4 top-4 z-20 inline-flex min-h-11 items-center gap-1.5 rounded-full bg-white pl-3 pr-4 text-sm font-semibold text-brand-800 shadow-lg shadow-brand-950/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 sm:left-6 lg:left-9 lg:top-9">
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />กลับ
    </Link>
    <div className="flex min-h-svh items-center justify-center px-4 pb-8 pt-20 sm:px-6 lg:py-8">
      <section className="liquid-glass-card w-full max-w-sm p-6 sm:p-8" aria-labelledby="auth-heading">
        <Image src="/icon.svg" alt="" width={48} height={48} unoptimized loading="eager" className="h-12 w-12 rounded-2xl bg-white shadow-glass lg:hidden" />
        <h1 id="auth-heading" className="mt-5 text-2xl font-bold text-brand-800 lg:mt-0">{title}</h1>
        <p className="mt-1 text-sm text-brand-800/65">{description}</p>
        {children}
      </section>
    </div>
  </div>;
}
