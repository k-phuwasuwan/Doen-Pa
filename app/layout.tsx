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
        <div className="ambient-glow-mesh-1 left-[-20rem] top-[-18rem]" aria-hidden="true" />
        <div className="ambient-glow-mesh-2 right-[-18rem] top-[20rem]" aria-hidden="true" />
        <div className="ambient-glow-mesh-3 bottom-[-22rem] left-[30%]" aria-hidden="true" />
        <TopNav />
        <main className="relative z-10 flex-1 pb-16 md:pb-0">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
