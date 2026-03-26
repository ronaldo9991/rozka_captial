#!/bin/bash
# Script to add wallet addresses from screenshots to Railway database

echo "🔐 Adding Crypto Wallet Addresses to Railway Database"
echo ""
echo "Please provide the wallet addresses from your screenshots:"
echo ""

read -p "Bitcoin (BTC) Wallet Address: " BTC_ADDRESS
read -p "USDT-BEP20 Wallet Address: " USDT_BEP20
read -p "USDT-TRC20 Wallet Address: " USDT_TRC20

echo ""
echo "Connecting to Railway PostgreSQL..."
echo ""

# Create SQL file
cat > /tmp/add_wallets.sql << EOF
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

echo "SQL commands ready. Now connecting to Railway..."
echo ""

railway connect postgres < /tmp/add_wallets.sql

echo ""
echo "✅ Wallet addresses have been added!"
echo ""
echo "You can now test the crypto deposit feature."

