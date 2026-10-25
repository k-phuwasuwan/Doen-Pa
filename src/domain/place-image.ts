import type { PlaceImage } from "../types";

export const PLACE_IMAGE_WIDTHS = [640, 1280] as const;
export type PlaceImageWidth = (typeof PLACE_IMAGE_WIDTHS)[number];

/** Park photos are static files in public/images/parks, pre-resized to each width. */
export function placeImageUrl(image: PlaceImage, width: PlaceImageWidth): string {
  return `/images/parks/${width}/${image.path}`;
}

export function placeImageCredit(image: PlaceImage): string {
  return `ภาพ: ${image.author} · ${image.license}`;
}
