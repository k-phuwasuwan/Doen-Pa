"""Write approved photo attribution from data/place-photos.json into the catalog CSV.

Only entries with a photo and without "approved": false are merged; others have their
image columns cleared. Files are produced by scripts/build-place-photos.mjs.
Run with: python3 scripts/merge-place-photos.py
"""
import csv
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location("importer", ROOT / "scripts/import-national-parks.py")
importer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(importer)

photos = json.loads((ROOT / "data/place-photos.json").read_text(encoding="utf-8"))
rows = importer.read_rows()
merged = 0
for row in rows:
    pid = importer.place_id(row["ชื่อหน่วยงาน"].strip())
    entry = photos.get(pid, {})
    photo = entry.get("photo")
    keep = bool(photo) and entry.get("approved") is not False
    values = {
        "image_path": f"{pid}.webp", "image_author": photo["author"] if keep else "", "image_license": photo["license"] if keep else "",
        "image_license_url": (photo.get("licenseUrl") or "").replace("http://", "https://", 1) if keep else "", "image_source_url": photo["sourceUrl"] if keep else "",
    } if keep else {field: "" for field in importer.IMAGE_FIELDS}
    row.update(values)
    merged += keep

fieldnames = importer.BASE_FIELDS + importer.IMAGE_FIELDS
with importer.SOURCE.open("w", encoding="utf-8-sig", newline="") as target:
    writer = csv.DictWriter(target, fieldnames=fieldnames, lineterminator="\r\n")
    writer.writeheader()
    writer.writerows(rows)
print(f"Merged {merged} photos into {importer.SOURCE.name}")
