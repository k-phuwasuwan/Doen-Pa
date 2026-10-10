"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import DynamicThailandMap from "@/components/map/DynamicThailandMap";
import { useTravelRecordReadModel } from "@/lib/use-travel-record-read-model";
import { userService } from "@/services/user.service";
import { SelectedPlaceCard } from "./SelectedPlaceCard";

export function MapOverview() {
  const memories = useTravelRecordReadModel(userService.getCurrentUser().id);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const places = memories.mapPlaces;
  const selectedPlace = places.find((place) => place.id === selectedPlaceId) ?? null;
  const photo = selectedPlace ? memories.getPlaceMemory(selectedPlace.id).mapPhoto : undefined;

  return (
    <section className={`map-fullscreen fixed inset-0 h-dvh w-full overflow-hidden bg-brand-100${selectedPlace ? " map-fullscreen--place-selected" : ""}`} aria-label="แผนที่สถานที่ที่เคยไป">
      <DynamicThailandMap places={places} selectedPlaceId={selectedPlaceId} onSelectPlace={setSelectedPlaceId} />

      <div className="map-visited-count pointer-events-none absolute inset-x-4 top-22 z-[1000] flex justify-center lg:top-24">
        <div className="liquid-glass-capsule flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-brand-900 shadow-glass sm:text-base">
          <MapPin className="h-4 w-4 text-brand-600" aria-hidden="true" />
          สถานที่ที่ไปแล้ว {places.length} แห่ง
        </div>
      </div>

      {places.length === 0 && (
        <div className="pointer-events-none absolute inset-0 z-[1000] flex items-center justify-center px-4">
          <p className="max-w-sm rounded-3xl border border-white bg-white/95 px-5 py-4 text-center text-sm font-medium text-brand-900 shadow-glass backdrop-blur-xl">
            ยังไม่มีสถานที่บนแผนที่
          </p>
        </div>
      )}

      {selectedPlace && (
        <SelectedPlaceCard place={selectedPlace} photo={photo} onClose={() => setSelectedPlaceId(null)} />
      )}
    </section>
  );
}
