"use client";

import "./globals.css";

export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <html lang="th"><body className="flex min-h-svh items-center justify-center bg-canvas p-6 text-brand-800">
    <title>Doen Pa</title>
    <main className="liquid-glass-card w-full max-w-md rounded-3xl p-8 text-center">
      <h1 className="text-2xl font-bold">โหลดหน้าไม่สำเร็จ</h1>
      <p className="mt-3">กรุณาตรวจสอบอินเทอร์เน็ต แล้วลองโหลดหน้าอีกครั้ง</p>
      <button type="button" onClick={() => retry()} className="glass-button mt-6 min-h-12 rounded-2xl px-6 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600">ลองอีกครั้ง</button>
    </main>
  </body></html>;
}
