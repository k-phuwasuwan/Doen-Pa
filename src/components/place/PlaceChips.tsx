import type { Place } from "@/types";
import { displayPlaceValue, PLACE_TYPE_LABELS } from "@/domain/place-display";

interface PlaceChipsProps {
  place: Place;
}

export function PlaceChips({ place }: PlaceChipsProps) {
  const chips = [
    {
      key: "type",
      label: PLACE_TYPE_LABELS[place.type],
    },
    {
      key: "altitude",
      label: displayPlaceValue(place.altitude),
      name: "ความสูง",
    },
    {
      key: "distance",
      label: displayPlaceValue(place.distance),
      name: "ระยะทาง",
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2.5 mb-5">
      {chips.map((chip) => (
        <span
          key={chip.key}
          aria-label={chip.name ? `${chip.name}: ${chip.label}` : undefined}
          className="liquid-glass inline-flex items-center rounded-2xl px-4 py-2 text-sm font-semibold text-brand-700"
        >
          {chip.label}
        </span>
      ))}
    </div>
  );
}
