"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Search, Map, BookOpen, BarChart2, User } from "lucide-react";
import { getActiveNavHref, getNavigationHref, type NavHref } from "./activeNav";

const links: { href: NavHref; label: string; icon: typeof Search }[] = [
  { href: "/search", label: "ค้นหา", icon: Search },
  { href: "/map", label: "แผนที่", icon: Map },
  { href: "/passport", label: "แพสพอร์ต", icon: BookOpen },
  { href: "/stats", label: "สถิติ", icon: BarChart2 },
  { href: "/profile", label: "โปรไฟล์", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const [lastActiveHref, setLastActiveHref] = useState<NavHref>(() => getActiveNavHref(pathname));
  const [lastGuest, setLastGuest] = useState(false);
  return (
    <Suspense fallback={<BottomNavContent activeHref={lastActiveHref} isGuest={lastGuest} />}>
      <ResolvedBottomNav pathname={pathname} onActiveChange={setLastActiveHref} onGuestChange={setLastGuest} />
    </Suspense>
  );
}

function ResolvedBottomNav({ pathname, onActiveChange, onGuestChange }: { pathname: string; onActiveChange: (href: NavHref) => void; onGuestChange: (isGuest: boolean) => void }) {
  const searchParams = useSearchParams();
  const activeHref = getActiveNavHref(pathname, searchParams.get("from"));
  const isGuest = searchParams.get("view") === "guest";
  useEffect(() => onActiveChange(activeHref), [activeHref, onActiveChange]);
  useEffect(() => onGuestChange(isGuest), [isGuest, onGuestChange]);
  return <BottomNavContent activeHref={activeHref} isGuest={isGuest} />;
}

function BottomNavContent({ activeHref, isGuest }: { activeHref: NavHref; isGuest: boolean }) {
  return (
    <nav aria-label="เมนูหลัก" className="mobile-bottom-nav fixed left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center rounded-full p-1.5 md:hidden">
      {links.map((link) => {
        const isActive = activeHref === link.href;
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={getNavigationHref(link.href, isGuest)}
            aria-current={isActive ? "page" : undefined}
            className={`relative flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-full border text-brand-800 transition-[background-color,box-shadow,transform] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${
              isActive
                ? "border-brand-200/80 bg-brand-100/90 shadow-glass-inner"
                : "border-transparent hover:bg-white/45 active:scale-95"
            }`}
          >
            <Icon aria-hidden="true" className={`h-5 w-5 ${isActive ? "text-brand-600 stroke-[2.5px]" : "stroke-2"}`} />
            <span className={`truncate text-[10px] leading-none ${isActive ? "font-semibold" : "font-medium"}`}>
              {link.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
