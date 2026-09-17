"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="flex items-center gap-2 text-slate transition-colors hover:text-forest"
    >
      <ArrowLeft className="h-[18px] w-[18px]" />
      <span>ย้อนกลับ</span>
    </button>
  );
}
