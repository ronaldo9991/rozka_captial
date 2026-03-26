#!/bin/bash
# PostgreSQL setup for Rozka Capitals on VPS

set -e  # Exit on error

echo "🐘 PostgreSQL VPS Setup Script"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
    OS_VERSION=$VERSION_ID
else
    echo -e "${RED}❌ Cannot detect OS${NC}"
    exit 1
fi

echo -e "${GREEN}Detected OS: $OS $OS_VERSION${NC}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${YELLOW}⚠️  This script needs sudo privileges${NC}"
    echo "Please run: sudo bash $0"
    exit 1
fi

# Install PostgreSQL
echo -e "${GREEN}📦 Installing PostgreSQL...${NC}"

if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
    apt update
    apt install -y postgresql postgresql-contrib
    systemctl start postgresql
    systemctl enable postgresql
elif [ "$OS" = "centos" ] || [ "$OS" = "rhel" ] || [ "$OS" = "fedora" ]; then
    if command_exists dnf; then
        dnf install -y postgresql-server postgresql-contrib
        postgresql-setup --initdb
    elif command_exists yum; then
        yum install -y postgresql-server postgresql-contrib
        postgresql-setup initdb
    fi
    systemctl enable postgresql
    systemctl start postgresql
else
    echo -e "${RED}❌ Unsupported OS: $OS${NC}"
    exit 1
fi

# Get PostgreSQL version
if command_exists psql; then
    PG_VERSION=$(psql --version | awk '{print $3}' | cut -d. -f1)
    echo -e "${GREEN}✅ PostgreSQL $PG_VERSION installed${NC}"
else
    echo -e "${RED}❌ PostgreSQL installation failed${NC}"
    exit 1
fi

# Check if PostgreSQL is running
if systemctl is-active --quiet postgresql; then
    echo -e "${GREEN}✅ PostgreSQL service is running${NC}"
else
    echo -e "${RED}❌ PostgreSQL service is not running${NC}"
    exit 1
fi

# Generate secure password
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
DB_USER="rozka_user"
DB_NAME="rozka_db"

echo ""
echo -e "${GREEN}📊 Creating database and user...${NC}"

# Create database and user
sudo -u postgres psql <<EOF
-- Drop if exists (for re-running script)
DROP DATABASE IF EXISTS $DB_NAME;
DROP USER IF EXISTS $DB_USER;

-- Create database
CREATE DATABASE $DB_NAME;

-- Create user
CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER USER $DB_USER CREATEDB;

-- Connect to database and grant schema privileges
\c $DB_NAME
GRANT ALL ON SCHEMA public TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;

\q
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database and user created successfully${NC}"
else
    echo -e "${RED}❌ Failed to create database/user${NC}"
    exit 1
fi

# Test connection
echo ""
echo -e "${GREEN}🔍 Testing connection...${NC}"
if sudo -u postgres psql -U $DB_USER -d $DB_NAME -h localhost -c "SELECT version();" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Connection test successful${NC}"
else
    echo -e "${YELLOW}⚠️  Connection test failed (this might be normal due to authentication)${NC}"
fi

# Create backup directory
echo ""
echo -e "${GREEN}📁 Setting up backup directory...${NC}"
mkdir -p /backups/postgresql
chown postgres:postgres /backups/postgresql
chmod 700 /backups/postgresql
echo -e "${GREEN}✅ Backup directory created: /backups/postgresql${NC}"

# Output connection details
echo ""
echo "=========================================="
echo -e "${GREEN}✅ PostgreSQL Setup Complete!${NC}"
echo "=========================================="
echo ""
echo "📝 Connection Details:"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo "   Password: $DB_PASSWORD"
echo "   Host: localhost"
echo "   Port: 5432"
echo ""
echo "🔗 Connection String:"
echo "   postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"
echo ""
echo "📋 Add this to your .env file:"
echo "   DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT:${NC}"
echo "   1. Save this password securely!"
echo "   2. Update your application .env file with the connection string above"
echo "   3. Run: npm run db:push (or tables will auto-create on startup)"
echo "   4. Consider setting up automated backups"
echo ""
echo "📚 Next Steps:"
echo "   1. Update .env file with DATABASE_URL"
echo "   2. Test connection: psql -U $DB_USER -d $DB_NAME -h localhost"
echo "   3. Run migrations or let tables auto-create"
echo "   4. Migrate data from Railway if needed"
echo ""

