interface ProgressRingProps {
  value: number;
  total: number;
  label: string;
}

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ProgressRing({ value, total, label }: ProgressRingProps) {
  const ratio = total > 0 ? Math.min(1, value / total) : 0;

  return (
    <div className="relative h-24 w-24 shrink-0 sm:h-28 sm:w-28" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={total} aria-label={label}>
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="currentColor" strokeWidth="10" className="text-brand-800/[0.08]" />
        <circle
          cx="60"
          cy="60"
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - ratio)}
          className={`text-brand-600 transition-[stroke-dashoffset] duration-700 ${ratio === 0 ? "opacity-0" : ""}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center" aria-hidden="true">
        <span className="font-num text-2xl font-semibold leading-none text-brand-800 sm:text-[1.75rem]">{value}</span>
        <span className="font-num mt-1 text-xs text-brand-800/55">จาก {total}</span>
      </div>
    </div>
  );
}
