#!/bin/bash
# AWS EC2 Deployment Script for Mekness Trading Platform
# Usage: ./deploy-aws.sh

set -e

echo "🚀 Starting AWS deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 20+ first.${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${YELLOW}⚠️  Node.js version is less than 20. Recommended: Node.js 20+${NC}"
fi

echo -e "${GREEN}✅ Node.js version: $(node -v)${NC}"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build application
echo "🔨 Building application..."
npm run build

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    sudo npm install -g pm2
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating template...${NC}"
    cat > .env << EOF
NODE_ENV=production
PORT=5000
SESSION_SECRET=$(openssl rand -base64 32)
EOF
    echo -e "${GREEN}✅ Created .env file. Please review and update if needed.${NC}"
fi

# Stop existing PM2 process if running
pm2 stop mekness 2>/dev/null || true
pm2 delete mekness 2>/dev/null || true

# Start application with PM2
echo "🚀 Starting application with PM2..."
pm2 start dist/index.js --name mekness

# Save PM2 configuration
pm2 save

# Setup PM2 startup (if not already done)
if [ ! -f /etc/systemd/system/pm2-root.service ]; then
    echo "🔧 Setting up PM2 startup script..."
    pm2 startup
    echo -e "${YELLOW}⚠️  Please run the command shown above to enable PM2 on boot.${NC}"
fi

# Show status
echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
pm2 status
echo ""
echo -e "${GREEN}🌐 Your application should be running on port 5000${NC}"
echo -e "${GREEN}📊 View logs: pm2 logs mekness${NC}"
echo -e "${GREEN}🔄 Restart: pm2 restart mekness${NC}"
echo -e "${GREEN}⏹️  Stop: pm2 stop mekness${NC}"

