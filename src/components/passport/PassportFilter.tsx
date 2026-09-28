"use client";

import { FilterChip } from "@/components/ui/FilterChip";
import type { PlaceType } from "@/types";

const filters: {
  label: string;
  type: PlaceType | "all";
}[] = [
  { label: "ทั้งหมด", type: "all" },
  { label: "ภูเขา", type: "mountain" },
  { label: "น้ำตก", type: "waterfall" },
  { label: "ถ้ำ", type: "cave" },
  { label: "หมู่เกาะ & ทะเล", type: "island" },
];

interface PassportFilterProps {
  currentType: PlaceType | "all";
  onChange: (type: PlaceType | "all") => void;
}

export function PassportFilter({ currentType, onChange }: PassportFilterProps) {
  return (
    <div className="w-full pb-3" role="group" aria-label="กรองประเภทสถานที่">
      <div className="grid w-full grid-cols-5 justify-items-center gap-1 sm:mx-auto sm:flex sm:w-max sm:max-w-full sm:justify-center sm:gap-8">
        {filters.map((filter) => (
          <FilterChip
            key={filter.type}
            label={filter.label}
            active={currentType === filter.type}
            onClick={() => onChange(filter.type)}
          />
        ))}
      </div>
    </div>
  );
}
