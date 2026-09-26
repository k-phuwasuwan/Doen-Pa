"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LogIn } from "lucide-react";
import { useCurrentUser } from "@/lib/use-current-user";
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
  const user = useCurrentUser();

  return (
    <nav className="sticky top-4 z-40 mx-4 flex items-center md:mx-auto md:w-full md:px-8">
      <div className="liquid-glass-capsule flex min-h-16 w-full items-center justify-between rounded-full px-5 py-2.5 shadow-glass transition-shadow hover:shadow-glass-hover md:min-h-0 md:px-6 md:py-2">
        <Link href={getNavigationHref("/search", isGuest)} className="flex min-h-11 shrink-0 items-center gap-2 rounded-full text-base font-bold text-brand-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600 sm:text-xl md:min-h-0">
          <Image src="/icon.svg" alt="" width={32} height={32} unoptimized loading="eager" className="h-8 w-8 rounded-lg" />
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
          <Link href="/profile" aria-label={`โปรไฟล์ ${user.name}`} className="inline-flex min-h-11 min-w-0 max-w-32 items-center gap-1.5 rounded-full bg-white/70 px-2 py-1.5 text-xs font-medium text-brand-800 shadow-glass transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 sm:max-w-40 sm:gap-2 sm:px-3 sm:text-sm">
            <span className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-600 text-xs font-bold text-white">
              {user.avatar ? <Image src={user.avatar} alt="" fill sizes="28px" className="object-cover" /> : user.name.slice(0, 1)}
            </span>
            <span className="min-w-0 truncate">{user.name}</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
