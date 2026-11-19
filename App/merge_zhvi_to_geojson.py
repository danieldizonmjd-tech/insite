# merge_zhvi_to_geojson.py
import json
import pandas as pd
import geopandas as gpd
from rapidfuzz import process, fuzz
import folium
import sys

# CONFIG: filenames (adjust if your files are named differently)
GEOJSON_IN = "Official_Neighborhoods_-_Open_Data.geojson"  # CHANGED: use official, complete file
ZHVI_CSV = "neighborhood_zhvi_allhomes.csv"   # downloaded from Zillow Research
GEOJSON_OUT = "official_atlanta_neighborhoods_enriched.geojson"  # CHANGED: output new enriched file
VALUES_OUT = "values.json"

# 1) Load Atlanta neighborhoods GeoJSON
print("Loading GeoJSON...")
# Read as plain JSON first
with open(GEOJSON_IN, 'r') as f:
    geojson_raw = json.load(f)

# Extract features and create a simple dataframe
features = geojson_raw['features']
data = []
for feat in features:
    props = feat['properties'].copy()
    props['geometry'] = feat['geometry']
    data.append(props)

gdf = pd.DataFrame(data)
# normalize the name property key (common: 'NAME' in Atlanta dataset)
if 'NAME' in gdf.columns:
    gdf['nbhd_name'] = gdf['NAME'].astype(str)
elif 'name' in gdf.columns:
    gdf['nbhd_name'] = gdf['name'].astype(str)
else:
    # fallback: check properties if geopandas didn't flatten
    if 'properties' in gdf.columns:
        gdf['nbhd_name'] = gdf['properties'].apply(lambda p: p.get('NAME') or p.get('name') or '')
    else:
        raise SystemExit("Could not find neighborhood name field in GeoJSON. Inspect the GEOJSON_IN file.")

# 2) Load Zillow CSV (neighborhood-level)
print("Loading Zillow CSV (this could be large)...")
df = pd.read_csv(ZHVI_CSV, low_memory=False)

# Inspect columns: we expect columns like RegionName, City, State, and month columns
print("Columns in Zillow CSV (first 20):", df.columns[:20].tolist(), "... (and total", len(df.columns), "columns)")

# common Zillow CSV fields: 'RegionName' (neighborhood name), 'City', 'State', then monthly columns
if 'RegionName' not in df.columns:
    raise SystemExit("Expected 'RegionName' column in Zillow CSV. Open the CSV and confirm its format.")

# Filter to entries that are for Atlanta, GA
filter_mask = pd.Series([True] * len(df))

if 'City' in df.columns:
    filter_mask = df['City'].str.contains('Atlanta', case=False, na=False)
elif 'city' in df.columns:
    filter_mask = df['city'].str.contains('Atlanta', case=False, na=False)
else:
    # fallback: try State == 'GA'
    if 'State' in df.columns:
        filter_mask = df['State'].str.upper() == 'GA'
    elif 'state' in df.columns:
        filter_mask = df['state'].str.upper() == 'GA'
    else:
        print("Warning: Could not detect City/State columns. Proceeding without filtering (you may get many rows).")

df_atl = df[filter_mask].copy()
print("Rows after Atlanta filter:", len(df_atl))

# Determine the latest date column (monthly time series columns usually come after metadata columns)
# Heuristic: drop common metadata columns, then choose the rightmost column whose name contains a digit (likely a date)
metadata_cols = {'RegionID','RegionName','City','State','Metro','CountyName','SizeRank','RegionType'}
candidate_time_cols = [c for c in df_atl.columns if c not in metadata_cols]

# pick columns that look date-like (contain a digit)
date_like_cols = [c for c in candidate_time_cols if any(ch.isdigit() for ch in c)]

if date_like_cols:
    latest_col = date_like_cols[-1]
else:
    # fallback: choose the last column in the dataframe
    latest_col = df_atl.columns[-1]

print("Using latest value column:", latest_col)

# Ensure numeric conversion
df_atl[latest_col] = pd.to_numeric(df_atl[latest_col], errors='coerce')

# Build a small lookup: neighborhood name -> latest ZHVI value
# Zillow's neighborhood name is in 'RegionName'
zhvi_lookup = {}
for _, row in df_atl.iterrows():
    name = str(row['RegionName']).strip()
    val = row[latest_col]
    if pd.notna(val):
        zhvi_lookup[name] = float(val)

print("Zillow neighborhoods loaded:", len(zhvi_lookup))

