"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LogIn, Mountain } from "lucide-react";
import { getActiveNavHref, getNavigationHref, type NavHref } from "./activeNav";

const links: { href: NavHref; label: string }[] = [
  { href: "/search", label: "ค้นหา" },
  { href: "/map", label: "แผนที่" },
  { href: "/passport", label: "พาสปอร์ต" },
  { href: "/stats", label: "สถิติ" },
  { href: "/profile", label: "โปรไฟล์" },
];

export function TopNav() {
  const pathname = usePathname();
  const [lastActiveHref, setLastActiveHref] = useState<NavHref>(() => getActiveNavHref(pathname));
  const [lastGuest, setLastGuest] = useState(false);
  return (
    <Suspense fallback={<TopNavContent activeHref={lastActiveHref} isGuest={lastGuest} />}>
      <ResolvedTopNav pathname={pathname} onActiveChange={setLastActiveHref} onGuestChange={setLastGuest} />
    </Suspense>
  );
}

function ResolvedTopNav({ pathname, onActiveChange, onGuestChange }: { pathname: string; onActiveChange: (href: NavHref) => void; onGuestChange: (isGuest: boolean) => void }) {
  const searchParams = useSearchParams();
  const activeHref = getActiveNavHref(pathname, searchParams.get("from"));
  const isGuest = searchParams.get("view") === "guest";
  useEffect(() => onActiveChange(activeHref), [activeHref, onActiveChange]);
  useEffect(() => onGuestChange(isGuest), [isGuest, onGuestChange]);
  return <TopNavContent activeHref={activeHref} isGuest={isGuest} />;
}

function TopNavContent({ activeHref, isGuest }: { activeHref: NavHref; isGuest: boolean }) {
  return (
    <nav className="sticky top-4 z-40 mx-4 flex items-center md:mx-auto md:w-full md:px-8">
      <div className="liquid-glass-capsule flex w-full items-center justify-between rounded-full px-4 py-2 shadow-glass transition-shadow hover:shadow-glass-hover md:px-6">
        <Link href={getNavigationHref("/search", isGuest)} className="flex items-center gap-2 rounded-full text-xl font-bold text-brand-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600">
          <Mountain className="h-6 w-6" aria-hidden="true" />
          <span>Doen Pa</span>
        </Link>

        <div className="hidden min-w-0 rounded-full bg-brand-900/[0.04] p-1.5 md:flex md:gap-2">
          {links.map((link) => {
            const isActive = activeHref === link.href;
            return (
              <Link
                key={link.href}
                href={getNavigationHref(link.href, isGuest)}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center rounded-full px-6 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-gradient-to-r from-brand-600 to-emerald-700 font-semibold text-white shadow-glow-emerald"
                    : "text-brand-800/80 hover:bg-white/70"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {isGuest ? (
          <Link href={`/login?from=${activeHref.slice(1)}`} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/80 bg-white/80 px-3 py-1.5 text-sm font-semibold text-brand-800 shadow-glass transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 sm:px-4">
            <LogIn className="h-4 w-4" aria-hidden="true" />
            เข้าสู่ระบบ
          </Link>
        ) : (
          <div className="hidden items-center gap-2 rounded-full bg-white/60 px-3 py-1.5 text-sm text-brand-800 md:flex">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">N</span>
            นักท่องไพร
          </div>
        )}
      </div>
    </nav>
  );
}
