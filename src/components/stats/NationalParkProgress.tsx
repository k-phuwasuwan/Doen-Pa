interface NationalParkProgressProps {
  visitedCount: number;
  totalCount: number;
}

export function NationalParkProgress({ visitedCount, totalCount }: NationalParkProgressProps) {
  const progress = totalCount > 0 ? Math.round((visitedCount / totalCount) * 100) : 0;
  const remaining = Math.max(0, totalCount - visitedCount);

  return (
    <section className="liquid-glass-card p-6" aria-labelledby="national-park-heading">
      <div>
        <p className="text-sm font-medium text-brand-800/65">การเดินทางในอุทยานแห่งชาติ</p>
        <h2 id="national-park-heading" className="mt-1 text-2xl font-bold text-brand-800">
          {visitedCount}/{totalCount} อุทยานแห่งชาติ
        </h2>
      </div>
      <div className="mt-5 h-3 overflow-hidden rounded-full bg-beige-100/40" role="progressbar" aria-valuenow={visitedCount} aria-valuemin={0} aria-valuemax={totalCount} aria-label="จำนวนอุทยานแห่งชาติที่ไปเยือน">
        <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-3 text-sm text-brand-800/65">
        {totalCount === 0 ? "ยังไม่มีอุทยานแห่งชาติในรายการสถานที่" : `เหลืออีก ${remaining} อุทยานแห่งชาติที่คุณยังไม่ได้ไป`}
      </p>
    </section>
  );
}
