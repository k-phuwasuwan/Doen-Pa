import { CategoryGrid } from "@/components/search/CategoryGrid";
import { SearchHero } from "@/components/search/SearchHero";
import { SearchResults } from "@/components/search/SearchResults";
import { PlaceCard } from "@/components/search/PlaceCard";
import { placeService } from "@/services/place.service";
import { userService } from "@/services/user.service";
import type { PlaceType } from "@/types";

export const metadata = {
  title: "ค้นหา | Doen Pa",
  description: "ค้นหาสถานที่เดินป่าที่คุณต้องการ",
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string; type?: string; visited?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || "";
  const type = (params.type as PlaceType | "all") || "all";
  const visited = params.visited === "visited" || params.visited === "unvisited" ? params.visited : "all";
  const currentUser = userService.getCurrentUser();

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
        <CategoryGrid currentType={type} query={query} visited={visited} />
        <SearchResults
          places={places}
          cards={places.map((place) => <PlaceCard key={place.id} place={place} userId={currentUser.id} />)}
          userId={currentUser.id}
          query={query}
          type={type}
          visited={visited}
        />
      </div>
    </>
  );
}
