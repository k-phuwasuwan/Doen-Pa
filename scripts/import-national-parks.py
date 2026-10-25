"""Generate the Supabase seed from the reviewed CSV.

Types are editable in the CSV. Missing values stay missing; UI owns placeholders.
Run with: pnpm import:places
"""
import argparse
import csv
import hashlib
import json
import math
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "data/national-parks-156.csv"
SEED_OUTPUT = ROOT / "supabase/seed.sql"

# Six geographical regions, matching the app's existing Region model.
PROVINCES = {
    "north": "เชียงใหม่ เชียงราย แม่ฮ่องสอน ลำปาง ลำพูน แพร่ น่าน พะเยา อุตรดิตถ์",
    "central": "กรุงเทพมหานคร กำแพงเพชร ชัยนาท นครนายก นครปฐม นครสวรรค์ นนทบุรี ปทุมธานี พระนครศรีอยุธยา พิจิตร พิษณุโลก เพชรบูรณ์ ลพบุรี สมุทรปราการ สมุทรสงคราม สมุทรสาคร สิงห์บุรี สุโขทัย สุพรรณบุรี สระบุรี อ่างทอง อุทัยธานี",
    "northeast": "กาฬสินธุ์ ขอนแก่น ชัยภูมิ นครพนม นครราชสีมา บึงกาฬ บุรีรัมย์ มหาสารคาม มุกดาหาร ยโสธร ร้อยเอ็ด เลย ศรีสะเกษ สกลนคร สุรินทร์ หนองคาย หนองบัวลำภู อำนาจเจริญ อุดรธานี อุบลราชธานี",
    "east": "ฉะเชิงเทรา ชลบุรี ระยอง จันทบุรี ตราด ปราจีนบุรี สระแก้ว",
    "west": "กาญจนบุรี ตาก ประจวบคีรีขันธ์ เพชรบุรี ราชบุรี",
    "south": "กระบี่ ชุมพร ตรัง นครศรีธรรมราช นราธิวาส ปัตตานี พังงา พัทลุง ภูเก็ต ระนอง สตูล สงขลา สุราษฎร์ธานี ยะลา",
}
REGION_BY_PROVINCE = {p: region for region, names in PROVINCES.items() for p in names.split()}
assert len(REGION_BY_PROVINCE) == 77

# Keep IDs used by existing personal records and saved links.
EXISTING_IDS = {
    "ดอยอินทนนท์": "place-doi-inthanon",
    "เขาใหญ่": "place-khao-yai",
    "เขาสามร้อยยอด": "place-khao-sam-roi-yod",
    "เขาสก": "place-khao-sok",
    "หาดนพรัตน์ธารา-หมู่เกาะพีพี": "place-phi-phi",
    "ภูกระดึง": "place-phu-kradueng",
    "ภูเรือ": "place-phu-reua",
    "ภูเวียง": "place-phu-wieng",
    "ตาดโตน": "place-tat-ton",
}

BASE_FIELDS = ["หน่วยงาน", "ชื่อหน่วยงาน", "อำเภอ", "จังหวัด", "lat", "long", "description", "altitude", "distance", "type"]
# Optional freely licensed photo: all five values together, or all empty.
IMAGE_FIELDS = ["image_path", "image_author", "image_license", "image_license_url", "image_source_url"]
IMAGE_DIR = ROOT / "public/images/parks"
IMAGE_WIDTHS = (640, 1280)


def read_rows():
    with SOURCE.open(encoding="utf-8-sig", newline="") as source:
        reader = csv.DictReader(source)
        assert reader.fieldnames in (BASE_FIELDS, BASE_FIELDS + IMAGE_FIELDS), reader.fieldnames
        return list(reader)


def place_id(name):
    short_name = name.removeprefix("อุทยานแห่งชาติ")
    return EXISTING_IDS.get(short_name, "national-park-" + hashlib.sha256(name.encode()).hexdigest()[:12])


def parse_image(row, pid, name):
    values = {field: (row.get(field) or "").strip() for field in IMAGE_FIELDS}
    if not any(values.values()):
        return {}
    assert values["image_path"] == f"{pid}.webp", (name, "image_path must be <id>.webp")
    for field in ("image_author", "image_license", "image_source_url"):
        assert values[field], (name, f"{field} is required with a photo")
    for field in ("image_license_url", "image_source_url"):
        assert not values[field] or values[field].startswith("https://"), (name, field)
    for width in IMAGE_WIDTHS:
        assert (IMAGE_DIR / str(width) / values["image_path"]).is_file(), (name, f"missing public/images/parks/{width}/{values['image_path']}")
    return {
        "imagePath": values["image_path"], "imageAuthor": values["image_author"], "imageLicense": values["image_license"],
        "imageLicenseUrl": values["image_license_url"] or None, "imageSourceUrl": values["image_source_url"],
    }


