-- Simple SQL to add crypto wallet addresses
-- Copy this file and replace the wallet addresses with your actual addresses
-- Then run: railway connect postgres < add-wallets-simple.sql

-- Bitcoin (BTC) Wallet
INSERT INTO crypto_wallets (id, crypto_type, network, wallet_address, enabled, created_at, updated_at)
VALUES 
  (gen_random_uuid()::text, 'BTC', 'BTC', 'YOUR_BTC_WALLET_ADDRESS_HERE', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- USDT on BEP20 (BNB Smart Chain)
INSERT INTO crypto_wallets (id, crypto_type, network, wallet_address, enabled, created_at, updated_at)
VALUES 
  (gen_random_uuid()::text, 'USDT-BEP20', 'BEP20', 'YOUR_USDT_BEP20_ADDRESS_HERE', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- USDT on TRC20 (TRON)
INSERT INTO crypto_wallets (id, crypto_type, network, wallet_address, enabled, created_at, updated_at)
VALUES 
  (gen_random_uuid()::text, 'USDT-TRC20', 'TRC20', 'YOUR_USDT_TRC20_ADDRESS_HERE', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Verify wallets were added
SELECT crypto_type, network, LEFT(wallet_address, 20) || '...' as address_preview, enabled 
FROM crypto_wallets 
ORDER BY crypto_type;

