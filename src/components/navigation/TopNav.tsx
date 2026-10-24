"use client";

import { photoThumb } from "@/domain/account-data";
import Image from "next/image";
import Link from "next/link";
import { LogIn, UserRound } from "lucide-react";
import { useCurrentUser } from "@/lib/use-current-user";
import { useAuth } from "@/components/auth/AuthProvider";
import { NAV_LINKS, getNavigationHref, type NavHref } from "./activeNav";
import { NavigationState } from "./NavigationState";
import { handleNavClick } from "./pendingNav";
import { indicatorStyle, useSlidingIndicator } from "./useSlidingIndicator";

export function TopNav() {
  return <NavigationState>{(state) => <TopNavContent {...state} />}</NavigationState>;
}

function TopNavContent({ activeHref, isGuest: previewGuest }: { activeHref: NavHref; isGuest: boolean }) {
  const user = useCurrentUser();
  const { user: account } = useAuth();
  const isGuest = previewGuest || !account;
  const { containerRef, box } = useSlidingIndicator(activeHref);

  return (
    <nav className="sticky top-3 z-40 mx-auto flex w-full max-w-6xl items-center px-4 sm:top-4 sm:px-6 lg:px-8">
      <div className="liquid-glass-capsule site-top-nav-surface flex min-h-14 w-full items-center justify-between rounded-full py-1.5 pl-4 pr-1.5 shadow-glass lg:pl-5" style={{ backdropFilter: "blur(32px) saturate(160%)", WebkitBackdropFilter: "blur(32px) saturate(160%)" }}>
        <Link href={getNavigationHref("/search", isGuest)} className="flex min-h-11 shrink-0 items-center gap-2 rounded-full text-base font-bold text-brand-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600 sm:text-lg">
          <Image src="/icon.svg" alt="" width={32} height={32} unoptimized loading="eager" className="h-7 w-7 rounded-lg sm:h-8 sm:w-8" />
          <span>Doen Pa</span>
        </Link>

        <div ref={containerRef} className="relative hidden min-w-0 rounded-full bg-brand-900/[0.04] p-1 lg:flex lg:gap-1">
          <span aria-hidden="true" className="nav-indicator pointer-events-none absolute left-0 top-0 rounded-full bg-gradient-to-r from-brand-600 to-emerald-700 shadow-glow-emerald" style={indicatorStyle(box)} />
          {NAV_LINKS.map((link) => {
            const isActive = activeHref === link.href;
            return (
              <Link
                key={link.href}
                href={getNavigationHref(link.href, isGuest)}
                aria-current={isActive ? "page" : undefined}
                onClick={(event) => handleNavClick(event, link.href)}
                className={`relative z-10 flex min-h-10 shrink-0 items-center rounded-full px-5 text-sm transition-colors ${
                  isActive
                    ? "font-semibold text-white"
                    : "text-brand-800/80 hover:bg-white/70"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {isGuest ? (
          <Link href={`/login?from=${activeHref.slice(1)}`} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600">
            <LogIn className="h-4 w-4" aria-hidden="true" />
            เข้าสู่ระบบ
          </Link>
        ) : (
          <Link href="/profile" aria-label={`โปรไฟล์ ${user.name}`} className="inline-flex min-h-11 min-w-0 max-w-36 items-center gap-2 rounded-full bg-white/70 py-1 pl-1 pr-3 text-sm font-medium text-brand-800 transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 sm:max-w-44">
            <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-600 text-xs font-bold text-white">
              {user.avatar ? <Image unoptimized src={photoThumb(user.avatar, 256)} alt="" fill sizes="36px" className="object-cover" /> : <UserRound className="h-4 w-4" aria-hidden="true" />}
            </span>
            <span className="min-w-0 truncate">{user.name}</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
