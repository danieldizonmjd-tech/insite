#!/bin/bash

#############################################
# InSite AWS S3 Setup Script
# Automates S3 bucket creation and file upload
#############################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BUCKET_NAME="insite-data-storage"
REGION="us-east-1"
DATA_DIR="/Users/ilyessmoudden/Documents/Insite/Map"

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    InSite AWS S3 Setup & Upload Script                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if AWS CLI is configured
echo -e "${YELLOW}Checking AWS CLI configuration...${NC}"
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not configured!${NC}"
    echo -e "${YELLOW}Please run: aws configure${NC}"
    echo ""
    echo "You'll need:"
    echo "  - AWS Access Key ID"
    echo "  - AWS Secret Access Key"
    echo "  - Default region (use: us-east-1)"
    echo "  - Default output format (use: json)"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ AWS CLI is configured${NC}"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${BLUE}   Account ID: ${ACCOUNT_ID}${NC}"
echo ""

# Create S3 bucket
echo -e "${YELLOW}Creating S3 bucket: ${BUCKET_NAME}...${NC}"
if aws s3 ls "s3://${BUCKET_NAME}" 2>&1 | grep -q 'NoSuchBucket'; then
    aws s3 mb "s3://${BUCKET_NAME}" --region "${REGION}"
    echo -e "${GREEN}✅ Bucket created successfully${NC}"
else
    echo -e "${BLUE}ℹ️  Bucket already exists${NC}"
fi
echo ""

# Enable public access
echo -e "${YELLOW}Configuring public access settings...${NC}"
aws s3api put-public-access-block \
    --bucket "${BUCKET_NAME}" \
    --public-access-block-configuration \
    "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"
echo -e "${GREEN}✅ Public access configured${NC}"
echo ""

# Set bucket policy for public read
echo -e "${YELLOW}Setting bucket policy for public read access...${NC}"
aws s3api put-bucket-policy --bucket "${BUCKET_NAME}" --policy "{
  \"Version\": \"2012-10-17\",
  \"Statement\": [
    {
      \"Sid\": \"PublicReadGetObject\",
      \"Effect\": \"Allow\",
      \"Principal\": \"*\",
      \"Action\": \"s3:GetObject\",
      \"Resource\": \"arn:aws:s3:::${BUCKET_NAME}/*\"
    }
  ]
}"
echo -e "${GREEN}✅ Bucket policy set${NC}"
echo ""

# Configure CORS
echo -e "${YELLOW}Configuring CORS...${NC}"
aws s3api put-bucket-cors --bucket "${BUCKET_NAME}" --cors-configuration '{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3600
    }
  ]
}'
echo -e "${GREEN}✅ CORS configured${NC}"
echo ""

# Upload files
echo -e "${YELLOW}Uploading data files to S3...${NC}"
echo -e "${BLUE}This may take a few minutes depending on file sizes...${NC}"
echo ""

cd "${DATA_DIR}"

# Upload Data directory
if [ -d "Data" ]; then
    echo -e "${BLUE}Uploading Data/ directory...${NC}"
    aws s3 sync Data/ "s3://${BUCKET_NAME}/Data/" \
        --acl public-read \
        --storage-class INTELLIGENT_TIERING
    echo -e "${GREEN}✅ Data/ directory uploaded${NC}"
fi

# Upload large GeoJSON files
if [ -f "georgia_zipcodes_enriched.geojson" ]; then
    echo -e "${BLUE}Uploading georgia_zipcodes_enriched.geojson...${NC}"
    aws s3 cp georgia_zipcodes_enriched.geojson "s3://${BUCKET_NAME}/" \
        --acl public-read \
        --storage-class INTELLIGENT_TIERING
    echo -e "${GREEN}✅ georgia_zipcodes_enriched.geojson uploaded${NC}"
fi

if [ -f "USPS_Zip_Codes_enriched_CLEAN.geojson" ]; then
    echo -e "${BLUE}Uploading USPS_Zip_Codes_enriched_CLEAN.geojson...${NC}"
    aws s3 cp USPS_Zip_Codes_enriched_CLEAN.geojson "s3://${BUCKET_NAME}/" \
        --acl public-read \
        --storage-class INTELLIGENT_TIERING
    echo -e "${GREEN}✅ USPS_Zip_Codes_enriched_CLEAN.geojson uploaded${NC}"
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           🎉 Setup Complete!                           ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Display bucket info
echo -e "${BLUE}📦 S3 Bucket Information:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "Bucket Name:  ${GREEN}${BUCKET_NAME}${NC}"
echo -e "Region:       ${GREEN}${REGION}${NC}"
echo -e "Base URL:     ${GREEN}https://${BUCKET_NAME}.s3.amazonaws.com${NC}"
echo -e "Console:      ${GREEN}https://s3.console.aws.amazon.com/s3/buckets/${BUCKET_NAME}${NC}"
echo ""

# Count files
FILE_COUNT=$(aws s3 ls "s3://${BUCKET_NAME}" --recursive | wc -l | tr -d ' ')
echo -e "${BLUE}📊 Upload Summary:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "Total files:  ${GREEN}${FILE_COUNT}${NC}"
echo ""

# Show example URLs
echo -e "${BLUE}🔗 Example URLs:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}https://${BUCKET_NAME}.s3.amazonaws.com/USPS_Zip_Codes_enriched_CLEAN.geojson${NC}"
echo -e "${GREEN}https://${BUCKET_NAME}.s3.amazonaws.com/Data/City_of_Atlanta_Parks.geojson${NC}"
echo -e "${GREEN}https://${BUCKET_NAME}.s3.amazonaws.com/Data/MARTA_Routes.geojson${NC}"
echo ""

echo -e "${YELLOW}✅ Next Steps:${NC}"
echo -e "1. Test URLs in your browser"
echo -e "2. Update your app to use aws-s3-config.js"
echo -e "3. Test your application"
echo ""
echo -e "${BLUE}For detailed documentation, see: AWS_S3_SETUP_GUIDE.md${NC}"
