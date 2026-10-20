import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/navigation/AppShell";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { getAuthAccount } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Doen Pa — พาสปอร์ตเดินป่า",
  description: "บันทึกการเดินป่า สะสมทริป สร้างพาสปอร์ตที่ไม่ซ้ำใคร",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const account = await getAuthAccount();
  return (
    <html lang="th" className="h-full antialiased">
      <body className="relative min-h-full flex flex-col bg-canvas contour-pattern">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="ambient-glow-mesh-1 left-[-20rem] top-[-18rem]" />
          <div className="ambient-glow-mesh-2 right-[-18rem] top-[20rem]" />
          <div className="ambient-glow-mesh-3 bottom-[-22rem] left-[30%]" />
        </div>
        <AuthProvider key={account?.user.id ?? "guest"} initialData={account}>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
