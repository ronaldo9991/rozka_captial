#!/bin/bash
# Script to add wallet addresses from WALLET_ADDRESSES.txt file

echo "🔐 Adding Crypto Wallet Addresses from File"
echo ""

# Check if file exists
if [ ! -f "WALLET_ADDRESSES.txt" ]; then
  echo "❌ Error: WALLET_ADDRESSES.txt not found!"
  echo "Please create the file and add your wallet addresses first."
  exit 1
fi

# Extract addresses from file
BTC_ADDRESS=$(grep "^BTC_ADDRESS=" WALLET_ADDRESSES.txt | cut -d'=' -f2 | tr -d ' ' | tr -d '"' | tr -d "'")
USDT_BEP20=$(grep "^USDT_BEP20_ADDRESS=" WALLET_ADDRESSES.txt | cut -d'=' -f2 | tr -d ' ' | tr -d '"' | tr -d "'")
USDT_TRC20=$(grep "^USDT_TRC20_ADDRESS=" WALLET_ADDRESSES.txt | cut -d'=' -f2 | tr -d ' ' | tr -d '"' | tr -d "'")

# Validate addresses
if [ -z "$BTC_ADDRESS" ] || [ "$BTC_ADDRESS" = "" ]; then
  echo "❌ Error: BTC_ADDRESS not found in WALLET_ADDRESSES.txt"
  exit 1
fi

if [ -z "$USDT_BEP20" ] || [ "$USDT_BEP20" = "" ]; then
  echo "❌ Error: USDT_BEP20_ADDRESS not found in WALLET_ADDRESSES.txt"
  exit 1
fi

if [ -z "$USDT_TRC20" ] || [ "$USDT_TRC20" = "" ]; then
  echo "❌ Error: USDT_TRC20_ADDRESS not found in WALLET_ADDRESSES.txt"
  exit 1
fi

echo "✅ Found wallet addresses:"
echo "   BTC: ${BTC_ADDRESS:0:20}..."
echo "   USDT-BEP20: ${USDT_BEP20:0:20}..."
echo "   USDT-TRC20: ${USDT_TRC20:0:20}..."
echo ""
echo "Connecting to Railway PostgreSQL..."
echo ""

# Create SQL file
cat > /tmp/add_wallets_from_file.sql << EOF
-- Add Bitcoin (BTC) Wallet
INSERT INTO crypto_wallets (id, crypto_type, network, wallet_address, enabled, created_at, updated_at)
VALUES 
  (gen_random_uuid()::text, 'BTC', 'BTC', '$BTC_ADDRESS', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Add USDT-BEP20 Wallet
INSERT INTO crypto_wallets (id, crypto_type, network, wallet_address, enabled, created_at, updated_at)
VALUES 
  (gen_random_uuid()::text, 'USDT-BEP20', 'BEP20', '$USDT_BEP20', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Add USDT-TRC20 Wallet
INSERT INTO crypto_wallets (id, crypto_type, network, wallet_address, enabled, created_at, updated_at)
VALUES 
  (gen_random_uuid()::text, 'USDT-TRC20', 'TRC20', '$USDT_TRC20', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Verify wallets were added
SELECT crypto_type, network, LEFT(wallet_address, 20) || '...' as address_preview, enabled 
FROM crypto_wallets 
ORDER BY crypto_type;
EOF

echo "Executing SQL commands..."
railway connect postgres < /tmp/add_wallets_from_file.sql

echo ""
echo "✅ Done! Wallet addresses have been added to the database."
echo ""
echo "You can now test the crypto deposit feature."

