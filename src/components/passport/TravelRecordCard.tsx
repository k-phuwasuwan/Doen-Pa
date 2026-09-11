import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin, Star } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Place, TravelRecord } from "@/types";

const typeLabels: Record<Place["type"], string> = {
  mountain: "ภูเขา",
  waterfall: "น้ำตก",
  cave: "ถ้ำ",
  island: "หมู่เกาะและทะเล",
  national_park: "อุทยานแห่งชาติ",
};

interface TravelRecordCardProps {
  record: TravelRecord;
  place: Place;
}

export function TravelRecordCard({ record, place }: TravelRecordCardProps) {
  const image = record.photos[0] || place.image;

  return (
    <article className="card-glass overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-glass-md">
      <Link href={`/places/${place.id}`} className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-inset">
        <div className="relative h-52 w-full overflow-hidden bg-beige/20">
          {image ? (
            <Image
              src={image}
              alt={`ภาพความทรงจำจาก ${place.name}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate">ไม่มีรูปภาพ</div>
          )}
          <span className="absolute left-4 top-4 rounded-full bg-forest/90 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {typeLabels[place.type]}
          </span>
        </div>

        <div className="space-y-3 p-5">
          <div>
            <h2 className="text-xl font-bold text-forest group-hover:text-forest/80">{place.name}</h2>
            <div className="mt-1 flex items-center gap-1 text-sm text-slate">
              <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{place.province}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              {formatDate(record.visitedAt)}
            </span>
            <span className="inline-flex items-center gap-1" aria-label={`คะแนน ${record.rating} จาก 5`}>
              <Star className="h-4 w-4 fill-gold text-gold" aria-hidden="true" />
              {record.rating}/5
            </span>
          </div>

          {record.note && (
            <blockquote className="border-l-2 border-gold pl-3 text-sm italic leading-relaxed text-slate">
              “{record.note}”
            </blockquote>
          )}
        </div>
      </Link>
    </article>
  );
}
