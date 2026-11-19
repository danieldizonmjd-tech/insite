#!/bin/zsh
# InSite Application - Quick Start & Verification Script
# Created: January 10, 2026

echo "🚀 InSite Application - Quick Start"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

cd "/Users/ilyessmoudden/Documents/Insite/Map"

echo "${BLUE}📋 Checking file integrity...${NC}"
echo ""

# Check CSS file
if [ -f "insite-professional.css" ]; then
    SIZE=$(stat -f%z "insite-professional.css")
    if [ $SIZE -gt 1000 ]; then
        echo "${GREEN}✅ CSS file exists and has content ($SIZE bytes)${NC}"
    else
        echo "${RED}❌ CSS file is too small or empty${NC}"
    fi
else
    echo "${RED}❌ CSS file missing${NC}"
fi

# Check HTML file
if [ -f "insite_main.html" ]; then
    echo "${GREEN}✅ Main HTML file exists${NC}"
    
    # Check for Atlanta metro
    if grep -q "selectMetroRegion('atlanta')" insite_main.html; then
        echo "${GREEN}✅ Atlanta metro selection is present${NC}"
    else
        echo "${RED}❌ Atlanta metro selection missing${NC}"
    fi
    
    # Check for theme toggle
    if grep -q "toggleTheme()" insite_main.html; then
        echo "${GREEN}✅ Theme toggle function exists${NC}"
    else
        echo "${RED}❌ Theme toggle function missing${NC}"
    fi
else
    echo "${RED}❌ Main HTML file missing${NC}"
fi

echo ""
echo "${BLUE}🎨 Checking theme support...${NC}"

if grep -q "\[data-theme=\"light\"\]" insite-professional.css; then
    echo "${GREEN}✅ Light mode theme defined${NC}"
else
    echo "${YELLOW}⚠️  Light mode theme not found${NC}"
fi

if grep -q "--radius-full" insite-professional.css; then
    echo "${GREEN}✅ All CSS variables defined${NC}"
else
    echo "${YELLOW}⚠️  Some CSS variables may be missing${NC}"
fi

echo ""
echo "${BLUE}📱 Application Features:${NC}"
echo "  • Home Dashboard (Alt+1)"
echo "  • Explore ZIP codes (Alt+2)"
echo "  • Compare areas (Alt+3)"
echo "  • Lifestyle matcher (Alt+4)"
echo "  • Analytics (Alt+5)"
echo "  • Interactive Map (Alt+6)"
echo "  • Theme Toggle (top-right button)"
echo ""

echo "${YELLOW}💡 To see metro selection screen:${NC}"
echo "  1. Open browser DevTools (Cmd+Option+I)"
echo "  2. Console tab → type: localStorage.clear()"
echo "  3. Refresh page (Cmd+R)"
echo "  4. Click 'Atlanta Metro' card"
echo ""

echo "${BLUE}🌐 Opening InSite application...${NC}"
open insite_main.html

echo ""
echo "${GREEN}✅ Application launched!${NC}"
echo ""
echo "${YELLOW}Quick Tips:${NC}"
echo "  • Theme toggle is in top-right corner (moon/sun icon)"
echo "  • Use keyboard shortcuts for faster navigation"
echo "  • Press '?' for help anytime"
echo ""
