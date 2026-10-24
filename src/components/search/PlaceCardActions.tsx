import { Stamp } from "lucide-react";
import Link from "next/link";

export function StampButton({ placeId }: { placeId: string }) {
  return (
    <Link
      href={`/records/new?placeId=${placeId}&returnTo=search`}
      prefetch={false}
      className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full bg-brand-600 px-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
    >
      <Stamp className="h-4 w-4" aria-hidden="true" />
      สแตมป์
    </Link>
  );
}
