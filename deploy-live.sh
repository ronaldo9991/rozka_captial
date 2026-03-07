#!/bin/bash
# Quick Live Deployment Script for Mekness
# Deploys latest code from master branch to production

set -e

echo "🚀 Starting Live Deployment..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Start timing
START_TIME=$(date +%s)

# Step 1: Git Pull
echo -e "${BLUE}📥 Step 1: Pulling latest code from master...${NC}"
GIT_START=$(date +%s)
git fetch origin
git checkout master
git stash push -m "Auto-stash before deployment $(date +%Y%m%d-%H%M%S)" 2>/dev/null || true

# Remove SQLite files that might conflict
rm -f local.db-shm local.db-wal 2>/dev/null || true

git pull origin master
GIT_END=$(date +%s)
GIT_TIME=$((GIT_END - GIT_START))
echo -e "${GREEN}✅ Git pull completed in ${GIT_TIME}s${NC}"
echo ""

# Step 2: Check if dependencies need updating
echo -e "${BLUE}📦 Step 2: Checking dependencies...${NC}"
if git diff HEAD@{1} HEAD --name-only | grep -q "package.json\|package-lock.json"; then
    echo "   Dependencies changed, installing..."
    NPM_START=$(date +%s)
    npm ci
    NPM_END=$(date +%s)
    NPM_TIME=$((NPM_END - NPM_START))
    echo -e "${GREEN}✅ Dependencies installed in ${NPM_TIME}s${NC}"
else
    echo "   No dependency changes, skipping npm ci"
    NPM_TIME=0
fi
echo ""

# Step 3: Build
echo -e "${BLUE}🔨 Step 3: Building application...${NC}"
BUILD_START=$(date +%s)
npm run build
BUILD_END=$(date +%s)
BUILD_TIME=$((BUILD_END - BUILD_START))
echo -e "${GREEN}✅ Build completed in ${BUILD_TIME}s${NC}"
echo ""

# Step 4: Restart PM2
echo -e "${BLUE}🔄 Step 4: Restarting server...${NC}"
PM2_START=$(date +%s)
# Use ecosystem config if it exists, otherwise use direct start
if [ -f "ecosystem.config.cjs" ]; then
    pm2 restart ecosystem.config.cjs --update-env
else
    pm2 restart mekness-api --update-env
fi
pm2 save
PM2_END=$(date +%s)
PM2_TIME=$((PM2_END - PM2_START))
echo -e "${GREEN}✅ Server restarted in ${PM2_TIME}s${NC}"
echo ""

# Calculate total time
END_TIME=$(date +%s)
TOTAL_TIME=$((END_TIME - START_TIME))

# Display summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⏱️  Timing Breakdown:"
echo "   Git pull:      ${GIT_TIME}s"
if [ $NPM_TIME -gt 0 ]; then
    echo "   Dependencies:  ${NPM_TIME}s"
fi
echo "   Build:         ${BUILD_TIME}s"
echo "   PM2 restart:   ${PM2_TIME}s"
echo "   ─────────────────────────"
echo -e "   ${GREEN}Total:         ${TOTAL_TIME}s${NC}"
echo ""
echo "📊 Server Status:"
pm2 status mekness-api
echo ""
echo "📝 Latest Commit:"
git log -1 --oneline
echo ""
echo -e "${GREEN}🌐 Server is live at: https://new.mekness.com${NC}"

