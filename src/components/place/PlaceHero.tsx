import Image from "next/image";
import type { Place } from "@/types";

interface PlaceHeroProps {
  place: Place;
}

export function PlaceHero({ place }: PlaceHeroProps) {
  return (
    <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-glass-card">
      {place.image ? (
        <Image
          src={place.image}
          alt={place.name}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      ) : (
        <div className="w-full h-full bg-beige-100/30 flex items-center justify-center text-brand-800/65 text-sm">
          ไม่มีรูปภาพ
        </div>
      )}
    </div>
  );
}

