import { Suspense } from "react";
import { SearchBar } from "@/components/search/SearchBar";
import { FilterSection } from "@/components/search/FilterSection";
import { PlaceList } from "@/components/search/PlaceList";
import { placeService } from "@/services/place.service";
import type { PlaceType } from "@/types";

export const metadata = {
  title: "ค้นหา | Doen Pa",
  description: "ค้นหาสถานที่เดินป่าที่คุณต้องการ",
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string; type?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || "";
  const type = (params.type as PlaceType | "all") || "all";

  // Simulate network delay for skeleton to show in dev
  // await new Promise((resolve) => setTimeout(resolve, 1000));

  let places = placeService.getAll();

  if (type !== "all") {
    places = places.filter((p) => p.type === type);
  }

  if (query) {
    const lowerQuery = query.trim().toLowerCase();
    places = places.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.location.toLowerCase().includes(lowerQuery) ||
        p.province.toLowerCase().includes(lowerQuery) ||
        p.region.toLowerCase().includes(lowerQuery)
    );
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8">
      {/* Search Header Area */}
      <div className="card-glass relative mb-6 overflow-hidden p-4 sm:mb-8 sm:p-6 md:p-8">
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold text-forest mb-2">
            สำรวจเส้นทางใหม่
          </h1>
          <p className="mb-5 text-slate sm:mb-6">
            ค้นหาสถานที่เดินป่าที่ใช่ และบันทึกเรื่องราวของคุณ
          </p>
          <div className="max-w-xl">
            <Suspense fallback={<div className="h-[48px] glass-input animate-pulse" />}>
              <SearchBar initialQuery={query} />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="mb-6 sm:mb-8">
        <Suspense fallback={<div className="h-[96px] w-full bg-white/20 animate-pulse rounded-2xl" />}>
          <FilterSection currentType={type} />
        </Suspense>
      </div>

      {/* Results */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-forest">
          {query ? `ผลการค้นหา "${query}"` : "สถานที่แนะนำ"}
        </h2>
        <span className="text-slate text-sm">{places.length} แห่ง</span>
      </div>

      <PlaceList places={places} />
    </div>
  );
}
