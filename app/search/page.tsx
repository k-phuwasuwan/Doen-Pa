import { CategoryGrid } from "@/components/search/CategoryGrid";
import { SearchHero } from "@/components/search/SearchHero";
import { SearchResults } from "@/components/search/SearchResults";
import { PlaceCard } from "@/components/search/PlaceCard";
import { CatalogContent } from "@/components/place/CatalogContent";
import { getAuthUser } from "@/lib/auth/server";

export const metadata = {
  description: "ค้นหาสถานที่เดินป่าที่คุณต้องการ",
};

export default async function SearchPage() {
  const currentUser = await getAuthUser();

  return (
    <div className="page-shell">
      <SearchHero />
      <div className="mt-5">
        <CategoryGrid />
      </div>
      <CatalogContent>{(catalog) => {
        const places = catalog.places;
        return <SearchResults
          places={places}
          cards={places.map((place) => <PlaceCard key={place.id} place={place} userId={currentUser?.id ?? ""} />)}
          userId={currentUser?.id ?? ""}
        />;
      }}</CatalogContent>
    </div>
  );
}
