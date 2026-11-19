# 🚀 AWS S3 Setup Guide for InSite

## Step 1: Configure AWS CLI

You need to configure AWS CLI with your credentials. Run this command:

```bash
aws configure
```

You'll be prompted for:
1. **AWS Access Key ID**: Get from AWS Console → IAM → Users → Security credentials
2. **AWS Secret Access Key**: Same location as above
3. **Default region name**: Use `us-east-1` (recommended for best performance)
4. **Default output format**: Use `json`

### Don't have AWS credentials yet?

1. Go to https://aws.amazon.com/
2. Sign in or create an account
3. Go to IAM Console: https://console.aws.amazon.com/iam/
4. Click "Users" → "Add user"
5. Create user with "Programmatic access"
6. Attach policy: `AmazonS3FullAccess`
7. Save the Access Key ID and Secret Access Key

---

## Step 2: Create S3 Bucket

Once configured, run these commands:

```bash
# Create the S3 bucket (change region if needed)
aws s3 mb s3://insite-data-storage --region us-east-1

# Enable public access for read operations
aws s3api put-public-access-block \
  --bucket insite-data-storage \
  --public-access-block-configuration \
  "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

# Set bucket policy for public read access
aws s3api put-bucket-policy --bucket insite-data-storage --policy '{
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
}'
```

---

## Step 3: Configure CORS

```bash
aws s3api put-bucket-cors --bucket insite-data-storage --cors-configuration '{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3600
    }
  ]
}'
```

---

## Step 4: Upload Data Files

```bash
cd /Users/ilyessmoudden/Documents/Insite/Map

# Upload all data files
aws s3 sync Data/ s3://insite-data-storage/Data/ --acl public-read

# Upload large GeoJSON files
aws s3 cp georgia_zipcodes_enriched.geojson s3://insite-data-storage/ --acl public-read
aws s3 cp USPS_Zip_Codes_enriched_CLEAN.geojson s3://insite-data-storage/ --acl public-read
```

---

## Step 5: Verify Upload

```bash
# List files in bucket
aws s3 ls s3://insite-data-storage/ --recursive --human-readable

# Test a file URL in browser
echo "Test this URL: https://insite-data-storage.s3.amazonaws.com/USPS_Zip_Codes_enriched_CLEAN.geojson"
```

---

## Your Data URLs

After upload, your files will be accessible at:

**Base URL:** `https://insite-data-storage.s3.amazonaws.com/`

Or with region-specific URL:
**Base URL:** `https://insite-data-storage.s3.us-east-1.amazonaws.com/`

**Examples:**
```
https://insite-data-storage.s3.amazonaws.com/georgia_zipcodes_enriched.geojson
https://insite-data-storage.s3.amazonaws.com/USPS_Zip_Codes_enriched_CLEAN.geojson
https://insite-data-storage.s3.amazonaws.com/Data/City_of_Atlanta_Parks.geojson
https://insite-data-storage.s3.amazonaws.com/Data/MARTA_Routes.geojson
```

---

## Cost Estimate

**Storage:** 
- First 50 GB: $0.023/GB/month
- 140 MB = ~$0.003/month

**Requests:**
- First 2,000 GET requests: FREE
- After: $0.0004 per 1,000 requests

**Data Transfer:**
- First 100 GB out: FREE
- After: $0.09/GB

**Total Monthly Cost: < $1** (typically $0.10-0.30 for your usage)

---

## Next Steps

Once you've completed the above steps, I'll update your application files to use AWS S3 URLs.

**Ready?** Just let me know when you've:
1. ✅ Configured AWS CLI (`aws configure`)
2. ✅ Created the S3 bucket
3. ✅ Set public access and CORS
4. ✅ Uploaded the files

Then I'll update your `index.html` and create new config files!
