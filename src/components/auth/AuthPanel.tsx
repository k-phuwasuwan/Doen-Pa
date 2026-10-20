import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

export function AuthPanel({ title, description, backHref, children }: { title: string; description: string; backHref: string; children: ReactNode }) {
  return <div className="flex min-h-svh flex-col px-4 py-6 sm:px-6">
    <Link href={backHref} className="liquid-glass-capsule inline-flex min-h-11 w-fit items-center gap-2 rounded-full px-4 text-sm font-medium text-brand-800 hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600">
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />กลับ
    </Link>
    <div className="flex flex-1 items-center justify-center py-8">
      <section className="liquid-glass-card w-full max-w-md rounded-3xl px-6 py-9 sm:px-10 sm:py-11" aria-labelledby="auth-heading">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl border border-white bg-white/85 shadow-glass">
          <Image src="/icon.svg" alt="" width={80} height={80} unoptimized loading="eager" className="rounded-2xl" />
        </div>
        <h1 id="auth-heading" className="mt-6 text-center text-2xl font-bold text-brand-800">{title}</h1>
        <p className="mt-2 text-center text-sm text-brand-800/75">{description}</p>
        {children}
      </section>
    </div>
  </div>;
}
