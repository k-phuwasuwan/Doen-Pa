import { Suspense } from "react";
import { SearchBar } from "@/components/search/SearchBar";

export function SearchHero({ initialQuery = "" }: { initialQuery?: string }) {
  return (
    <section
      aria-labelledby="search-hero-title"
      className="relative mx-auto mt-16 h-80 w-[calc(100%-2rem)] max-w-[1440px] overflow-hidden rounded-3xl bg-beige-100 md:h-96"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-brand-950/90 via-brand-800/75 to-brand-600/60" aria-hidden="true" />
      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-5 px-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200">บันทึกการเดินทางของคุณ</p>
        <h1
          id="search-hero-title"
          className="text-3xl font-bold text-white md:text-5xl"
        >
          ค้นพบสถานที่ที่เคยอยู่ในความทรงจำ
        </h1>
        <p className="max-w-xl text-white/75">ค้นหาเส้นทาง ภูเขา น้ำตก และสถานที่ธรรมชาติ เพื่อเติมเต็มแพสพอร์ตของคุณ</p>
        <div className="w-full max-w-2xl rounded-2xl hero-glass-console p-2">
          <Suspense fallback={<div className="glass-input h-[48px] w-full bg-white/90 animate-pulse" />}>
            <SearchBar initialQuery={initialQuery} />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
