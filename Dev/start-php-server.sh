#!/bin/bash

# InSite PHP Development Server
# Starts a local PHP server to properly process insite_main.php

echo "🚀 Starting InSite PHP Development Server"
echo "=========================================="
echo ""

cd /Users/ilyessmoudden/Documents/Insite/Map

echo "📍 Location: $(pwd)"
echo "🌐 Server: http://localhost:8000"
echo "📄 Main App: http://localhost:8000/insite_main.php"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""
echo "Starting server..."
echo "=========================================="
echo ""

# Start PHP built-in web server
php -S localhost:8000

