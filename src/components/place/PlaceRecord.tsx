import { Star } from "lucide-react";
import type { Place, TravelRecord } from "@/types";
import { formatStampDate } from "@/lib/utils";
import { InkStamp } from "@/components/ui/InkStamp";

interface PlaceRecordProps {
  record: TravelRecord;
  place: Place;
}

function formatThaiDate(date: Date): string {
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}

/** One journal line per visit; the stamp carries the date the way a passport page would. */
export function PlaceRecord({ record, place }: PlaceRecordProps) {
  const stampDate = formatStampDate(new Date(record.visitedAt));

  return (
    <article className="relative flex items-start gap-4 border-t border-dashed border-brand-800/15 py-4 first:border-t-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-brand-800">{formatThaiDate(record.visitedAt)}</p>
        {/* Star rating — personal only, never aggregated */}
        {record.rating > 0 && (
          <div className="mt-1.5 flex items-center gap-0.5" aria-label={`คะแนนส่วนตัว ${record.rating} จาก 5 ดาว`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} aria-hidden="true" className={`h-4 w-4 ${i < record.rating ? "fill-amber-400 text-amber-400" : "fill-brand-800/10 text-transparent"}`} />
            ))}
          </div>
        )}
        {record.note && (
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-brand-800/75">
            &ldquo;{record.note}&rdquo;
          </p>
        )}
      </div>
      <InkStamp
        top={place.name}
        bottom={place.province || "DOEN PA"}
        center={stampDate.dayMonth}
        sub={stampDate.year}
        seed={record.id}
        className="h-20 w-20 shrink-0"
      />
    </article>
  );
}
