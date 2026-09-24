import L from "leaflet";
import type { Place } from "@/types";

export interface ProvinceLabel {
  name: string;
  position: L.LatLng;
  area: number;
  marker: L.Marker;
  width: number;
}

const LABEL_HEIGHT = 20;
const LABEL_MIN_WIDTH = 44;
const LABEL_MAX_WIDTH = 120;
const LABEL_CHARACTER_WIDTH = 7;
const LABEL_GAP = 4;
const PIN_HALF_WIDTH = 22;
const PIN_HEIGHT = 42;
const DEFAULT_LABEL_OFFSETS = [[0, 0]] as const;
const VISITED_LABEL_OFFSETS = [[0, 0], [0, 32]] as const;

interface LabelRect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

function overlaps(first: LabelRect, second: LabelRect): boolean {
  return first.left < second.right && first.right > second.left && first.top < second.bottom && first.bottom > second.top;
}

export function provinceLabelWidth(name: string): number {
  return Math.min(LABEL_MAX_WIDTH, Math.max(LABEL_MIN_WIDTH, name.length * LABEL_CHARACTER_WIDTH));
}

export function updateProvinceLabels(map: L.Map, labels: ProvinceLabel[], places: Place[]): void {
  const viewport = map.getSize();
  const occupied: LabelRect[] = [];
  const visitedProvinces = new Set(places.map((place) => place.province));
  const pins = places.flatMap((place): LabelRect[] => {
    if (place.latitude === undefined || place.longitude === undefined) return [];
    const point = map.latLngToContainerPoint([place.latitude, place.longitude]);
    return [{
      left: point.x - PIN_HALF_WIDTH - LABEL_GAP,
      right: point.x + PIN_HALF_WIDTH + LABEL_GAP,
      top: point.y - PIN_HEIGHT - LABEL_GAP,
      bottom: point.y + LABEL_GAP,
    }];
  });
  const sortedLabels = [...labels].sort((a, b) =>
    Number(visitedProvinces.has(b.name)) - Number(visitedProvinces.has(a.name)) || b.area - a.area,
  );

  for (const label of sortedLabels) {
    const point = map.latLngToContainerPoint(label.position);
    let placement: { center: L.Point; rect: LabelRect } | null = null;
    const offsets = visitedProvinces.has(label.name) ? VISITED_LABEL_OFFSETS : DEFAULT_LABEL_OFFSETS;
    for (const [offsetX, offsetY] of offsets) {
      const center = point.add([offsetX, offsetY]);
      const rect = {
        left: center.x - label.width / 2 - LABEL_GAP,
        right: center.x + label.width / 2 + LABEL_GAP,
        top: center.y - LABEL_HEIGHT / 2 - LABEL_GAP,
        bottom: center.y + LABEL_HEIGHT / 2 + LABEL_GAP,
      };
      const inView = rect.right > 0 && rect.left < viewport.x && rect.bottom > 0 && rect.top < viewport.y;
      if (inView && !pins.some((pin) => overlaps(rect, pin)) && !occupied.some((other) => overlaps(rect, other))) {
        placement = { center, rect };
        break;
      }
    }
    const element = label.marker.getElement();
    if (element) element.style.visibility = placement ? "visible" : "hidden";
    if (placement) {
      label.marker.setLatLng(map.containerPointToLatLng(placement.center));
      occupied.push(placement.rect);
    }
  }
}
