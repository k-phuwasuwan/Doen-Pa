import type { ReactNode } from "react";
import { SearchX } from "lucide-react";

export function PlaceList({ cards }: { cards: ReactNode[] }) {
  if (cards.length === 0) {
    return (
      <div id="search-place-list" className="liquid-glass-card flex scroll-mt-40 flex-col items-center justify-center rounded-[1.75rem] p-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-600/10">
          <SearchX className="h-8 w-8 text-brand-600" aria-hidden="true" />
        </div>
        <h3 className="mb-2 text-lg font-bold text-brand-800">ไม่พบสถานที่</h3>
        <p className="max-w-sm text-brand-800/65">
          ลองค้นหาด้วยคำอื่น หรือเลือกหมวดหมู่ทั้งหมดเพื่อดูสถานที่ทั้งหมด
        </p>
      </div>
    );
  }

  return (
    <div id="search-place-list" className="grid scroll-mt-40 grid-cols-1 items-stretch gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
      {cards}
    </div>
  );
}
