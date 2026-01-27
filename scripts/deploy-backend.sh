#!/bin/bash
# Deploy PassAddis Backend to AWS Elastic Beanstalk
# Usage: ./scripts/deploy-backend.sh

set -e

echo "🚀 PassAddis Backend Deployment Script"
echo "========================================"

# Check if we're in the project root
if [ ! -d "backend" ]; then
    echo "❌ Error: Run this script from the project root directory"
    exit 1
fi

cd backend

echo "📦 Installing dependencies..."
npm ci

echo "🔧 Generating Prisma Client..."
npx prisma generate

echo "🏗️  Building application..."
npm run build

echo "📁 Creating deployment package..."
rm -rf deploy deploy.zip
mkdir -p deploy

# Copy required files
cp -r dist deploy/
cp -r prisma deploy/
cp package.json deploy/
cp package-lock.json deploy/

# Create Procfile
echo "web: npm run start:prod" > deploy/Procfile

# Create .ebextensions
mkdir -p deploy/.ebextensions
cat > deploy/.ebextensions/nodecommand.config << 'EOF'
option_settings:
  aws:elasticbeanstalk:container:nodejs:
    NodeCommand: "npm run start:prod"
  aws:elasticbeanstalk:application:environment:
    NODE_ENV: production
EOF

# Create zip
cd deploy
zip -r ../deploy.zip .
cd ..

echo "✅ Deployment package created: backend/deploy.zip"
echo ""
echo "📤 To deploy to AWS Elastic Beanstalk:"
echo ""
echo "Option 1: Using EB CLI (if installed)"
echo "  eb deploy passaddis-dev-backend-env --staged"
echo ""
echo "Option 2: Using AWS Console"
echo "  1. Go to AWS Elastic Beanstalk Console"
echo "  2. Select 'passaddis-dev-backend-env'"
echo "  3. Click 'Upload and Deploy'"
echo "  4. Upload backend/deploy.zip"
echo "  5. Click 'Deploy'"
echo ""
echo "Option 3: Using AWS CLI"
echo "  aws s3 cp deploy.zip s3://your-bucket/deploy.zip"
echo "  aws elasticbeanstalk create-application-version \\"
echo "    --application-name passaddis-dev-backend \\"
echo "    --version-label v\$(date +%Y%m%d%H%M%S) \\"
echo "    --source-bundle S3Bucket=your-bucket,S3Key=deploy.zip"
echo ""
echo "🔄 Don't forget to run database migrations after deployment:"
echo "  DATABASE_URL=your-prod-url npx prisma migrate deploy"
