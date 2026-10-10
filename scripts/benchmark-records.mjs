import { mkdtempSync, rmSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { performance } from "node:perf_hooks";
import ts from "typescript";

const output = mkdtempSync(join(tmpdir(), "doen-pa-benchmark-"));
try {
  const compile = spawnSync(process.execPath, ["node_modules/typescript/bin/tsc", "--project", "tsconfig.test.json", "--outDir", output], { stdio: "inherit" });
  if (compile.status !== 0) throw new Error("Could not compile benchmark sources");
  const { readTravelRecords, createTravelRecordReader } = createRequire(import.meta.url)(join(output, "src/domain/travel-record-read-model.js"));
  const compiledCatalog = ts.transpileModule(readFileSync("src/mocks/places.ts", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } });
  const catalogPath = join(output, "catalog.cjs");
  writeFileSync(catalogPath, compiledCatalog.outputText);
  const { mockPlaces: catalog } = createRequire(import.meta.url)(catalogPath);
  const readShared = createTravelRecordReader(catalog);
  const callers = catalog.length + 1; // One filter plus one VisitCount per card.
  const date = new Date("2026-01-01T12:00:00Z");
  const median = (values) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
  const results = [];
  for (const size of [0, 100, 1000, 10000]) {
    const records = Array.from({ length: size }, (_, index) => ({ id: `record-${index}`, userId: "local-user", placeId: catalog[index % catalog.length].id, visitedAt: date, createdAt: date, photos: [], note: "", rating: 0 }));
    const before = [];
    const after = [];
    let beforeModels = 0;
    let afterModels = 0;
    for (let round = 0; round < 10; round++) {
      const snapshot = [...records]; // Each round includes the first build for a new snapshot.
      let start = performance.now();
      const separate = Array.from({ length: callers }, () => readTravelRecords("local-user", snapshot.filter((record) => record.userId === "local-user"), catalog));
      const beforeTime = performance.now() - start;
      start = performance.now();
      const shared = Array.from({ length: callers }, () => readShared("local-user", snapshot));
      const afterTime = performance.now() - start;
      if (separate[0].counts.records !== shared[0].counts.records) throw new Error("Benchmark results differ");
      beforeModels = new Set(separate).size;
      afterModels = new Set(shared).size;
      if (round >= 3) { before.push(beforeTime); after.push(afterTime); }
    }
    results.push({ records: size, callers, beforeModels, afterModels, beforeMs: +median(before).toFixed(3), afterMs: +median(after).toFixed(3) });
  }
  console.log("Synthetic Node benchmark: median of 7 rounds after 3 warmups; no JSON, DOM, rendering or photos.");
  console.table(results);
} finally {
  rmSync(output, { recursive: true, force: true });
}
