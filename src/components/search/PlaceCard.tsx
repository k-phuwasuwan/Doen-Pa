import Link from "next/link";
import { MapPin } from "lucide-react";
import type { Place } from "@/types";
import { StampButton } from "./PlaceCardActions";
import { VisitCount } from "./VisitCount";

const placeTypeLabels: Record<Place["type"], string> = {
  mountain: "ภูเขา",
  waterfall: "น้ำตก",
  cave: "ถ้ำ",
  island: "หมู่เกาะและทะเล",
  national_park: "อุทยานแห่งชาติ",
};

export function PlaceCard({ place, userId }: { place: Place; userId: string }) {
  return (
    <Link href={`/places/${place.id}`} className="block group h-full">
      <div className="liquid-glass-card h-full flex flex-col overflow-hidden rounded-3xl">
        <div className="relative h-52 w-full shrink-0 bg-beige-100">
          <div className="absolute inset-0 bg-gradient-to-t from-brand-950/70 via-transparent to-transparent" />
          <span className="absolute left-4 top-4 rounded-full bg-brand-600/90 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">{placeTypeLabels[place.type]}</span>
        </div>
        <div className="flex min-h-52 flex-1 flex-col p-4">
          <h3 className="mb-1 text-lg font-bold text-brand-800">{place.name}</h3>
          <p className="mb-3 line-clamp-2 text-sm text-brand-800/65">{place.description}</p>
          <div className="mb-4 flex min-h-10 items-center text-sm text-brand-800/60">
            <MapPin className="w-4 h-4 mr-1 shrink-0" />
            <span className="truncate">{place.location}, {place.province}</span>
          </div>
          <div className="mt-auto flex min-h-14 items-center justify-end gap-3 border-t border-brand-800/10 pt-3 text-xs text-brand-800/60">
            <VisitCount placeId={place.id} userId={userId} />
            <StampButton placeId={place.id} />
          </div>
        </div>
      </div>
    </Link>
  );
}
