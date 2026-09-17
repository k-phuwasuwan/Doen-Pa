import { notFound } from "next/navigation";
import { placeService } from "@/services/place.service";
import { travelRecordService } from "@/services/travel-record.service";
import { BackButton } from "@/components/place/BackButton";
import { PlaceGallery } from "@/components/place/PlaceGallery";
import { PlaceInfo } from "@/components/place/PlaceInfo";
import { PlaceChips } from "@/components/place/PlaceChips";
import { PlaceDescription } from "@/components/place/PlaceDescription";
import { PlaceMeta } from "@/components/place/PlaceMeta";
import { PlaceRecord } from "@/components/place/PlaceRecord";
import { PlaceActions } from "@/components/place/PlaceActions";

interface PlacePageProps {
  params: Promise<{ id: string }>;
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

export default async function PlacePage({ params }: PlacePageProps) {
  const { id } = await params;
  const place = placeService.getPlaceById(id);

  if (!place) {
    notFound();
  }

  const CURRENT_USER_ID = "user-1";
  const existingRecord = travelRecordService.getRecordByPlace(CURRENT_USER_ID, place.id);
  const recordPhotos = existingRecord?.photos ?? [];

  return (
    <div className="mx-auto max-w-6xl px-8 py-8">
      <BackButton />

      {/* Desktop: 2-col grid | Mobile: stacked */}
      <div className="mt-4 grid grid-cols-1 items-start gap-10 md:grid-cols-2">
        {/* Left column — Place gallery */}
        <div className="md:sticky md:top-24">
          <PlaceGallery defaultImage={place.image} recordPhotos={recordPhotos} />
        </div>

        {/* Right column — Info */}
        <div className="flex flex-col gap-4">
          <PlaceInfo place={place} />
          <PlaceChips place={place} />

          <hr className="border-beige/40" />

          <PlaceDescription place={place} />

          <hr className="border-beige/40" />

          <PlaceMeta />

          <hr className="border-beige/40" />

          {existingRecord && (
            <PlaceRecord record={existingRecord} />
          )}

          <PlaceActions placeId={place.id} hasRecord={!!existingRecord} />
        </div>
      </div>
    </div>
  );
}
