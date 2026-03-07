#!/bin/bash
# Quick Migration Script: Railway → AWS RDS

set -e

echo "🚀 Railway to AWS RDS Migration"
echo "================================"
echo ""

# Check if AWS_RDS_URL is set
if [ -z "$AWS_RDS_URL" ]; then
  echo "❌ AWS_RDS_URL not set!"
  echo ""
  echo "Please set it:"
  echo "export AWS_RDS_URL=\"postgresql://username:password@database-1.cluster-ckzyy4eccgqg.us-east-1.rds.amazonaws.com:5432/database_name?sslmode=require\""
  exit 1
fi

echo "📋 Step 1: Creating schema on AWS RDS..."
export DATABASE_URL="$AWS_RDS_URL"
npm run db:push

echo ""
echo "📋 Step 2: Migrating data..."
export RAILWAY_DATABASE_URL="postgresql://postgres:YxscShUJpmgzIAvcjnVVkYeWZpPKUkKt@shuttle.proxy.rlwy.net:23811/railway"
node migrate-to-aws-rds.js

echo ""
echo "✅ Migration complete!"
echo ""
echo "📋 Step 3: Update DATABASE_URL to AWS RDS"
echo "   Update Railway Variables or .env file:"
echo "   DATABASE_URL=$AWS_RDS_URL"
echo ""
echo "📋 Step 4: Restart server"
echo "   pm2 restart mekness-api"




