import { spawnSync } from "node:child_process";
import type { Place } from "../../src/types";

/** Test data comes from the reviewed CSV, never an application fallback. */
export function readReviewedCatalog(): Place[] {
  const result = spawnSync("python3", ["scripts/import-national-parks.py", "--json"], { encoding: "utf8" });
  if (result.status !== 0) throw new Error(result.stderr || "Could not read reviewed catalog");
  return JSON.parse(result.stdout);
}
