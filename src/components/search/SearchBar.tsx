"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowRight, Search } from "lucide-react";

export function SearchBar({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);

  // Sync state if URL changes externally
  const currentQuery = searchParams.get("q") || "";

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query) params.set("q", query);
    else params.delete("q");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query !== currentQuery && (query || searchParams.has("q"))) {
        if (query) {
          params.set("q", query);
        } else {
          params.delete("q");
        }
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [currentQuery, query, pathname, router, searchParams]);

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-brand-800/60" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="ค้นหาชื่อสถานที่ จังหวัด หรือภูมิภาค..."
        className="block w-full rounded-xl border-0 bg-white/70 py-3 pl-11 pr-4 text-brand-800 placeholder-brand-800/50 backdrop-blur focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
      />
      <button type="submit" className="shimmer-glass flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-brand-600 px-4 font-semibold text-white shadow-glow-emerald transition-colors hover:bg-brand-700" aria-label="ค้นหา">
        <span className="hidden sm:inline">ค้นหา</span>
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}
