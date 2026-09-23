import type { Place } from "@/types";

interface PlaceDescriptionProps {
  place: Place;
}

export function PlaceDescription({ place }: PlaceDescriptionProps) {
  return (
    <div className="space-y-1.5 mb-5">
      <h2 className="text-base sm:text-lg font-bold text-brand-700 tracking-tight">
        เกี่ยวกับสถานที่
      </h2>
      <p className="text-sm sm:text-base text-brand-800/65 leading-relaxed">
        {place.description}
      </p>
    </div>
  );
}
