"use client";

import { useState, type FormEvent } from "react";
import { notifyAuthChanged } from "@/lib/auth/browser";

export function DeleteAccountPanel() {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError("");
    try {
      const response = await fetch("/auth/delete-account", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      const result: { error?: string; next?: string } = await response.json().catch(() => ({}));
      if (!response.ok) { setError(result.error ?? "ลบบัญชีไม่สำเร็จ กรุณาลองใหม่"); setBusy(false); return; }
      const { createClient } = await import("@/lib/supabase/client");
      await createClient().auth.signOut({ scope: "local" });
      notifyAuthChanged();
      window.location.assign(new URL("/profile", window.location.origin).href);
    } catch {
      setError("เชื่อมต่อไม่สำเร็จ กรุณาลองใหม่");
      setBusy(false);
    }
  }

  return (
    <section className="liquid-glass-card rounded-3xl p-5 sm:p-8 lg:col-start-2" aria-labelledby="delete-account-heading">
      <h2 id="delete-account-heading" className="text-xl font-semibold text-brand-800">ลบบัญชี</h2>
      <p className="mt-2 text-sm text-brand-800/70">ลบบัญชี โปรไฟล์ บันทึกการเดินทางและรูปภาพทั้งหมดทันที ไม่สามารถกู้คืนได้</p>
      {!open ? (
        <button type="button" onClick={() => setOpen(true)} className="mt-4 min-h-11 rounded-full px-5 text-sm font-semibold text-red-700 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-red-700">ต้องการลบบัญชี</button>
      ) : (
        <form onSubmit={submit} className="mt-4 space-y-3">
          <label className="block text-sm font-medium text-brand-800" htmlFor="delete-password">กรอกรหัสผ่านเพื่อยืนยัน</label>
          <input id="delete-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required
            className="min-h-11 w-full rounded-2xl border border-brand-700/20 bg-white/80 px-4 focus-visible:outline-2 focus-visible:outline-brand-600" />
          <p role="alert" className="text-sm text-red-700">{error}</p>
          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={busy || !password} className="min-h-11 rounded-full bg-red-700 px-5 text-sm font-semibold text-white disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-red-700">{busy ? "กำลังลบบัญชี…" : "ยืนยันลบบัญชีถาวร"}</button>
            <button type="button" disabled={busy} onClick={() => { setOpen(false); setPassword(""); setError(""); }} className="min-h-11 rounded-full px-5 text-sm text-brand-800/70 underline underline-offset-4">ยกเลิก</button>
          </div>
        </form>
      )}
    </section>
  );
}