# 3) Match GeoJSON neighborhood names to Zillow neighborhood names (fuzzy match)
geo_names = list(gdf['nbhd_name'].unique())
zhvi_names = list(zhvi_lookup.keys())

# Manual mapping for neighborhood name mismatches (add more as needed)
manual_name_map = {
    # 'Official GeoJSON Name': 'Zillow CSV Name',
    'Old Fourth Ward': 'Old 4th Ward',
    'Peachtree Heights East': 'Peachtree Heights E',
    'Peachtree Heights West': 'Peachtree Heights W',
    'Poncey-Highland': 'Poncey Highland',
    'Inman Park': 'Inman Pk',
    'Candler Park': 'Candler Pk',
    'Edgewood': 'Edgewood-Kirkwood',
    'Buckhead Village': 'Buckhead',
    'Midtown': 'Midtown',
    'Downtown': 'Downtown',
    # Add more mappings as you find mismatches
}

# We'll attempt exact match first, then fuzzy for the rest
values_map = {}
unmatched_geo = []
for name in geo_names:
    zhvi_name = manual_name_map.get(name, name)
    if zhvi_name in zhvi_lookup:
        values_map[name] = zhvi_lookup[zhvi_name]
    else:
        # fuzzy match best candidate
        best = process.extractOne(zhvi_name, zhvi_names, scorer=fuzz.token_sort_ratio)
        if best and best[1] >= 80:  # threshold (80 is fairly strict)
            matched_name = best[0]
            values_map[name] = zhvi_lookup[matched_name]
            print(f"Fuzzy matched '{name}' -> '{matched_name}' (score {best[1]})")
        else:
            values_map[name] = None
            unmatched_geo.append(name)

print(f"Matched values for {len(values_map)-len(unmatched_geo)} neighborhoods; {len(unmatched_geo)} unmatched.")

# 4) Write values.json
with open(VALUES_OUT, 'w') as f:
    out_map = {k: int(v) if (v is not None and not pd.isna(v)) else None for k, v in values_map.items()}
    json.dump(out_map, f, indent=2)
print("Wrote", VALUES_OUT)

# 5) Add avg_value property to geo DataFrame and write enriched GeoJSON
gdf['avg_value'] = gdf['nbhd_name'].map(values_map)
gdf['avg_value'] = gdf['avg_value'].where(pd.notna(gdf['avg_value']), None)

gdf.to_file(GEOJSON_OUT, driver='GeoJSON')
print("Wrote enriched GeoJSON:", GEOJSON_OUT)

# 6) Print any unmatched neighborhoods for manual handling
if unmatched_geo:
    print("\nUnmatched neighborhoods (consider manual mapping):")
    for nm in unmatched_geo:
        print(" -", nm)

print("Done.")

# === 7) Optional: Generate an interactive Folium map ===
try:
    print("Creating Folium map...")
    # Load the enriched GeoJSON (it already has avg_value)
    gdf_enriched = gpd.read_file(GEOJSON_OUT)

    # Convert any datetime columns to strings (avoid JSON errors)
    for col in gdf_enriched.columns:
        if pd.api.types.is_datetime64_any_dtype(gdf_enriched[col]):
            gdf_enriched[col] = gdf_enriched[col].astype(str)

    # Create a base map centered on Atlanta
    m = folium.Map(location=[33.75, -84.39], zoom_start=12, tiles="cartodbpositron")

    # Add a choropleth layer using the avg_value field
    folium.Choropleth(
        geo_data=gdf_enriched,
        data=gdf_enriched,
        columns=["nbhd_name", "avg_value"],
        key_on="feature.properties.nbhd_name",
        fill_color="YlGnBu",
        nan_fill_color="gray",
        fill_opacity=0.7,
        line_opacity=0.2,
        legend_name="Average Home Value (USD)"
    ).add_to(m)

    # Add a separate GeoJson layer for tooltips/popups
    folium.GeoJson(
        gdf_enriched,
        tooltip=folium.GeoJsonTooltip(
            fields=["nbhd_name", "avg_value"],
            aliases=["Neighborhood:", "Avg Value:"],
            localize=True
        ),
        style_function=lambda x: {
            'fillColor': 'transparent',
            'color': 'transparent',
            'weight': 0
        }
    ).add_to(m)

    # Save and open the map
    m.save("map.html")
    print("✅ Map created successfully: map.html")

    import webbrowser
    webbrowser.open("map.html")

except Exception as e:
    print("⚠️ Could not generate map:", e)
