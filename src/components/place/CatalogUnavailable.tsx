"use client";

import { useState } from "react";

export function CatalogUnavailable() {
  const [retrying, setRetrying] = useState(false);
  return (
    <section role="alert" className="liquid-glass-card mx-auto my-8 max-w-xl px-6 py-10 text-center">
      <h1 className="text-xl font-bold text-brand-800">โหลดข้อมูลสถานที่ไม่สำเร็จ</h1>
      <p className="mt-3 text-sm text-brand-800/75">ลองโหลดหน้านี้อีกครั้งเพื่อดูสถานที่และบันทึกการเดินทางของคุณ</p>
      <button
        type="button"
        disabled={retrying}
        onClick={() => { setRetrying(true); window.location.reload(); }}
        className="glass-button mt-5 min-h-11 px-5 py-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600 disabled:opacity-60"
      >
        {retrying ? "กำลังโหลด…" : "ลองอีกครั้ง"}
      </button>
    </section>
  );
}
