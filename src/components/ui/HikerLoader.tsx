import Image from "next/image";

interface HikerLoaderProps {
  label?: string;
  compact?: boolean;
}

export function HikerLoader({ label = "กำลังเตรียมเส้นทาง…", compact = false }: HikerLoaderProps) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center gap-4 text-center">
      <div className={`liquid-glass-card flex items-center justify-center rounded-3xl ${compact ? "h-24 w-24" : "h-36 w-36"}`}>
        <Image
          src="/hiker-loading.svg"
          alt=""
          width={compact ? 72 : 112}
          height={compact ? 72 : 112}
          unoptimized
          priority
        />
      </div>
      <p className="text-sm font-medium text-brand-800/75">{label}</p>
    </div>
  );
}
