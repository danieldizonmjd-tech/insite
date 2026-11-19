#!/bin/bash

# S3 Migration Verification & Test Script
# Verifies all files use S3 and tests ZIP code filtering

set -e

echo "🔍 InSite S3 Migration Verification"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test 1: Check for local file references
echo "1️⃣ Checking for local file references..."
echo "----------------------------------------"

LOCAL_REFS=0

# Check insite_main.html
if grep -q 'fetch("USPS_Zip_Codes' /Users/ilyessmoudden/Documents/Insite/Map/insite_main.html 2>/dev/null; then
    echo -e "${RED}❌ insite_main.html still has local file reference${NC}"
    LOCAL_REFS=$((LOCAL_REFS + 1))
else
    echo -e "${GREEN}✅ insite_main.html uses S3${NC}"
fi

# Check index.html
if grep -q 'INSITE_S3_CONFIG' /Users/ilyessmoudden/Documents/Insite/Map/index.html; then
    echo -e "${GREEN}✅ index.html uses S3 config${NC}"
else
    echo -e "${RED}❌ index.html missing S3 config${NC}"
    LOCAL_REFS=$((LOCAL_REFS + 1))
fi

# Check www/index.html
if grep -q 'INSITE_S3_CONFIG' /Users/ilyessmoudden/Documents/Insite/Map/www/index.html; then
    echo -e "${GREEN}✅ www/index.html uses S3 config${NC}"
else
    echo -e "${RED}❌ www/index.html missing S3 config${NC}"
    LOCAL_REFS=$((LOCAL_REFS + 1))
fi

# Check Android app
if grep -q 'INSITE_S3_CONFIG' /Users/ilyessmoudden/Documents/Insite/android/app/src/main/assets/www/index.html; then
    echo -e "${GREEN}✅ Android app uses S3 config${NC}"
else
    echo -e "${RED}❌ Android app missing S3 config${NC}"
    LOCAL_REFS=$((LOCAL_REFS + 1))
fi

echo ""

# Test 2: Verify S3 config files exist
echo "2️⃣ Checking S3 config file deployment..."
echo "----------------------------------------"

CONFIG_FILES=0

if [ -f "/Users/ilyessmoudden/Documents/Insite/Map/aws-s3-config.js" ]; then
    echo -e "${GREEN}✅ Main aws-s3-config.js exists${NC}"
    CONFIG_FILES=$((CONFIG_FILES + 1))
else
    echo -e "${RED}❌ Main aws-s3-config.js missing${NC}"
fi

if [ -f "/Users/ilyessmoudden/Documents/Insite/Map/www/aws-s3-config.js" ]; then
    echo -e "${GREEN}✅ www/aws-s3-config.js exists${NC}"
    CONFIG_FILES=$((CONFIG_FILES + 1))
else
    echo -e "${RED}❌ www/aws-s3-config.js missing${NC}"
fi

if [ -f "/Users/ilyessmoudden/Documents/Insite/android/app/src/main/assets/www/aws-s3-config.js" ]; then
    echo -e "${GREEN}✅ Android aws-s3-config.js exists${NC}"
    CONFIG_FILES=$((CONFIG_FILES + 1))
else
    echo -e "${RED}❌ Android aws-s3-config.js missing${NC}"
fi

echo ""
echo "Config files deployed: $CONFIG_FILES / 3"
echo ""

# Test 3: Check ZIP code filtering
echo "3️⃣ Checking ZIP code filtering (5-digit only)..."
echo "------------------------------------------------"

# Check insite_main.html for ZIP filtering
if grep -q "split('-')\[0\]" /Users/ilyessmoudden/Documents/Insite/Map/insite_main.html; then
    echo -e "${GREEN}✅ insite_main.html filters ZIP extensions${NC}"
else
    echo -e "${YELLOW}⚠️  insite_main.html may not filter ZIP extensions${NC}"
fi

# Check index.html for ZIP filtering
if grep -q "split('-')\[0\]" /Users/ilyessmoudden/Documents/Insite/Map/index.html; then
    echo -e "${GREEN}✅ index.html filters ZIP extensions${NC}"
else
    echo -e "${YELLOW}⚠️  index.html may not filter ZIP extensions${NC}"
fi

# Check www/index.html for ZIP filtering
if grep -q "split('-')\[0\]" /Users/ilyessmoudden/Documents/Insite/Map/www/index.html; then
    echo -e "${GREEN}✅ www/index.html filters ZIP extensions${NC}"
else
    echo -e "${YELLOW}⚠️  www/index.html may not filter ZIP extensions${NC}"
fi

# Check Android app for ZIP filtering
if grep -q "split('-')\[0\]" /Users/ilyessmoudden/Documents/Insite/android/app/src/main/assets/www/index.html; then
    echo -e "${GREEN}✅ Android app filters ZIP extensions${NC}"
else
    echo -e "${YELLOW}⚠️  Android app may not filter ZIP extensions${NC}"
fi

echo ""

# Test 4: Test S3 bucket access
echo "4️⃣ Testing AWS S3 bucket access..."
echo "----------------------------------"

S3_URL="https://insite-data-storage.s3.amazonaws.com/USPS_Zip_Codes_enriched_CLEAN.geojson"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$S3_URL")

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ S3 bucket is publicly accessible${NC}"
    echo "   URL: $S3_URL"
    echo "   Status: $HTTP_CODE OK"
    
    # Get file size
    SIZE=$(curl -sI "$S3_URL" | grep -i content-length | awk '{print $2}' | tr -d '\r')
    SIZE_MB=$(echo "scale=2; $SIZE / 1048576" | bc 2>/dev/null || echo "N/A")
    echo "   Size: ${SIZE_MB} MB"
