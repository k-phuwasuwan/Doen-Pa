"use client";

import Link from "next/link";
import { PassportHeader } from "@/components/passport/PassportHeader";
import { TravelRecordCard } from "@/components/passport/TravelRecordCard";
import { InkStamp } from "@/components/ui/InkStamp";
import { useTravelRecordReadModel } from "@/lib/use-travel-record-read-model";
import { useCurrentUser } from "@/lib/use-current-user";
import { formatStampDate } from "@/lib/utils";

type Entry = ReturnType<typeof useTravelRecordReadModel>["entries"][number];

/** Groups consecutive entries by Buddhist-era year, keeping the read model's order. */
function groupByYear(entries: readonly Entry[]): { year: string; entries: Entry[] }[] {
  const groups: { year: string; entries: Entry[] }[] = [];
  for (const entry of entries) {
    const year = formatStampDate(entry.record.visitedAt).year;
    const last = groups.at(-1);
    if (last?.year === year) last.entries.push(entry);
    else groups.push({ year, entries: [entry] });
  }
  return groups;
}

export function PassportContent() {
  const user = useCurrentUser();
  const { entries, counts } = useTravelRecordReadModel(user.id);
  const { places: placeCount, provinces: provinceCount, photos: photoCount } = counts;

  return (
    <div className="page-shell">
      <PassportHeader
        user={user}
        placeCount={placeCount}
        provinceCount={provinceCount}
        photoCount={photoCount}
      />

      <section className="mt-8 sm:mt-10" aria-labelledby="records-heading">
        <div className="flex items-baseline justify-between gap-4 px-1">
          <h2 id="records-heading" className="text-lg font-bold text-brand-800 sm:text-xl">หน้าตราประทับ</h2>
          <span className="font-num shrink-0 text-sm text-brand-800/60">{entries.length} บันทึก</span>
        </div>
      </section>

      {entries.length > 0 ? (
        <div className="mt-4 space-y-8" aria-label="รายการบันทึกการเดินทาง">
          {groupByYear(entries).map((group) => (
            <section key={group.year} aria-label={`ปี ${group.year}`}>
              <div className="mb-3 flex items-center gap-3">
                <span className="font-num text-sm font-semibold text-brand-600">{group.year}</span>
                <span className="h-px flex-1 border-t border-dashed border-brand-800/20" aria-hidden="true" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
                {group.entries.map(({ record, place }) => (
                  <TravelRecordCard key={record.id} record={record} place={place} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <section className="mt-4 flex min-h-64 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-brand-800/15 bg-white/30 px-6 py-10 text-center">
          <InkStamp top="ตราแรกของคุณ" bottom="DOEN PA ★ THAILAND" center="ว่าง" seed="empty" className="h-24 w-24 opacity-40" />
          <h3 className="mt-4 text-lg font-bold text-brand-800">พาสปอร์ตของคุณยังว่างเปล่า</h3>
          <p className="mt-2 max-w-md text-sm text-brand-800/65">
            เริ่มต้นด้วยการเพิ่มสถานที่ที่คุณเคยไป
          </p>
          <Link href="/search" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-brand-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600">
            สำรวจสถานที่
          </Link>
        </section>
      )}
    </div>
  );
}
