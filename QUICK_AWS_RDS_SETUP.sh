#!/bin/bash
# Quick AWS RDS Setup Script

echo "🚀 AWS RDS PostgreSQL Setup"
echo "============================"
echo ""
echo "Your RDS Endpoint: database-1.cluster-ckzyy4eccgqg.us-east-1.rds.amazonaws.com"
echo ""
echo "Please provide the following information:"
echo ""

read -p "Database Username (usually 'postgres'): " DB_USER
read -sp "Database Password: " DB_PASS
echo ""
read -p "Database Name (default: 'postgres'): " DB_NAME
DB_NAME=${DB_NAME:-postgres}

echo ""
echo "📝 Constructing connection string..."
DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@database-1.cluster-ckzyy4eccgqg.us-east-1.rds.amazonaws.com:5432/${DB_NAME}?sslmode=require"

echo ""
echo "✅ Connection string created!"
echo ""
echo "🔧 Next steps:"
echo ""
echo "1. Set environment variable:"
echo "   export DATABASE_URL=\"${DATABASE_URL}\""
echo ""
echo "2. Or update Railway Variables:"
echo "   DATABASE_URL=${DATABASE_URL}"
echo ""
echo "3. Test connection:"
echo "   DATABASE_URL=\"${DATABASE_URL}\" node test-aws-rds-connection.js"
echo ""
echo "4. Push schema:"
echo "   DATABASE_URL=\"${DATABASE_URL}\" npm run db:push"
echo ""
echo "5. Restart server:"
echo "   pm2 restart mekness-api"
echo ""




