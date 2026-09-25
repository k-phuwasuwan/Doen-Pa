import { notFound } from "next/navigation";
import { placeService } from "@/services/place.service";
import { BackButton } from "@/components/place/BackButton";
import { PlaceDetailContent } from "@/components/place/PlaceDetailContent";
import { userService } from "@/services/user.service";

interface PlacePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string; photo?: string }>;
}

export async function generateMetadata({ params }: PlacePageProps) {
  const { id } = await params;
  const place = placeService.getPlaceById(id);
  if (!place) return { title: "ไม่พบสถานที่ | Doen Pa" };
  return {
    title: `${place.name} | Doen Pa`,
    description: place.description,
  };
}

export default async function PlacePage({ params, searchParams }: PlacePageProps) {
  const { id } = await params;
  const { from, photo } = await searchParams;
  const place = placeService.getPlaceById(id);
  const isFromPassport = from === "passport";
  const isFromProfile = from === "profile";
  const photoIndex = photo && /^\d+$/.test(photo) && Number.isSafeInteger(Number(photo)) ? Number(photo) : 0;

  if (!place) notFound();

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 overflow-x-hidden">
      {/* Back button */}
      <div className="mb-6">
        <BackButton href={isFromPassport ? "/passport" : isFromProfile ? "/profile" : "/search"} />
      </div>

      <PlaceDetailContent place={place} userId={userService.getCurrentUser().id} readOnly={isFromPassport} initialPhotoIndex={photoIndex} />
    </div>
  );
}
