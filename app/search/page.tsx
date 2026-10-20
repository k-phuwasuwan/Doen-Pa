import { CategoryGrid } from "@/components/search/CategoryGrid";
import { SearchHero } from "@/components/search/SearchHero";
import { SearchResults } from "@/components/search/SearchResults";
import { PlaceCard } from "@/components/search/PlaceCard";
import { CatalogContent } from "@/components/place/CatalogContent";
import { getAuthUser } from "@/lib/auth/server";
import type { PlaceType } from "@/types";

export const metadata = {
  title: "ค้นหา | Doen Pa",
  description: "ค้นหาสถานที่เดินป่าที่คุณต้องการ",
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string; type?: string; visited?: string }>;
}

const placeTypes = new Set<PlaceType>(["mountain", "waterfall", "cave", "island"]);

function isPlaceType(value: string | undefined): value is PlaceType {
  return value !== undefined && placeTypes.has(value as PlaceType);
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || "";
  const type = isPlaceType(params.type) ? params.type : "all";
  const visited = params.visited === "visited" || params.visited === "unvisited" ? params.visited : "all";
  const currentUser = await getAuthUser();

  return (
    <>
      <SearchHero initialQuery={query} />

      <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8">
        <CategoryGrid currentType={type} query={query} visited={visited} />
        <CatalogContent>{(catalog) => {
          const places = catalog.search(query, type);
          return <SearchResults
            places={places}
            cards={places.map((place) => <PlaceCard key={place.id} place={place} userId={currentUser?.id ?? ""} />)}
            userId={currentUser?.id ?? ""}
            query={query}
            type={type}
            visited={visited}
          />;
        }}</CatalogContent>
      </div>
    </>
  );
}
