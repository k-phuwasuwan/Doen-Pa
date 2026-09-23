"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Map, BookOpen, BarChart2, User } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  const links = [
    { href: "/search", label: "ค้นหา", icon: Search },
    { href: "/map", label: "แผนที่", icon: Map },
    { href: "/passport", label: "แพสพอร์ต", icon: BookOpen },
    { href: "/stats", label: "สถิติ", icon: BarChart2 },
    { href: "/profile", label: "โปรไฟล์", icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 nav-glass flex items-center justify-around px-2 z-40 pb-safe">
      {links.map((link) => {
        const isActive = pathname.startsWith(link.href);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
              isActive ? "text-brand-800" : "text-brand-800/65 hover:text-brand-800"
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5px]" : "stroke-2"}`} />
            <span className={`text-[10px] ${isActive ? "font-semibold" : "font-medium"}`}>
              {link.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

