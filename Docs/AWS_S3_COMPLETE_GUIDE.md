# 🚀 AWS S3 for InSite - Complete Guide

## Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# 1. Configure AWS CLI first
aws configure

# 2. Run the automated setup script
cd /Users/ilyessmoudden/Documents/Insite/Map
./setup-aws-s3.sh
```

### Option 2: Manual Setup

Follow the steps in `AWS_S3_SETUP_GUIDE.md`

---

## Prerequisites

✅ AWS Account (free tier available)  
✅ AWS CLI installed (✅ already installed)  
✅ AWS credentials configured

---

## AWS CLI Configuration

Before running the setup script, configure AWS CLI:

```bash
aws configure
```

**You'll need:**
1. **AWS Access Key ID** - From AWS Console → IAM → Users → Security credentials
2. **AWS Secret Access Key** - Same location
3. **Default region** - Use `us-east-1`
4. **Default output format** - Use `json`

### Get AWS Credentials

1. Go to https://console.aws.amazon.com/iam/
2. Click "Users" → "Create user"
3. Enable "Provide user access to the AWS Management Console"
4. Click "Next" → Attach "AmazonS3FullAccess" policy
5. Create user and download/save credentials
6. Run `aws configure` and enter the credentials

---

## What the Setup Does

The `setup-aws-s3.sh` script will automatically:

1. ✅ Check AWS CLI configuration
2. ✅ Create S3 bucket: `insite-data-storage`
3. ✅ Enable public read access
4. ✅ Set bucket policy
5. ✅ Configure CORS
6. ✅ Upload all data files (~140 MB)
7. ✅ Display example URLs

**Estimated time:** 5-10 minutes (depending on upload speed)

---

## File Structure After Upload

```
s3://insite-data-storage/
├── georgia_zipcodes_enriched.geojson (60.9 MB)
├── USPS_Zip_Codes_enriched_CLEAN.geojson (3.5 MB)
└── Data/
    ├── City_of_Atlanta_Parks.geojson
    ├── MARTA_Routes.geojson
    ├── MARTA_Rail_Stations_*.geojson
    ├── MARTA/
    │   ├── agency.txt
    │   ├── routes.txt
    │   ├── stops.txt
    │   └── ... (GTFS files)
    ├── CobbLinc/
    ├── Gwinnett_County_Transit/
    └── Xpress/
```

---

## Your Data URLs

After setup, files are accessible at:

**Base URL:** `https://insite-data-storage.s3.amazonaws.com/`

**Examples:**
```
https://insite-data-storage.s3.amazonaws.com/USPS_Zip_Codes_enriched_CLEAN.geojson
https://insite-data-storage.s3.amazonaws.com/Data/City_of_Atlanta_Parks.geojson
https://insite-data-storage.s3.amazonaws.com/Data/MARTA/stops.txt
```

---

## Using AWS S3 in Your App

### 1. Update index.html

Replace the cloud-config.js script tag with aws-s3-config.js:

```html
<!-- Replace this -->
<script src="cloud-config.js"></script>

<!-- With this -->
<script src="aws-s3-config.js"></script>
```

### 2. Update Data Loading

Change `INSITE_CLOUD_CONFIG` to `INSITE_S3_CONFIG`:

```javascript
// Before (Google Cloud)
const url = INSITE_CLOUD_CONFIG.getUrl(INSITE_CLOUD_CONFIG.ZIP_CODES.USPS_CLEAN);

// After (AWS S3)
const url = INSITE_S3_CONFIG.getUrl(INSITE_S3_CONFIG.ZIP_CODES.USPS_CLEAN);
```

### 3. Test Your App

Open `index.html` and check the browser console for:
```
✅ Loaded data from AWS S3
```

---

## Cost Breakdown

### Storage Costs
- **First 50 GB:** $0.023/GB/month
- **Your usage (140 MB):** ~$0.003/month

### Request Costs
- **First 2,000 GET requests:** FREE every month
- **After 2,000:** $0.0004 per 1,000 requests
- **Your typical usage:** $0.00-0.05/month

### Data Transfer
- **First 100 GB out:** FREE every month
- **After 100 GB:** $0.09/GB
- **Your typical usage:** FREE (under 100 GB)

### Total Monthly Cost
**Typical: $0.10 - $0.50/month**  
**Maximum (high traffic): < $2/month**

---

## AWS S3 vs Google Cloud Storage

