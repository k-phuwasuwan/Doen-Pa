import assert from "node:assert/strict";
import { test } from "node:test";
import { stripImageMetadata } from "../src/lib/images/strip-metadata";

const ascii = (text: string) => [...text].map((c) => c.charCodeAt(0));
const contains = (bytes: Uint8Array, text: string) => Buffer.from(bytes).includes(Buffer.from(text, "latin1"));

function jpegWithExif(orientation: number) {
  // Big-endian EXIF with Orientation plus a marker string standing in for GPS data.
  const tiff = [0x4d, 0x4d, 0, 0x2a, 0, 0, 0, 8, 0, 1, 0x01, 0x12, 0, 3, 0, 0, 0, 1, 0, orientation, 0, 0, 0, 0, 0, 0, ...ascii("GPSLAT")];
  const body = [...ascii("Exif"), 0, 0, ...tiff];
  const length = body.length + 2;
  const icc = [0xff, 0xe2, 0, 4, 1, 2];
  return Uint8Array.from([0xff, 0xd8, 0xff, 0xe1, length >> 8, length & 0xff, ...body, ...icc, 0xff, 0xda, 0, 2, 9, 9, 0xff, 0xd9]);
}

test("JPEG GPS is removed, ICC and image data kept, orientation preserved", () => {
  const out = stripImageMetadata(jpegWithExif(6), "image/jpeg");
  assert.equal(contains(out, "GPSLAT"), false);
  assert.equal(contains(out, "Exif"), true);
  assert.equal(out[out.indexOf(0x12) + 8], 6);
  assert.deepEqual([...out.subarray(out.length - 8)], [0xff, 0xda, 0, 2, 9, 9, 0xff, 0xd9]);
  assert.equal(out.includes(0xe2), true);
});

test("JPEG with upright orientation has no EXIF left", () => {
  const out = stripImageMetadata(jpegWithExif(1), "image/jpeg");
  assert.equal(contains(out, "Exif"), false);
  assert.equal(contains(out, "GPSLAT"), false);
});

test("PNG text and EXIF chunks are removed while pixel chunks stay", () => {
  const chunk = (type: string, data: number[]) => [0, 0, 0, data.length, ...ascii(type), ...data, 0, 0, 0, 0];
  const png = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, ...chunk("IHDR", [1]), ...chunk("eXIf", ascii("GPSLAT")), ...chunk("IDAT", [7]), ...chunk("IEND", [])]);
  const out = stripImageMetadata(png, "image/png");
  assert.equal(contains(out, "GPSLAT"), false);
  assert.equal(contains(out, "IDAT"), true);
});

test("WebP EXIF chunk is removed and RIFF size updated", () => {
  const le = (n: number) => [n & 255, (n >> 8) & 255, 0, 0];
  const chunk = (type: string, data: number[]) => [...ascii(type), ...le(data.length), ...data, ...(data.length % 2 ? [0] : [])];
  const body = [...ascii("WEBP"), ...chunk("VP8X", [0x08, 0, 0, 0, 0, 0, 0, 0, 0, 0]), ...chunk("EXIF", ascii("GPSLAT!")), ...chunk("VP8 ", [1, 2, 3, 4])];
  const webp = Uint8Array.from([...ascii("RIFF"), ...le(body.length), ...body]);
  const out = stripImageMetadata(webp, "image/webp");
  assert.equal(contains(out, "GPSLAT"), false);
  assert.equal(new DataView(out.buffer, out.byteOffset).getUint32(4, true), out.length - 8);
  assert.equal(out[20], 0);
});

test("malformed or unsupported input is returned unchanged", () => {
  const junk = Uint8Array.from([1, 2, 3]);
  assert.equal(stripImageMetadata(junk, "image/jpeg"), junk);
  assert.equal(stripImageMetadata(junk, "image/gif"), junk);
});
