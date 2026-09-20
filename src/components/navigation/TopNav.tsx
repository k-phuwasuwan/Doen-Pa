"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Mountain } from "lucide-react";

export function TopNav() {
  const pathname = usePathname();

  const links = [
    { href: "/search", label: "ค้นหา" },
    { href: "/map", label: "แผนที่" },
    { href: "/passport", label: "พาสปอร์ต" },
    { href: "/stats", label: "สถิติ" },
    { href: "/profile", label: "โปรไฟล์" },
  ];

  return (
    <nav className="sticky top-4 z-40 mx-auto flex w-full max-w-[1440px] min-w-0 items-center justify-between px-4 md:px-8">
      <div className="liquid-glass-capsule flex min-w-0 w-full items-center justify-between rounded-full px-4 py-2 shadow-glass transition-shadow hover:shadow-glass-hover md:px-6">
      <Link href="/search" className="flex items-center gap-2 text-brand-800 font-bold text-xl">
        <Mountain className="w-6 h-6" />
        <span>Doen Pa</span>
      </Link>
      
      {/* Desktop Navigation */}
      <div className="hidden min-w-0 rounded-full bg-brand-900/[0.04] p-1.5 md:flex md:gap-2">
        {links.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
                className={`flex items-center rounded-full px-6 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-gradient-to-r from-brand-600 to-emerald-700 text-white font-semibold shadow-glow"
                  : "text-brand-800/80 hover:bg-white/70"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full bg-white/60 px-3 py-1.5 text-sm text-brand-800 md:flex">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">N</span>
          นักท่องไพร
        </div>
        <button className="flex h-11 w-11 items-center justify-center rounded-full text-brand-800 md:hidden" aria-label="เปิดเมนู">
          <Menu className="w-5 h-5" />
        </button>
      </div>
      </div>
    </nav>
  );
}

