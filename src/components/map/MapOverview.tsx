"use client";

import { useState } from "react";
import DynamicThailandMap from "@/components/map/DynamicThailandMap";
import { useTravelRecordReadModel } from "@/lib/use-travel-record-read-model";
import { useCurrentUser } from "@/lib/use-current-user";
import { SelectedPlaceCard } from "./SelectedPlaceCard";

export function MapOverview() {
  const memories = useTravelRecordReadModel(useCurrentUser().id);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const places = memories.mapPlaces;
  const selectedPlace = places.find((place) => place.id === selectedPlaceId) ?? null;
  const photo = selectedPlace ? memories.getMapPhoto(selectedPlace.id) : undefined;

  return (
    <section className={`map-fullscreen fixed inset-0 h-dvh w-full overflow-hidden bg-brand-100${selectedPlace ? " map-fullscreen--place-selected" : ""}`} aria-label="แผนที่สถานที่ที่เคยไป">
      <DynamicThailandMap places={places} selectedPlaceId={selectedPlaceId} onSelectPlace={setSelectedPlaceId} />

      {places.length === 0 && (
        <div className="pointer-events-none absolute inset-0 z-[1000] flex items-center justify-center px-4">
          <p className="liquid-glass-card max-w-xs px-5 py-4 text-center text-sm text-brand-800">
            <span className="block font-semibold">ยังไม่มีสถานที่บนแผนที่</span>
            <span className="mt-1 block text-brand-800/65">สแตมป์สถานที่ที่เคยไป แล้วหมุดจะปรากฏที่นี่</span>
          </p>
        </div>
      )}

      {selectedPlace && (
        <SelectedPlaceCard place={selectedPlace} photo={photo} onClose={() => setSelectedPlaceId(null)} />
      )}
    </section>
  );
}
