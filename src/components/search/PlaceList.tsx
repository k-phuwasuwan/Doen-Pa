import { PlaceCard } from "./PlaceCard";
import { SearchX } from "lucide-react";
import type { Place } from "@/types";

export function PlaceList({ places, visitCounts = {} }: { places: Place[]; visitCounts?: Record<string, number> }) {
  if (places.length === 0) {
    return (
      <div className="card-glass p-12 flex flex-col items-center justify-center text-center">
        <div className="h-16 w-16 bg-beige/20 rounded-full flex items-center justify-center mb-4">
          <SearchX className="w-8 h-8 text-slate" />
        </div>
        <h3 className="text-lg font-bold text-forest mb-2">ไม่พบสถานที่</h3>
        <p className="text-slate max-w-sm">
          ลองค้นหาด้วยคำอื่น หรือเลือกหมวดหมู่ทั้งหมดเพื่อดูสถานที่ทั้งหมด
        </p>
      </div>
    );
  }

  return (
    <div className="grid items-stretch grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {places.map((place) => (
        <PlaceCard key={place.id} place={place} visitCount={visitCounts[place.id] ?? 0} />
      ))}
    </div>
  );
}

export function PlaceListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="card-glass h-full flex flex-col overflow-hidden animate-pulse">
          <div className="h-48 w-full bg-beige/40"></div>
          <div className="p-4 flex flex-col flex-1">
            <div className="h-6 bg-beige/40 rounded w-2/3 mb-4"></div>
            <div className="h-4 bg-beige/40 rounded w-1/2 mt-auto"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
