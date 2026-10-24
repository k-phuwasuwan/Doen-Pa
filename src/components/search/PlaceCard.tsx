import Link from "next/link";
import type { Place } from "@/types";
import { StampButton } from "./PlaceCardActions";
import { VisitCount, VisitStamp } from "./VisitCount";
import { displayPlaceValue, PLACE_TYPE_LABELS } from "@/domain/place-display";

/** Compact row on phones, photo-first card from tablet up; the frame waits for park photos. */
export function PlaceCard({ place, userId }: { place: Place; userId: string }) {
  const description = place.description.trim();

  return (
    <div className="liquid-glass-card relative flex h-full flex-col overflow-hidden">
      <Link
        href={`/places/${place.id}`}
        className="flex flex-1 gap-3 rounded-3xl p-3 pb-14 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 sm:flex-col sm:gap-0 sm:p-0 sm:pb-0"
      >
        <div className="topo-fill relative aspect-square w-24 shrink-0 overflow-hidden rounded-2xl sm:aspect-[16/10] sm:w-full sm:rounded-none">
          <span className="absolute left-2 top-2 rounded-full bg-brand-600/90 px-2 py-0.5 text-[11px] font-medium text-white sm:left-3 sm:top-3 sm:px-2.5 sm:text-xs">{PLACE_TYPE_LABELS[place.type]}</span>
          <VisitStamp placeId={place.id} userId={userId} province={place.province} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col sm:px-5 sm:pb-5 sm:pt-5">
          <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-brand-800 sm:text-lg sm:leading-snug">{place.name}</h3>
          <p className="mt-1 truncate text-xs text-brand-800/60 sm:mt-1.5 sm:text-sm">{displayPlaceValue(place.location)} {displayPlaceValue(place.province)}</p>
          {description && <p className="mt-4 hidden text-sm leading-7 text-brand-800/65 sm:line-clamp-2">{description}</p>}
          <VisitCount placeId={place.id} userId={userId} />
        </div>
      </Link>
      <div className="absolute inset-x-3 bottom-3 left-[7.5rem] flex items-end justify-between gap-3 sm:static sm:mx-5 sm:mb-5 sm:items-center sm:border-t sm:border-brand-800/10 sm:pt-4">
        <dl className="flex gap-5 text-xs">
          <div>
            <dt className="text-brand-800/55">ความสูง</dt>
            <dd className="font-num text-sm font-semibold text-brand-800">{displayPlaceValue(place.altitude)}</dd>
          </div>
          <div>
            <dt className="text-brand-800/55">ระยะทาง</dt>
            <dd className="font-num text-sm font-semibold text-brand-800">{displayPlaceValue(place.distance)}</dd>
          </div>
        </dl>
        <StampButton placeId={place.id} />
      </div>
    </div>
  );
}
