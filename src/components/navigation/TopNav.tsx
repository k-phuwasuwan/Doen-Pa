"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Mountain } from "lucide-react";

export function TopNav() {
  const pathname = usePathname();

  const links = [
    { href: "/search", label: "ค้นหา" },
    { href: "/map", label: "แผนที่" },
    { href: "/passport", label: "แพสพอร์ต" },
    { href: "/stats", label: "สถิติ" },
    { href: "/profile", label: "โปรไฟล์" },
  ];

  return (
    <nav className="h-16 nav-glass flex items-center justify-between px-6 sticky top-0 z-40">
      <Link href="/" className="flex items-center gap-2 text-forest font-bold text-xl">
        <Mountain className="w-6 h-6" />
        <span>Doen Pa</span>
      </Link>
      
      {/* Desktop Navigation */}
      <div className="hidden md:flex h-full gap-8">
        {links.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center h-full transition-colors border-b-2 ${
                isActive 
                  ? "text-forest font-semibold border-forest" 
                  : "text-slate hover:text-forest border-transparent"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* Mobile Hamburger */}
      <button className="flex h-11 w-11 items-center justify-center text-forest md:hidden" aria-label="เปิดเมนู">
        <Menu className="w-6 h-6" />
      </button>
    </nav>
  );
}

