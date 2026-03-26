#!/bin/bash
# Live deployment: pull latest code, build, restart PM2 (Rozka Capitals)

set -e

echo "🚀 Starting live deployment..."
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

START_TIME=$(date +%s)

echo -e "${BLUE}📥 Step 1: Pulling latest code from main...${NC}"
GIT_START=$(date +%s)
git fetch origin
git checkout main
git stash push -m "Auto-stash before deployment $(date +%Y%m%d-%H%M%S)" 2>/dev/null || true

rm -f local.db-shm local.db-wal 2>/dev/null || true

git pull origin main
GIT_END=$(date +%s)
GIT_TIME=$((GIT_END - GIT_START))
echo -e "${GREEN}✅ Git pull completed in ${GIT_TIME}s${NC}"
echo ""

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

echo -e "${BLUE}🔨 Step 3: Building application...${NC}"
BUILD_START=$(date +%s)
npm run build
BUILD_END=$(date +%s)
BUILD_TIME=$((BUILD_END - BUILD_START))
echo -e "${GREEN}✅ Build completed in ${BUILD_TIME}s${NC}"
echo ""

echo -e "${BLUE}🔄 Step 4: Restarting server...${NC}"
PM2_START=$(date +%s)
if [ -f "ecosystem.config.cjs" ]; then
    pm2 restart ecosystem.config.cjs --update-env
else
    pm2 restart rozka-api --update-env
fi
pm2 save
PM2_END=$(date +%s)
PM2_TIME=$((PM2_END - PM2_START))
echo -e "${GREEN}✅ Server restarted in ${PM2_TIME}s${NC}"
echo ""

END_TIME=$(date +%s)
TOTAL_TIME=$((END_TIME - START_TIME))

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Deployment complete${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⏱️  Timing:"
echo "   Git pull:      ${GIT_TIME}s"
if [ "${NPM_TIME:-0}" -gt 0 ]; then
    echo "   Dependencies:  ${NPM_TIME}s"
fi
echo "   Build:         ${BUILD_TIME}s"
echo "   PM2 restart:   ${PM2_TIME}s"
echo "   ─────────────────────────"
echo -e "   ${GREEN}Total:         ${TOTAL_TIME}s${NC}"
echo ""
echo "📊 Server status:"
pm2 status rozka-api 2>/dev/null || pm2 status
echo ""
echo "📝 Latest commit:"
git log -1 --oneline
echo ""
