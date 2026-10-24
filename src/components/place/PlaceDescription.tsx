import type { Place } from "@/types";
import { displayPlaceValue } from "@/domain/place-display";

interface PlaceDescriptionProps {
  place: Place;
}

export function PlaceDescription({ place }: PlaceDescriptionProps) {
  return (
    <div className="space-y-1.5">
      <h2 className="text-base font-semibold text-brand-800">เกี่ยวกับสถานที่</h2>
      <p className="max-w-prose text-sm leading-relaxed text-brand-800/70 sm:text-[15px]">
        {displayPlaceValue(place.description)}
      </p>
    </div>
  );
}
