import Image from "next/image";
import { MapPin, Mountain, Route, X } from "lucide-react";
import type { Place } from "@/types";

interface SelectedPlaceCardProps {
  place: Place;
  photo?: string;
  onClose: () => void;
}

export function SelectedPlaceCard({ place, photo, onClose }: SelectedPlaceCardProps) {
  return (
    <aside
      className="absolute bottom-28 left-1/2 z-[1000] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 md:bottom-7"
      aria-label={`รายละเอียด ${place.name}`}
    >
      <div className="liquid-glass-card map-place-card overflow-hidden rounded-3xl p-3 shadow-glass-card sm:p-4">
        <div className="map-place-photo relative h-36 overflow-hidden rounded-2xl bg-beige-100 sm:h-40">
          {photo && (
            <Image
              src={photo}
              alt={`ภาพบันทึกการเดินทางที่${place.name}`}
              fill
              sizes="(max-width: 640px) 100vw, 448px"
              className="object-cover"
            />
          )}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white/90 text-brand-800 shadow-glass transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            aria-label="ปิดรายละเอียดสถานที่"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="px-1 pt-4">
          <h2 className="text-lg font-semibold leading-snug text-brand-800 sm:text-xl">{place.name}</h2>
          <span className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full border border-brand-200/80 bg-brand-50/90 px-3 py-1.5 text-xs font-medium text-brand-700 sm:text-sm">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{place.province}</span>
          </span>

          <div className="mt-4 grid grid-cols-2 gap-2 border-t border-brand-800/10 pt-3">
            <div className="flex min-w-0 items-center gap-2 rounded-2xl border border-white/80 bg-white/60 p-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                <Route className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-xs text-brand-800/65">ระยะทาง</p>
                <p className="truncate text-sm font-semibold text-brand-800">{place.distance ?? "—"}</p>
              </div>
            </div>
            <div className="flex min-w-0 items-center gap-2 rounded-2xl border border-white/80 bg-white/60 p-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                <Mountain className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-xs text-brand-800/65">ความสูง</p>
                <p className="truncate text-sm font-semibold text-brand-800">{place.altitude ?? "—"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
