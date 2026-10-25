import { Suspense } from "react";
import Image from "next/image";
import { SearchBar } from "@/components/search/SearchBar";
import { InkStamp } from "@/components/ui/InkStamp";

export function SearchHero() {
  return (
    <section
      aria-labelledby="search-hero-title"
      className="relative overflow-hidden rounded-[1.75rem] border border-white/85 bg-[#e6eee6] shadow-glass-card"
    >
      <Image
        src="/images/search-hero-forest.jpg"
        alt=""
        fill
        priority
        sizes="(max-width: 1152px) 100vw, 1152px"
        className="object-cover object-[90%_bottom] md:object-bottom"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#edf1ec]/95 via-[#edf1ec]/50 to-transparent" aria-hidden="true" />
      <InkStamp
        top="พาสปอร์ตนักเดินป่า"
        bottom="DOEN PA ★ THAILAND"
        center="77"
        sub="จังหวัด"
        seed="hero"
        className="absolute right-8 top-6 hidden h-32 w-32 md:block lg:right-14 lg:h-40 lg:w-40"
      />
      <div className="relative z-10 px-5 py-7 sm:px-8 sm:py-9 lg:px-12 lg:py-11">
        <h1 id="search-hero-title" className="text-[1.875rem] font-bold leading-tight tracking-tight text-brand-900 sm:text-4xl lg:text-[2.75rem]">
          ไปไหนมาแล้วบ้าง?
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-brand-800/75 sm:text-base">
          ค้นหาภูเขา น้ำตก ถ้ำ และทะเลที่คุณเคยไป แล้วประทับตราเก็บไว้ใน<span className="whitespace-nowrap">พาสปอร์ต</span>
        </p>
        <div className="hero-glass-console mt-5 w-full max-w-lg rounded-2xl p-1.5 sm:mt-6">
          <Suspense fallback={<div className="glass-input h-12 w-full animate-pulse bg-white/90" />}>
            <SearchBar />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
