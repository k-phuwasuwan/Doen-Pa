"use client";

import { useTravelRecordReadModel } from "@/lib/use-travel-record-read-model";
import type { Place } from "@/types";
import { PlaceActions } from "./PlaceActions";
import { PlaceChips } from "./PlaceChips";
import { PlaceDescription } from "./PlaceDescription";
import { PlaceGallery } from "./PlaceGallery";
import { PlaceInfo } from "./PlaceInfo";
import { PlaceMeta } from "./PlaceMeta";
import { PlaceRecord } from "./PlaceRecord";

interface PlaceDetailContentProps {
  place: Place;
  userId: string;
  readOnly?: boolean;
  initialPhotoIndex?: number;
}

export function PlaceDetailContent({ place, userId, readOnly = false, initialPhotoIndex = 0 }: PlaceDetailContentProps) {
  const memories = useTravelRecordReadModel(userId);
  const { records: placeRecords, photos } = memories.getPlaceMemory(place.id);

  return (
    <div className="grid grid-cols-1 items-start gap-8 overflow-hidden lg:grid-cols-2 lg:gap-12 xl:gap-14">
      <div className="overflow-hidden lg:sticky lg:top-24">
        <PlaceGallery key={initialPhotoIndex} recordPhotos={photos} initialPhotoIndex={initialPhotoIndex} />
      </div>

      <section className="liquid-glass-card relative overflow-hidden rounded-3xl p-6 sm:p-8 lg:p-9">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
        <PlaceInfo place={place} />
        <PlaceChips place={place} />
        <div className="mb-5 h-px w-full bg-gradient-to-r from-transparent via-brand-700/15 to-transparent" />
        <PlaceDescription place={place} />
        <PlaceMeta place={place} />

        {placeRecords.length > 0 && (
          <section aria-labelledby="place-records-heading" className="mb-5">
            <h2 id="place-records-heading" className="mb-3 text-lg font-semibold text-brand-800">
              บันทึกการเดินทางของคุณ ({placeRecords.length})
            </h2>
            <div className="space-y-3">
              {placeRecords.map((record) => <PlaceRecord key={record.id} record={record} />)}
            </div>
          </section>
        )}

        {!readOnly && <PlaceActions placeId={place.id} />}
      </section>
    </div>
  );
}
