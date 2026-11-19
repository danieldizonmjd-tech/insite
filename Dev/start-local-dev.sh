#!/bin/bash

# Local Development Setup Script for INSITE API Keys

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║     INSITE - Local Development API Key Setup             ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check if Google Maps API key is already set
if [ -n "$GOOGLE_MAPS_API_KEY" ]; then
    echo "✅ GOOGLE_MAPS_API_KEY is already set"
    echo "   Current value: ${GOOGLE_MAPS_API_KEY:0:20}..."
else
    echo "⚠️  GOOGLE_MAPS_API_KEY is not set"
    echo ""
    echo "Please enter your Google Maps API key:"
    echo "(You can find it in Google Cloud Console)"
    read -r api_key
    
    if [ -n "$api_key" ]; then
        export GOOGLE_MAPS_API_KEY="$api_key"
        echo "✅ API key set for this session"
        echo ""
        echo "To make it permanent, add this to your ~/.zshrc:"
        echo "export GOOGLE_MAPS_API_KEY=\"$api_key\""
    else
        echo "❌ No API key provided"
        exit 1
    fi
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo ""
echo "🚀 Starting PHP development server..."
echo ""

# Start PHP server
cd "$(dirname "$0")"
php -S localhost:8000

# The script will keep running until you press Ctrl+C
