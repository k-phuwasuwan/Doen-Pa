import Link from "next/link";
import { LogIn, type LucideIcon } from "lucide-react";

interface GuestPrivatePageProps {
  label: string;
  title: string;
  emptyTitle: string;
  description: string;
  previewHref: string;
  previewLabel: string;
  headerIcon: LucideIcon;
  emptyIcon: LucideIcon;
}

export function GuestPrivatePage({
  label,
  title,
  emptyTitle,
  description,
  previewHref,
  previewLabel,
  headerIcon: HeaderIcon,
  emptyIcon: EmptyIcon,
}: GuestPrivatePageProps) {
  return (
    <div className="mx-auto flex min-h-[calc(100svh-7rem)] max-w-[1280px] flex-col px-4 py-8 sm:px-6 lg:px-8" aria-labelledby="guest-page-heading">
      <section className="liquid-glass-card flex items-center gap-4 rounded-3xl p-5 sm:p-6">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-600/10 text-brand-700">
          <HeaderIcon className="h-7 w-7" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-medium text-brand-800/65">{label}</p>
          <h1 id="guest-page-heading" className="text-xl font-bold text-brand-800 sm:text-2xl">{title}</h1>
        </div>
      </section>

      <section className="flex flex-1 flex-col items-center justify-center py-12 text-center sm:py-16" aria-labelledby="guest-empty-heading">
        <div className="liquid-glass-card flex h-32 w-32 items-center justify-center rounded-full sm:h-36 sm:w-36">
          <EmptyIcon className="h-14 w-14 text-brand-600" strokeWidth={1.5} aria-hidden="true" />
        </div>
        <h2 id="guest-empty-heading" className="mt-8 text-2xl font-bold text-brand-800 sm:text-3xl">{emptyTitle}</h2>
        <p className="mt-3 max-w-sm text-base text-brand-800/65">{description}</p>
        <Link href={`/login?from=${previewHref.slice(1)}`} className="liquid-glass mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-7 py-3 font-semibold text-brand-800 transition-colors hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600">
          <LogIn className="h-5 w-5" aria-hidden="true" />
          เข้าสู่ระบบ
        </Link>
        <Link href={previewHref} className="mt-5 rounded-full px-4 py-2 text-sm font-medium text-brand-700 underline underline-offset-4 transition hover:text-brand-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
          {previewLabel}
        </Link>
      </section>
    </div>
  );
}
