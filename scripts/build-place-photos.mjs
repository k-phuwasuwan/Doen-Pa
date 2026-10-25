// Downloads the approved Commons photos from data/place-photos.json and writes resized WebP files to
// public/images/parks/{640,1280}/<id>.webp. Existing files are kept; delete one to re-download it.
// Entries with "approved": false are skipped. Afterwards run: python3 scripts/merge-place-photos.py && pnpm import:places
// Run with Node 22+: node scripts/build-place-photos.mjs
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import sharp from "sharp";

const WIDTHS = [640, 1280];
const USER_AGENT = "DoenPa/0.1 (https://doen-pa.vercel.app; kantawit.phu@gmail.com) place-photo-builder";
const photos = JSON.parse(readFileSync("data/place-photos.json", "utf8"));
const approved = Object.entries(photos).filter(([, entry]) => entry.photo && entry.approved !== false);
for (const width of WIDTHS) mkdirSync(`public/images/parks/${width}`, { recursive: true });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function download(source) {
  for (let attempt = 1; attempt <= 6; attempt++) {
    const response = await fetch(source, { headers: { "user-agent": USER_AGENT } });
    if (response.ok) return Buffer.from(await response.arrayBuffer());
    await sleep(3000 * attempt);
  }
  throw new Error(`download failed: ${source}`);
}

let written = 0;
for (const [id, { photo }] of approved) {
  if (WIDTHS.every((width) => existsSync(`public/images/parks/${width}/${id}.webp`))) continue;
  const original = await download(photo.thumbUrl ?? photo.originalUrl);
  for (const width of WIDTHS) {
    await sharp(original).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 78 }).toFile(`public/images/parks/${width}/${id}.webp`);
  }
  if (++written % 10 === 0) console.log(`${written} written`);
  await sleep(400);
}
console.log(`done: ${written} new, ${approved.length} approved`);
