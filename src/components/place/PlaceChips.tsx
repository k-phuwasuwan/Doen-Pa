import type { Place, PlaceType } from "@/types";

const typeLabels: Record<PlaceType, string> = {
  mountain: "ภูเขา",
  waterfall: "น้ำตก",
  cave: "ถ้ำ",
  island: "หมู่เกาะ & ทะเล",
};

interface PlaceChipsProps {
  place: Place;
}

export function PlaceChips({ place }: PlaceChipsProps) {
  const chips = [
    {
      key: "type",
      label: typeLabels[place.type],
    },
    {
      key: "altitude",
      label: place.altitude,
    },
    {
      key: "distance",
      label: place.distance,
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2.5 mb-5">
      {chips
        .filter((chip) => chip.label)
        .map((chip) => (
          <span
            key={chip.key}
            className="liquid-glass inline-flex items-center rounded-2xl px-4 py-2 text-sm font-semibold text-brand-700"
          >
            {chip.label}
          </span>
        ))}
    </div>
  );
}
