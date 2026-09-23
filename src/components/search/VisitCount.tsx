"use client";

import { useTravelRecords } from "@/lib/use-travel-records";

export function VisitCount({ placeId, userId }: { placeId: string; userId: string }) {
  const count = useTravelRecords(userId).filter((record) => record.placeId === placeId).length;

  return count > 0 ? <span className="mr-auto">เคยไปแล้ว {count} ครั้ง</span> : null;
}
