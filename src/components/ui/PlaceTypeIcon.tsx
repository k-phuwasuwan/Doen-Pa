import type { PlaceType } from "@/types";

/** Line glyphs drawn for the four catalog types so they share one stroke weight. */
const glyphs: Record<PlaceType, React.ReactNode> = {
  mountain: <><path d="M3 19 9.5 8l3.5 5.5L15.5 10 21 19Z" /><path d="m8 10.5 1.5 1.3 1.6-1.4" /></>,
  waterfall: <><path d="M4 5h16" /><path d="M7 5v9M12 5v12M17 5v8" /><path d="M4 19c1.5-1.2 3-1.2 4.5 0s3 1.2 4.5 0 3-1.2 4.5 0 2.5 1 2.5 0" /></>,
  cave: <><path d="M2.5 19.5c0-8 4.3-14 9.5-14s9.5 6 9.5 14" /><path d="M8 19.5c0-4.4 1.8-7.5 4-7.5s4 3.1 4 7.5" /><path d="M2.5 19.5h19" /></>,
  island: <><path d="M3 18c1.5-1 3-1 4.5 0s3 1 4.5 0 3-1 4.5 0 3 1 4.5 0" /><path d="M7 15c1.5-2.5 3.2-4 5-4s3.5 1.5 5 4" /><path d="M12 11V5.5M12 5.5c-1.5-1.5-3.6-1.4-5 0M12 5.5c1.4-1.5 3.5-1.6 5-.3" /></>,
};

export function PlaceTypeIcon({ type, className = "h-5 w-5" }: { type: PlaceType; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      {glyphs[type]}
    </svg>
  );
}
