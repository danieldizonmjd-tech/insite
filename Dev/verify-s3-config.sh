#!/bin/bash

# AWS S3 Configuration Verification Script
# This script helps you verify and configure your S3 bucket for public access

set -e

BUCKET_NAME="insite-data-storage"
REGION="us-east-1"

echo "🔍 AWS S3 Configuration Verification"
echo "======================================"
echo ""

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI is not configured or credentials are invalid"
    echo ""
    echo "Please run: aws configure"
    exit 1
fi

echo "✅ AWS CLI is configured"
echo ""

# Check if bucket exists
if aws s3api head-bucket --bucket $BUCKET_NAME 2>/dev/null; then
    echo "✅ Bucket '$BUCKET_NAME' exists"
else
    echo "❌ Bucket '$BUCKET_NAME' does not exist"
    echo ""
    echo "Creating bucket..."
    aws s3api create-bucket --bucket $BUCKET_NAME --region $REGION
    echo "✅ Bucket created"
fi

echo ""
echo "📋 Current Bucket Configuration:"
echo "--------------------------------"

# Check public access block
echo ""
echo "1️⃣ Public Access Block Settings:"
aws s3api get-public-access-block --bucket $BUCKET_NAME 2>/dev/null || echo "   No public access block configured"

# Check bucket policy
echo ""
echo "2️⃣ Bucket Policy:"
aws s3api get-bucket-policy --bucket $BUCKET_NAME 2>/dev/null | jq -r '.Policy' || echo "   No bucket policy configured"

# Check CORS configuration
echo ""
echo "3️⃣ CORS Configuration:"
aws s3api get-bucket-cors --bucket $BUCKET_NAME 2>/dev/null | jq '.' || echo "   No CORS configuration"

echo ""
echo "================================"
echo "🔧 Fixing Configuration..."
echo "================================"
echo ""

# Step 1: Remove public access block
echo "1️⃣ Removing public access block..."
aws s3api delete-public-access-block --bucket $BUCKET_NAME
echo "✅ Public access block removed"
echo ""

# Step 2: Apply bucket policy for public read access
echo "2️⃣ Applying public read bucket policy..."
cat > /tmp/bucket-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::insite-data-storage/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file:///tmp/bucket-policy.json
echo "✅ Bucket policy applied"
echo ""

# Step 3: Apply CORS configuration
echo "3️⃣ Applying CORS configuration..."
if [ -f "cors-s3.json" ]; then
    aws s3api put-bucket-cors --bucket $BUCKET_NAME --cors-configuration file://cors-s3.json
    echo "✅ CORS configuration applied from cors-s3.json"
else
    cat > /tmp/cors-config.json << 'EOF'
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3600
    }
  ]
}
EOF
    aws s3api put-bucket-cors --bucket $BUCKET_NAME --cors-configuration file:///tmp/cors-config.json
    echo "✅ CORS configuration applied"
fi
echo ""

# Step 4: Test public access
echo "================================"
echo "🧪 Testing Public Access..."
echo "================================"
echo ""

TEST_FILE="USPS_Zip_Codes_enriched_CLEAN.geojson"
TEST_URL="https://${BUCKET_NAME}.s3.amazonaws.com/${TEST_FILE}"

echo "Testing URL: $TEST_URL"
echo ""

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$TEST_URL")

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ SUCCESS! Bucket is publicly accessible"
    echo ""
    echo "🎉 Your InSite data is now live at:"
    echo "   $TEST_URL"
    echo ""
    
    # List some files
    echo "📁 Sample files in bucket:"
    aws s3 ls s3://$BUCKET_NAME/ --recursive --human-readable | head -10
    
elif [ "$HTTP_CODE" = "403" ]; then
    echo "❌ FAILED: 403 Forbidden"
    echo ""
    echo "The bucket policy may need a few seconds to propagate."
    echo "Wait 30 seconds and try again:"
    echo ""
    echo "   curl -I $TEST_URL"
    echo ""
    echo "If still failing, check:"
    echo "1. AWS Console → S3 → $BUCKET_NAME → Permissions"
    echo "2. Ensure 'Block all public access' is OFF"
    echo "3. Ensure bucket policy allows public read"
    
elif [ "$HTTP_CODE" = "404" ]; then
    echo "⚠️  File not found: $TEST_FILE"
    echo ""
    echo "Upload your data files with:"
    echo "   ./setup-aws-s3.sh"
    
else
    echo "❌ Unexpected HTTP code: $HTTP_CODE"
fi

echo ""
echo "================================"
echo "📊 Bucket Statistics"
echo "================================"
echo ""

# Get bucket size and file count
aws s3 ls s3://$BUCKET_NAME --recursive --summarize --human-readable | tail -2

echo ""
echo "✅ Configuration complete!"
echo ""
echo "Next steps:"
echo "1. Test your InSite app in a browser"
echo "2. Check browser console for S3 loading confirmation"
echo "3. Monitor AWS CloudWatch for S3 metrics"
echo ""
echo "Helpful commands:"
echo "  • View files:  aws s3 ls s3://$BUCKET_NAME --recursive"
echo "  • Upload file: aws s3 cp file.json s3://$BUCKET_NAME/"
echo "  • Delete file: aws s3 rm s3://$BUCKET_NAME/file.json"
echo "  • Sync folder: aws s3 sync Data/ s3://$BUCKET_NAME/Data/"
