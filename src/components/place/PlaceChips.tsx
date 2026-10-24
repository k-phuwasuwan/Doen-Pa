import type { Place } from "@/types";
import { displayPlaceValue } from "@/domain/place-display";

interface PlaceChipsProps {
  place: Place;
  visitCount: number;
}

/** Instrument strip: the place's measurements read like values from a field device. */
export function PlaceChips({ place, visitCount }: PlaceChipsProps) {
  const readings = [
    { key: "altitude", name: "ความสูง", value: displayPlaceValue(place.altitude) },
    { key: "distance", name: "ระยะทาง", value: displayPlaceValue(place.distance) },
  ];

  return (
    <dl className="liquid-glass-card liquid-glass-card--flat grid grid-cols-3 divide-x divide-brand-800/10 py-3">
      {readings.map((reading) => (
        <div key={reading.key} aria-label={`${reading.name}: ${reading.value}`} className="min-w-0 px-4">
          <dt className="text-xs text-brand-800/60">{reading.name}</dt>
          <dd className="font-num mt-0.5 truncate text-lg font-semibold text-brand-800 sm:text-xl">{reading.value}</dd>
        </div>
      ))}
      <div className="min-w-0 px-4">
        <dt className="text-xs text-brand-800/60">การเยือนของคุณ</dt>
        <dd className="mt-0.5 truncate text-lg font-semibold text-brand-800 sm:text-xl">
          <span className="font-num">{visitCount}</span> <span className="text-sm font-medium text-brand-800/65">ครั้ง</span>
        </dd>
      </div>
    </dl>
  );
}
