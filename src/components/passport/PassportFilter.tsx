"use client";

import { Compass, Droplets, Map, Mountain, Umbrella } from "lucide-react";
import { FilterChip } from "@/components/ui/FilterChip";
import type { PlaceType } from "@/types";

const filters: {
  label: string;
  type: PlaceType | "all";
  icon: React.ReactNode;
}[] = [
  { label: "ทั้งหมด", type: "all", icon: <Compass className="h-6 w-6" /> },
  { label: "ภูเขา", type: "mountain", icon: <Mountain className="h-6 w-6" /> },
  { label: "น้ำตก", type: "waterfall", icon: <Droplets className="h-6 w-6" /> },
  { label: "ถ้ำ", type: "cave", icon: <Map className="h-6 w-6" /> },
  { label: "หมู่เกาะและทะเล", type: "island", icon: <Umbrella className="h-6 w-6" /> },
];

interface PassportFilterProps {
  currentType: PlaceType | "all";
  onChange: (type: PlaceType | "all") => void;
}

export function PassportFilter({ currentType, onChange }: PassportFilterProps) {
  return (
    <div className="w-full pb-3" role="group" aria-label="กรองประเภทสถานที่">
      <div className="grid w-full grid-cols-5 items-start gap-1 sm:mx-auto sm:flex sm:w-max sm:max-w-full sm:justify-center sm:gap-8">
        {filters.map((filter) => (
          <FilterChip
            key={filter.type}
            icon={filter.icon}
            label={filter.label}
            active={currentType === filter.type}
            onClick={() => onChange(filter.type)}
          />
        ))}
      </div>
    </div>
  );
}
