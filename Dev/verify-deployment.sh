#!/bin/bash

# InSite Mobile - Pre-Deployment Verification Script
# Run this before deploying to Google Play Store

echo "🔍 InSite Mobile - Pre-Deployment Verification"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Track overall status
ERRORS=0
WARNINGS=0

# Check if we're in the right directory
if [ ! -f "insite_main_mobile.html" ]; then
    echo -e "${RED}❌ ERROR: insite_main_mobile.html not found!${NC}"
    echo "Please run this script from the Map directory"
    exit 1
fi

echo "📱 Checking main application file..."
if [ -f "insite_main_mobile.html" ]; then
    LINES=$(wc -l < insite_main_mobile.html)
    echo -e "${GREEN}✅ insite_main_mobile.html found ($LINES lines)${NC}"
else
    echo -e "${RED}❌ insite_main_mobile.html missing${NC}"
    ((ERRORS++))
fi

echo ""
echo "📊 Checking data files..."
if [ -f "USPS_Zip_Codes_enriched.geojson" ]; then
    SIZE=$(du -h USPS_Zip_Codes_enriched.geojson | cut -f1)
    echo -e "${GREEN}✅ USPS_Zip_Codes_enriched.geojson found ($SIZE)${NC}"
else
    echo -e "${RED}❌ USPS_Zip_Codes_enriched.geojson missing${NC}"
    ((ERRORS++))
fi

echo ""
echo "🖼️ Checking assets..."
if [ -f "insite_new_logo.png" ]; then
    echo -e "${GREEN}✅ insite_new_logo.png found${NC}"
else
    echo -e "${RED}❌ insite_new_logo.png missing${NC}"
    ((ERRORS++))
fi

echo ""
echo "📱 Checking PWA files..."
FILES=("manifest.json" "service-worker.js" "privacy-policy.html")
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file found${NC}"
    else
        echo -e "${RED}❌ $file missing${NC}"
        ((ERRORS++))
    fi
done

echo ""
echo "🔧 Checking Capacitor configuration..."
if [ -f "capacitor.config.json" ]; then
    echo -e "${GREEN}✅ capacitor.config.json found${NC}"
    
    # Check for required fields
    if grep -q "com.insiteatl.mobile" capacitor.config.json; then
        echo -e "${GREEN}   ✓ App ID configured${NC}"
    else
        echo -e "${YELLOW}   ⚠ App ID not found${NC}"
        ((WARNINGS++))
    fi
else
    echo -e "${RED}❌ capacitor.config.json missing${NC}"
    ((ERRORS++))
fi

echo ""
echo "🔒 Checking security features..."

# Check for sanitization function
if grep -q "function sanitizeInput" insite_main_mobile.html; then
    echo -e "${GREEN}✅ Input sanitization implemented${NC}"
else
    echo -e "${RED}❌ Input sanitization missing${NC}"
    ((ERRORS++))
fi

# Check for ZIP validation
if grep -q "function isValidZipCode" insite_main_mobile.html; then
    echo -e "${GREEN}✅ ZIP code validation implemented${NC}"
else
    echo -e "${RED}❌ ZIP code validation missing${NC}"
    ((ERRORS++))
fi

# Check for CSP header
if grep -q "Content-Security-Policy" insite_main_mobile.html; then
    echo -e "${GREEN}✅ Content Security Policy configured${NC}"
else
    echo -e "${RED}❌ Content Security Policy missing${NC}"
    ((ERRORS++))
fi

# Check for try-catch blocks
TRYCATCH_COUNT=$(grep -c "try {" insite_main_mobile.html)
if [ "$TRYCATCH_COUNT" -ge 2 ]; then
    echo -e "${GREEN}✅ Error handling implemented ($TRYCATCH_COUNT try-catch blocks)${NC}"
else
    echo -e "${YELLOW}⚠ Limited error handling ($TRYCATCH_COUNT try-catch blocks)${NC}"
    ((WARNINGS++))
fi

echo ""
echo "🎨 Checking features..."

# Check for AI summary
if grep -q "generateAISummary" insite_main_mobile.html; then
    echo -e "${GREEN}✅ AI Summary feature implemented${NC}"
else
    echo -e "${YELLOW}⚠ AI Summary feature not found${NC}"
    ((WARNINGS++))
fi

# Check for neighborhood search
if grep -q "neighborhood" insite_main_mobile.html; then
    echo -e "${GREEN}✅ Neighborhood search implemented${NC}"
else
    echo -e "${YELLOW}⚠ Neighborhood search not found${NC}"
    ((WARNINGS++))
fi

echo ""
echo "📦 Checking deployment scripts..."
if [ -f "deploy-playstore.sh" ]; then
    if [ -x "deploy-playstore.sh" ]; then
        echo -e "${GREEN}✅ deploy-playstore.sh found and executable${NC}"
    else
        echo -e "${YELLOW}⚠ deploy-playstore.sh not executable (run: chmod +x deploy-playstore.sh)${NC}"
        ((WARNINGS++))
    fi
else
    echo -e "${RED}❌ deploy-playstore.sh missing${NC}"
    ((ERRORS++))
fi

echo ""
echo "📚 Checking documentation..."
DOCS=("PLAYSTORE_DEPLOYMENT_GUIDE.md" "SECURITY_FIXES.md" "DEPLOYMENT_READY_CHECKLIST.md")
for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        echo -e "${GREEN}✅ $doc found${NC}"
    else
        echo -e "${YELLOW}⚠ $doc missing${NC}"
        ((WARNINGS++))
    fi
done

echo ""
echo "=============================================="
echo "📊 VERIFICATION SUMMARY"
echo "=============================================="

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL CHECKS PASSED!${NC}"
    echo -e "${GREEN}✅ Your app is ready for Google Play Store deployment${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Run: ./deploy-playstore.sh"
    echo "2. Generate release keystore"
    echo "3. Build release AAB"
    echo "4. Test on physical devices"
    echo "5. Submit to Play Store"
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ $WARNINGS WARNING(S) FOUND${NC}"
    echo -e "${GREEN}✅ No critical errors - you can proceed with deployment${NC}"
    echo ""
    echo "Review warnings above and fix if needed."
else
    echo -e "${RED}❌ $ERRORS ERROR(S) FOUND${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠ $WARNINGS WARNING(S) FOUND${NC}"
    fi
    echo ""
    echo "Please fix the errors above before deploying."
    exit 1
fi

echo ""
echo "For detailed deployment instructions, see:"
echo "  📖 PLAYSTORE_DEPLOYMENT_GUIDE.md"
echo "  📋 DEPLOYMENT_READY_CHECKLIST.md"
echo ""

exit 0
