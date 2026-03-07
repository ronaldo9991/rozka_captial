#!/bin/bash

# VPS Deployment Script for Mekness Project
# Usage: ./deploy-to-vps.sh

set -e

echo "🚀 Starting Mekness VPS Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SERVER_IP="67.227.198.100"
SERVER_USER="root"
SERVER_PATH="/var/www/html/new.mekness.com/"
PROJECT_DIR="d:\Project\Mekness Project"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Found project files${NC}"

# Step 1: Build the project
echo -e "${YELLOW}📦 Building project...${NC}"
npm ci
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Error: Build failed. dist/ directory not found.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully${NC}"

# Step 2: Create deployment package
echo -e "${YELLOW}📦 Creating deployment package...${NC}"
DEPLOY_DIR="deploy-package"
rm -rf $DEPLOY_DIR
mkdir -p $DEPLOY_DIR

# Copy necessary files
cp -r dist $DEPLOY_DIR/
cp package.json $DEPLOY_DIR/
cp package-lock.json $DEPLOY_DIR/
cp -r server $DEPLOY_DIR/ 2>/dev/null || true
cp -r shared $DEPLOY_DIR/ 2>/dev/null || true
cp drizzle.config.ts $DEPLOY_DIR/ 2>/dev/null || true
cp tsconfig.json $DEPLOY_DIR/ 2>/dev/null || true

# Create .env.example if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Warning: .env file not found. You'll need to create it on the server.${NC}"
fi

# Create deployment instructions
cat > $DEPLOY_DIR/DEPLOY_INSTRUCTIONS.txt << EOF
DEPLOYMENT INSTRUCTIONS
=======================

1. Extract this package on the server:
   tar -xzf deploy-package.tar.gz -C /var/www/html/new.mekness.com/

2. Navigate to the directory:
   cd /var/www/html/new.mekness.com/

3. Install dependencies:
   npm ci --production

4. Create .env file with your environment variables

5. Start with PM2:
   pm2 start dist/index.js --name mekness-app
   pm2 save

6. Configure Nginx reverse proxy (see VPS_DEPLOYMENT_GUIDE.md)

EOF

# Create tarball
echo -e "${YELLOW}📦 Creating tarball...${NC}"
tar -czf deploy-package.tar.gz -C $DEPLOY_DIR .

echo -e "${GREEN}✅ Deployment package created: deploy-package.tar.gz${NC}"

# Step 3: Instructions for manual upload
echo -e "${YELLOW}📤 Upload Instructions:${NC}"
echo ""
echo "Option 1: Using SCP (from this machine):"
echo "  scp deploy-package.tar.gz ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}"
echo ""
echo "Option 2: Using SFTP client (FileZilla, WinSCP, etc.)"
echo "  Upload deploy-package.tar.gz to: ${SERVER_PATH}"
echo ""
echo "Option 3: Using Git (if repository is set up)"
echo "  Push to repository and pull on server"
echo ""
echo -e "${GREEN}✅ Deployment package ready!${NC}"
echo ""
echo "Next steps:"
echo "1. Upload deploy-package.tar.gz to the server"
echo "2. SSH into the server: ssh ${SERVER_USER}@${SERVER_IP}"
echo "3. Extract: cd ${SERVER_PATH} && tar -xzf deploy-package.tar.gz"
echo "4. Follow the instructions in VPS_DEPLOYMENT_GUIDE.md"
echo ""

# Cleanup
read -p "Do you want to keep the deploy-package directory? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    rm -rf $DEPLOY_DIR
    echo -e "${GREEN}✅ Cleaned up temporary files${NC}"
fi

echo -e "${GREEN}🎉 Deployment package created successfully!${NC}"
