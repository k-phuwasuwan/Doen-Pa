import { notFound, unstable_rethrow } from "next/navigation";
import { getPlaceCatalog } from "@/services/place.service";
import { CatalogContent } from "@/components/place/CatalogContent";
import { BackButton } from "@/components/place/BackButton";
import { PlaceDetailContent } from "@/components/place/PlaceDetailContent";
import { getAuthUser } from "@/lib/auth/server";

interface PlacePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string; photo?: string }>;
}

export async function generateMetadata({ params }: PlacePageProps) {
  const { id } = await params;
  let catalog;
  try {
    catalog = await getPlaceCatalog();
  } catch (error) {
    unstable_rethrow(error);
    return {};
  }
  const place = catalog.getById(id);
  if (!place) return {};
  return { description: place.description };
}

export default async function PlacePage({ params, searchParams }: PlacePageProps) {
  const user = await getAuthUser();
  const { id } = await params;
  const { from, photo } = await searchParams;
  const isFromPassport = from === "passport";
  const isFromProfile = from === "profile";
  const photoIndex = photo && /^\d+$/.test(photo) && Number.isSafeInteger(Number(photo)) ? Number(photo) : 0;

  return (
    <CatalogContent>{(catalog) => {
      const place = catalog.getById(id);
      if (!place) notFound();
      return (
        <div className="page-shell overflow-x-hidden">
          <div className="mb-5">
            <BackButton href={isFromPassport ? "/passport" : isFromProfile ? "/profile" : "/search"} />
          </div>

          <PlaceDetailContent place={place} userId={user?.id ?? ""} readOnly={isFromPassport || !catalog.isCatalogPlace(place.id)} initialPhotoIndex={photoIndex} />
        </div>
      );
    }}</CatalogContent>
  );
}
