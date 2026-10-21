import { Plus } from "lucide-react";
import Link from "next/link";

export function StampButton({ placeId }: { placeId: string }) {
  return (
    <Link
      href={`/records/new?placeId=${placeId}&returnTo=search`}
      prefetch={false}
      className="ml-0 inline-flex min-h-11 min-w-11 shrink-0 items-center gap-1 rounded-xl bg-brand-600 px-3 py-2 font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
    >
      <Plus className="h-3.5 w-3.5" />
      สแตมป์
    </Link>
  );
}
