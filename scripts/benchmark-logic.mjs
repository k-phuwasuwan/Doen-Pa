import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { performance } from "node:perf_hooks";

const output = mkdtempSync(join(tmpdir(), "doen-pa-logic-"));
const WARMUP_ROUNDS = 7;
const SAMPLE_ROUNDS = 25;
try {
  const compile = spawnSync(process.execPath, ["node_modules/typescript/bin/tsc", "--project", "tsconfig.test.json", "--outDir", output], { stdio: "inherit" });
  if (compile.status !== 0) throw new Error("Could not compile benchmark sources");
  const require = createRequire(import.meta.url);
  const { readTravelRecords } = require(join(output, "src/domain/travel-record-read-model.js"));
  const { createPlaceCatalog } = require(join(output, "src/domain/place-catalog.js"));
  const source = spawnSync("python3", ["scripts/import-national-parks.py", "--json"], { encoding: "utf8" });
  if (source.status !== 0) throw new Error("Could not read benchmark catalog");
  const places = JSON.parse(source.stdout);
  const catalog = createPlaceCatalog(places);
  const queries = ["เชียงใหม่", "อินทนนท์", "north", "อุทยานแห่งชาติ", "ไม่พบสถานที่นี้", ""];
  const rows = [];
  function measure(workload, iterations, run) {
    const samples = [];
    let checksum = 0;
    for (let round = 0; round < WARMUP_ROUNDS + SAMPLE_ROUNDS; round++) {
      const start = performance.now();
      for (let index = 0; index < iterations; index++) checksum += run(index);
      if (round >= WARMUP_ROUNDS) samples.push(performance.now() - start);
    }
    samples.sort((a, b) => a - b);
    rows.push({ workload, iterations, medianMs: +samples[Math.floor(samples.length / 2)].toFixed(3), checksum });
  }
  measure("Search: 1,000 queries / 156 places", 1000, (index) => catalog.search(queries[index % queries.length], index % 2 ? "all" : "mountain").length);
  for (const size of [100, 10000]) {
    const records = Array.from({ length: size }, (_, index) => ({
      id: `record-${index}`, userId: "benchmark-user", placeId: places[index % places.length].id,
      visitedAt: new Date(Date.UTC(2026, 0, 1 + index % 28)), createdAt: new Date(Date.UTC(2026, 0, 1 + index % 28, index % 24)),
      photos: index % 5 === 0 ? [`photo-${index}-1`, `photo-${index}-2`] : [], note: "", rating: 0,
    }));
    measure(`Map selection: ${size} records`, 20, () => {
      const model = readTravelRecords("benchmark-user", records, places);
      return model.mapPlaces.reduce((total, place) => total + (model.getMapPhoto(place.id)?.length ?? 0), 0);
    });
    measure(`Profile gallery: ${size} records`, 20, () => readTravelRecords("benchmark-user", records, places).photos.length);
  }
  console.log(`Synthetic Node benchmark: median of ${SAMPLE_ROUNDS} rounds after ${WARMUP_ROUNDS} warmups. Map/Profile include a fresh model each time; no network, JSON, image bytes or DOM.`);
  console.table(rows);
} finally {
  rmSync(output, { recursive: true, force: true });
}
