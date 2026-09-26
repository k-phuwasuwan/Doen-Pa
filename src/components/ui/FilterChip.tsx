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
      className="group flex min-h-11 min-w-0 flex-col items-center justify-start gap-2 rounded-2xl px-0.5 text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 sm:min-w-11 sm:gap-2.5 sm:px-1"
    >
      <div 
        className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-200 sm:h-16 sm:w-16 ${
          active 
            ? "bg-brand-600 text-white ring-1 ring-inset ring-white/15"
            : "border border-white/80 bg-white/85 text-brand-800 shadow-glass backdrop-blur-[10px] group-hover:bg-white group-hover:shadow-glass-hover"
        }`}
      >
        {icon}
      </div>
      <span className={`max-w-full text-[10px] leading-tight sm:whitespace-nowrap sm:text-sm ${
        active ? "text-brand-800 font-semibold" : "text-brand-800/65"
      }`}>
        {label}
      </span>
    </button>
  );
}
