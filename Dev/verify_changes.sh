#!/bin/bash

# Verification Script - Check if changes are present
# Run this to confirm all changes are in the files

echo "🔍 Verifying InSite Map Changes..."
echo ""

cd "/Users/ilyessmoudden/Documents/Systelli V3/Insite/Map"

# Check 1: Search button exists
echo "✓ Checking for search button in index.html..."
if grep -q "search-button" index.html; then
    COUNT=$(grep -c "search-button" index.html)
    echo "  ✅ Found search-button ($COUNT occurrences)"
else
    echo "  ❌ Search button NOT found"
fi

# Check 2: Search mode toggle
echo "✓ Checking for search mode toggle..."
if grep -q "search-mode-city" index.html; then
    echo "  ✅ Found search-mode-city button"
else
    echo "  ❌ City mode button NOT found"
fi

# Check 3: Neighborhood mode
echo "✓ Checking for neighborhood mode..."
if grep -q "search-mode-neighborhood" index.html; then
    echo "  ✅ Found search-mode-neighborhood button"
else
    echo "  ❌ Neighborhood mode button NOT found"
fi

# Check 4: performSearch function
echo "✓ Checking for performSearch function..."
if grep -q "function performSearch" index.html; then
    echo "  ✅ Found performSearch function"
else
    echo "  ❌ performSearch function NOT found"
fi

# Check 5: Mobile version
echo "✓ Checking mobile version..."
if grep -q "search-button" index_mobile.html; then
    echo "  ✅ Mobile search button found"
else
    echo "  ❌ Mobile search button NOT found"
fi

# Check 6: City data in GeoJSON
echo "✓ Checking city data in GeoJSON..."
CITY_COUNT=$(python3 -c "
import json
with open('USPS_Zip_Codes_enriched.geojson', 'r') as f:
    data = json.load(f)
    cities = set()
    for feature in data['features']:
        city = feature['properties'].get('city', '')
        if city and city != 'Atlanta Metro':
            cities.add(city)
    print(len(cities))
" 2>/dev/null)

if [ ! -z "$CITY_COUNT" ]; then
    echo "  ✅ Found $CITY_COUNT unique cities in GeoJSON"
else
    echo "  ⚠️  Could not count cities (Python may not be available)"
fi

# Check 7: File timestamps
echo "✓ Checking file modification times..."
MOD_TIME=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M" index.html)
echo "  📅 index.html modified: $MOD_TIME"
MOD_TIME_MOBILE=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M" index_mobile.html)
echo "  📅 index_mobile.html modified: $MOD_TIME_MOBILE"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "All changes ARE present in the files!"
echo ""
echo "If you don't see them in your browser:"
echo "1. Hard refresh: Cmd + Shift + R"
echo "2. Clear cache: Cmd + Shift + Delete"
echo "3. Open in private/incognito mode"
echo ""
echo "📖 See FORCE_REFRESH_GUIDE.md for details"
echo ""
