#!/bin/bash

# Insite Android Deployment Helper Script
# This script automates common deployment tasks

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════╗"
echo "║   Insite Android Deployment Helper           ║"
echo "║   Atlanta Property Explorer                   ║"
echo "╚═══════════════════════════════════════════════╝"
echo -e "${NC}"

# Change to project root
cd "$(dirname "$0")"

# Function to show menu
show_menu() {
    echo ""
    echo -e "${GREEN}What would you like to do?${NC}"
    echo ""
    echo "  1) 🔄 Sync web code to Android"
    echo "  2) 🏗️  Build debug APK"
    echo "  3) 📱 Install debug APK on device"
    echo "  4) 🚀 Build release APK (signed)"
    echo "  5) 📦 Build release AAB for Play Store"
    echo "  6) 🖥️  Open in Android Studio"
    echo "  7) 🧹 Clean build"
    echo "  8) 📊 Show APK location"
    echo "  9) 🔍 View device logs"
    echo "  0) ❌ Exit"
    echo ""
}

# Function to sync code
sync_code() {
    echo -e "${YELLOW}Syncing web code to Android...${NC}"
    npx cap sync android
    echo -e "${GREEN}✓ Sync complete!${NC}"
}

# Function to build debug APK
build_debug() {
    echo -e "${YELLOW}Building debug APK...${NC}"
    cd android
    ./gradlew assembleDebug
    cd ..
    APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"
    if [ -f "$APK_PATH" ]; then
        echo -e "${GREEN}✓ Debug APK built successfully!${NC}"
        echo -e "${BLUE}Location: $APK_PATH${NC}"
        SIZE=$(du -h "$APK_PATH" | cut -f1)
        echo -e "${BLUE}Size: $SIZE${NC}"
    else
        echo -e "${RED}✗ Build failed!${NC}"
    fi
}

# Function to install on device
install_debug() {
    APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"
    if [ ! -f "$APK_PATH" ]; then
        echo -e "${YELLOW}Debug APK not found. Building first...${NC}"
        build_debug
    fi
    
    echo -e "${YELLOW}Installing on device...${NC}"
    
    # Check if device is connected
    if ! command -v adb &> /dev/null; then
        echo -e "${RED}✗ ADB not found. Please install Android SDK platform tools.${NC}"
        return 1
    fi
    
    DEVICES=$(adb devices | grep -v "List" | grep "device$" | wc -l)
    if [ "$DEVICES" -eq 0 ]; then
        echo -e "${RED}✗ No device connected. Please connect a device or start an emulator.${NC}"
        return 1
    fi
    
    adb install -r "$APK_PATH"
    echo -e "${GREEN}✓ App installed!${NC}"
}

# Function to build release APK
build_release_apk() {
    if [ ! -f "android/key.properties" ]; then
        echo -e "${RED}✗ key.properties not found!${NC}"
        echo -e "${YELLOW}You need to create a signing key first.${NC}"
        echo ""
        echo "Run this command:"
        echo "keytool -genkey -v -keystore insite-release-key.jks -alias insite -keyalg RSA -keysize 2048 -validity 10000"
        echo ""
        echo "Then create android/key.properties with:"
        echo "storePassword=YOUR_PASSWORD"
        echo "keyPassword=YOUR_PASSWORD"
        echo "keyAlias=insite"
        echo "storeFile=../insite-release-key.jks"
        return 1
    fi
    
    echo -e "${YELLOW}Building release APK...${NC}"
    cd android
    ./gradlew assembleRelease
    cd ..
    APK_PATH="android/app/build/outputs/apk/release/app-release.apk"
    if [ -f "$APK_PATH" ]; then
        echo -e "${GREEN}✓ Release APK built successfully!${NC}"
        echo -e "${BLUE}Location: $APK_PATH${NC}"
        SIZE=$(du -h "$APK_PATH" | cut -f1)
        echo -e "${BLUE}Size: $SIZE${NC}"
    else
        echo -e "${RED}✗ Build failed!${NC}"
    fi
}

# Function to build release AAB
build_release_aab() {
    if [ ! -f "android/key.properties" ]; then
        echo -e "${RED}✗ key.properties not found!${NC}"
        echo -e "${YELLOW}You need to create a signing key first.${NC}"
        return 1
    fi
    
    echo -e "${YELLOW}Building release AAB for Play Store...${NC}"
    cd android
    ./gradlew bundleRelease
    cd ..
    AAB_PATH="android/app/build/outputs/bundle/release/app-release.aab"
    if [ -f "$AAB_PATH" ]; then
        echo -e "${GREEN}✓ Release AAB built successfully!${NC}"
        echo -e "${BLUE}Location: $AAB_PATH${NC}"
        SIZE=$(du -h "$AAB_PATH" | cut -f1)
        echo -e "${BLUE}Size: $SIZE${NC}"
        echo ""
        echo -e "${GREEN}This file is ready to upload to Google Play Console!${NC}"
    else
        echo -e "${RED}✗ Build failed!${NC}"
    fi
}

# Function to open Android Studio
open_studio() {
    echo -e "${YELLOW}Opening Android Studio...${NC}"
    npx cap open android
}

# Function to clean build
clean_build() {
    echo -e "${YELLOW}Cleaning build...${NC}"
    cd android
    ./gradlew clean
    cd ..
    echo -e "${GREEN}✓ Clean complete!${NC}"
}

# Function to show APK location
show_apk_location() {
    echo -e "${BLUE}APK/AAB Locations:${NC}"
    echo ""
    
    DEBUG_APK="android/app/build/outputs/apk/debug/app-debug.apk"
    RELEASE_APK="android/app/build/outputs/apk/release/app-release.apk"
    RELEASE_AAB="android/app/build/outputs/bundle/release/app-release.aab"
    
    if [ -f "$DEBUG_APK" ]; then
        SIZE=$(du -h "$DEBUG_APK" | cut -f1)
        echo -e "${GREEN}✓ Debug APK:${NC} $DEBUG_APK ($SIZE)"
    else
        echo -e "${YELLOW}✗ Debug APK: Not built yet${NC}"
    fi
    
    if [ -f "$RELEASE_APK" ]; then
        SIZE=$(du -h "$RELEASE_APK" | cut -f1)
        echo -e "${GREEN}✓ Release APK:${NC} $RELEASE_APK ($SIZE)"
    else
        echo -e "${YELLOW}✗ Release APK: Not built yet${NC}"
    fi
    
    if [ -f "$RELEASE_AAB" ]; then
        SIZE=$(du -h "$RELEASE_AAB" | cut -f1)
        echo -e "${GREEN}✓ Release AAB:${NC} $RELEASE_AAB ($SIZE)"
    else
        echo -e "${YELLOW}✗ Release AAB: Not built yet${NC}"
    fi
    echo ""
}

# Function to view logs
view_logs() {
    if ! command -v adb &> /dev/null; then
        echo -e "${RED}✗ ADB not found.${NC}"
        return 1
    fi
    
    echo -e "${YELLOW}Viewing device logs (Ctrl+C to stop)...${NC}"
    adb logcat | grep -i "capacitor\|chromium\|systelli"
}

# Main loop
while true; do
    show_menu
    read -p "Enter your choice [0-9]: " choice
    
    case $choice in
        1) sync_code ;;
        2) build_debug ;;
        3) install_debug ;;
        4) build_release_apk ;;
        5) build_release_aab ;;
        6) open_studio ;;
        7) clean_build ;;
        8) show_apk_location ;;
        9) view_logs ;;
        0) 
            echo -e "${GREEN}Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid option. Please try again.${NC}"
            ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
done
