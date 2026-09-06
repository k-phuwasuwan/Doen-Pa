"use client";

import { useRouter } from "next/navigation";
import { PlusCircle, Bookmark } from "lucide-react";
import { useState } from "react";

interface PlaceActionsProps {
  placeId: string;
  hasRecord: boolean;
}

export function PlaceActions({ placeId, hasRecord }: PlaceActionsProps) {
  const router = useRouter();
  const [bookmarked, setBookmarked] = useState(false);

  const handleAddRecord = () => {
    router.push(`/records/new?placeId=${placeId}`);
  };

  const handleBookmark = () => {
    setBookmarked((prev) => !prev);
  };

  return (
    <div className="flex gap-3">
      <button
        onClick={handleAddRecord}
        className="glass-button flex items-center gap-2 px-5 py-2.5 text-sm font-semibold transition-all duration-150 hover:opacity-90 active:scale-95 focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-2"
      >
        <PlusCircle className="w-4 h-4" />
        {hasRecord ? "เพิ่มบันทึกใหม่" : "+ เพิ่มบันทึก"}
      </button>

      <button
        onClick={handleBookmark}
        aria-label={bookmarked ? "ยกเลิกบุ๊กมาร์ก" : "บุ๊กมาร์กสถานที่นี้"}
        className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-all duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-2 ${
          bookmarked
            ? "bg-gold/10 border-gold/40 text-gold"
            : "bg-white/70 border-beige/60 text-slate hover:border-forest/30 hover:text-forest"
        }`}
      >
        <Bookmark className={`w-4 h-4 ${bookmarked ? "fill-gold" : ""}`} />
      </button>
    </div>
  );
}

