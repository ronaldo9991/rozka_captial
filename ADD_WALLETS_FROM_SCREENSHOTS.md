# Add Wallet Addresses from Screenshots

I found your three crypto deposit screenshots. To make crypto deposits work, I need the wallet addresses from them.

## Quick Method: Use the Script

Run this script and it will prompt you for the addresses:

```bash
./add-wallets-from-screenshots.sh
```

It will:
1. Ask you for each wallet address
2. Connect to Railway database
3. Add all three wallets automatically

## Manual Method

### Step 1: Get Wallet Addresses from Screenshots

Look at your three screenshots and find the wallet addresses:

1. **Bitcoin (BTC)** screenshot - Find the wallet address (starts with `1`, `3`, or `bc1`)
2. **USDT-BEP20** screenshot - Find the wallet address (starts with `0x`)
3. **USDT-TRC20** screenshot - Find the wallet address (starts with `T`)

### Step 2: Add to Database

```bash
# Install Railway CLI (if needed)
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# Connect to database
railway connect postgres
```

Then paste this SQL (replace with addresses from screenshots):

```sql
-- Bitcoin (BTC)
INSERT INTO crypto_wallets (id, crypto_type, network, wallet_address, enabled, created_at, updated_at)
VALUES 
  (gen_random_uuid()::text, 'BTC', 'BTC', 'PASTE_BTC_ADDRESS_FROM_SCREENSHOT', true, NOW(), NOW());

-- USDT-BEP20
INSERT INTO crypto_wallets (id, crypto_type, network, wallet_address, enabled, created_at, updated_at)
VALUES 
  (gen_random_uuid()::text, 'USDT-BEP20', 'BEP20', 'PASTE_USDT_BEP20_ADDRESS_FROM_SCREENSHOT', true, NOW(), NOW());

-- USDT-TRC20
INSERT INTO crypto_wallets (id, crypto_type, network, wallet_address, enabled, created_at, updated_at)
VALUES 
  (gen_random_uuid()::text, 'USDT-TRC20', 'TRC20', 'PASTE_USDT_TRC20_ADDRESS_FROM_SCREENSHOT', true, NOW(), NOW());

-- Verify
SELECT crypto_type, network, wallet_address FROM crypto_wallets;
```

Type `\q` to exit.

## What to Look For in Screenshots

The wallet addresses should be visible in the screenshots:
- Usually shown below the QR code
- Long alphanumeric strings
- May have a "Copy" button next to them

## After Adding

1. Refresh your deposit page
2. Select "Cryptocurrency (Direct)"
3. Choose a crypto type
4. Enter amount and click "Deposit"
5. **QR code and wallet address will appear!**

