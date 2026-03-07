# ⚠️ URGENT: Add Wallet Addresses to Fix Bitcoin Deposit

## The Error You're Seeing
```
404: {"message":"Wallet address not configured for BTC"}
```

**This means wallet addresses are NOT in the database yet.**

## Quick Fix (5 minutes)

### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
```

### Step 2: Login to Railway
```bash
railway login
```
(Opens browser to authenticate)

### Step 3: Link to Your Project
```bash
railway link
```
Select your Mekness project.

### Step 4: Connect to Database
```bash
railway connect postgres
```

### Step 5: Add Wallet Addresses

**Copy and paste this SQL** (replace with YOUR actual wallet addresses):

```sql
-- Bitcoin (BTC)
INSERT INTO crypto_wallets (id, crypto_type, network, wallet_address, enabled, created_at, updated_at)
VALUES 
  (gen_random_uuid()::text, 'BTC', 'BTC', 'YOUR_BTC_ADDRESS', true, NOW(), NOW());

-- USDT-BEP20
INSERT INTO crypto_wallets (id, crypto_type, network, wallet_address, enabled, created_at, updated_at)
VALUES 
  (gen_random_uuid()::text, 'USDT-BEP20', 'BEP20', 'YOUR_USDT_BEP20_ADDRESS', true, NOW(), NOW());

-- USDT-TRC20
INSERT INTO crypto_wallets (id, crypto_type, network, wallet_address, enabled, created_at, updated_at)
VALUES 
  (gen_random_uuid()::text, 'USDT-TRC20', 'TRC20', 'YOUR_USDT_TRC20_ADDRESS', true, NOW(), NOW());
```

**Example** (replace with your addresses):
```sql
INSERT INTO crypto_wallets (id, crypto_type, network, wallet_address, enabled, created_at, updated_at)
VALUES 
  (gen_random_uuid()::text, 'BTC', 'BTC', '1L3BPwEuMW12FmZeWjKZymkY7XtzjrAhse', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'USDT-BEP20', 'BEP20', '0x95c30530b9c39c5960303be151b2a6d1834a0512', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'USDT-TRC20', 'TRC20', 'TEqhR8NkqcpdTGc9jhR5W9oWLZgha1ppsH', true, NOW(), NOW());
```

### Step 6: Verify
```sql
SELECT crypto_type, network, wallet_address, enabled FROM crypto_wallets;
```

### Step 7: Exit
Type `\q` and press Enter.

## ✅ After Adding Wallets

1. **Refresh your deposit page**
2. Select "Cryptocurrency (Direct)"
3. Choose "Bitcoin (BTC)"
4. Enter amount and click "Deposit"
5. **QR code and wallet address will appear!**

## 📝 Wallet Address Formats

- **Bitcoin (BTC)**: Starts with `1`, `3`, or `bc1`
  - Example: `1L3BPwEuMW12FmZeWjKZymkY7XtzjrAhse`
  
- **USDT-BEP20**: Starts with `0x` (Ethereum-style)
  - Example: `0x95c30530b9c39c5960303be151b2a6d1834a0512`
  
- **USDT-TRC20**: Starts with `T` (TRON)
  - Example: `TEqhR8NkqcpdTGc9jhR5W9oWLZgha1ppsH`

## 🆘 Don't Have Wallet Addresses?

You need to create crypto wallets first:
1. **Bitcoin**: Use a Bitcoin wallet (Electrum, Exodus, etc.)
2. **USDT-BEP20**: Use MetaMask or Trust Wallet (BNB Smart Chain network)
3. **USDT-TRC20**: Use TronLink or Trust Wallet (TRON network)

Then get the receiving addresses from those wallets.

