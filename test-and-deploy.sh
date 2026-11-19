#!/bin/bash

# INSITE Map Testing & Deployment Script
# Ultra-Modern UI - November 2025

echo "🏙️ INSITE Map - Testing & Deployment"
echo "======================================"
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test desktop version
echo -e "${BLUE}1. Testing Desktop Version...${NC}"
echo "Opening index.html in browser..."
open "Map/index.html"
sleep 2

echo ""
echo -e "${YELLOW}Desktop Features to Test:${NC}"
echo "  ✓ Left panel: Data layer selector & filters"
echo "  ✓ Right panel: Statistics cards"
echo "  ✓ Hover over areas: Quick preview"
echo "  ✓ Click area: Full details panel"
echo "  ✓ Ctrl+Click: Add to comparison"
echo "  ✓ Search: ZIP codes, cities, neighborhoods"
echo "  ✓ View toggle: Map ↔ Satellite"
echo "  ✓ Press '?': Show keyboard hints"
echo ""

read -p "Press Enter to test mobile version..."

# Test mobile version
echo ""
echo -e "${BLUE}2. Testing Mobile Version...${NC}"
echo "Opening index_mobile.html in browser..."
open "Map/index_mobile.html"
sleep 2

echo ""
echo -e "${YELLOW}Mobile Features to Test:${NC}"
echo "  ✓ Menu button: Slide-out panel with filters"
echo "  ✓ Bottom stats bar: Horizontal scroll"
echo "  ✓ Tap area: Bottom sheet with details"
echo "  ✓ Long press area: Add to comparison"
echo "  ✓ Comparison FAB: Floating button bottom-right"
echo "  ✓ Search: ZIP codes, cities, neighborhoods"
echo "  ✓ View toggle: Map ↔ Satellite"
echo ""

read -p "Press Enter to proceed with Android deployment..."

# Android deployment
echo ""
echo -e "${BLUE}3. Android App Deployment${NC}"
echo ""

# Check if Android Studio is installed
if [ -d "/Applications/Android Studio.app" ]; then
    echo -e "${GREEN}✓ Android Studio found${NC}"
else
    echo -e "${YELLOW}⚠ Android Studio not found. Please install it first.${NC}"
    echo "Download from: https://developer.android.com/studio"
    exit 1
fi

# Sync to Android
echo ""
echo "Syncing to Android project..."
npx cap sync android

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Sync successful${NC}"
else
    echo -e "${YELLOW}⚠ Sync failed. Check errors above.${NC}"
    exit 1
fi

# Open Android Studio
echo ""
echo "Opening Android Studio..."
npx cap open android

echo ""
echo -e "${GREEN}======================================"
echo "Deployment Steps in Android Studio:"
echo "======================================${NC}"
echo ""
echo "1. Wait for Gradle sync to complete"
echo "2. Build → Clean Project"
echo "3. Build → Rebuild Project"
echo ""
echo "For Testing:"
echo "  • Run → Run 'app' (green play button)"
echo "  • Select your device/emulator"
echo ""
echo "For Release APK:"
echo "  • Build → Generate Signed Bundle/APK"
echo "  • Follow the wizard to create release APK"
echo ""
echo -e "${BLUE}App Features:${NC}"
echo "  ✓ Ultra-modern glassmorphic UI"
echo "  ✓ Touch-optimized mobile interface"
echo "  ✓ All data layers & filters"
echo "  ✓ User reviews & ratings"
echo "  ✓ Area comparison (up to 3)"
echo "  ✓ Search & navigation"
echo "  ✓ Offline-capable (cached data)"
echo ""
echo -e "${GREEN}Done! 🎉${NC}"
