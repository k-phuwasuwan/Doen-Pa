"use client";

import { Bookmark, Plus } from "lucide-react";

export function BookmarkButton() {
  return (
    <button
      type="button"
      onClick={(event) => event.preventDefault()}
      className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-brand-800 backdrop-blur transition-colors hover:bg-white"
      aria-label="บันทึกสถานที่"
    >
      <Bookmark className="h-4 w-4" />
    </button>
  );
}

export function StampButton() {
  return (
    <button
      type="button"
      onClick={(event) => event.preventDefault()}
      className="ml-0 inline-flex shrink-0 items-center gap-1 rounded-xl bg-brand-600 px-3 py-2 font-semibold text-white transition-colors hover:bg-brand-700"
    >
      <Plus className="h-3.5 w-3.5" />
      สแตมป์
    </button>
  );
}
