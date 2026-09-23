"use client";

import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";

interface PlaceActionsProps {
  placeId: string;
  hasRecord: boolean;
}

export function PlaceActions({ placeId, hasRecord }: PlaceActionsProps) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-3 pt-2">
      {/* Primary CTA */}
      <button
        type="button"
        onClick={() => router.push(`/records/new?placeId=${placeId}`)}
        className="shimmer-glass flex-1 sm:flex-initial inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-brand-700 to-brand-500 hover:from-brand-800 hover:to-brand-600 text-white px-7 py-3.5 rounded-2xl font-semibold text-sm sm:text-base shadow-glow-emerald transition-all duration-300 active:scale-[0.98] border border-emerald-400/20 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
      >
        <PlusCircle className="w-5 h-5 text-emerald-200" />
        {hasRecord ? "เพิ่มบันทึกใหม่" : "+ เพิ่มบันทึก"}
      </button>
    </div>
  );
}