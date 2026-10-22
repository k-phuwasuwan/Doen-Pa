"use client";

import Link from "next/link";
import { Search, Map, BookOpen, BarChart2, User } from "lucide-react";
import { NAV_LINKS, getNavigationHref, type NavHref } from "./activeNav";
import { NavigationState } from "./NavigationState";
import { handleNavClick } from "./pendingNav";
import { indicatorStyle, useSlidingIndicator } from "./useSlidingIndicator";

const icons: Record<NavHref, typeof Search> = {
  "/search": Search, "/map": Map, "/passport": BookOpen, "/stats": BarChart2, "/profile": User,
};

export function BottomNav() {
  return <NavigationState>{(state) => <BottomNavContent {...state} />}</NavigationState>;
}

function BottomNavContent({ activeHref, isGuest }: { activeHref: NavHref; isGuest: boolean }) {
  const { containerRef, box } = useSlidingIndicator(activeHref);
  return (
    <nav aria-label="เมนูหลัก" className="mobile-bottom-nav fixed left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-full p-1.5 lg:hidden" style={{ backdropFilter: "blur(28px) saturate(160%)", WebkitBackdropFilter: "blur(28px) saturate(160%)" }}>
      <div ref={containerRef} className="relative flex items-center">
      <span aria-hidden="true" className="nav-indicator pointer-events-none absolute left-0 top-0 rounded-full bg-gradient-to-r from-brand-600 to-emerald-700 shadow-glow-emerald" style={indicatorStyle(box)} />
      {NAV_LINKS.map((link) => {
        const isActive = activeHref === link.href;
        const Icon = icons[link.href];
        return (
          <Link
            key={link.href}
            href={getNavigationHref(link.href, isGuest)}
            aria-current={isActive ? "page" : undefined}
            onClick={(event) => handleNavClick(event, link.href)}
            className={`relative flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 z-10 rounded-full border text-brand-800 transition-[background-color,color,transform] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${
              isActive
                ? "border-transparent text-white"
                : "border-transparent hover:bg-white/45 active:scale-95"
            }`}
          >
            <Icon aria-hidden="true" className={`h-5 w-5 ${isActive ? "stroke-[2.5px]" : "stroke-2"}`} />
            <span className={`truncate text-[10px] leading-none ${isActive ? "font-semibold" : "font-medium"}`}>
              {link.label}
            </span>
          </Link>
        );
      })}
      </div>
    </nav>
  );
}
