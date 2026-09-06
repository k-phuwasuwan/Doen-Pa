import { CalendarDays, Star } from "lucide-react";
import type { TravelRecord } from "@/types";

interface PlaceRecordProps {
  record: TravelRecord;
}

function formatThaiDate(date: Date): string {
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function PlaceRecord({ record }: PlaceRecordProps) {
  return (
    <div className="mb-6 p-4 rounded-xl bg-forest/5 border border-forest/10">
      <div className="flex items-center gap-2 text-forest font-semibold text-sm mb-3">
        <span className="inline-block w-2 h-2 rounded-full bg-forest" />
        คุณเคยไปที่นี่แล้ว
      </div>

      <div className="flex items-center gap-2 text-slate text-sm mb-2">
        <CalendarDays className="w-4 h-4 shrink-0" />
        <span>{formatThaiDate(record.visitedAt)}</span>
      </div>

      {record.rating > 0 && (
        <div className="flex items-center gap-1 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < record.rating ? "fill-gold text-gold" : "text-beige"
              }`}
            />
          ))}
        </div>
      )}

      {record.note && (
        <p className="text-sm text-slate italic leading-relaxed">
          &ldquo;{record.note}&rdquo;
        </p>
      )}
    </div>
  );
}

