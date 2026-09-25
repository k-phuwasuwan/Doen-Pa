"use client";

import { usePathname } from "next/navigation";
import { TopNav } from "./TopNav";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const isLoginPage = usePathname() === "/login";

  return (
    <>
      {!isLoginPage && <TopNav />}
      <main className={`relative z-10 flex-1 ${isLoginPage ? "" : "pb-28 md:pb-0"}`}>
        {children}
      </main>
      {!isLoginPage && <BottomNav />}
    </>
  );
}
