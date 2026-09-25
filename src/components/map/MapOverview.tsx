"use client";

import { useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import DynamicThailandMap from "@/components/map/DynamicThailandMap";
import { useTravelRecords } from "@/lib/use-travel-records";
import { placeService } from "@/services/place.service";
import { userService } from "@/services/user.service";
import type { Place } from "@/types";
import { SelectedPlaceCard } from "./SelectedPlaceCard";

function hasCoordinates(place: Place): boolean {
  return Number.isFinite(place.latitude) && Number.isFinite(place.longitude);
}

export function MapOverview() {
  const records = useTravelRecords(userService.getCurrentUser().id);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  const places = useMemo(() => {
    const uniquePlaces = new Map<string, Place>();
    for (const record of records) {
      const place = placeService.getPlaceById(record.placeId);
      if (place && hasCoordinates(place)) uniquePlaces.set(place.id, place);
    }
    return [...uniquePlaces.values()];
  }, [records]);

  const selectedPlace = places.find((place) => place.id === selectedPlaceId) ?? null;
  const photo = selectedPlace
    ? records
        .filter((record) => record.placeId === selectedPlace.id && record.photos.length > 0)
        .sort((a, b) => b.visitedAt.getTime() - a.visitedAt.getTime())[0]?.photos[0]
    : undefined;

  return (
    <section className={`map-fullscreen fixed inset-0 h-dvh w-full overflow-hidden bg-brand-100${selectedPlace ? " map-fullscreen--place-selected" : ""}`} aria-label="แผนที่สถานที่ที่เคยไป">
      <DynamicThailandMap places={places} selectedPlaceId={selectedPlaceId} onSelectPlace={setSelectedPlaceId} />

      <div className="map-visited-count pointer-events-none absolute inset-x-4 top-22 z-[1000] flex justify-center md:top-24">
        <div className="liquid-glass-capsule flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-brand-900 shadow-glass sm:text-base">
          <MapPin className="h-4 w-4 text-brand-600" aria-hidden="true" />
          สถานที่ที่ไปแล้ว {places.length} แห่ง
        </div>
      </div>

      {places.length === 0 && (
        <div className="pointer-events-none absolute inset-x-4 top-44 z-[1000] flex justify-center md:top-48">
          <p className="liquid-glass-card max-w-sm rounded-3xl px-5 py-4 text-center text-sm text-brand-800">
            ยังไม่มีสถานที่บนแผนที่ เริ่มบันทึกสถานที่ที่คุณเคยไปในแพสพอร์ต
          </p>
        </div>
      )}

      {selectedPlace && (
        <SelectedPlaceCard place={selectedPlace} photo={photo} onClose={() => setSelectedPlaceId(null)} />
      )}
    </section>
  );
}
