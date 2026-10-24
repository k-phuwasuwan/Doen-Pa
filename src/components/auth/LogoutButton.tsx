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
  return <div>
    <button type="button" disabled={busy} onClick={() => void logout()} className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-medium text-brand-800/75 transition-colors hover:bg-white/70 hover:text-brand-800 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600">
      <LogOut className="h-4 w-4" aria-hidden="true" />
      {busy ? "กำลังออกจากระบบ…" : "ออกจากระบบ"}
    </button>
    <p role="alert" className="mt-2 text-sm text-red-700 empty:hidden">{error}</p>
  </div>;
}
