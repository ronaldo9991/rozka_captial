#!/bin/bash

echo "🔧 RDS Database Connection Setup"
echo "================================"
echo ""

# RDS Endpoint
RDS_HOST="database-1.ckzyy4eccgqg.us-east-1.rds.amazonaws.com"
RDS_PORT="5432"

echo "📝 Please provide your RDS database credentials:"
echo ""

read -p "👤 Database Username: " DB_USER
read -s -p "🔒 Database Password: " DB_PASS
echo ""
read -p "🗄️  Database Name: " DB_NAME

echo ""
echo "🔗 Creating DATABASE_URL for RDS connection..."

# Create the DATABASE_URL
DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@${RDS_HOST}:${RDS_PORT}/${DB_NAME}?sslmode=require"

echo ""
echo "✅ Generated DATABASE_URL:"
echo "${DATABASE_URL}"
echo ""

echo "📋 To update your .env file, replace the current DATABASE_URL line with:"
echo "DATABASE_URL=${DATABASE_URL}"
echo ""

echo "🚀 After updating .env, restart your application with: npm run dev"