| Feature | AWS S3 | Google Cloud Storage |
|---------|--------|----------------------|
| **Cost (140 MB)** | $0.003/month | $0.003/month |
| **Free Tier** | 5 GB storage, 20k GET requests | 5 GB storage, 1 GB bandwidth |
| **Request Cost** | $0.0004/1k after 2k | $0.004/10k |
| **CDN Integration** | CloudFront | Cloud CDN |
| **Popularity** | Most widely used | Growing |
| **Setup Complexity** | Moderate | Moderate |

**Both are excellent choices!** AWS S3 is slightly more popular and has a larger free tier for requests.

---

## Advanced Features

### Enable CloudFront CDN (Optional)

For even faster global delivery:

```bash
# Create CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name insite-data-storage.s3.amazonaws.com \
  --default-root-object index.html
```

### Enable Server-Side Encryption

```bash
aws s3api put-bucket-encryption \
  --bucket insite-data-storage \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'
```

### Set Cache Control Headers

```bash
# Upload with cache headers
aws s3 cp georgia_zipcodes_enriched.geojson s3://insite-data-storage/ \
  --cache-control "max-age=86400, public" \
  --acl public-read
```

---

## Useful Commands

### List all files
```bash
aws s3 ls s3://insite-data-storage/ --recursive --human-readable
```

### Upload a single file
```bash
aws s3 cp myfile.geojson s3://insite-data-storage/ --acl public-read
```

### Upload entire directory
```bash
aws s3 sync Data/ s3://insite-data-storage/Data/ --acl public-read
```

### Delete a file
```bash
aws s3 rm s3://insite-data-storage/filename.geojson
```

### Download a file
```bash
aws s3 cp s3://insite-data-storage/filename.geojson ./
```

### Check bucket size and file count
```bash
aws s3 ls s3://insite-data-storage --recursive --summarize | tail -2
```

### Make a file private
```bash
aws s3api put-object-acl --bucket insite-data-storage \
  --key filename.geojson --acl private
```

---

## Troubleshooting

### Error: "Unable to locate credentials"
**Solution:** Run `aws configure` and enter your credentials

### Error: "BucketAlreadyExists"
**Solution:** Bucket names are globally unique. Choose a different name like `insite-data-storage-[your-initials]`

### Error: "Access Denied"
**Solution:** Check that your IAM user has `AmazonS3FullAccess` policy attached

### Files not accessible publicly
**Solution:**
```bash
# Verify bucket policy
aws s3api get-bucket-policy --bucket insite-data-storage

# Re-apply public access
./setup-aws-s3.sh
```

### CORS errors in browser
**Solution:**
```bash
# Verify CORS configuration
aws s3api get-bucket-cors --bucket insite-data-storage

# Re-apply CORS
aws s3api put-bucket-cors --bucket insite-data-storage --cors-configuration file://cors-s3.json
```

---

## Monitoring & Analytics

### View bucket in AWS Console
https://s3.console.aws.amazon.com/s3/buckets/insite-data-storage

### Enable access logging (Optional)
```bash
aws s3api put-bucket-logging \
  --bucket insite-data-storage \
  --bucket-logging-status '{
    "LoggingEnabled": {
      "TargetBucket": "insite-data-storage",
      "TargetPrefix": "logs/"
    }
  }'
```

### View CloudWatch metrics
https://console.aws.amazon.com/cloudwatch/

---

## Security Best Practices

1. ✅ Only make necessary files public
2. ✅ Use IAM roles instead of root credentials
3. ✅ Enable MFA for AWS account
4. ✅ Regularly rotate access keys
5. ✅ Monitor access with CloudTrail
6. ✅ Enable versioning for important data

---

## Next Steps

1. ✅ Configure AWS CLI: `aws configure`
2. ✅ Run setup script: `./setup-aws-s3.sh`
3. ✅ Update your app to use `aws-s3-config.js`
4. ✅ Test in browser
5. ✅ Deploy to production

**Ready to get started?** Run `./setup-aws-s3.sh` now!

---

## Support Resources

- **AWS S3 Documentation:** https://docs.aws.amazon.com/s3/
- **AWS CLI Reference:** https://awscli.amazonaws.com/v2/documentation/api/latest/reference/s3/index.html
- **Pricing Calculator:** https://calculator.aws/
- **Free Tier Details:** https://aws.amazon.com/free/

---

**Questions?** Check the troubleshooting section or AWS documentation!
