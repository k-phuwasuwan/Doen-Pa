import { Suspense } from "react";
import Image from "next/image";
import { SearchBar } from "@/components/search/SearchBar";

export function SearchHero({ initialQuery = "" }: { initialQuery?: string }) {
  return (
    <section
      aria-labelledby="search-hero-title"
      className="relative h-64 w-full overflow-hidden md:h-80"
    >
      <Image
        src="/nature.jpg"
        alt="ทิวทัศน์ธรรมชาติ"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
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
