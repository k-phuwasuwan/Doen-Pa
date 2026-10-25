// Finds a freely licensed Wikimedia Commons photo for every national park.
// Output: data/place-photos.json (review file; nothing is uploaded or written to the database).
// Run with: node scripts/find-place-photos.mjs   (Node 22+)
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT = join(ROOT, "data/place-photos.json");
const USER_AGENT = "DoenPa/0.1 (https://doen-pa.vercel.app; kantawit.phu@gmail.com) place-photo-finder";
const DELAY_MS = 120;
const MIN_WIDTH = 1000;
// Commercial reuse and modification are allowed; ND/NC variants are not.
const ALLOWED_LICENSE = /^(CC BY(-SA)? [0-9.]+( [A-Za-z]+)?|CC0.*|Public domain|PDM.*|Attribution|FAL.*)$/i;
const BLOCKED_NAME = /(map|logo|flag|emblem|sign|diagram|chart|poster|screenshot|แผนที่|ตรา)/i;

const places = JSON.parse(execFileSync("python3", [join(ROOT, "scripts/import-national-parks.py"), "--json"], { encoding: "utf8" }));
const previous = existsSync(OUTPUT) ? JSON.parse(readFileSync(OUTPUT, "utf8")) : {};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function api(host, params) {
  const url = `https://${host}/w/api.php?${new URLSearchParams({ format: "json", formatversion: "2", maxlag: "5", ...params })}`;
  for (let attempt = 0; attempt < 3; attempt++) {
    await sleep(DELAY_MS * (attempt + 1));
    const response = await fetch(url, { headers: { "user-agent": USER_AGENT } });
    if (response.ok) return response.json();
  }
  throw new Error(`request failed: ${url}`);
}

const stripHtml = (value) => (value ?? "").replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();

// Commons "Artist" is free text; keep just the name when it is a boilerplate sentence.
function cleanAuthor(value) {
  const taken = value.match(/^This Photo was taken by (.+?)\.\s/);
  if (taken) return taken[1].trim();
  const assumed = value.match(/^No machine-readable author provided\. (\S+) assumed/);
  if (assumed) return assumed[1];
  const uploader = value.match(/original uploader was (\S+?)( at |\.|$)/);
  return uploader ? uploader[1] : value;
}

async function fileInfo(fileName) {
  const data = await api("commons.wikimedia.org", {
    action: "query",
    titles: `File:${fileName.replace(/^File:/, "")}`,
    prop: "imageinfo",
    iiprop: "url|size|mime|extmetadata",
    iiurlwidth: "1600",
  });
  const info = data.query?.pages?.[0]?.imageinfo?.[0];
  if (!info) return null;
  const meta = info.extmetadata ?? {};
  return {
    file: data.query.pages[0].title.replace(/^File:/, ""),
    width: info.width,
    height: info.height,
    mime: info.mime,
    license: stripHtml(meta.LicenseShortName?.value),
    licenseUrl: meta.LicenseUrl?.value ?? "",
    author: cleanAuthor(stripHtml(meta.Artist?.value) || "Unknown"),
    sourceUrl: info.descriptionurl,
    thumbUrl: info.thumburl,
    originalUrl: info.url,
  };
}

function acceptable(info) {
  if (!info) return "missing";
  if (!/^image\/(jpeg|png|webp)$/.test(info.mime)) return `type ${info.mime}`;
  if (BLOCKED_NAME.test(info.file)) return "name looks like a map/logo";
  if (!ALLOWED_LICENSE.test(info.license)) return `license ${info.license || "unknown"}`;
  if (/^unknown$/i.test(info.author)) return "unknown author";
  if (info.width < MIN_WIDTH) return `small ${info.width}px`;
  if (info.width < info.height) return "portrait";
  return "";
}

async function pageImage(host, title) {
  const data = await api(host, { action: "query", prop: "pageimages|langlinks|pageprops", piprop: "name", lllang: "en", titles: title, redirects: "1" });
  const page = data.query?.pages?.[0];
  if (!page || page.missing) return {};
  return { image: page.pageimage, english: page.langlinks?.[0]?.title, wikidata: page.pageprops?.wikibase_item, title: page.title };
}

async function wikidataImage(id) {
  const data = await api("www.wikidata.org", { action: "wbgetclaims", entity: id, property: "P18" });
  return data.claims?.P18?.map((claim) => claim.mainsnak?.datavalue?.value).filter(Boolean) ?? [];
}

async function commonsSearch(query) {
  const data = await api("commons.wikimedia.org", { action: "query", list: "search", srsearch: query, srnamespace: "6", srlimit: "8" });
  return data.query?.search?.map((hit) => hit.title.replace(/^File:/, "")) ?? [];
}

async function findFor(place) {
  const tried = [];
  const attempt = async (source, fileName) => {
    if (!fileName) return null;
    const info = await fileInfo(fileName);
    const reason = acceptable(info);
    tried.push({ source, file: fileName, rejected: reason || undefined });
    return reason ? null : { source, ...info };
  };

  const thai = await pageImage("th.wikipedia.org", place.name);
  let found = await attempt("th.wikipedia", thai.image);
  if (!found && thai.english) {
    const english = await pageImage("en.wikipedia.org", thai.english);
    found = await attempt("en.wikipedia", english.image);
    thai.wikidata ??= english.wikidata;
  }
  if (!found && thai.wikidata) {
    for (const file of await wikidataImage(thai.wikidata)) {
      found = await attempt("wikidata", file);
      if (found) break;
    }
  }
  if (!found) {
    const short = place.name.replace("อุทยานแห่งชาติ", "").trim();
    for (const query of [`${place.name}`, `${short} ${place.province} national park`]) {
      for (const file of await commonsSearch(query)) {
        found = await attempt("commons-search", file);
        if (found) break;
      }
      if (found) break;
    }
  }
  return { name: place.name, province: place.province, photo: found, tried };
}

const results = { ...previous };
let done = 0;
for (const place of places) {
  if (results[place.id]?.photo) { done++; continue; }
  try {
    results[place.id] = await findFor(place);
  } catch (error) {
    results[place.id] = { name: place.name, province: place.province, photo: null, tried: [{ error: String(error) }] };
  }
  done++;
  if (done % 10 === 0) { writeFileSync(OUTPUT, `${JSON.stringify(results, null, 2)}\n`); console.log(`${done}/${places.length}`); }
}
writeFileSync(OUTPUT, `${JSON.stringify(results, null, 2)}\n`);
const withPhoto = Object.values(results).filter((entry) => entry.photo).length;
console.log(`found ${withPhoto}/${places.length}`);
