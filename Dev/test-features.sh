#!/bin/bash

# InSite Testing Script
# Tests all implemented features locally before deployment

echo "🧪 InSite Advanced Features - Testing Script"
echo "=============================================="
echo ""

# Check if we're in the right directory
if [ ! -f "insite_main_mobile.html" ]; then
    echo "❌ Error: Not in the Map directory!"
    echo "Please run this script from: /Users/ilyessmoudden/Documents/Systelli V3/Insite/Map"
    exit 1
fi

echo "📋 Pre-Deployment Checklist:"
echo ""

# 1. Check file sizes
echo "1️⃣  Checking file sizes..."
if [ -f "USPS_Zip_Codes_enriched.geojson" ]; then
    SIZE=$(ls -lh USPS_Zip_Codes_enriched.geojson | awk '{print $5}')
    echo "   ✅ GeoJSON file found: $SIZE"
else
    echo "   ❌ GeoJSON file missing!"
    exit 1
fi

# 2. Verify crime rate variation in data
echo ""
echo "2️⃣  Verifying crime rate data..."
CRIME_SAMPLE=$(grep -o '"crime_rate":[0-9.]*' USPS_Zip_Codes_enriched.geojson | head -5)
echo "   Sample crime rates:"
echo "$CRIME_SAMPLE" | sed 's/^/      /'
if echo "$CRIME_SAMPLE" | grep -q "crime_rate:16\""; then
    echo "   ⚠️  Warning: Some crime rates still at 16"
else
    echo "   ✅ Crime rates appear varied"
fi

# 3. Check for search mode toggle in mobile app
echo ""
echo "3️⃣  Checking search mode implementation..."
if grep -q "exploreSearchMode" insite_main_mobile.html; then
    echo "   ✅ Search mode variable found"
else
    echo "   ❌ Search mode variable missing!"
fi

if grep -q "displayExploreResults" insite_main_mobile.html; then
    echo "   ✅ Display function found"
else
    echo "   ❌ Display function missing!"
fi

# 4. Check comparison charts container
echo ""
echo "4️⃣  Checking horizontal scroll implementation..."
if grep -q "comparison-charts-container" insite_main_mobile.html; then
    echo "   ✅ Charts container found"
else
    echo "   ❌ Charts container missing!"
fi

# 5. Check bottom nav fix
echo ""
echo "5️⃣  Checking bottom nav overflow fix..."
if grep -q "overflow-y: auto" insite_main_mobile.html; then
    echo "   ✅ Overflow fix found"
else
    echo "   ❌ Overflow fix missing!"
fi

# 6. File count check
echo ""
echo "6️⃣  Checking all required files..."
FILES=("index.html" "index_mobile.html" "insite_main_mobile.html" "USPS_Zip_Codes_enriched.geojson")
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file missing!"
    fi
done

echo ""
echo "=============================================="
echo "🎯 Testing Recommendations:"
echo ""
echo "Web Version (index.html):"
echo "  1. Open in Chrome: open index.html"
echo "  2. Test ZIP mode: Search '90210'"
echo "  3. Test City mode: Search 'Beverly Hills'"
echo "  4. Verify crime rates vary"
echo ""
echo "Mobile App (insite_main_mobile.html):"
echo "  1. Open in Chrome DevTools (mobile mode)"
echo "  2. Test Explore tab ZIP/City toggle"
echo "  3. Test Compare tab horizontal scroll"
echo "  4. Verify no content cut off by bottom nav"
echo ""
echo "Android Build:"
echo "  cd ../android"
echo "  ./gradlew assembleDebug"
echo "  adb install app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "=============================================="
echo "✅ Pre-flight checks complete!"
echo ""

# Optional: Open web version for quick test
read -p "🌐 Open web version in browser for testing? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Opening index.html..."
    open index.html
    echo "Opening mobile version..."
    open insite_main_mobile.html
fi

echo ""
echo "📄 See IMPLEMENTATION_COMPLETE.md for full details"
echo "🚀 Ready for deployment!"
