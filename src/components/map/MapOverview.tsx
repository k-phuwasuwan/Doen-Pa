"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { MapPin, X } from "lucide-react";
import DynamicThailandMap from "@/components/map/DynamicThailandMap";
import { useTravelRecords } from "@/lib/use-travel-records";
import { placeService } from "@/services/place.service";
import { userService } from "@/services/user.service";
import type { Place } from "@/types";

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
    <section className="relative mt-4 h-[calc(100dvh-9rem)] min-h-[28rem] overflow-hidden bg-brand-100 md:mt-5 md:h-[calc(100dvh-6rem)]" aria-label="แผนที่สถานที่ที่เคยไป">
      <DynamicThailandMap places={places} selectedPlaceId={selectedPlaceId} onSelectPlace={setSelectedPlaceId} />

      <div className="pointer-events-none absolute inset-x-4 top-4 z-[1000] flex justify-center">
        <div className="liquid-glass-capsule flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-brand-900 shadow-glass sm:text-base">
          <MapPin className="h-4 w-4 text-brand-600" aria-hidden="true" />
          สถานที่ที่ไปแล้ว {places.length} แห่ง
        </div>
      </div>

      {places.length === 0 && (
        <div className="pointer-events-none absolute inset-x-4 top-24 z-[1000] flex justify-center">
          <p className="liquid-glass-card max-w-sm rounded-3xl px-5 py-4 text-center text-sm text-brand-800">
            ยังไม่มีสถานที่บนแผนที่ เริ่มบันทึกสถานที่ที่คุณเคยไปในแพสพอร์ต
          </p>
        </div>
      )}

      {selectedPlace && (
        <aside className="absolute bottom-8 left-1/2 z-[1000] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 md:bottom-7" aria-label={`รายละเอียด ${selectedPlace.name}`}>
          <div className="liquid-glass-card relative rounded-3xl p-3 shadow-glass-card sm:p-4">
            <button
              type="button"
              onClick={() => setSelectedPlaceId(null)}
              className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-brand-800 shadow-glass transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
              aria-label="ปิดรายละเอียดสถานที่"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="relative h-40 overflow-hidden rounded-2xl bg-beige-100 sm:h-44">
              {photo && (
                <Image src={photo} alt={`ภาพบันทึกการเดินทางที่${selectedPlace.name}`} fill sizes="(max-width: 640px) 100vw, 448px" className="object-cover" />
              )}
              <div className="absolute inset-x-3 bottom-3 rounded-xl bg-white/90 px-4 py-2 text-center font-semibold text-brand-900 backdrop-blur-sm">
                {selectedPlace.name}
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs font-medium text-brand-800 sm:text-sm">
              <span className="rounded-xl bg-brand-100/80 px-2 py-2">ระยะทาง {selectedPlace.distance ?? "—"}</span>
              <span className="rounded-xl bg-brand-100/80 px-2 py-2">ความสูง {selectedPlace.altitude ?? "—"}</span>
            </div>
          </div>
        </aside>
      )}
    </section>
  );
}
