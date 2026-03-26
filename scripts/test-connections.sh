#!/bin/bash
# Quick connection test script for Rozka Capitals

echo "🚀 Rozka Capitals - Connection Test"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found${NC}"
    echo "   Please copy .env.example to .env and configure it"
    exit 1
fi

echo -e "${GREEN}✅ .env file found${NC}"
echo ""

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js installed: $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js not found${NC}"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm installed: $NPM_VERSION${NC}"
else
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi

# Check PHP (if MT5 is enabled)
if [ "$MT5_ENABLED" = "true" ]; then
    if command -v php &> /dev/null; then
        PHP_VERSION=$(php --version | head -n 1)
        echo -e "${GREEN}✅ PHP installed: $PHP_VERSION${NC}"
    else
        echo -e "${RED}❌ PHP not found (required for MT5)${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  MT5 integration disabled (PHP check skipped)${NC}"
fi

# Check database connection
echo ""
echo "Testing database connection..."

if [ -n "$DATABASE_URL" ]; then
    if [[ "$DATABASE_URL" == postgresql://* ]] || [[ "$DATABASE_URL" == postgres://* ]]; then
        echo "   Detected PostgreSQL connection"
        # Try to extract connection details (basic check)
        if [[ "$DATABASE_URL" == *@* ]]; then
            echo -e "${GREEN}✅ PostgreSQL connection string format looks valid${NC}"
        else
            echo -e "${RED}❌ PostgreSQL connection string format invalid${NC}"
        fi
    else
        echo "   Using SQLite (development mode)"
        echo -e "${GREEN}✅ SQLite will be created automatically${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  DATABASE_URL not set (will use SQLite)${NC}"
fi

# Check MT5 configuration
if [ "$MT5_ENABLED" = "true" ]; then
    echo ""
    echo "Checking MT5 configuration..."
    
    if [ -z "$MT5_HOST" ]; then
        echo -e "${RED}❌ MT5_HOST not set${NC}"
    else
        echo -e "${GREEN}✅ MT5_HOST: $MT5_HOST${NC}"
    fi
    
    if [ -z "$MT5_MANAGER_LOGIN" ]; then
        echo -e "${RED}❌ MT5_MANAGER_LOGIN not set${NC}"
    else
        echo -e "${GREEN}✅ MT5_MANAGER_LOGIN: set${NC}"
    fi
    
    if [ -z "$MT5_MANAGER_PASSWORD" ]; then
        echo -e "${RED}❌ MT5_MANAGER_PASSWORD not set${NC}"
    else
        echo -e "${GREEN}✅ MT5_MANAGER_PASSWORD: set${NC}"
    fi
fi

# Check SESSION_SECRET
echo ""
if [ -z "$SESSION_SECRET" ]; then
    echo -e "${RED}❌ SESSION_SECRET not set${NC}"
    echo "   Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
else
    if [ "$SESSION_SECRET" = "change-this-to-a-secure-random-string-in-production" ]; then
        echo -e "${YELLOW}⚠️  SESSION_SECRET is still the default value${NC}"
        echo "   Please change it for security"
    else
        echo -e "${GREEN}✅ SESSION_SECRET: set${NC}"
    fi
fi

echo ""
echo "======================================"
echo "Run 'npm run verify' for detailed connection tests"
echo "Run 'npm run dev' to start the server"

