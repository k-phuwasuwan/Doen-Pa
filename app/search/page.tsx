import { FilterSection } from "@/components/search/FilterSection";
import { SearchHero } from "@/components/search/SearchHero";
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
    <>
      <SearchHero initialQuery={query} />

      <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8">
        {/* Filter Section */}
        <div className="mb-6 sm:mb-8">
          <FilterSection currentType={type} />
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
    </>
  );
}
