import assert from "node:assert/strict";
import { test } from "node:test";
import { createPlaceCatalog } from "../src/domain/place-catalog";
import { decodePlace, loadPlaceCatalog } from "../src/services/place-catalog-source";
import { archivedPlaces } from "../src/data/archived-places";
import { readTravelRecords } from "../src/domain/travel-record-read-model";

const config = { url: "https://catalog.test", publishableKey: "sb_publishable_test" };
const park = {
  id: "place-khao-sam-roi-yod", name: "อุทยานทดสอบจากฐานข้อมูล", location: "",
  province: "ประจวบคีรีขันธ์", region: "west", type: "mountain", description: "",
  is_national_park: true, latitude: 0, longitude: 0, altitude: null, distance: "0 กม.",
};

test("database fields map to Place without replacing missing measurements or real zero", () => {
  assert.deepEqual(decodePlace(park), {
    id: park.id, name: park.name, location: "", province: park.province, region: "west",
    type: "mountain", description: "", isNationalPark: true, latitude: 0, longitude: 0,
    altitude: undefined, distance: "0 กม.",
  });
});

test("optional photo attribution maps to Place.image and rejects partial values", () => {
  const photo = { image_path: "place-khao-sam-roi-yod.webp", image_author: "ช่างภาพ", image_license: "CC BY-SA 4.0", image_license_url: null, image_source_url: "https://commons.wikimedia.org/wiki/File:Test.jpg" };
  assert.deepEqual(decodePlace({ ...park, ...photo }).image, {
    path: photo.image_path, author: photo.image_author, license: photo.image_license, sourceUrl: photo.image_source_url,
  });
  assert.equal("image" in decodePlace({ ...park, image_path: null }), false);
  assert.throws(() => decodePlace({ ...park, image_path: "x.webp", image_author: null, image_license: null, image_source_url: null }), /Invalid/);
});

test("catalog reads paginate through project row caps and only send public read credentials", async () => {
  const offsets: string[] = [];
  const request: typeof fetch = async (input, init) => {
    const url = new URL(String(input));
    assert.equal(url.pathname, "/rest/v1/places");
    assert.equal(url.searchParams.get("order"), "id.asc");
    assert.equal(init?.cache, "no-store");
    assert.equal(new Headers(init?.headers).get("apikey"), config.publishableKey);
    assert.equal(new Headers(init?.headers).has("authorization"), false);
    assert.ok(init?.signal);
    offsets.push(url.searchParams.get("offset") ?? "");
    const index = offsets.length - 1;
    // Deliberately return fewer rows than requested on every page.
    return Response.json([{ ...park, id: `park-${index}` }], { headers: { "content-range": `${index}-${index}/3` } });
  };
  const places = await loadPlaceCatalog(config, request);
  assert.deepEqual(offsets, ["0", "1", "2"]);
  assert.equal(places.length, 3);
});

test("empty catalogs and responses without a count are complete only at the end", async () => {
  const empty = await loadPlaceCatalog(config, async () => Response.json([], { headers: { "content-range": "*/0" } }));
  assert.deepEqual(empty, []);
  let requests = 0;
  const places = await loadPlaceCatalog(config, async () => Response.json(requests++ === 0 ? [park] : []));
  assert.equal(requests, 2);
  assert.equal(places.length, 1);
});

test("unavailable, malformed, partial and duplicate data fail instead of becoming an empty catalog", async () => {
  await assert.rejects(loadPlaceCatalog(config, async () => { throw new Error("offline"); }), /offline/);
  await assert.rejects(loadPlaceCatalog(config, async () => Response.json({ message: "denied" }, { status: 403 })), /HTTP 403/);
  await assert.rejects(loadPlaceCatalog(config, async () => Response.json({ places: [] })), /Invalid/);
  await assert.rejects(loadPlaceCatalog(config, async () => Response.json([], { headers: { "content-range": "*/3" } })), /Incomplete/);
  await assert.rejects(loadPlaceCatalog(config, async () => Response.json([park, park])), /Duplicate/);
  for (const row of [{ ...park, region: "unknown" }, { ...park, latitude: 91 }, { ...park, distance: 0 }]) {
    assert.throws(() => decodePlace(row), /Invalid/);
  }
});

test("all views use the supplied database snapshot while aliases and history remain readable", () => {
  const places = [decodePlace(park)];
  const catalog = createPlaceCatalog(places, archivedPlaces);
  assert.deepEqual(catalog.search("ฐานข้อมูล"), places);
  assert.deepEqual(catalog.search("ฐานข้อมูล", "island"), []);
  assert.equal(catalog.getById("place-khao-sam-rok")?.id, park.id);
  assert.equal(catalog.getById("missing"), null);
  assert.equal(catalog.getById("place-doi-chiang-dao")?.isNationalPark, false);
  assert.equal(catalog.isCatalogPlace("place-doi-chiang-dao"), false);
  const memories = readTravelRecords("local-user", [], places, archivedPlaces);
  assert.equal(memories.getStats().totalNationalParks, 1);
  assert.equal(memories.getStats().totalByType.mountain, 1);
});
