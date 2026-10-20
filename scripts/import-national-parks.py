"""Generate the local place catalog from data/national-parks-156.csv.

Types are editable in the CSV. Missing values stay missing; UI owns placeholders.
Run with: pnpm import:places
"""
import csv
import hashlib
import json
import math
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "data/national-parks-156.csv"
OUTPUT = ROOT / "src/data/places.ts"

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

def load_places():
    with SOURCE.open(encoding="utf-8-sig", newline="") as source:
        reader = csv.DictReader(source)
        assert reader.fieldnames == ["หน่วยงาน", "ชื่อหน่วยงาน", "อำเภอ", "จังหวัด", "lat", "long", "description", "altitude", "distance", "type"]
        rows = list(reader)
    assert len(rows) == 156
    places = []
    for row in rows:
        name = row["ชื่อหน่วยงาน"].strip()
        assert row["หน่วยงาน"].strip() == "อุทยานแห่งชาติ"
        assert name.startswith("อุทยานแห่งชาติ")
        short_name = name.removeprefix("อุทยานแห่งชาติ")
        kind = row["type"].strip()
        assert kind in {"mountain", "waterfall", "cave", "island"}, name
        province = row["จังหวัด"].strip()
        assert province in REGION_BY_PROVINCE, province
        district = row["อำเภอ"].strip()
        place = {
            "id": EXISTING_IDS.get(short_name, "national-park-" + hashlib.sha256(name.encode()).hexdigest()[:12]),
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
        places.append(place)
    assert len({p["id"] for p in places}) == len({p["name"] for p in places}) == 156
    return places

if __name__ == "__main__":
    places = load_places()
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(
        '// Generated from data/national-parks-156.csv by pnpm import:places.\n'
        '// Edit the CSV and regenerate; do not fill missing values with mock data.\n'
        'import type { Place } from "../types";\n\n'
        'export const places: Place[] = ' + json.dumps(places, ensure_ascii=False, indent=2) + ';\n',
        encoding="utf-8",
    )
    print(f"Imported {len(places)} national parks into {OUTPUT.relative_to(ROOT)}")
