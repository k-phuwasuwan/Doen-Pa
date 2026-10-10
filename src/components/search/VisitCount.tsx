"use client";

import { useTravelRecordReadModel } from "@/lib/use-travel-record-read-model";

export function VisitCount({ placeId, userId }: { placeId: string; userId: string }) {
  const count = useTravelRecordReadModel(userId).getVisitCount(placeId);

  return count > 0 ? <span className="mr-auto">เคยไปแล้ว {count} ครั้ง</span> : null;
}
