"use client";

import { useMemo } from "react";
import { readTravelRecords } from "@/domain/travel-record-read-model";
import { placeService } from "@/services/place.service";
import { useTravelRecords } from "./use-travel-records";

const catalog = placeService.getAll();

export function useTravelRecordReadModel(userId: string) {
  const records = useTravelRecords(userId);
  return useMemo(() => readTravelRecords(userId, records, catalog), [userId, records]);
}
