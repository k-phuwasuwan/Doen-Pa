import assert from "node:assert/strict";
import { test } from "node:test";
import { createPlaceCatalog } from "../src/domain/place-catalog";
import { readReviewedCatalog } from "./helpers/place-catalog";
import { archivedPlaces } from "../src/data/archived-places";
import type { PlaceType } from "../src/types";

const places = readReviewedCatalog();

test("indexed search preserves catalog order, field matching and category filtering", () => {
  const catalog = createPlaceCatalog(places, archivedPlaces);
  const queries = ["", "   ", "เชียงใหม่", "อำเภอ", "north", " NORTH ", "ป่า", "อุทยานแห่งชาติ", "ไม่พบสถานที่นี้"];
  const types: Array<PlaceType | "all"> = ["all", "mountain", "waterfall", "cave", "island"];
  for (const query of queries) {
    for (const type of types) {
      const normalized = query.trim().toLowerCase();
      const expected = places.filter((place) => (type === "all" || place.type === type) &&
        [place.name, place.location, place.province, place.region, place.description].join(" ").toLowerCase().includes(normalized));
      const matches = catalog.search(query, type);
      assert.deepEqual(matches, expected, `${query} / ${type}`);
      assert.ok(matches.every((place, index) => place === expected[index]), "search returns the original place objects");
    }
  }
});

test("a new catalog snapshot refreshes searchable text without changing the previous snapshot", () => {
  const original = createPlaceCatalog([places[0]]);
  const updatedPlace = { ...places[0], description: "Updated searchable memory" };
  const updated = createPlaceCatalog([updatedPlace]);
  assert.deepEqual(original.search("Updated searchable memory"), []);
  assert.deepEqual(updated.search("UPDATED SEARCHABLE MEMORY"), [updatedPlace]);
  assert.deepEqual(updated.search(""), [updatedPlace]);
});
