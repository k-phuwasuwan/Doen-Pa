import type { PlaceType } from "@/types";
import { CategoryCard } from "./CategoryCard";

const categories: { label: string; type: PlaceType | "all" }[] = [
  { label: "ทั้งหมด", type: "all" },
  { label: "ภูเขา", type: "mountain" },
  { label: "น้ำตก", type: "waterfall" },
  { label: "ถ้ำ", type: "cave" },
  { label: "หมู่เกาะ & ทะเล", type: "island" },
];

export function CategoryGrid({ currentType = "all", query = "", visited = "all" }: {
  currentType?: PlaceType | "all";
  query?: string;
  visited?: "all" | "visited" | "unvisited";
}) {
  return (
    <section aria-labelledby="category-title" className="py-8">
      <div className="mb-5 flex items-end justify-center text-center">
        <div className="min-w-0 max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">หมวดหมู่ระบบนิเวศ</p>
          <h2 id="category-title" className="text-2xl font-bold text-brand-800">เลือกประเภทสถานที่ตามสไตล์การเดินป่าของคุณ</h2>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
