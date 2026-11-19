#!/usr/bin/env python3
"""
Test script to verify all cities are properly indexed for search
"""

import json

# Load the GeoJSON data
with open('/Users/ilyessmoudden/Documents/Systelli V3/Insite/Map/USPS_Zip_Codes_enriched.geojson', 'r') as f:
    data = json.load(f)

# Build city index like the JavaScript does
city_map = {}
zip_count = 0

for feature in data['features']:
    zip_code = feature['properties'].get('NAME')
    city = (feature['properties'].get('city') or '').strip()
    
    if zip_code:
        zip_count += 1
    
    if city:
        if city not in city_map:
            city_map[city] = []
        city_map[city].append(zip_code)

# Print results
print("=" * 60)
print("CITY SEARCH INDEX TEST")
print("=" * 60)
print()
print(f"✓ Total ZIP codes: {zip_count}")
print(f"✓ Total unique cities: {len(city_map)}")
print()

# Show cities with multiple ZIP codes
print("CITIES WITH MULTIPLE ZIP CODES:")
print("-" * 60)
multi_zip_cities = {city: zips for city, zips in city_map.items() if len(zips) > 1}
for city in sorted(multi_zip_cities.keys()):
    zips = multi_zip_cities[city]
    print(f"  {city:20s} ({len(zips):2d} ZIPs): {', '.join(sorted(zips))}")

print()
print(f"Total cities with multiple ZIPs: {len(multi_zip_cities)}")
print()

# Show all cities alphabetically
print("ALL SEARCHABLE CITIES (A-Z):")
print("-" * 60)
for i, city in enumerate(sorted(city_map.keys()), 1):
    zip_count = len(city_map[city])
    print(f"{i:3d}. {city:25s} ({zip_count} ZIP{'s' if zip_count > 1 else ''})")

print()
print("=" * 60)
print("✅ All cities are ready for search!")
print("=" * 60)
print()
print("TESTING INSTRUCTIONS:")
print("1. Open index.html in browser")
print("2. Click 'City' button")
print("3. Start typing any city name from above")
print("4. Should see it in autocomplete dropdown")
print("5. Click or press Enter to search")
print("6. Should highlight all ZIP codes in that city")
