interface StatCardProps {
  value: string | number;
  label: string;
}

export function StatCard({ value, label }: StatCardProps) {
  return (
    <div className="liquid-glass-card p-4 flex flex-col items-center justify-center text-center">
      <div className="text-2xl font-bold text-brand-800">{value}</div>
      <div className="text-sm text-brand-800/65 mt-1">{label}</div>
    </div>
  );
}
