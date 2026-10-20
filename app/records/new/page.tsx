import { redirect } from "next/navigation";
import { CatalogContent } from "@/components/place/CatalogContent";
import { TravelRecordForm } from "@/components/records/TravelRecordForm";
import { BackButton } from "@/components/place/BackButton";
import { requireAuthUser } from "@/lib/auth/server";

export const metadata = {
  title: "สแตมป์ | Doen Pa",
};

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
        <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8">
          <div className="mb-6">
            <BackButton href={backHref} />
          </div>

          {/* Centered card */}
          <div className="max-w-xl mx-auto">
            <div className="liquid-glass-card p-4 sm:p-6 md:p-8">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-brand-800">บันทึกการเดินทาง</h1>
                <p className="text-brand-800/65 text-sm mt-1">
                  บันทึกความทรงจำและรูปภาพของทริปนี้ลงพาสปอร์ต
                </p>
              </div>

              <TravelRecordForm place={place} />
            </div>
          </div>
        </div>
      );
    }}</CatalogContent>
  );
}
