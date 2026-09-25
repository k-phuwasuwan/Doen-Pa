"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { TopNav } from "./TopNav";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const isLoginPage = usePathname() === "/login";

  useEffect(() => {
    try {
      localStorage.removeItem("doen-pa-travel-records");
      localStorage.removeItem("doen-pa-current-user");
    } catch {
      // Storage may be unavailable in private browsing; the new keys still start empty.
    }
  }, []);

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
