"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function StampButton({ placeId }: { placeId: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        router.push(`/records/new?placeId=${placeId}&returnTo=search`);
      }}
      className="ml-0 inline-flex shrink-0 items-center gap-1 rounded-xl bg-brand-600 px-3 py-2 font-semibold text-white transition-colors hover:bg-brand-700"
    >
      <Plus className="h-3.5 w-3.5" />
      สแตมป์
    </button>
  );
}
