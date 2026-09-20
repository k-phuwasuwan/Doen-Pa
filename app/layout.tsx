import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TopNav } from "@/components/navigation/TopNav";
import { BottomNav } from "@/components/navigation/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Doen Pa — แพสพอร์ตเดินป่า",
  description: "บันทึกการเดินป่า สะสมทริป สร้างแพสพอร์ตที่ไม่ซ้ำใคร",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="th"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
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
