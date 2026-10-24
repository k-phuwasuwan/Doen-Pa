import Link from "next/link";
import { LogIn, type LucideIcon } from "lucide-react";

interface GuestPrivatePageProps {
  emptyTitle: string;
  description: string;
  previewHref: string;
  emptyIcon: LucideIcon;
}

/** Guest view of a personal page: an empty stamp slot waiting for the first visit. */
export function GuestPrivatePage({ emptyTitle, description, previewHref, emptyIcon: EmptyIcon }: GuestPrivatePageProps) {
  return (
    <div className="page-shell flex min-h-[calc(100svh-6rem)] flex-col">
      <section className="liquid-glass-card flex flex-1 flex-col items-center justify-center px-6 py-12 text-center sm:py-16" aria-labelledby="guest-empty-heading">
        <div className="flex h-28 w-28 rotate-[-8deg] items-center justify-center rounded-full border-[3px] border-dashed border-ink/35">
          <div className="flex h-[5.5rem] w-[5.5rem] items-center justify-center rounded-full border border-dashed border-ink/25">
            <EmptyIcon className="h-9 w-9 rotate-[8deg] text-ink/60" strokeWidth={1.5} aria-hidden="true" />
          </div>
        </div>
        <h1 id="guest-empty-heading" className="mt-6 text-xl font-bold text-brand-800 sm:text-2xl">{emptyTitle}</h1>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-brand-800/65 sm:text-[15px]">{description}</p>
        <Link href={`/login?from=${previewHref.slice(1)}`} className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand-600 px-6 font-semibold text-white shadow-glow-emerald transition-colors hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600">
          <LogIn className="h-5 w-5" aria-hidden="true" />
          เข้าสู่ระบบ
        </Link>
      </section>
    </div>
  );
}
