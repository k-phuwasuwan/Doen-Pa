import { notFound } from "next/navigation";
import { placeService } from "@/services/place.service";
import { mockTravelRecords } from "@/mocks/travel-records";
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

  // Server-side record lookup (localStorage is client-only, read mock directly)
  const CURRENT_USER_ID = "user-1";
  const existingRecord =
    mockTravelRecords.find(
      (r) => r.userId === CURRENT_USER_ID && r.placeId === place.id,
    ) ?? null;

  // Gallery: only show user's own uploaded photos from their TravelRecord
  const userPhotos = existingRecord?.photos ?? [];

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
      {/* Back button */}
      <div className="mb-6">
        <BackButton />
      </div>

      {/* Desktop: 2-col grid | Mobile: stacked */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-14 items-start">
        {/* Left — Gallery (no box, sits directly on page background) */}
        <div className="lg:sticky lg:top-24">
          <PlaceGallery recordPhotos={userPhotos} />
        </div>

        {/* Right — Info panel (liquid-glass-card box) */}
        <section className="liquid-glass-card rounded-3xl p-6 sm:p-8 lg:p-9 relative overflow-hidden">
          {/* Specular rim at top */}
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

          <div className="space-y-0">
            <PlaceInfo place={place} />
            <PlaceChips place={place} />

            {/* Divider */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-brand-700/15 to-transparent mb-5" />

            <PlaceDescription place={place} />
            <PlaceMeta place={place} />

            {existingRecord && <PlaceRecord record={existingRecord} />}

            <PlaceActions placeId={place.id} hasRecord={!!existingRecord} />
          </div>
        </section>
      </div>
    </div>
  );
}
