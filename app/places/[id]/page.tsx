import { notFound } from "next/navigation";
import { placeService } from "@/services/place.service";
import { mockTravelRecords } from "@/mocks/travel-records";
import { PlaceHero } from "@/components/place/PlaceHero";
import { PlaceInfo } from "@/components/place/PlaceInfo";
import { PlaceChips } from "@/components/place/PlaceChips";
import { PlaceDescription } from "@/components/place/PlaceDescription";
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

  // Server-side: read from mock directly (localStorage is client-only)
  const CURRENT_USER_ID = "user-1";
  const existingRecord =
    mockTravelRecords.find(
      (r) => r.userId === CURRENT_USER_ID && r.placeId === place.id,
    ) ?? null;

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
      {/* Desktop: 2-col grid | Mobile: stacked */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* Left column — Hero image */}
        <div className="lg:sticky lg:top-24">
          <PlaceHero place={place} />
        </div>

        {/* Right column — Info */}
        <div className="card-glass p-6 md:p-8 flex flex-col">
          <PlaceInfo place={place} />
          <PlaceChips place={place} />

          <hr className="border-beige/40 mb-5" />

          <PlaceDescription place={place} />

          {existingRecord && (
            <PlaceRecord record={existingRecord} />
          )}

          <PlaceActions placeId={place.id} hasRecord={!!existingRecord} />
        </div>
      </div>
    </div>
  );
}
