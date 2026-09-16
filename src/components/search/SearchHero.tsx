import { Suspense } from "react";
import { SearchBar } from "@/components/search/SearchBar";

export function SearchHero({ initialQuery = "" }: { initialQuery?: string }) {
  return (
    <section
      aria-labelledby="search-hero-title"
      className="relative h-64 w-full overflow-hidden md:h-80"
    >
      {/* TODO: replace with next/image (fill + object-cover) เมื่อมีรูปจริง */}
      <div className="absolute inset-0 bg-gradient-to-br from-forest to-slate" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-forest/70 via-forest/40 to-forest/60" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-4 px-4">
        <h1
          id="search-hero-title"
          className="text-center text-3xl font-bold text-white md:text-4xl"
        >
          ค้นหาอุทยานแห่งชาติ
        </h1>
        <div className="w-full max-w-xl">
          <Suspense fallback={<div className="glass-input h-[48px] w-full bg-white/90 animate-pulse" />}>
            <SearchBar initialQuery={initialQuery} />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
