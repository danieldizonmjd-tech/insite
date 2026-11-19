#!/bin/bash

# InSite Mobile - Quick Rebuild & Deploy Script
# This script rebuilds the app with the latest fixes and installs it on your phone

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📱 InSite Mobile - Quick Rebuild & Deploy${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "capacitor.config.json" ]; then
  echo -e "${RED}❌ Error: capacitor.config.json not found${NC}"
  echo -e "${YELLOW}Please run this script from the Map directory${NC}"
  exit 1
fi

# Step 1: Sync Capacitor
echo -e "${YELLOW}[1/4] Syncing Capacitor...${NC}"
npx cap sync android
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Sync complete${NC}"
else
  echo -e "${RED}✗ Sync failed${NC}"
  exit 1
fi
echo ""

# Step 2: Build Debug APK
echo -e "${YELLOW}[2/4] Building debug APK...${NC}"
cd android
./gradlew assembleDebug --quiet
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Build complete${NC}"
  APK_SIZE=$(du -h app/build/outputs/apk/debug/app-debug.apk | cut -f1)
  echo -e "${BLUE}   APK size: ${APK_SIZE}${NC}"
else
  echo -e "${RED}✗ Build failed${NC}"
  exit 1
fi
cd ..
echo ""

# Step 3: Check if device is connected
echo -e "${YELLOW}[3/4] Checking for connected devices...${NC}"
DEVICES=$(adb devices | grep -v "List" | grep "device" | wc -l)
if [ "$DEVICES" -eq 0 ]; then
  echo -e "${RED}✗ No devices found${NC}"
  echo -e "${YELLOW}Please connect your phone via USB and enable USB debugging${NC}"
  echo ""
  echo "To enable USB debugging:"
  echo "1. Settings → About Phone → Tap 'Build Number' 7 times"
  echo "2. Settings → Developer Options → Enable 'USB Debugging'"
  echo "3. Connect phone to computer via USB cable"
  echo "4. Accept the 'Allow USB Debugging' prompt on your phone"
  exit 1
fi

DEVICE_MODEL=$(adb shell getprop ro.product.model 2>/dev/null)
echo -e "${GREEN}✓ Device connected: ${DEVICE_MODEL}${NC}"
echo ""

# Step 4: Install on device
echo -e "${YELLOW}[4/4] Installing on device...${NC}"
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Installation successful${NC}"
else
  echo -e "${RED}✗ Installation failed${NC}"
  exit 1
fi
echo ""

# Success summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}📱 App installed on: ${DEVICE_MODEL}${NC}"
echo -e "${YELLOW}📦 APK size: ${APK_SIZE}${NC}"
echo -e "${YELLOW}🔖 Version: 1.0.1${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Open the InSite app on your phone"
echo "2. Test the Map tab (should show Google Maps)"
echo "3. Test the Analytics tab (no dropdown, no overflow)"
echo "4. Test the Search and Compare tabs"
echo ""
echo -e "${GREEN}See TESTING_GUIDE.md for a complete testing checklist${NC}"
echo ""

# Optional: Launch app
read -p "Launch app now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}Launching app...${NC}"
  adb shell am start -n com.systelli.insite/.MainActivity
  echo -e "${GREEN}✓ App launched${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
