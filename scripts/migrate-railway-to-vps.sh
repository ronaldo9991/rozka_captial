#!/bin/bash
# Migration Script: Railway PostgreSQL → VPS PostgreSQL

set -e

echo "🔄 Railway to VPS PostgreSQL Migration"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Railway connection (source)
RAILWAY_URL="postgresql://postgres:YxscShUJpmgzIAvcjnVVkYeWZpPKUkKt@shuttle.proxy.rlwy.net:23811/railway"

# VPS connection (target) - will prompt if not set
if [ -z "$VPS_DATABASE_URL" ]; then
    echo -e "${YELLOW}Enter VPS PostgreSQL connection details:${NC}"
    read -p "Database user: " VPS_USER
    read -sp "Database password: " VPS_PASSWORD
    echo ""
    read -p "Database name [mekness_db]: " VPS_DB
    VPS_DB=${VPS_DB:-mekness_db}
    VPS_DATABASE_URL="postgresql://$VPS_USER:$VPS_PASSWORD@localhost:5432/$VPS_DB"
fi

echo ""
echo -e "${GREEN}Source (Railway):${NC}"
echo "  $RAILWAY_URL" | sed 's/:[^:@]*@/:****@/'
echo ""
echo -e "${GREEN}Target (VPS):${NC}"
echo "  $VPS_DATABASE_URL" | sed 's/:[^:@]*@/:****@/'
echo ""

read -p "Continue with migration? (y/N): " confirm
if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "Migration cancelled."
    exit 0
fi

# Create backup directory
BACKUP_DIR="./migration-backup-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo ""
echo -e "${GREEN}📤 Step 1: Exporting data from Railway...${NC}"

# Export from Railway
pg_dump "$RAILWAY_URL" \
    --verbose \
    --clean \
    --if-exists \
    --format=custom \
    --file="$BACKUP_DIR/railway_backup.dump" 2>&1 | grep -v "^--" | grep -v "^SET" || true

if [ ! -f "$BACKUP_DIR/railway_backup.dump" ]; then
    echo -e "${RED}❌ Export failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Export complete: $BACKUP_DIR/railway_backup.dump${NC}"

# Also create SQL backup for inspection
echo ""
echo -e "${GREEN}📄 Creating SQL backup for inspection...${NC}"
pg_dump "$RAILWAY_URL" \
    --clean \
    --if-exists \
    > "$BACKUP_DIR/railway_backup.sql" 2>&1 || true

echo -e "${GREEN}✅ SQL backup created: $BACKUP_DIR/railway_backup.sql${NC}"

# Import to VPS
echo ""
echo -e "${GREEN}📥 Step 2: Importing data to VPS PostgreSQL...${NC}"

# Test VPS connection first
if ! psql "$VPS_DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${RED}❌ Cannot connect to VPS PostgreSQL${NC}"
    echo "Please verify:"
    echo "  1. PostgreSQL is running: sudo systemctl status postgresql"
    echo "  2. Database and user exist"
    echo "  3. Password is correct"
    exit 1
fi

echo -e "${GREEN}✅ VPS connection verified${NC}"

# Restore data
pg_restore \
    --dbname="$VPS_DATABASE_URL" \
    --verbose \
    --clean \
    --if-exists \
    --no-owner \
    --no-acl \
    "$BACKUP_DIR/railway_backup.dump" 2>&1 | grep -v "^--" | grep -v "^SET" || true

echo ""
echo -e "${GREEN}✅ Import complete${NC}"

# Verify migration
echo ""
echo -e "${GREEN}🔍 Step 3: Verifying migration...${NC}"

# Get counts from both databases
echo "Comparing data counts..."

# Railway counts
RAILWAY_USERS=$(psql "$RAILWAY_URL" -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | xargs)
RAILWAY_DEPOSITS=$(psql "$RAILWAY_URL" -t -c "SELECT COUNT(*) FROM deposits;" 2>/dev/null | xargs)
RAILWAY_WITHDRAWALS=$(psql "$RAILWAY_URL" -t -c "SELECT COUNT(*) FROM withdrawals;" 2>/dev/null | xargs)
RAILWAY_ACCOUNTS=$(psql "$RAILWAY_URL" -t -c "SELECT COUNT(*) FROM trading_accounts;" 2>/dev/null | xargs)

# VPS counts
VPS_USERS=$(psql "$VPS_DATABASE_URL" -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | xargs)
VPS_DEPOSITS=$(psql "$VPS_DATABASE_URL" -t -c "SELECT COUNT(*) FROM deposits;" 2>/dev/null | xargs)
VPS_WITHDRAWALS=$(psql "$VPS_DATABASE_URL" -t -c "SELECT COUNT(*) FROM withdrawals;" 2>/dev/null | xargs)
VPS_ACCOUNTS=$(psql "$VPS_DATABASE_URL" -t -c "SELECT COUNT(*) FROM trading_accounts;" 2>/dev/null | xargs)

echo ""
echo "Data Comparison:"
echo "  Users:      Railway=$RAILWAY_USERS, VPS=$VPS_USERS"
echo "  Deposits:   Railway=$RAILWAY_DEPOSITS, VPS=$VPS_DEPOSITS"
echo "  Withdrawals: Railway=$RAILWAY_WITHDRAWALS, VPS=$VPS_WITHDRAWALS"
echo "  Accounts:   Railway=$RAILWAY_ACCOUNTS, VPS=$VPS_ACCOUNTS"

# Check if counts match
if [ "$RAILWAY_USERS" = "$VPS_USERS" ] && [ "$RAILWAY_DEPOSITS" = "$VPS_DEPOSITS" ]; then
    echo ""
    echo -e "${GREEN}✅ Migration verified - counts match!${NC}"
else
    echo ""
    echo -e "${YELLOW}⚠️  Counts don't match - please verify manually${NC}"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Migration Complete!${NC}"
echo "=========================================="
echo ""
echo "📁 Backup location: $BACKUP_DIR"
echo ""
echo "📋 Next Steps:"
echo "  1. Update .env file:"
echo "     DATABASE_URL=$VPS_DATABASE_URL"
echo ""
echo "  2. Test your application:"
echo "     npm run dev"
echo ""
echo "  3. Verify data in admin panel"
echo ""
echo "  4. Keep backup for safety: $BACKUP_DIR"
echo ""

