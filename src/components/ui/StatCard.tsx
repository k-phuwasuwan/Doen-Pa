import React from "react";

interface StatCardProps {
  value: string | number;
  label: string;
  variant?: "yellow" | "white";
}

export function StatCard({ value, label, variant = "white" }: StatCardProps) {
  const isYellow = variant === "yellow";
  
  return (
    <div className={`card-glass p-4 flex flex-col items-center justify-center text-center ${
      isYellow ? "border-gold/30 bg-gold/5" : ""
    }`}>
      <div className={`text-2xl font-bold ${isYellow ? "text-gold" : "text-forest"}`}>
        {value}
      </div>
      <div className="text-sm text-slate mt-1">
        {label}
      </div>
    </div>
  );
}

