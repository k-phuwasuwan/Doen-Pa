import type { Place } from "@/types";
import { displayPlaceValue, REGION_LABELS } from "@/domain/place-display";

interface PlaceInfoProps {
  place: Place;
}

export function PlaceInfo({ place }: PlaceInfoProps) {
  return (
    <div className="space-y-3 mb-5">
      <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-brand-700 tracking-tight leading-tight">
        {place.name}
      </h1>
      <div className="flex flex-wrap items-center gap-3">
        <div className="liquid-glass inline-flex items-center rounded-full px-3 py-1 text-xs sm:text-sm font-medium text-brand-700">
          <span>{displayPlaceValue(place.location)}, {displayPlaceValue(place.province)}</span>
        </div>
        <div className="liquid-glass inline-flex items-center rounded-full px-3 py-1 text-xs sm:text-sm font-medium text-brand-700">
          <span>{REGION_LABELS[place.region]}</span>
        </div>
      </div>
    </div>
  );
}
