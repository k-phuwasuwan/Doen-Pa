"use client";

import { usePathname } from "next/navigation";
import { TopNav } from "./TopNav";
import { BottomNav } from "./BottomNav";
import { RouteLoadingProvider } from "./RouteLoadingTransition";

export function AppShell({ children }: { children: React.ReactNode }) {
  const isLoginPage = ["/login", "/signup", "/forgot-password", "/reset-password"].includes(usePathname());

  return (
    <RouteLoadingProvider>
      {!isLoginPage && <TopNav />}
      <main className={`relative z-10 flex-1 ${isLoginPage ? "" : "pb-28 lg:pb-0"}`}>
        {children}
      </main>
      {!isLoginPage && <BottomNav />}
    </RouteLoadingProvider>
  );
}
