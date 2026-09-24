import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function BackButton() {
  return (
    <Link
      href="/search"
      className="liquid-glass-capsule group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-brand-700 transition-all duration-300 hover:shadow-glass-hover focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 active:scale-95"
    >
      <ArrowLeft className="h-4 w-4 text-brand-500 transition-transform duration-300 group-hover:-translate-x-1" />
      ย้อนกลับ
    </Link>
  );
}
