import { Suspense } from "react";
import Image from "next/image";
import { SearchBar } from "@/components/search/SearchBar";

export function SearchHero({ initialQuery = "" }: { initialQuery?: string }) {
  return (
    <section
      aria-labelledby="search-hero-title"
      className="relative mx-auto mt-16 h-80 w-[calc(100%-2rem)] max-w-[1440px] overflow-hidden rounded-3xl border border-white/85 bg-[#f3f7f1] shadow-glass-card md:h-96"
    >
      <Image
        src="/images/search-hero-forest.jpg"
        alt=""
        fill
        priority
        sizes="(max-width: 767px) calc(100vw - 2rem), (max-width: 1440px) 100vw, 1440px"
        className="object-cover object-[12%_bottom] md:object-bottom"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-white/15" aria-hidden="true" />
      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-5 px-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">บันทึกการเดินทางของคุณ</p>
        <h1
          id="search-hero-title"
          className="text-3xl font-bold text-brand-900 md:text-5xl"
        >
          ค้นพบสถานที่ที่เคยอยู่ในความทรงจำ
        </h1>
        <p className="max-w-xl text-brand-800/75">ค้นหาเส้นทาง ภูเขา น้ำตก และสถานที่ธรรมชาติ เพื่อเติมเต็มแพสพอร์ตของคุณ</p>
        <div className="w-full max-w-2xl rounded-2xl hero-glass-console p-2">
          <Suspense fallback={<div className="glass-input h-[48px] w-full bg-white/90 animate-pulse" />}>
            <SearchBar initialQuery={initialQuery} />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
