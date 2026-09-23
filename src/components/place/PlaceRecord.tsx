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
    <article className="liquid-glass-card rounded-2xl p-4 sm:p-5 relative overflow-hidden mb-5">
      {/* Ambient glow */}
      <div className="absolute -right-12 -top-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Status row */}
      <div className="relative z-10 flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-600" />
          </span>
          <span className="font-semibold text-brand-700 text-sm sm:text-base">
            คุณเคยไปที่นี่แล้ว
          </span>
        </div>

        {/* Date pill */}
        <div className="liquid-glass inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs sm:text-sm text-brand-800/65 font-medium">
          <CalendarDays className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          {formatThaiDate(record.visitedAt)}
        </div>
      </div>

      {/* Star rating — personal only, never aggregated */}
      {record.rating > 0 && (
        <div
          className="relative z-10 flex items-center gap-1 mb-2.5"
          aria-label={`คะแนนส่วนตัว ${record.rating} จาก 5 ดาว`}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 drop-shadow-sm ${
                i < record.rating ? "fill-amber-400 text-amber-400" : "fill-beige-100 text-beige-100"
              }`}
            />
          ))}
        </div>
      )}

      {/* Note quote */}
      {record.note && (
        <p className="relative z-10 text-xs sm:text-sm italic text-brand-700/80 leading-relaxed pl-3 border-l-2 border-emerald-500/50">
          &ldquo;{record.note}&rdquo;
        </p>
      )}
    </article>
  );
}