def load_places():
    rows = read_rows()
    assert len(rows) == 156
    places = []
    for row in rows:
        name = row["ชื่อหน่วยงาน"].strip()
        assert row["หน่วยงาน"].strip() == "อุทยานแห่งชาติ"
        assert name.startswith("อุทยานแห่งชาติ")
        kind = row["type"].strip()
        assert kind in {"mountain", "waterfall", "cave", "island"}, name
        province = row["จังหวัด"].strip()
        assert province in REGION_BY_PROVINCE, province
        district = row["อำเภอ"].strip()
        place = {
            "id": place_id(name),
            "name": name,
            "location": "อำเภอ" + district if district and not district.startswith("อำเภอ") else district,
            "province": province,
            "region": REGION_BY_PROVINCE[province],
            "description": row["description"].strip(),
            "type": kind,
            "isNationalPark": True,
        }
        for field, source_field, limit in [("latitude", "lat", 90), ("longitude", "long", 180)]:
            text = row[source_field].strip()
            if text:
                value = float(text)
                assert math.isfinite(value) and -limit <= value <= limit, name
                place[field] = value
        for field in ("altitude", "distance"):
            value = row[field].strip()
            if value:
                assert re.fullmatch(r"\d+(?:\.\d+)? m" if field == "altitude" else r"\d+(?:\.\d+)? กม\.", value), (name, field, value)
                place[field] = value
        place.update(parse_image(row, place["id"], name))
        places.append(place)
    assert len({p["id"] for p in places}) == len({p["name"] for p in places}) == 156
    return places

def sql_literal(value):
    if value is None:
        return "null"
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (int, float)):
        if not math.isfinite(value):
            raise ValueError("SQL numbers must be finite")
        return str(value)
    if "\0" in value:
        raise ValueError("Postgres text cannot contain NUL")
    # E-strings explicitly escape backslashes as well as quotes.
    return "E'" + value.replace("\\", "\\\\").replace("'", "''") + "'"


def render_seed(places):
    fields = [
        ("id", "id"), ("name", "name"), ("location", "location"),
        ("province", "province"), ("region", "region"),
        ("description", "description"), ("type", "type"),
        ("is_national_park", "isNationalPark"), ("latitude", "latitude"),
        ("longitude", "longitude"), ("altitude", "altitude"),
        ("distance", "distance"),
        ("image_path", "imagePath"), ("image_author", "imageAuthor"), ("image_license", "imageLicense"),
        ("image_license_url", "imageLicenseUrl"), ("image_source_url", "imageSourceUrl"),
    ]
    columns = ", ".join(column for column, _ in fields)
    rows = ",\n".join(
        "  (" + ", ".join(sql_literal(place.get(field)) for _, field in fields) + ")"
        for place in places
    )
    updates = ",\n".join(
        f"  {column} = excluded.{column}" for column, _ in fields if column != "id"
    )
    return (
        "-- Generated from data/national-parks-156.csv by pnpm import:places.\n"
        "-- Run after migrations as a database administrator. No personal data.\n"
        "-- Rerunning updates matching IDs; it never deletes other places.\n"
        "begin;\n\n"
        f"insert into public.places ({columns})\nvalues\n{rows}\n"
        f"on conflict (id) do update set\n{updates};\n\n"
        "commit;\n"
    )


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Check generated files without writing")
    parser.add_argument("--json", action="store_true", help="Print validated catalog JSON for offline tooling")
    args = parser.parse_args()
    places = load_places()
    if args.json:
        print(json.dumps(places, ensure_ascii=False))
        return
    outputs = {SEED_OUTPUT: render_seed(places)}
    stale = []
    for path, content in outputs.items():
        if args.check:
            if not path.exists() or path.read_text(encoding="utf-8") != content:
                stale.append(str(path.relative_to(ROOT)))
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content, encoding="utf-8")
    if stale:
        parser.exit(1, "Run pnpm import:places to regenerate: " + ", ".join(stale) + "\n")
    action = "Checked" if args.check else "Generated"
    print(f"{action} {len(places)} national parks: Supabase seed")


if __name__ == "__main__":
    main()
