# How to Add Crypto Wallet Addresses to Railway PostgreSQL

## Step 1: Install Railway CLI (if not already installed)

```bash
npm install -g @railway/cli
```

## Step 2: Login to Railway

```bash
railway login
```

## Step 3: Link to Your Project

```bash
railway link
```

Select your Mekness project when prompted.

## Step 4: Connect to PostgreSQL Database

```bash
railway connect postgres
```

This will open a PostgreSQL connection in your terminal.

## Step 5: Add Wallet Addresses

Once connected, run these SQL commands (replace with your actual wallet addresses):

```sql
-- Bitcoin (BTC) Wallet
INSERT INTO crypto_wallets (id, crypto_type, network, wallet_address, enabled, created_at, updated_at)
VALUES 
  (gen_random_uuid()::text, 'BTC', 'BTC', 'YOUR_BTC_WALLET_ADDRESS', true, NOW(), NOW());

-- USDT on BEP20 (BNB Smart Chain)
INSERT INTO crypto_wallets (id, crypto_type, network, wallet_address, enabled, created_at, updated_at)
VALUES 
  (gen_random_uuid()::text, 'USDT-BEP20', 'BEP20', 'YOUR_USDT_BEP20_ADDRESS', true, NOW(), NOW());

-- USDT on TRC20 (TRON)
INSERT INTO crypto_wallets (id, crypto_type, network, wallet_address, enabled, created_at, updated_at)
VALUES 
  (gen_random_uuid()::text, 'USDT-TRC20', 'TRC20', 'YOUR_USDT_TRC20_ADDRESS', true, NOW(), NOW());
```

## Step 6: Verify Wallets Were Added

```sql
SELECT crypto_type, network, wallet_address, enabled 
FROM crypto_wallets 
ORDER BY crypto_type;
```

You should see all three wallets listed.

## Step 7: Exit PostgreSQL

Type `\q` and press Enter to exit.

## Example Wallet Addresses Format

- **Bitcoin (BTC)**: Starts with `1` or `3` or `bc1` (e.g., `1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa`)
- **USDT-BEP20**: Starts with `0x` (e.g., `0x95c30530b9c39c5960303be151b2a6d1834a0512`)
- **USDT-TRC20**: Starts with `T` (e.g., `TEqhR8NkqcpdTGc9jhR5W9oWLZgha1ppsH`)

## Troubleshooting

### Error: "relation crypto_wallets does not exist"
- The table should be created automatically on server startup
- Check Railway logs to see if migrations ran successfully
- If not, the server will create it on next restart

### Error: "duplicate key value"
- Wallet already exists for that crypto type
- Use UPDATE instead:
```sql
UPDATE crypto_wallets 
SET wallet_address = 'YOUR_NEW_ADDRESS', updated_at = NOW()
WHERE crypto_type = 'BTC';
```

### Can't connect to database
- Make sure you're in the correct Railway project
- Check that PostgreSQL service is running in Railway dashboard
- Verify DATABASE_URL is set correctly

