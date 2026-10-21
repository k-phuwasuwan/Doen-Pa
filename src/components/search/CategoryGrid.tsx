"use client";

import type { PlaceType } from "@/types";
import { CategoryCard } from "./CategoryCard";
import { useSearchFilters } from "./useSearchFilters";

const categories: { label: string; type: PlaceType | "all" }[] = [
  { label: "ทั้งหมด", type: "all" },
  { label: "ภูเขา", type: "mountain" },
  { label: "น้ำตก", type: "waterfall" },
  { label: "ถ้ำ", type: "cave" },
  { label: "หมู่เกาะ & ทะเล", type: "island" },
];

export function CategoryGrid() {
  const { type: currentType, query, visited } = useSearchFilters();
  return (
    <section aria-labelledby="category-title" className="py-8">
      <div className="mb-5 flex items-end justify-center text-center">
        <div className="min-w-0 max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">หมวดหมู่ระบบนิเวศ</p>
          <h2 id="category-title" className="text-2xl font-bold text-brand-800">เลือกประเภทสถานที่ตามสไตล์การเดินป่าของคุณ</h2>
        </div>
      </div>
      <div className="-mx-1 -my-2 flex gap-3 overflow-x-auto overscroll-x-contain px-1 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-auto md:grid md:max-w-[1100px] md:grid-cols-2 md:overflow-visible lg:grid-cols-5">
        {categories.map((category) => (
          <CategoryCard
            key={category.type}
            {...category}
            active={currentType === category.type}
            query={query}
            visited={visited}
          />
        ))}
      </div>
    </section>
  );
}
