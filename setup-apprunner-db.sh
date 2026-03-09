#!/bin/bash

echo "🗄️ AWS App Runner PostgreSQL Database Setup"
echo "=========================================="
echo ""

# RDS Configuration
RDS_HOST="database-1.ckzyy4eccgqg.us-east-1.rds.amazonaws.com"
RDS_PORT="5432"

echo "📋 Please provide your RDS database credentials:"
echo ""

read -p "👤 Database Username: " DB_USER
read -s -p "🔒 Database Password: " DB_PASS
echo ""
read -p "🗄️  Database Name: " DB_NAME

echo ""
echo "🔗 Creating DATABASE_URL for AWS App Runner..."

# Create the DATABASE_URL with SSL (required for AWS RDS)
DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@${RDS_HOST}:${RDS_PORT}/${DB_NAME}?sslmode=require"

echo ""
echo "✅ Generated DATABASE_URL:"
echo "${DATABASE_URL}"
echo ""

echo "📝 Update your App Runner environment variables:"
echo ""
echo "1. Go to AWS App Runner Console"
echo "2. Select your service"
echo "3. Go to 'Configuration' → 'Environment variables'"
echo "4. Add/update these variables:"
echo ""
echo "   DATABASE_URL=${DATABASE_URL}"
echo "   SESSION_SECRET=binofox-production-session-secret-$(date +%s)"
echo "   NODE_ENV=production"
echo "   PORT=5000"
echo ""

echo "🚀 After updating environment variables:"
echo "   - Redeploy your App Runner service"
echo "   - The database will automatically connect"
echo ""

echo "🔍 Database connection will be established with:"
echo "   - SSL encryption (required for AWS RDS)"
echo "   - Connection pooling (managed by App Runner)"
echo "   - Automatic retries on connection failures"
echo "   - Health checks during startup"
