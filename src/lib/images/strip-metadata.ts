/**
 * Removes embedded location/camera metadata (EXIF GPS, XMP) from JPEG, PNG and WebP
 * bytes without re-encoding. JPEG keeps only the EXIF orientation so phone photos
 * stay upright; ICC profiles are retained.
 */
const EXIF_ORIENTATION_TAG = 0x0112;

function readOrientation(exif: Uint8Array): number {
  // exif begins at the TIFF header ("II*\0" or "MM\0*").
  if (exif.length < 8) return 1;
  const view = new DataView(exif.buffer, exif.byteOffset, exif.byteLength);
  const little = exif[0] === 0x49;
  if (!little && exif[0] !== 0x4d) return 1;
  const ifd = view.getUint32(4, little);
  if (ifd + 2 > exif.length) return 1;
  const count = view.getUint16(ifd, little);
  for (let i = 0; i < count; i++) {
    const entry = ifd + 2 + i * 12;
    if (entry + 12 > exif.length) return 1;
    if (view.getUint16(entry, little) === EXIF_ORIENTATION_TAG) {
      const value = view.getUint16(entry + 8, little);
      return value >= 1 && value <= 8 ? value : 1;
    }
  }
  return 1;
}

function orientationSegment(orientation: number): Uint8Array {
  // APP1 "Exif\0\0" + big-endian TIFF with one IFD0 entry (Orientation).
  const tiff = [0x4d, 0x4d, 0, 0x2a, 0, 0, 0, 8, 0, 1, 0x01, 0x12, 0, 3, 0, 0, 0, 1, 0, orientation, 0, 0, 0, 0, 0, 0];
  const body = [0x45, 0x78, 0x69, 0x66, 0, 0, ...tiff];
  const length = body.length + 2;
  return Uint8Array.from([0xff, 0xe1, length >> 8, length & 0xff, ...body]);
}

function stripJpeg(bytes: Uint8Array): Uint8Array {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return bytes;
  const parts: Uint8Array[] = [bytes.subarray(0, 2)];
  let orientation = 1;
  let offset = 2;
  while (offset + 4 <= bytes.length) {
    if (bytes[offset] !== 0xff) return bytes;
    const marker = bytes[offset + 1];
    if (marker === 0xff) { offset += 1; continue; }
    if (marker === 0xda) { parts.push(bytes.subarray(offset)); break; }
    const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
    const end = offset + 2 + length;
    if (length < 2 || end > bytes.length) return bytes;
    const isExif = marker === 0xe1 && bytes[offset + 4] === 0x45 && bytes[offset + 5] === 0x78 && bytes[offset + 6] === 0x69 && bytes[offset + 7] === 0x66;
    if (isExif) orientation = readOrientation(bytes.subarray(offset + 10, end));
    // Drop every APP1 (EXIF/XMP), APP12/13 (IPTC/Photoshop) and comment segment.
    const drop = marker === 0xe1 || marker === 0xec || marker === 0xed || marker === 0xfe;
    if (!drop) parts.push(bytes.subarray(offset, end));
    offset = end;
  }
  if (orientation !== 1) parts.splice(1, 0, orientationSegment(orientation));
  return concat(parts);
}

function stripPng(bytes: Uint8Array): Uint8Array {
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (bytes.length < 8 || signature.some((b, i) => bytes[i] !== b)) return bytes;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const dropped = new Set(["eXIf", "tEXt", "zTXt", "iTXt"]);
  const parts: Uint8Array[] = [bytes.subarray(0, 8)];
  let offset = 8;
  while (offset + 12 <= bytes.length) {
    const length = view.getUint32(offset);
    const end = offset + 12 + length;
    if (end > bytes.length) return bytes;
    const type = String.fromCharCode(bytes[offset + 4], bytes[offset + 5], bytes[offset + 6], bytes[offset + 7]);
    if (!dropped.has(type)) parts.push(bytes.subarray(offset, end));
    offset = end;
  }
  return concat(parts);
}

function stripWebp(bytes: Uint8Array): Uint8Array {
  const tag = (at: number) => String.fromCharCode(bytes[at], bytes[at + 1], bytes[at + 2], bytes[at + 3]);
  if (bytes.length < 12 || tag(0) !== "RIFF" || tag(8) !== "WEBP") return bytes;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const parts: Uint8Array[] = [];
  let offset = 12;
  while (offset + 8 <= bytes.length) {
    const size = view.getUint32(offset + 4, true);
    const end = offset + 8 + size + (size & 1);
    if (end > bytes.length) return bytes;
    const type = tag(offset);
    if (type !== "EXIF" && type !== "XMP ") {
      const chunk = bytes.slice(offset, end);
      if (type === "VP8X") chunk[8] &= ~0x0c; // clear EXIF and XMP presence flags
      parts.push(chunk);
    }
    offset = end;
  }
  const body = concat(parts);
  const out = new Uint8Array(12 + body.length);
  out.set(bytes.subarray(0, 12));
  new DataView(out.buffer).setUint32(4, out.length - 8, true);
  out.set(body, 12);
  return out;
}

function concat(parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let at = 0;
  for (const part of parts) { out.set(part, at); at += part.length; }
  return out;
}

export function stripImageMetadata(bytes: Uint8Array, mimeType: string): Uint8Array {
  if (mimeType === "image/jpeg") return stripJpeg(bytes);
  if (mimeType === "image/png") return stripPng(bytes);
  if (mimeType === "image/webp") return stripWebp(bytes);
  return bytes;
}
