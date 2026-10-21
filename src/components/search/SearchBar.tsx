"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { updateSearchFilter } from "./useSearchFilters";

export function SearchBar() {
  const searchParams = useSearchParams();
  const currentQuery = searchParams.get("q") || "";
  const [draft, setDraft] = useState({ value: currentQuery, urlQuery: currentQuery });
  // Back/Forward changes the URL; an old typing draft must not overwrite it.
  const query = draft.urlQuery === currentQuery ? draft.value : currentQuery;
  if (draft.urlQuery !== currentQuery) {
    setDraft({ value: currentQuery, urlQuery: currentQuery });
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateSearchFilter("q", query);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query !== currentQuery) updateSearchFilter("q", query);
    }, 300);

    return () => clearTimeout(timer);
  }, [currentQuery, query]);

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-brand-800/60" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setDraft({ value: e.target.value, urlQuery: currentQuery })}
        placeholder="ค้นหาชื่อสถานที่ จังหวัด..."
        className="block min-w-0 flex-1 rounded-xl border-0 bg-white/70 py-3 pl-11 pr-4 text-brand-800 placeholder-brand-800/50 backdrop-blur focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
      />
      <button type="submit" className="shimmer-glass flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-brand-600 px-4 font-semibold text-white shadow-glow-emerald transition-colors hover:bg-brand-700" aria-label="ค้นหา">
        <span className="whitespace-nowrap">ค้นหา</span>
      </button>
    </form>
  );
}
