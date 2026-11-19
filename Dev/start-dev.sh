#!/bin/bash

# INSITE Local Development Server
# This script starts the PHP development server for local testing

echo "╔════════════════════════════════════════════════════════╗"
echo "║          INSITE - Development Server                   ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "🚀 Starting PHP development server..."
echo ""
echo "📍 Server running at: http://localhost:8000"
echo ""
echo "📂 Files available:"
echo "   • http://localhost:8000/insite_main.html"
echo "   • http://localhost:8000/index.html"
echo "   • http://localhost:8000/diagnostic-api.html"
echo ""
echo "💡 Press Ctrl+C to stop the server"
echo ""
echo "════════════════════════════════════════════════════════"
echo ""

cd "$(dirname "$0")"
php -S localhost:8000
