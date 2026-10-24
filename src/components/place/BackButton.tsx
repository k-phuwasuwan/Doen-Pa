import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function BackButton({ href = "/search" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-white pl-3 pr-4 text-sm font-semibold text-brand-800 shadow-lg shadow-brand-950/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      ย้อนกลับ
    </Link>
  );
}
