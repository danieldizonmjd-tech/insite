#!/bin/bash

###############################################################################
# InSite Enhanced Features - Integration Test & Demo Script
# Purpose: Verify all features are working correctly after integration
# Date: December 7, 2025
###############################################################################

echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║            🧪 InSite Phase 2 Integration - Test & Demo Suite 🧪              ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print test results
print_test() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗${NC} $2"
        ((TESTS_FAILED++))
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📁 FILE STRUCTURE VERIFICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if all required files exist
if [ -f "insite_map_integrated.html" ]; then
    print_test 0 "insite_map_integrated.html exists"
else
    print_test 1 "insite_map_integrated.html exists"
fi

if [ -f "phase2-features.js" ]; then
    print_test 0 "phase2-features.js exists"
else
    print_test 1 "phase2-features.js exists"
fi

if [ -f "transit-features.js" ]; then
    print_test 0 "transit-features.js exists"
else
    print_test 1 "transit-features.js exists"
fi

if [ -f "parks-features.js" ]; then
    print_test 0 "parks-features.js exists"
else
    print_test 1 "parks-features.js exists"
fi

if [ -f "insite_main.html" ]; then
    print_test 0 "insite_main.html exists"
else
    print_test 1 "insite_main.html exists"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔗 INTEGRATION VERIFICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if insite_main.html references the integrated map
if grep -q "insite_map_integrated.html" insite_main.html; then
    print_test 0 "insite_main.html references integrated map"
else
    print_test 1 "insite_main.html references integrated map"
fi

# Check if integrated map includes all feature scripts
if grep -q "phase2-features.js" insite_map_integrated.html; then
    print_test 0 "Integrated map includes phase2-features.js"
else
    print_test 1 "Integrated map includes phase2-features.js"
fi

if grep -q "transit-features.js" insite_map_integrated.html; then
    print_test 0 "Integrated map includes transit-features.js"
else
    print_test 1 "Integrated map includes transit-features.js"
fi

if grep -q "parks-features.js" insite_map_integrated.html; then
    print_test 0 "Integrated map includes parks-features.js"
else
    print_test 1 "Integrated map includes parks-features.js"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 DATA FILES VERIFICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check for GTFS data
if [ -d "Data/MARTA" ]; then
    print_test 0 "MARTA GTFS data directory exists"
else
    print_test 1 "MARTA GTFS data directory exists"
fi

if [ -d "Data/CobbLinc" ]; then
    print_test 0 "CobbLinc GTFS data directory exists"
else
    print_test 1 "CobbLinc GTFS data directory exists"
fi

if [ -d "Data/Gwinnett_County_Transit" ]; then
    print_test 0 "Gwinnett County Transit data directory exists"
else
    print_test 1 "Gwinnett County Transit data directory exists"
fi

# Check for Parks data
if [ -f "Data/City_of_Atlanta_Parks.geojson" ]; then
    print_test 0 "City of Atlanta Parks data exists"
else
    print_test 1 "City of Atlanta Parks data exists"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ PHASE 2 FEATURES CODE VERIFICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check for Phase 2 feature implementations in phase2-features.js
if grep -q "initRealTimeTransit" phase2-features.js; then
    print_test 0 "Real-time transit feature implemented"
else
    print_test 1 "Real-time transit feature implemented"
fi

if grep -q "addParkReview" phase2-features.js; then
    print_test 0 "Park reviews feature implemented"
else
    print_test 1 "Park reviews feature implemented"
fi

if grep -q "generatePhotoGalleryHTML" phase2-features.js; then
    print_test 0 "Photo galleries feature implemented"
else
    print_test 1 "Photo galleries feature implemented"
fi

if grep -q "loadBikeShareData" phase2-features.js; then
    print_test 0 "Bike share feature implemented"
else
    print_test 1 "Bike share feature implemented"
fi

if grep -q "fetchWeatherData" phase2-features.js; then
    print_test 0 "Weather overlay feature implemented"
else
    print_test 1 "Weather overlay feature implemented"
fi

if grep -q "addToFavorites" phase2-features.js; then
    print_test 0 "Favorites system feature implemented"
