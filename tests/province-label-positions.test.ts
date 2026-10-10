import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { PROVINCE_LABEL_POSITIONS } from "../src/components/map/provinceLabelPositions";

type Point = [number, number];
type Polygon = Point[][];
interface ProvinceFeature {
  properties: { name: string };
  geometry: { type: "Polygon"; coordinates: Polygon } | { type: "MultiPolygon"; coordinates: Polygon[] };
}

function insidePolygon(point: Point, rings: Polygon): boolean {
  let inside = false;
  for (const ring of rings) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const a = ring[i];
      const b = ring[j];
      if ((a[1] > point[1]) !== (b[1] > point[1]) &&
          point[0] < (b[0] - a[0]) * (point[1] - a[1]) / (b[1] - a[1]) + a[0]) {
        inside = !inside;
      }
    }
  }
  return inside;
}

test("all 77 province labels are anchored inside their own geographic boundaries", () => {
  const boundaries: { features: ProvinceFeature[] } = JSON.parse(readFileSync("public/data/thailand.json", "utf8"));
  assert.equal(boundaries.features.length, 77);
  assert.equal(Object.keys(PROVINCE_LABEL_POSITIONS).length, 77);
  for (const feature of boundaries.features) {
    const anchor = PROVINCE_LABEL_POSITIONS[feature.properties.name];
    assert.ok(anchor, `Missing anchor for ${feature.properties.name}`);
    const point: Point = [anchor[1], anchor[0]];
    const polygons = feature.geometry.type === "Polygon" ? [feature.geometry.coordinates] : feature.geometry.coordinates;
    assert.ok(polygons.some((polygon) => insidePolygon(point, polygon)), `${feature.properties.name} label is outside its province`);
  }
});
