import Image from "next/image";
import Link from "next/link";
import { CalendarDays, ChevronRight, MapPin, Stamp, Star } from "lucide-react";
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
    <article className="liquid-glass-card h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-glass-card">
      <Link href={`/places/${place.id}?from=passport`} className="group flex h-full flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-inset">
        <div className="relative h-56 w-full shrink-0 overflow-hidden bg-beige-100/20">
          {image ? (
            <Image
              src={image}
              alt={`ภาพความทรงจำจาก ${place.name}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-brand-800/65">ไม่มีรูปภาพ</div>
          )}
          <span className="absolute left-4 top-4 rounded-full bg-brand-600/90 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {typeLabels[place.type]}
          </span>
          <span className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-brand-800/25 text-white backdrop-blur-md" aria-hidden="true">
            <Stamp className="h-5 w-5" />
          </span>
        </div>

        <div className="flex min-h-60 flex-1 flex-col gap-4 p-5 sm:p-6">
          <div className="space-y-3">
            <div>
              <h2 className="text-xl font-bold text-brand-800 group-hover:text-brand-800/80">{place.name}</h2>
              <div className="mt-1 flex items-center gap-1 text-sm text-brand-800/65">
                <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{place.province}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-brand-800/65">
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                {formatDate(record.visitedAt)}
              </span>
              <span className="inline-flex items-center gap-1" aria-label={`คะแนน ${record.rating} จาก 5`}>
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                {record.rating}/5
              </span>
            </div>
          </div>

          {record.note && (
            <blockquote className="line-clamp-2 rounded-r-lg border-l-2 border-brand-500 bg-brand-50/70 px-3 py-1.5 text-sm italic leading-relaxed text-brand-800/75">
              “{record.note}”
            </blockquote>
          )}

          <div className="mt-auto flex items-center justify-between pt-2">
            <span className="text-xs font-semibold tracking-wide text-brand-500">บันทึกสำเร็จ</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-800/8 text-brand-800 transition-colors group-hover:bg-brand-600 group-hover:text-white" aria-hidden="true">
              <ChevronRight className="h-5 w-5" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
