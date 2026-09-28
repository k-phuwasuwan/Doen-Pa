"use client";

interface FilterChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export function FilterChip({ label, active = false, onClick }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex aspect-square w-full max-w-20 items-center justify-center rounded-full p-1 text-center text-[11px] font-semibold leading-tight transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 sm:h-24 sm:w-24 sm:max-w-none sm:p-2 sm:text-sm ${
        active
          ? "bg-brand-600 text-white ring-1 ring-inset ring-white/15"
          : "border border-white/80 bg-white/85 text-brand-800 shadow-glass backdrop-blur-[10px] hover:bg-white hover:shadow-glass-hover"
      }`}
    >
      <span className="min-w-0 break-words">{label}</span>
    </button>
  );
}
