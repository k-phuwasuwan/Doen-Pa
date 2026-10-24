"use client";

import { useTravelRecordReadModel } from "@/lib/use-travel-record-read-model";
import type { Place } from "@/types";
import { PlaceActions } from "./PlaceActions";
import { PlaceChips } from "./PlaceChips";
import { PlaceDescription } from "./PlaceDescription";
import { PlaceGallery } from "./PlaceGallery";
import { PlaceInfo } from "./PlaceInfo";
import { PlaceRecord } from "./PlaceRecord";

interface PlaceDetailContentProps {
  place: Place;
  userId: string;
  readOnly?: boolean;
  initialPhotoIndex?: number;
}

/** Title, a wide photo stage, then readings; the Stamp bar rides beside the story on desktop. */
export function PlaceDetailContent({ place, userId, readOnly = false, initialPhotoIndex = 0 }: PlaceDetailContentProps) {
  const memories = useTravelRecordReadModel(userId);
  const { records: placeRecords, photos } = memories.getPlaceMemory(place.id);

  return (
    <div className="space-y-5">
      <PlaceInfo place={place} />
      <PlaceGallery key={initialPhotoIndex} recordPhotos={photos} initialPhotoIndex={initialPhotoIndex} />
      <PlaceChips place={place} visitCount={placeRecords.length} />

      <div className={`grid items-start gap-5 ${readOnly ? "" : "lg:grid-cols-[minmax(0,1fr)_21rem]"}`}>
        {!readOnly && (
          <div className="lg:sticky lg:top-24 lg:col-start-2 lg:row-start-1">
            <PlaceActions placeId={place.id} visited={placeRecords.length > 0} />
          </div>
        )}

        <section className="liquid-glass-card liquid-glass-card--flat space-y-6 p-5 sm:p-6 lg:col-start-1 lg:row-start-1">
          <PlaceDescription place={place} />

          {placeRecords.length > 0 && (
            <section aria-labelledby="place-records-heading" className="border-t border-brand-800/10 pt-5">
              <h2 id="place-records-heading" className="text-base font-semibold text-brand-800">
                บันทึกการเดินทางของคุณ ({placeRecords.length})
              </h2>
              <div className="mt-1">
                {placeRecords.map((record) => <PlaceRecord key={record.id} record={record} place={place} />)}
              </div>
            </section>
          )}
        </section>
      </div>
    </div>
  );
}
