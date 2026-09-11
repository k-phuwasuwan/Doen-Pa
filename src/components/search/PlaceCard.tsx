import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import type { Place } from "@/types";

export function PlaceCard({ place }: { place: Place }) {
  return (
    <Link href={`/places/${place.id}`} className="block group h-full">
      <div className="card-glass h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-glass-md hover:-translate-y-1">
        <div className="relative h-48 w-full shrink-0 bg-beige/20">
          {place.image ? (
            <Image
              src={place.image}
              alt={place.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate">
              ไม่มีรูปภาพ
            </div>
          )}
        </div>
        <div className="p-4 flex flex-col flex-1">
          <h3 className="text-lg font-bold text-forest mb-1">{place.name}</h3>
          <div className="flex items-center text-sm text-slate mt-auto">
            <MapPin className="w-4 h-4 mr-1 shrink-0" />
            <span className="truncate">{place.location}, {place.province}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
