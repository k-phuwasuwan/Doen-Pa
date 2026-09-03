"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { FilterChip } from "@/components/ui/FilterChip";
import { Mountain, Droplets, Map, Umbrella, Compass } from "lucide-react";
import type { PlaceType } from "@/types";

const filters: { label: string; type: PlaceType | "all"; icon: React.ReactNode }[] = [
  { label: "ทั้งหมด", type: "all", icon: <Compass className="w-6 h-6" /> },
  { label: "ภูเขา", type: "mountain", icon: <Mountain className="w-6 h-6" /> },
  { label: "น้ำตก", type: "waterfall", icon: <Droplets className="w-6 h-6" /> },
  { label: "ถ้ำ", type: "cave", icon: <Map className="w-6 h-6" /> },
  { label: "หมู่เกาะและทะเล", type: "island", icon: <Umbrella className="w-6 h-6" /> },
];

export function FilterSection({ currentType = "all" }: { currentType?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSelect = (type: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (type !== "all") {
      params.set("type", type);
    } else {
      params.delete("type");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
      {filters.map((filter) => (
        <FilterChip
          key={filter.type}
          icon={filter.icon}
          label={filter.label}
          active={currentType === filter.type}
          onClick={() => handleSelect(filter.type)}
        />
      ))}
    </div>
  );
}
