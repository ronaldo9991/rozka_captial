# 🚀 Quick Guide: Add Crypto Wallet Addresses

## The Error You're Seeing
```
404: {"message":"Wallet address not configured for BTC"}
```

This means wallet addresses need to be added to the database.

## Step-by-Step Instructions

### 1. Install Railway CLI (if needed)
```bash
npm install -g @railway/cli
```

### 2. Login to Railway
```bash
railway login
```
This will open your browser to authenticate.

### 3. Link to Your Project
```bash
railway link
```
- Select your Mekness project from the list
- Or enter your project ID if prompted

### 4. Connect to PostgreSQL Database
```bash
railway connect postgres
```
This will open a PostgreSQL terminal.

### 5. Add Your Wallet Addresses

**Copy and paste this SQL** (replace the addresses with YOUR actual wallet addresses):

```sql
-- Add Bitcoin (BTC) Wallet
INSERT INTO crypto_wallets (id, crypto_type, network, wallet_address, enabled, created_at, updated_at)
VALUES 
  (gen_random_uuid()::text, 'BTC', 'BTC', 'YOUR_BTC_ADDRESS_HERE', true, NOW(), NOW());

-- Add USDT-BEP20 Wallet  
INSERT INTO crypto_wallets (id, crypto_type, network, wallet_address, enabled, created_at, updated_at)
VALUES 
  (gen_random_uuid()::text, 'USDT-BEP20', 'BEP20', 'YOUR_USDT_BEP20_ADDRESS_HERE', true, NOW(), NOW());

-- Add USDT-TRC20 Wallet
INSERT INTO crypto_wallets (id, crypto_type, network, wallet_address, enabled, created_at, updated_at)
VALUES 
  (gen_random_uuid()::text, 'USDT-TRC20', 'TRC20', 'YOUR_USDT_TRC20_ADDRESS_HERE', true, NOW(), NOW());
```

**Example with real addresses:**
```sql
INSERT INTO crypto_wallets (id, crypto_type, network, wallet_address, enabled, created_at, updated_at)
VALUES 
  (gen_random_uuid()::text, 'BTC', 'BTC', '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'USDT-BEP20', 'BEP20', '0x95c30530b9c39c5960303be151b2a6d1834a0512', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'USDT-TRC20', 'TRC20', 'TEqhR8NkqcpdTGc9jhR5W9oWLZgha1ppsH', true, NOW(), NOW());
```

### 6. Verify Wallets Were Added
```sql
SELECT crypto_type, network, wallet_address, enabled 
FROM crypto_wallets 
ORDER BY crypto_type;
```

You should see all three wallets listed.

### 7. Exit PostgreSQL
Type `\q` and press Enter.

## ✅ Done!

After adding the wallets:
1. Refresh your deposit page
2. Select "Cryptocurrency (Direct)"
3. Choose Bitcoin (BTC) or USDT
4. The wallet address and QR code will appear!

## 🔍 Wallet Address Formats

- **Bitcoin (BTC)**: Starts with `1`, `3`, or `bc1`
  - Example: `1L3BPwEuMW12FmZeWjKZymkY7XtzjrAhse`
  
- **USDT-BEP20**: Starts with `0x` (Ethereum-style address)
  - Example: `0x95c30530b9c39c5960303be151b2a6d1834a0512`
  
- **USDT-TRC20**: Starts with `T` (TRON address)
  - Example: `TEqhR8NkqcpdTGc9jhR5W9oWLZgha1ppsH`

## ❌ Troubleshooting

### "relation crypto_wallets does not exist"
- The table should be created automatically
- Check Railway logs - if migrations failed, restart the server
- The server will create the table on next startup

### "duplicate key value"
- Wallet already exists for that crypto type
- Use UPDATE instead:
```sql
UPDATE crypto_wallets 
SET wallet_address = 'YOUR_NEW_ADDRESS', updated_at = NOW()
WHERE crypto_type = 'BTC';
```

### Can't connect to database
- Make sure you're in the correct Railway project: `railway link`
- Check PostgreSQL service is running in Railway dashboard
- Verify you're logged in: `railway whoami`

