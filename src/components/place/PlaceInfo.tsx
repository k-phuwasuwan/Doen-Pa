import type { Place } from "@/types";
import { displayPlaceValue, PLACE_TYPE_LABELS, REGION_LABELS } from "@/domain/place-display";

interface PlaceInfoProps {
  place: Place;
}

export function PlaceInfo({ place }: PlaceInfoProps) {
  return (
    <header>
      <p className="text-sm font-medium text-brand-600">{PLACE_TYPE_LABELS[place.type]}</p>
      <h1 className="mt-1 text-2xl font-bold leading-snug tracking-tight text-brand-800 sm:text-3xl lg:text-[2.125rem]">
        {place.name}
      </h1>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="liquid-glass inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-brand-700 sm:text-sm">
          {displayPlaceValue(place.location)} {displayPlaceValue(place.province)}
        </span>
        <span className="liquid-glass inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-brand-700 sm:text-sm">
          {REGION_LABELS[place.region]}
        </span>
      </div>
    </header>
  );
}
