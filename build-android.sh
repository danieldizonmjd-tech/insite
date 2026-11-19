#!/bin/bash

# Insite Android App - Quick Deploy Script
# This script will help you build and deploy your Android app

echo "🏙️  Insite Android App Builder"
echo "================================"
echo ""

# Check if Android Studio is installed
if ! command -v android &> /dev/null; then
    echo "⚠️  Android Studio not detected."
    echo "Please install Android Studio from: https://developer.android.com/studio"
    echo ""
fi

# Check if running in correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the Insite directory"
    echo "   cd '/Users/ilyessmoudden/Documents/Systelli V3/Insite'"
    exit 1
fi

echo "📱 Choose what you want to do:"
echo ""
echo "1) Open project in Android Studio"
echo "2) Build APK for testing"
echo "3) Sync changes from web app"
echo "4) Full setup (install + sync)"
echo "5) Exit"
echo ""
read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo "🚀 Opening Android Studio..."
        npx cap open android
        ;;
    2)
        echo "📦 Building APK..."
        echo "This will be done in Android Studio."
        echo "Steps:"
        echo "1. Build > Build Bundle(s) / APK(s) > Build APK(s)"
        echo "2. Find APK at: android/app/build/outputs/apk/debug/app-debug.apk"
        npx cap open android
        ;;
    3)
        echo "🔄 Syncing web assets to Android..."
        npx cap sync android
        echo "✅ Sync complete! Rebuild in Android Studio to see changes."
        ;;
    4)
        echo "📥 Installing dependencies..."
        npm install
        echo ""
        echo "🔄 Syncing to Android..."
        npx cap sync android
        echo ""
        echo "✅ Setup complete! Opening Android Studio..."
        npx cap open android
        ;;
    5)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "✅ Done!"
