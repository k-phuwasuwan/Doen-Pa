"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mountain } from "lucide-react";

const links = [
  { href: "/search", label: "ค้นหา" },
  { href: "/map", label: "แผนที่" },
  { href: "/passport", label: "พาสปอร์ต" },
  { href: "/stats", label: "สถิติ" },
  { href: "/profile", label: "โปรไฟล์" },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-4 z-40 ml-4 mr-auto flex w-fit items-center md:mx-auto md:w-full md:px-8">
      <div className="liquid-glass-capsule flex w-full items-center justify-between rounded-full px-4 py-2 shadow-glass transition-shadow hover:shadow-glass-hover md:px-6">
        <Link href="/search" className="flex items-center gap-2 rounded-full text-xl font-bold text-brand-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600">
          <Mountain className="h-6 w-6" aria-hidden="true" />
          <span>Doen Pa</span>
        </Link>

        <div className="hidden min-w-0 rounded-full bg-brand-900/[0.04] p-1.5 md:flex md:gap-2">
          {links.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
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

        <div className="hidden items-center gap-2 rounded-full bg-white/60 px-3 py-1.5 text-sm text-brand-800 md:flex">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">N</span>
          นักท่องไพร
        </div>
      </div>
    </nav>
  );
}
