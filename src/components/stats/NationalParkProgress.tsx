import { ProgressRing } from "./ProgressRing";

interface NationalParkProgressProps {
  visitedCount: number;
  totalCount: number;
}

export function NationalParkProgress({ visitedCount, totalCount }: NationalParkProgressProps) {
  const remaining = Math.max(0, totalCount - visitedCount);

  return (
    <section className="liquid-glass-card flex h-full items-center gap-5 p-5 sm:gap-6 sm:p-6" aria-labelledby="national-park-heading">
      <ProgressRing value={visitedCount} total={totalCount} label="จำนวนอุทยานแห่งชาติที่ไปเยือน" />
      <div className="min-w-0">
        <h2 id="national-park-heading" className="text-lg font-bold text-brand-800 sm:text-xl">
          {visitedCount}/{totalCount} อุทยานแห่งชาติ
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-brand-800/60">
          {totalCount === 0 ? "ยังไม่มีอุทยานแห่งชาติในรายการสถานที่" : `เหลืออีก ${remaining} อุทยานแห่งชาติที่คุณยังไม่ได้ไป`}
        </p>
      </div>
    </section>
  );
}
