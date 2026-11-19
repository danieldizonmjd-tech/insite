#!/bin/bash

echo "🚀 Starting Insite Map Server..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
  echo ""
fi

# Start the server
echo "⏳ Starting server on http://localhost:3000"
echo "📍 Auto-opening in browser in 2 seconds..."
echo ""

(sleep 2 && open http://localhost:3000) &
node server.js
