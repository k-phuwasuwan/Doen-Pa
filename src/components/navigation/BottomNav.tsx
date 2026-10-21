"use client";

import Link from "next/link";
import { Search, Map, BookOpen, BarChart2, User } from "lucide-react";
import { NAV_LINKS, getNavigationHref, type NavHref } from "./activeNav";
import { NavigationState } from "./NavigationState";

const icons: Record<NavHref, typeof Search> = {
  "/search": Search, "/map": Map, "/passport": BookOpen, "/stats": BarChart2, "/profile": User,
};

export function BottomNav() {
  return <NavigationState>{(state) => <BottomNavContent {...state} />}</NavigationState>;
}

function BottomNavContent({ activeHref, isGuest }: { activeHref: NavHref; isGuest: boolean }) {
  return (
    <nav aria-label="เมนูหลัก" className="mobile-bottom-nav fixed left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center rounded-full p-1.5 lg:hidden" style={{ backdropFilter: "blur(28px) saturate(160%)", WebkitBackdropFilter: "blur(28px) saturate(160%)" }}>
      {NAV_LINKS.map((link) => {
        const isActive = activeHref === link.href;
        const Icon = icons[link.href];
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
