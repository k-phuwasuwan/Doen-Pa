import React from "react";

interface StatCardProps {
  value: string | number;
  label: string;
  variant?: "yellow" | "white";
}

export function StatCard({ value, label, variant = "white" }: StatCardProps) {
  const isYellow = variant === "yellow";
  
  return (
    <div className={`liquid-glass-card p-4 flex flex-col items-center justify-center text-center ${
      isYellow ? "border-amber-400/30 bg-amber-400/5" : ""
    }`}>
      <div className={`text-2xl font-bold ${isYellow ? "text-amber-400" : "text-brand-800"}`}>
        {value}
      </div>
      <div className="text-sm text-brand-800/65 mt-1">
        {label}
      </div>
    </div>
  );
}
