import type { Place } from "@/types";

interface PlaceDescriptionProps {
  place: Place;
}

export function PlaceDescription({ place }: PlaceDescriptionProps) {
  return (
    <div className="mb-6">
      <h2 className="text-base font-semibold text-forest mb-2">เกี่ยวกับสถานที่</h2>
      <p className="text-slate leading-relaxed text-sm">{place.description}</p>
    </div>
  );
}

