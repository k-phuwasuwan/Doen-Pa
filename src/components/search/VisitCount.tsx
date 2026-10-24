"use client";

import { useTravelRecordReadModel } from "@/lib/use-travel-record-read-model";
import { InkStamp } from "@/components/ui/InkStamp";

export function VisitCount({ placeId, userId }: { placeId: string; userId: string }) {
  const count = useTravelRecordReadModel(userId).getVisitCount(placeId);
  if (count === 0) return null;

  return <span className="mt-2 inline-flex w-fit items-center rounded-full bg-lichen-soft px-2.5 py-0.5 text-xs font-semibold text-brand-800">เคยไปแล้ว {count} ครั้ง</span>;
}

/** Ink stamp pressed on the photo frame of places the user has visited. */
export function VisitStamp({ placeId, userId, province }: { placeId: string; userId: string; province: string }) {
  const count = useTravelRecordReadModel(userId).getVisitCount(placeId);
  if (count === 0) return null;

  return <InkStamp top="เคยไปแล้ว" bottom={province || "DOEN PA"} center={`×${count}`} seed={placeId} className="absolute bottom-1 right-1 h-14 w-14 sm:bottom-auto sm:right-3 sm:top-3 sm:h-20 sm:w-20" />;
}
