#!/bin/bash
# Quick script to add crypto wallet addresses via Railway CLI

echo "🚀 Adding Crypto Wallet Addresses to Railway PostgreSQL"
echo ""
echo "Make sure you have Railway CLI installed: npm install -g @railway/cli"
echo "And you're logged in: railway login"
echo ""
read -p "Press Enter to continue..."

echo ""
echo "📝 You'll need to provide your wallet addresses:"
echo ""
read -p "Enter Bitcoin (BTC) wallet address: " BTC_ADDRESS
read -p "Enter USDT-BEP20 wallet address: " USDT_BEP20
read -p "Enter USDT-TRC20 wallet address: " USDT_TRC20

echo ""
echo "Connecting to Railway PostgreSQL..."
echo ""

railway connect postgres << EOF_SQL
-- Add Bitcoin Wallet
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

-- Verify
SELECT crypto_type, network, LEFT(wallet_address, 20) || '...' as address_preview, enabled 
FROM crypto_wallets 
ORDER BY crypto_type;
\q
EOF_SQL

echo ""
echo "✅ Done! Wallet addresses have been added."
