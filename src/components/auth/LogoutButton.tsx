"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { notifyAuthChanged } from "@/lib/auth/browser";

export function LogoutButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function logout() {
    if (busy) return;
    setBusy(true); setError("");
    try {
      const response = await fetch("/auth/logout", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      if (!response.ok) throw new Error("logout");
      // Notify other tabs immediately; SSR cookies were cleared by the route.
      const { createClient } = await import("@/lib/supabase/client");
      await createClient().auth.signOut({ scope: "local" });
      notifyAuthChanged();
      // Full navigation prevents restoring a cached personal page after logout.
      window.location.assign(new URL("/profile", window.location.origin).href);
    } catch {
      setError("ออกจากระบบไม่สำเร็จ กรุณาลองใหม่");
      setBusy(false);
    }
  }
  return <div className="order-last lg:order-none">
    <button type="button" disabled={busy} onClick={() => void logout()} className="liquid-glass-card group flex min-h-14 w-full items-center gap-4 rounded-3xl px-5 py-3 text-brand-800 hover:bg-white/90 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-brand-600">
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600/10"><LogOut className="h-5 w-5" aria-hidden="true" /></span>
      <span className="font-semibold">{busy ? "กำลังออกจากระบบ…" : "ออกจากระบบ"}</span>
    </button>
    <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>
  </div>;
}
