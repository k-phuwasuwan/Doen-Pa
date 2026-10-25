import { photoThumb } from "@/domain/account-data";
import Image from "next/image";
import { X } from "lucide-react";
import type { Place } from "@/types";
import { PLACE_TYPE_LABELS } from "@/domain/place-display";
import { ReadingValue } from "@/components/ui/ReadingValue";

interface SelectedPlaceCardProps {
  place: Place;
  photo?: string;
  onClose: () => void;
}

/** Compact sheet over the map: photo, name and two readings, leaving most of the map visible. */
export function SelectedPlaceCard({ place, photo, onClose }: SelectedPlaceCardProps) {
  return (
    <aside
      className="absolute bottom-[8.25rem] left-1/2 z-[1000] w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 lg:bottom-6 lg:left-8 lg:translate-x-0"
      aria-label={`รายละเอียด ${place.name}`}
    >
      <div className="liquid-glass-card map-place-card flex gap-3 p-2.5 pr-3 shadow-glass-card sm:gap-4 sm:p-3">
        <div className={`map-place-photo relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl sm:h-32 sm:w-32 ${photo ? "bg-beige-100" : "topo-fill"}`}>
          {photo && (
            <Image unoptimized
              src={photoThumb(photo, 640)}
              alt={`ภาพบันทึกการเดินทางที่${place.name}`}
              fill
              sizes="128px"
              className="object-cover"
            />
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col py-1">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-brand-600">{PLACE_TYPE_LABELS[place.type]}</p>
              <h2 className="mt-0.5 line-clamp-2 text-base font-semibold leading-snug text-brand-800">{place.name}</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="-mr-1 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-brand-800/70 transition-colors hover:bg-brand-800/5 hover:text-brand-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
              aria-label="ปิดรายละเอียดสถานที่"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <span className="mt-1 inline-flex w-fit max-w-full items-center rounded-full bg-brand-600/10 px-2.5 py-0.5 text-xs font-medium text-brand-700">
            <span className="truncate">{place.province}</span>
          </span>
          <dl className="mt-auto flex gap-5 pt-2 text-xs">
            <div>
              <dt className="text-brand-800/55">ระยะทาง</dt>
              <dd className="font-num text-sm font-semibold text-brand-800"><ReadingValue value={place.distance} /></dd>
            </div>
            <div>
              <dt className="text-brand-800/55">ความสูง</dt>
              <dd className="font-num text-sm font-semibold text-brand-800"><ReadingValue value={place.altitude} /></dd>
            </div>
          </dl>
        </div>
      </div>
    </aside>
  );
}
