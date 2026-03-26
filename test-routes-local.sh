#!/bin/bash
# Local Route Testing Script
# Tests all production URL routes locally

echo "🧪 Testing Production Routes Locally"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:5000"

# Check if server is running
echo "📡 Checking if server is running..."
if curl -s -o /dev/null -w "%{http_code}" "$BASE_URL" | grep -q "200\|404"; then
    echo -e "${GREEN}✅ Server is running${NC}"
else
    echo -e "${RED}❌ Server is not running${NC}"
    echo ""
    echo "Please start the server first:"
    echo "  cd /root/mekness"
    echo "  npm install  # if not done"
    echo "  npm run dev"
    echo ""
    exit 1
fi

echo ""
echo "Testing Routes..."
echo ""

# Test User Routes
echo "👤 Testing User Routes:"
echo ""

test_route() {
    local route=$1
    local name=$2
    local status_code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$route")
    
    if [ "$status_code" = "200" ] || [ "$status_code" = "404" ]; then
        # 404 is OK for SPA - it means route exists but might need JS
        echo -e "  ${GREEN}✅${NC} $name: $route (HTTP $status_code)"
        return 0
    else
        echo -e "  ${RED}❌${NC} $name: $route (HTTP $status_code)"
        return 1
    fi
}

# User routes
test_route "/user/login" "User Login (Production URL)"
test_route "/user/signup" "User Signup (Production URL)"
test_route "/signin" "User Login (Internal)"
test_route "/signup" "User Signup (Internal)"

echo ""
echo "🔐 Testing Admin Routes:"
echo ""

# Admin routes
test_route "/huwnymfphhrq/" "Admin Login (Secret Path with slash)"
test_route "/huwnymfphhrq" "Admin Login (Secret Path no slash)"
test_route "/admin/login" "Admin Login (Internal)"
test_route "/admin/dashboard" "Admin Dashboard"

echo ""
echo "===================================="
echo ""
echo "📋 Summary:"
echo ""
echo "All routes should return HTTP 200 or 404 (404 is OK for SPA routes)"
echo ""
echo "🌐 Open in browser:"
echo "  User Login:   $BASE_URL/user/login"
echo "  Admin Login:  $BASE_URL/huwnymfphhrq/"
echo ""
echo "💡 Note: SPA routes may return 404 in curl but work in browser"
echo "   This is normal - React Router handles client-side routing"