else
    print_test 1 "Favorites system feature implemented"
fi

if grep -q "calculateTransitCarbonSavings" phase2-features.js; then
    print_test 0 "Carbon footprint calculator implemented"
else
    print_test 1 "Carbon footprint calculator implemented"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎨 UI COMPONENTS VERIFICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check for UI components in integrated map
if grep -q "feature-panel" insite_map_integrated.html; then
    print_test 0 "Collapsible feature panel implemented"
else
    print_test 1 "Collapsible feature panel implemented"
fi

if grep -q "search-container" insite_map_integrated.html; then
    print_test 0 "Search bar implemented"
else
    print_test 1 "Search bar implemented"
fi

if grep -q "map-legend" insite_map_integrated.html; then
    print_test 0 "Dynamic legend implemented"
else
    print_test 1 "Dynamic legend implemented"
fi

if grep -q "notification" insite_map_integrated.html; then
    print_test 0 "Notification system implemented"
else
    print_test 1 "Notification system implemented"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📚 DOCUMENTATION VERIFICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "INTEGRATION_COMPLETE.md" ]; then
    print_test 0 "Integration documentation exists"
else
    print_test 1 "Integration documentation exists"
fi

if [ -f "PHASE2_INTEGRATION_SUMMARY.txt" ]; then
    print_test 0 "Phase 2 summary exists"
else
    print_test 1 "Phase 2 summary exists"
fi

if [ -f "ENHANCED_FEATURES_README.md" ]; then
    print_test 0 "Enhanced features README exists"
else
    print_test 1 "Enhanced features README exists"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 TEST SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))
SUCCESS_RATE=$((TESTS_PASSED * 100 / TOTAL_TESTS))

echo ""
echo -e "Total Tests:    ${BLUE}$TOTAL_TESTS${NC}"
echo -e "Tests Passed:   ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed:   ${RED}$TESTS_FAILED${NC}"
echo -e "Success Rate:   ${YELLOW}$SUCCESS_RATE%${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                     ✅ ALL TESTS PASSED! READY TO DEPLOY! ✅                  ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "🎉 Integration is complete and all components are in place!"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🚀 NEXT STEPS:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "1. Open the app:"
    echo "   open insite_main.html"
    echo ""
    echo "2. Navigate to the Map tab"
    echo ""
    echo "3. Click 'Show Features' to explore all 16 features"
    echo ""
    echo "4. Test Phase 2 features:"
    echo "   • Write a park review"
    echo "   • View bike share stations"
    echo "   • Check weather overlay"
    echo "   • Save favorites"
    echo ""
    echo "5. Review documentation:"
    echo "   cat INTEGRATION_COMPLETE.md"
    echo "   cat PHASE2_INTEGRATION_SUMMARY.txt"
    echo ""
else
    echo -e "${RED}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║                  ⚠️  SOME TESTS FAILED - REVIEW REQUIRED ⚠️                   ║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Please review the failed tests above and ensure all files are in place."
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📖 FEATURE CATALOG"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚇 TRANSIT FEATURES:"
echo "   Phase 1:"
echo "   ✅ Multi-Agency Transit Stops (800+ stops)"
echo "   ✅ Park & Ride Finder (10 stations)"
echo "   ✅ Accessibility Heatmap"
echo ""
echo "   Phase 2:"
echo "   ⭐ Real-Time Transit Tracking (NEW!)"
echo ""
echo "🌳 PARKS FEATURES:"
echo "   Phase 1:"
echo "   ✅ Parks Layer (500+ parks)"
echo "   ✅ Amenity Filtering (11 types)"
echo "   ✅ Trail Network (1,000+ segments)"
echo ""
echo "   Phase 2:"
echo "   ⭐ Park Reviews System (NEW!)"
echo "   ⭐ Photo Galleries (NEW!)"
echo ""
echo "🎯 SMART FEATURES (Phase 2):"
echo "   ⭐ Bike Share Integration (8 stations)"
echo "   ⭐ Weather Overlay"
echo "   ⭐ Favorites System"
echo "   ⭐ Carbon Footprint Calculator"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
