#!/bin/bash
# Complete Migration: Railway → AWS RDS
# This script does everything in one go

set -e

echo "🚀 Complete Database Migration: Railway → AWS RDS"
echo "=================================================="
echo ""

# Check AWS RDS URL
if [ -z "$AWS_RDS_URL" ]; then
  echo "❌ AWS_RDS_URL not set!"
  echo ""
  echo "Please provide your AWS RDS credentials:"
  echo ""
  read -p "Database Username (usually 'postgres'): " DB_USER
  read -sp "Database Password: " DB_PASS
  echo ""
  read -p "Database Name (default 'postgres'): " DB_NAME
  DB_NAME=${DB_NAME:-postgres}
  
  AWS_RDS_URL="postgresql://${DB_USER}:${DB_PASS}@database-1.cluster-ckzyy4eccgqg.us-east-1.rds.amazonaws.com:5432/${DB_NAME}?sslmode=require"
  export AWS_RDS_URL
fi

echo "📋 Step 1: Testing AWS RDS connection..."
export DATABASE_URL="$AWS_RDS_URL"
if node -e "import('pg').then(async ({Pool})=>{const p=new Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false}});await p.query('SELECT NOW()');await p.end();console.log('✅ Connected');process.exit(0);}).catch(e=>{console.error('❌',e.message);process.exit(1);})" 2>/dev/null; then
  echo "✅ AWS RDS connection successful"
else
  echo "❌ AWS RDS connection failed!"
  echo "   Check your credentials and security group settings"
  exit 1
fi

echo ""
echo "📋 Step 2: Creating schema on AWS RDS..."
npm run db:push

echo ""
echo "📋 Step 3: Importing all data (users, admins, passwords, everything)..."
node import-to-aws-rds.js

echo ""
echo "📋 Step 4: Updating DATABASE_URL..."
# Update .env if it exists
if [ -f .env ]; then
  sed -i "s|DATABASE_URL=.*|DATABASE_URL=$AWS_RDS_URL|" .env
  echo "✅ Updated .env file"
fi

echo ""
echo "📋 Step 5: Restarting server..."
pm2 restart mekness-api

echo ""
echo "✅ Migration Complete!"
echo ""
echo "📊 Summary:"
echo "   - All users migrated (with passwords)"
echo "   - All admin users migrated (with passwords)"
echo "   - All data migrated"
echo "   - Server restarted with AWS RDS"
echo ""
echo "🔍 Verify:"
echo "   pm2 logs mekness-api --lines 20"
echo "   You should see: '✅ PostgreSQL connection successful'"




