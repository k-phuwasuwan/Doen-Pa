import { redirect } from "next/navigation";
import { CatalogContent } from "@/components/place/CatalogContent";
import { TravelRecordForm } from "@/components/records/TravelRecordForm";
import { BackButton } from "@/components/place/BackButton";
import { requireAuthUser } from "@/lib/auth/server";

interface RecordsNewPageProps {
  searchParams: Promise<{ placeId?: string; returnTo?: string }>;
}

export default async function RecordsNewPage({ searchParams }: RecordsNewPageProps) {
  const { placeId, returnTo } = await searchParams;

  if (!placeId) {
    redirect("/search");
  }

  await requireAuthUser(`/records/new?${new URLSearchParams({ placeId, ...(returnTo === "search" ? { returnTo } : {}) })}`);

  return (
    <CatalogContent>{(catalog) => {
      const place = catalog.getById(placeId);
      if (!place || !catalog.isCatalogPlace(place.id)) redirect("/search");
      const backHref = returnTo === "search" ? "/search" : `/places/${place.id}`;
      return (
        <div className="page-shell">
          <div className="mx-auto mb-5 max-w-5xl">
            <BackButton href={backHref} />
          </div>
          <TravelRecordForm place={place} />
        </div>
      );
    }}</CatalogContent>
  );
}
