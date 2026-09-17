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
      onClick={onClick}
      className="group flex min-h-11 min-w-11 flex-col items-center justify-center gap-2"
    >
      <div 
        className={`h-12 w-12 rounded-full flex items-center justify-center transition-all duration-300 ${
          active 
            ? "bg-forest text-white shadow-glow" 
            : "bg-white/80 backdrop-blur-[10px] border border-white/50 text-forest shadow-sm group-hover:shadow-md"
        }`}
      >
        {icon}
      </div>
      <span className={`text-xs whitespace-nowrap ${
        active ? "text-forest font-semibold" : "text-slate"
      }`}>
        {label}
      </span>
    </button>
  );
}

