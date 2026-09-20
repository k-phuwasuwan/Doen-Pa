"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function VisitedFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("visited") ?? "all";

  const select = (value: "all" | "visited" | "unvisited") => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete("visited");
    else params.set("visited", value);
    router.push(`${pathname}${params.size ? `?${params.toString()}` : ""}`, { scroll: false });
  };

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="กรองตามประวัติการเดินทาง">
      {(["visited", "unvisited"] as const).map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => select(current === value ? "all" : value)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            current === value
              ? "bg-brand-600 text-white shadow-glow"
              : "bg-transparent text-brand-800/70 hover:bg-brand-100/50"
          }`}
        >
          {value === "visited" ? "เคยไปแล้ว" : "ยังไม่เคยไป"}
        </button>
      )
      )}
    </div>
  );
}
