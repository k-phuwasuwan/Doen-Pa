import Link from "next/link";
import { Stamp } from "lucide-react";

interface PlaceActionsProps {
  placeId: string;
  visited: boolean;
}

export function PlaceActions({ placeId, visited }: PlaceActionsProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-lichen-soft p-2 pl-4 lg:flex-col lg:items-stretch lg:gap-3 lg:p-4">
      <p className="text-sm text-brand-800/80">{visited ? "กลับมาที่นี่อีกครั้ง?" : "เคยมาที่นี่แล้ว?"}</p>
      <Link
        href={`/records/new?placeId=${placeId}`}
        prefetch={false}
        className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 lg:min-h-12 text-sm font-semibold text-white shadow-glow-emerald transition-colors hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
      >
        <Stamp className="h-4 w-4" aria-hidden="true" />
        สแตมป์
      </Link>
    </div>
  );
}
