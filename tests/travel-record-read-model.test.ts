import assert from "node:assert/strict";
import { test } from "node:test";
import { readTravelRecords, createTravelRecordReader } from "../src/domain/travel-record-read-model";
import type { Place, TravelRecord } from "../src/types";

const catalog: Place[] = [
  { id: "mountain", name: "Mountain", location: "North", province: "เชียงใหม่", region: "north", description: "", type: "mountain", isNationalPark: true, latitude: 18, longitude: 99 },
  { id: "waterfall", name: "Waterfall", location: "North", province: "เชียงใหม่", region: "north", description: "", type: "waterfall", isNationalPark: true },
  { id: "cave", name: "Cave", location: "South", province: "กระบี่", region: "south", description: "", type: "cave", latitude: 8, longitude: 98 },
];
function record(id: string, changes: Partial<TravelRecord> = {}): TravelRecord {
  return { id, userId: "local-user", placeId: "mountain", visitedAt: new Date("2026-01-01T12:00:00Z"), createdAt: new Date("2026-01-02T12:00:00Z"), note: "", rating: 0, photos: [], ...changes };
}

test("empty passport keeps catalog progress without personal data", () => {
  const memories = readTravelRecords("local-user", [], catalog);
  assert.deepEqual(memories.counts, { records: 0, places: 0, provinces: 0, photos: 0 });
  assert.deepEqual(memories.photos, []);
  assert.deepEqual(memories.mapPlaces, []);
  assert.deepEqual(memories.getPlaceMemory("mountain"), { records: [], photos: [], mapPhoto: undefined });
  assert.equal(memories.getVisitCount("missing"), 0);
  const stats = memories.getStats();
  assert.equal(stats.totalNationalParks, 2);
  assert.equal(stats.visitedNationalParks, 0);
  assert.equal(stats.totalByType.waterfall, 1);
});

test("revisits count as records but unique places and provinces; all photos survive", () => {
  const memories = readTravelRecords("local-user", [
    record("first", { photos: ["a", "b", "c", "d", "e"] }),
    record("second", { photos: ["f", "g"] }),
    record("waterfall", { placeId: "waterfall" }),
    record("cave", { placeId: "cave" }),
    record("orphan", { placeId: "missing", photos: ["hidden"] }),
    record("other-user", { userId: "other", photos: ["private"] }),
  ], catalog);
  assert.deepEqual(memories.counts, { records: 4, places: 3, provinces: 2, photos: 7 });
  assert.equal(memories.getVisitCount("mountain"), 2);
  assert.equal(memories.getVisitCount("missing"), 0);
  assert.equal(memories.getPlaceMemory("mountain").photos.length, 7);
  assert.deepEqual(memories.entries.map(({ record }) => record.id), ["first", "second", "waterfall", "cave"]);
  assert.deepEqual(memories.mapPlaces.map((place) => place.id), ["mountain", "cave"]);
  const stats = memories.getStats();
  assert.equal(stats.totalPlaces, 3);
  assert.equal(stats.totalProvinces, 2);
  assert.equal(stats.totalPhotos, 7);
  assert.equal(stats.totalRegions, 2);
  assert.equal(stats.visitedNationalParks, 2);
  assert.equal(stats.byRegion.north.visitedNationalParks, 2);
  assert.deepEqual(stats.byRegion.north.provinces, ["เชียงใหม่"]);
  assert.deepEqual(stats.byType, { mountain: 1, waterfall: 1, cave: 1, island: 0 });
});

test("Profile photo positions match place gallery through interleaved revisits and date ties", () => {
  const records = [
    record("older", { photos: ["old-1", "old-2"] }),
    record("other-place", { placeId: "cave", photos: ["cave"] }),
    record("newer-created", { createdAt: new Date("2026-01-03T12:00:00Z"), photos: ["new-1", "new-2"] }),
    record("latest-visit", { visitedAt: new Date("2026-02-01T12:00:00Z"), photos: ["latest"] }),
  ];
  const original = records.map((item) => ({ ...item, photos: [...item.photos] }));
  const memories = readTravelRecords("local-user", records, catalog);
  assert.deepEqual(memories.getPlaceMemory("mountain").photos, ["latest", "new-1", "new-2", "old-1", "old-2"]);
  for (const post of memories.photos) {
    assert.equal(memories.getPlaceMemory(post.place.id).photos[post.photoIndex], post.photo);
  }
  assert.deepEqual(records, original, "reading must not mutate saved records");
});

test("map retains storage-order date ties and skips newer photo-less records", () => {
  const memories = readTravelRecords("local-user", [
    record("first", { photos: ["first-photo"] }),
    record("later-created", { createdAt: new Date("2026-01-03T12:00:00Z"), photos: ["second-photo"] }),
    record("no-photo", { visitedAt: new Date("2026-02-01T12:00:00Z") }),
  ], catalog);
  assert.equal(memories.getPlaceMemory("mountain").mapPhoto, "first-photo");
  assert.deepEqual(memories.getPlaceMemory("mountain").photos, ["second-photo", "first-photo"]);
});

test("park denominators follow catalog membership independently of place type", () => {
  const records = [record("first"), record("revisit")];
  const memories = readTravelRecords("local-user", records, [
    ...catalog,
    { ...catalog[2], id: "new-park", isNationalPark: true },
  ]);
  const stats = memories.getStats();
  assert.equal(stats.totalNationalParks, 3);
  assert.equal(stats.visitedNationalParks, 1);
  assert.equal(stats.byRegion.south.totalNationalParks, 1);
  assert.equal(stats.byRegion.north.totalNationalParks, 2);
  assert.equal(stats.totalByType.cave, 2);
});

test("readers share a snapshot but isolate users and rebuild when records change", () => {
  const read = createTravelRecordReader(catalog);
  const records = [record("first"), record("other", { userId: "other" })];
  const first = read("local-user", records);
  assert.equal(read("local-user", records), first);
  const other = read("other", records);
  assert.notEqual(other, first);
  assert.deepEqual(other.entries.map(({ record }) => record.id), ["other"]);
  const changed = read("local-user", [...records, record("second")]);
  assert.notEqual(changed, first);
  assert.equal(changed.counts.records, 2);
  assert.equal(first.counts.records, 1);
});
