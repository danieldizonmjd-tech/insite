#!/bin/bash

# InSite Mobile - Google Play Store Deployment Script
# This script prepares the app for Google Play Store submission

set -e  # Exit on error

echo "🚀 InSite Mobile - Play Store Deployment"
echo "========================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check prerequisites
echo -e "\n${YELLOW}Step 1: Checking prerequisites...${NC}"
command -v npm >/dev/null 2>&1 || { echo -e "${RED}npm is required but not installed. Aborting.${NC}" >&2; exit 1; }
command -v java >/dev/null 2>&1 || { echo -e "${RED}Java is required but not installed. Aborting.${NC}" >&2; exit 1; }
echo -e "${GREEN}✓ Prerequisites check passed${NC}"

# Step 2: Install Capacitor if not already installed
echo -e "\n${YELLOW}Step 2: Installing Capacitor...${NC}"
if [ ! -d "node_modules/@capacitor/core" ]; then
    npm init -y
    npm install @capacitor/core @capacitor/cli @capacitor/android
fi
echo -e "${GREEN}✓ Capacitor installed${NC}"

# Step 3: Initialize Capacitor (if not already initialized)
echo -e "\n${YELLOW}Step 3: Initializing Capacitor project...${NC}"
if [ ! -f "capacitor.config.json" ]; then
    npx cap init "InSite" "com.insiteatl.mobile" --web-dir .
else
    echo "Capacitor already initialized"
fi
echo -e "${GREEN}✓ Capacitor initialized${NC}"

# Step 4: Add Android platform
echo -e "\n${YELLOW}Step 4: Adding Android platform...${NC}"
if [ ! -d "android" ]; then
    npx cap add android
else
    echo "Android platform already exists"
fi
echo -e "${GREEN}✓ Android platform added${NC}"

# Step 5: Sync files to Android project
echo -e "\n${YELLOW}Step 5: Syncing files to Android...${NC}"
npx cap sync android
echo -e "${GREEN}✓ Files synced${NC}"

# Step 6: Update Android project
echo -e "\n${YELLOW}Step 6: Updating Android project...${NC}"
npx cap update android
echo -e "${GREEN}✓ Android project updated${NC}"

# Step 7: Copy resources
echo -e "\n${YELLOW}Step 7: Copying app resources...${NC}"
if [ -f "insite_new_logo.png" ]; then
    mkdir -p android/app/src/main/res/mipmap-hdpi
    mkdir -p android/app/src/main/res/mipmap-mdpi
    mkdir -p android/app/src/main/res/mipmap-xhdpi
    mkdir -p android/app/src/main/res/mipmap-xxhdpi
    mkdir -p android/app/src/main/res/mipmap-xxxhdpi
    
    # Copy icon to all drawable folders (you should create different sizes)
    cp insite_new_logo.png android/app/src/main/res/mipmap-mdpi/ic_launcher.png
    cp insite_new_logo.png android/app/src/main/res/mipmap-hdpi/ic_launcher.png
    cp insite_new_logo.png android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
    cp insite_new_logo.png android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
    cp insite_new_logo.png android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
    
    echo -e "${GREEN}✓ App icon copied${NC}"
else
    echo -e "${YELLOW}⚠ App icon not found${NC}"
fi

# Step 8: Security check
echo -e "\n${YELLOW}Step 8: Running security checks...${NC}"
echo "Checking for exposed secrets..."
if grep -r "AIza" insite_main_mobile.html; then
    echo -e "${RED}⚠ WARNING: API key found in HTML file!${NC}"
    echo "Please remove API keys before deployment"
fi
echo -e "${GREEN}✓ Security check completed${NC}"

# Step 9: Build instructions
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Deployment preparation complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Open Android Studio:"
echo "   npx cap open android"
echo ""
echo "2. In Android Studio:"
echo "   - Set build variant to 'release'"
echo "   - Go to Build > Generate Signed Bundle/APK"
echo "   - Select 'Android App Bundle'"
echo "   - Create/select keystore (SAVE IT SECURELY!)"
echo "   - Build the release AAB"
echo ""
echo "3. Test the AAB:"
echo "   - Install on physical device"
echo "   - Test all features"
echo "   - Check permissions"
echo ""
echo "4. Upload to Play Console:"
echo "   - Create app listing"
echo "   - Add screenshots (1080x1920)"
echo "   - Set content rating"
echo "   - Upload AAB file"
echo "   - Submit for review"
echo ""
echo "📱 Privacy Policy URL: file://$(pwd)/privacy-policy.html"
echo "📦 Package ID: com.insiteatl.mobile"
echo "🔐 Remember to keep your keystore file safe!"
echo ""
echo -e "${YELLOW}⚠ IMPORTANT: Create proper app icons for all sizes before submission${NC}"
echo ""

# Optional: Open Android Studio
read -p "Open Android Studio now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx cap open android
fi
