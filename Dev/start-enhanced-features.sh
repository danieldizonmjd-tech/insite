#!/bin/bash

# Enhanced Transit & Parks Features - Quick Start Script
# This script helps you get started with the new features

echo "🚀 InSite Enhanced Transit & Parks Features"
echo "==========================================="
echo ""

# Check if we're in the correct directory
if [ ! -f "enhanced-features-demo.html" ]; then
    echo "❌ Error: Please run this script from the Map directory"
    exit 1
fi

echo "✅ Found demo file"
echo ""

# Check data directories
echo "📊 Checking data directories..."

if [ -d "Data/MARTA" ]; then
    echo "  ✅ MARTA data found"
    MARTA_STOPS=$(wc -l < "Data/MARTA/stops.txt" 2>/dev/null || echo "0")
    echo "     - Stops: $MARTA_STOPS records"
else
    echo "  ⚠️  MARTA data directory not found"
fi

if [ -d "Data/CobbLinc" ]; then
    echo "  ✅ CobbLinc data found"
    COBB_STOPS=$(wc -l < "Data/CobbLinc/stops.txt" 2>/dev/null || echo "0")
    echo "     - Stops: $COBB_STOPS records"
else
    echo "  ⚠️  CobbLinc data directory not found"
fi

if [ -d "Data/Gwinnett_County_Transit" ]; then
    echo "  ✅ Gwinnett Transit data found"
    GWIN_STOPS=$(wc -l < "Data/Gwinnett_County_Transit/stops.txt" 2>/dev/null || echo "0")
    echo "     - Stops: $GWIN_STOPS records"
else
    echo "  ⚠️  Gwinnett Transit data directory not found"
fi

echo ""
echo "🌳 Checking parks data..."

PARKS_COUNT=0
if [ -f "Data/City_of_Atlanta_Parks.geojson" ]; then
    echo "  ✅ City of Atlanta Parks found"
    PARKS_COUNT=$((PARKS_COUNT + 1))
fi

if [ -f "Data/Park_Boundary.geojson" ]; then
    echo "  ✅ Park Boundary data found"
    PARKS_COUNT=$((PARKS_COUNT + 1))
fi

if [ -f "Data/Parks.geojson" ]; then
    echo "  ✅ Additional parks data found"
    PARKS_COUNT=$((PARKS_COUNT + 1))
fi

if [ -f "Data/Greenspace_in_Atlanta_Region_(Public_View_Layer)_-6578209153742607418.geojson" ]; then
    echo "  ✅ Greenspace/Trails data found"
    PARKS_COUNT=$((PARKS_COUNT + 1))
fi

echo ""
echo "📈 Summary:"
echo "  - Transit agencies: 3 (MARTA, CobbLinc, Gwinnett)"
echo "  - Parks datasets: $PARKS_COUNT"
echo ""

# Offer to open demo
echo "🌐 Launch Options:"
echo ""
echo "1. Open demo in default browser"
echo "2. Start local server (Python)"
echo "3. Show feature list"
echo "4. Exit"
echo ""
read -p "Choose option (1-4): " option

case $option in
    1)
        echo "🌐 Opening demo in browser..."
        if command -v open &> /dev/null; then
            open "enhanced-features-demo.html"
        elif command -v xdg-open &> /dev/null; then
            xdg-open "enhanced-features-demo.html"
        else
            echo "Please open enhanced-features-demo.html manually"
        fi
        ;;
    2)
        echo "🚀 Starting local server on port 8000..."
        echo "📍 Open http://localhost:8000/enhanced-features-demo.html in your browser"
        echo ""
        if command -v python3 &> /dev/null; then
            python3 -m http.server 8000
        elif command -v python &> /dev/null; then
            python -m SimpleHTTPServer 8000
        else
            echo "❌ Python not found. Please install Python to use local server."
        fi
        ;;
    3)
        echo ""
        echo "✨ Enhanced Features:"
        echo ""
        echo "🚇 TRANSIT FEATURES:"
        echo "  1. Multi-Agency Transit Stops - View all transit systems"
        echo "  2. Transit Schedule Lookup - See upcoming arrivals"
        echo "  3. Multi-Modal Journey Planner - Plan trips across systems"
        echo "  4. Park & Ride Finder - Find parking at stations"
        echo "  5. Transit Accessibility Heatmap - Visualize coverage"
        echo ""
        echo "🌳 PARKS FEATURES:"
        echo "  6. Park Amenity Finder - Filter by facilities"
        echo "  7. Trail Network Visualizer - Explore trails & paths"
        echo "  8. Detailed Park Information - Full park details"
        echo "  9. Green Space Analysis - Statistics & metrics"
        echo "  10. Get Directions - Navigate to parks"
        echo ""
        echo "📖 See ENHANCED_FEATURES_README.md for full documentation"
        ;;
    4)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "✅ Done!"
