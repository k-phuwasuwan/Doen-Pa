import assert from "node:assert/strict";
import { test } from "node:test";
import { readReviewedCatalog } from "./helpers/place-catalog";
import { archivedPlaces } from "../src/data/archived-places";
import { resolvePlaceId } from "../src/data/place-identities";
import { displayPlaceValue } from "../src/domain/place-display";
import { readTravelRecords } from "../src/domain/travel-record-read-model";

const places = readReviewedCatalog();

test("real catalog has 156 unique parks and preserves missing measurements", () => {
  assert.equal(places.length, 156);
  assert.equal(new Set(places.map((p) => p.id)).size, 156);
  assert.equal(new Set(places.map((p) => p.name)).size, 156);
  assert.ok(places.every((p) => p.isNationalPark && p.name.startsWith("อุทยานแห่งชาติ")));
  assert.ok(places.every((p) => p.province === p.province.trim()));
  assert.ok(places.every((p) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude)));
  assert.equal(places.filter((p) => p.altitude !== undefined).length, 111);
  assert.equal(places.filter((p) => p.distance !== undefined).length, 58);
  assert.equal(places.filter((p) => p.description === "").length, 13);
  assert.ok(places.every((p) => p.distance === undefined || /^\d+(?:\.\d+)? กม\.$/.test(p.distance)));
  assert.ok(places.every((p) => p.altitude !== "-" && p.distance !== "-"));
});

test("new park catalog drives every national park and region denominator", () => {
  const stats = readTravelRecords("local-user", [], places, archivedPlaces).getStats();
  assert.equal(stats.totalNationalParks, 156);
  assert.equal(stats.visitedNationalParks, 0);
  assert.equal(Object.values(stats.byRegion).reduce((n, r) => n + r.totalNationalParks, 0), 156);
  assert.equal(Object.values(stats.totalByType).reduce((n, total) => n + total, 0), 156);
  const khaoYai = places.find((p) => p.id === "place-khao-yai");
  assert.equal(khaoYai?.province, "นครราชสีมา");
  assert.equal(khaoYai?.region, "northeast");
  assert.equal(places.find((p) => p.id === "place-phu-wieng")?.province, "ขอนแก่น");
});

test("saved IDs resolve to real catalog entries; removed Chiang Dao stays history only", () => {
  for (const id of ["place-doi-inthanon", "place-khao-yai", "place-khao-sok", "place-phi-phi", "place-phu-kradueng", "place-phu-reua", "place-phu-wieng", "place-tat-ton", "place-khao-sam-rok", "place-khao-sam-roi-yod"]) {
    assert.ok(places.some((p) => p.id === resolvePlaceId(id)), id);
  }
  assert.equal(resolvePlaceId("unknown-place"), "unknown-place");
  assert.ok(!places.some((p) => p.id === "place-doi-chiang-dao"));
  assert.equal(archivedPlaces.find((p) => p.id === "place-doi-chiang-dao")?.isNationalPark, false);
});

test("place placeholders distinguish missing values from real zero measurements", () => {
  assert.equal(displayPlaceValue(undefined), "-");
  assert.equal(displayPlaceValue(""), "-");
  assert.equal(displayPlaceValue(" \n "), "-");
  assert.equal(displayPlaceValue("0 m"), "0 m");
  assert.equal(displayPlaceValue("0 กม."), "0 กม.");
});
