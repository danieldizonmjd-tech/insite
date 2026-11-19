import csv, json, math
import os

# Resolve relative to this script's folder so it works no matter where you run it from
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, "property_value_by_zipcode.csv")
GEOJSON_IN = os.path.join(BASE_DIR, "USPS_Zip_Codes.geojson")
GEOJSON_OUT = os.path.join(BASE_DIR, "USPS_Zip_Codes_enriched.geojson")
# 1) Build ZIP -> latest value from CSV
with open(CSV_PATH, newline='', encoding="utf-8") as f:
    reader = csv.reader(f)
    rows = list(reader)

if not rows:
    raise SystemExit("CSV is empty")

headers = rows[0]
rows = rows[1:]

# Find date columns that look like YYYY-MM-DD
date_idxs = [i for i, h in enumerate(headers) if len(h) == 10 and h[4] == '-' and h[7] == '-']
try:
    region_idx = headers.index("RegionName")
except ValueError:
    raise SystemExit("Expected 'RegionName' column in CSV")

zip_to_val = {}
for r in rows:
    if not r or region_idx >= len(r): 
        continue
    z = (r[region_idx] or "").strip()
    if not z: 
        continue
    # Scan from last date col backwards for first numeric
    val = None
    for i in reversed(date_idxs):
        if i < len(r):
            s = (r[i] or "").strip()
            if s:
                try:
                    num = float(s)
                    if not math.isnan(num):
                        val = num
                        break
                except ValueError:
                    pass
    if val is not None:
        zip_to_val[z] = val

print(f"Loaded latest values for {len(zip_to_val)} ZIPs")

# 2) Inject into GeoJSON by properties.NAME
with open(GEOJSON_IN, "r", encoding="utf-8") as f:
    gj = json.load(f)

count = 0
for feat in gj.get("features", []):
    props = feat.get("properties", {})
    zip_name = str(props.get("NAME", "")).strip()
    if not zip_name:
        continue
    v = zip_to_val.get(zip_name)
    if v is not None:
        props["avg_value"] = v
        count += 1

print(f"Annotated {count} features with avg_value")

# 3) Write out
with open(GEOJSON_OUT, "w", encoding="utf-8") as f:
    json.dump(gj, f, separators=(",", ":"), ensure_ascii=False)
print(f"Wrote {GEOJSON_OUT}")