import { photoThumb } from "@/domain/account-data";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { formatDate, formatStampDate } from "@/lib/utils";
import type { Place, TravelRecord } from "@/types";
import { InkStamp } from "@/components/ui/InkStamp";

interface TravelRecordCardProps {
  record: TravelRecord;
  place: Place;
}

export function TravelRecordCard({ record, place }: TravelRecordCardProps) {
  const image = record.photos[0];
  const stampDate = formatStampDate(record.visitedAt);

  return (
    <article className="liquid-glass-card h-full overflow-hidden">
      <Link href={`/places/${place.id}?from=passport`} className="flex h-full flex-col rounded-3xl focus:outline-none md:h-52 md:flex-row focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500">
        <div className={`relative aspect-[16/10] w-full shrink-0 overflow-hidden md:aspect-auto md:h-full md:w-2/5 ${image ? "bg-beige-100" : "topo-fill"}`}>
          {image ? (
            <Image unoptimized
              src={photoThumb(image, 1280)}
              alt={`ภาพความทรงจำจาก ${place.name}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 440px"
            />
          ) : (
            <span className="sr-only">ไม่มีรูปภาพ</span>
          )}
        </div>

        <div className="relative flex min-w-0 flex-1 flex-col p-4 sm:p-5 md:p-6">
          <InkStamp
            top={place.name}
            bottom={place.province || "DOEN PA"}
            center={stampDate.dayMonth}
            sub={stampDate.year}
            seed={record.id}
            className="absolute right-3 top-3 h-24 w-24 md:right-5 md:top-5 md:h-28 md:w-28"
          />
          <p className="pr-24 text-xs text-brand-800/60">{formatDate(record.visitedAt)}</p>
          <h2 className="mt-0.5 pr-24 text-base font-semibold leading-snug text-brand-800">{place.name}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 pr-24 text-xs text-brand-800/65">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {place.province}
            </span>
            {record.rating > 0 && (
              <span className="inline-flex items-center gap-1" aria-label={`คะแนน ${record.rating} จาก 5`}>
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                {record.rating}/5
              </span>
            )}
          </div>

          {record.note && (
            <blockquote className="mt-3 line-clamp-2 pr-24 md:pr-32 border-l-2 border-lichen pl-3 text-sm leading-relaxed text-brand-800/75">
              “{record.note}”
            </blockquote>
          )}
        </div>
      </Link>
    </article>
  );
}