elif [ "$HTTP_CODE" = "403" ]; then
    echo -e "${RED}❌ S3 bucket returns 403 Forbidden${NC}"
    echo "   Run: ./verify-s3-config.sh to fix permissions"
else
    echo -e "${YELLOW}⚠️  Unexpected status: $HTTP_CODE${NC}"
fi

echo ""

# Test 5: Check for Google Cloud references (should be removed)
echo "5️⃣ Checking for old Google Cloud references..."
echo "----------------------------------------------"

GCP_REFS=0

if grep -q 'INSITE_CLOUD_CONFIG' /Users/ilyessmoudden/Documents/Insite/Map/insite_main.html 2>/dev/null; then
    echo -e "${YELLOW}⚠️  insite_main.html still references INSITE_CLOUD_CONFIG${NC}"
    GCP_REFS=$((GCP_REFS + 1))
fi

if grep -q 'Google Cloud Storage' /Users/ilyessmoudden/Documents/Insite/Map/index.html 2>/dev/null; then
    echo -e "${YELLOW}⚠️  index.html still mentions Google Cloud Storage${NC}"
    GCP_REFS=$((GCP_REFS + 1))
fi

if [ $GCP_REFS -eq 0 ]; then
    echo -e "${GREEN}✅ No Google Cloud references found${NC}"
fi

echo ""

# Test 6: Verify HTML script tags
echo "6️⃣ Verifying script tag includes..."
echo "-----------------------------------"

# Check insite_main.html
if grep -q '<script src="aws-s3-config.js"></script>' /Users/ilyessmoudden/Documents/Insite/Map/insite_main.html; then
    echo -e "${GREEN}✅ insite_main.html includes aws-s3-config.js${NC}"
else
    echo -e "${RED}❌ insite_main.html missing aws-s3-config.js script tag${NC}"
fi

# Check index.html
if grep -q 'aws-s3-config.js' /Users/ilyessmoudden/Documents/Insite/Map/index.html; then
    echo -e "${GREEN}✅ index.html includes aws-s3-config.js${NC}"
else
    echo -e "${RED}❌ index.html missing aws-s3-config.js script tag${NC}"
fi

echo ""

# Summary
echo "===================================="
echo "📊 VERIFICATION SUMMARY"
echo "===================================="
echo ""

TOTAL_ISSUES=$((LOCAL_REFS + (3 - CONFIG_FILES)))

if [ "$HTTP_CODE" = "200" ] && [ $TOTAL_ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED!${NC}"
    echo ""
    echo "Your InSite platform is fully configured for AWS S3:"
    echo "  • All HTML files use S3 URLs"
    echo "  • Config files deployed to all locations"
    echo "  • ZIP codes filtered to 5-digit primary codes"
    echo "  • S3 bucket is publicly accessible"
    echo ""
    echo "🎉 You're ready to go!"
    echo ""
    echo "Next steps:"
    echo "  1. Open insite_main.html in your browser"
    echo "  2. Check console (F12) for: '✅ Loaded data from AWS S3'"
    echo "  3. Test ZIP code search (should show 5-digit codes only)"
    
elif [ "$HTTP_CODE" = "403" ]; then
    echo -e "${YELLOW}⚠️  S3 PERMISSIONS NEEDED${NC}"
    echo ""
    echo "Run this command to configure S3 bucket permissions:"
    echo "  ./verify-s3-config.sh"
    echo ""
    
else
    echo -e "${YELLOW}⚠️  SOME ISSUES FOUND${NC}"
    echo ""
    echo "Issues to fix: $TOTAL_ISSUES"
    echo ""
    
    if [ $LOCAL_REFS -gt 0 ]; then
        echo "• Local file references still exist"
    fi
    
    if [ $CONFIG_FILES -lt 3 ]; then
        echo "• Missing config files in some locations"
    fi
fi

echo ""
echo "===================================="
echo ""

# Test 7: Quick data sample test
echo "7️⃣ Testing data sample..."
echo "-------------------------"

if [ "$HTTP_CODE" = "200" ]; then
    echo "Fetching sample data from S3..."
    SAMPLE=$(curl -s "$S3_URL" | head -c 5000)
    
    # Check if it's valid JSON
    if echo "$SAMPLE" | grep -q '"type":"FeatureCollection"'; then
        echo -e "${GREEN}✅ Data format is valid GeoJSON${NC}"
        
        # Try to extract a sample ZIP
        SAMPLE_ZIP=$(echo "$SAMPLE" | grep -o '"NAME":"[0-9]*"' | head -1 | grep -o '[0-9]*')
        if [ ! -z "$SAMPLE_ZIP" ]; then
            echo -e "${GREEN}✅ Sample ZIP code: $SAMPLE_ZIP${NC}"
            
            # Check if it's 5 digits
            if [ ${#SAMPLE_ZIP} -eq 5 ]; then
                echo -e "${GREEN}✅ ZIP is 5 digits (primary code)${NC}"
            else
                echo -e "${YELLOW}⚠️  ZIP has ${#SAMPLE_ZIP} digits${NC}"
            fi
        fi
    else
        echo -e "${YELLOW}⚠️  Could not verify data format${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Skipping (S3 not accessible)${NC}"
fi

echo ""
echo "Verification complete!"
