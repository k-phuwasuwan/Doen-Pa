"use client";

import React from "react";

interface FilterChipProps {
  icon?: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export function FilterChip({ icon, label, active = false, onClick }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="group flex min-h-11 min-w-11 flex-col items-center justify-center gap-2.5 rounded-2xl px-1 text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
    >
      <div 
        className={`flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300 sm:h-16 sm:w-16 ${
          active 
            ? "bg-brand-600 text-white shadow-glow-emerald"
            : "border border-white/80 bg-white/85 text-brand-800 shadow-glass backdrop-blur-[10px] group-hover:bg-white group-hover:shadow-glass-hover"
        }`}
      >
        {icon}
      </div>
      <span className={`whitespace-nowrap text-xs sm:text-sm ${
        active ? "text-brand-800 font-semibold" : "text-brand-800/65"
      }`}>
        {label}
      </span>
    </button>
  );
}
