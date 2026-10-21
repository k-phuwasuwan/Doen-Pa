import type { ReactNode } from "react";
import { SearchX } from "lucide-react";

export function PlaceList({ cards }: { cards: ReactNode[] }) {
  if (cards.length === 0) {
    return (
      <div id="search-place-list" className="liquid-glass-card scroll-mt-24 p-12 flex flex-col items-center justify-center text-center">
        <div className="h-16 w-16 bg-beige-100/20 rounded-full flex items-center justify-center mb-4">
          <SearchX className="w-8 h-8 text-brand-800/65" />
        </div>
        <h3 className="text-lg font-bold text-brand-800 mb-2">ไม่พบสถานที่</h3>
        <p className="text-brand-800/65 max-w-sm">
          ลองค้นหาด้วยคำอื่น หรือเลือกหมวดหมู่ทั้งหมดเพื่อดูสถานที่ทั้งหมด
        </p>
      </div>
    );
  }

  return (
    <div id="search-place-list" className="grid scroll-mt-24 items-stretch grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {cards}
    </div>
  );
}
