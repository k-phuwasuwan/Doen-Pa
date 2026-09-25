import type { Metadata } from "next";
import { Kanit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { TopNav } from "@/components/navigation/TopNav";
import { BottomNav } from "@/components/navigation/BottomNav";

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Doen Pa — แพสพอร์ตเดินป่า",
  description: "บันทึกการเดินป่า สะสมทริป สร้างแพสพอร์ตที่ไม่ซ้ำใคร",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="th"
      className={`${kanit.variable} ${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="relative min-h-full flex flex-col bg-canvas contour-pattern">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="ambient-glow-mesh-1 left-[-20rem] top-[-18rem]" />
          <div className="ambient-glow-mesh-2 right-[-18rem] top-[20rem]" />
          <div className="ambient-glow-mesh-3 bottom-[-22rem] left-[30%]" />
        </div>
        <TopNav />
        <main className="relative z-10 flex-1 pb-28 md:pb-0">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
