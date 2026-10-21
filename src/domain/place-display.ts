import type { PlaceType, Region } from "../types";

export const PLACE_TYPE_LABELS: Record<PlaceType, string> = {
  mountain: "ภูเขา",
  waterfall: "น้ำตก",
  cave: "ถ้ำ",
  island: "หมู่เกาะ & ทะเล",
};

export const REGION_LABELS: Record<Region, string> = {
  north: "ภาคเหนือ",
  central: "ภาคกลาง",
  south: "ภาคใต้",
  northeast: "ภาคตะวันออกเฉียงเหนือ",
  east: "ภาคตะวันออก",
  west: "ภาคตะวันตก",
};

/** Placeholders belong to the view, never to measurements or searchable data. */
export function displayPlaceValue(value: string | undefined): string {
  return value?.trim() || "-";
}
