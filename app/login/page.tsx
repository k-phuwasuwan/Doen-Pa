import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Mountain } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบ | Doen Pa",
};

const guestRoutes = new Set(["search", "map", "passport", "stats", "profile"]);

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { from } = await searchParams;
  const backHref = from && guestRoutes.has(from) ? `/${from}?view=guest` : "/passport?view=guest";

  return (
    <div className="flex min-h-svh flex-col px-4 py-6 sm:px-6">
      <Link href={backHref} className="liquid-glass-capsule inline-flex min-h-11 w-fit items-center gap-2 rounded-full px-4 text-sm font-medium text-brand-800 transition-colors hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        กลับ
      </Link>
      <div className="flex flex-1 items-center justify-center py-8">
        <section className="liquid-glass-card w-full max-w-md rounded-3xl px-6 py-9 sm:px-10 sm:py-11" aria-labelledby="login-heading">
          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-white bg-white/85 text-brand-700 shadow-glass sm:h-32 sm:w-32">
            <Mountain className="h-14 w-14" strokeWidth={1.5} aria-hidden="true" />
          </div>
          <h1 id="login-heading" className="mt-6 text-center text-2xl font-bold text-brand-800">เข้าสู่ระบบ Doen Pa</h1>
          <p className="mt-1 text-center text-sm text-brand-800/65">กลับมาบันทึกความทรงจำจากทุกเส้นทาง</p>
          <LoginForm />
        </section>
      </div>
    </div>
  );
}
