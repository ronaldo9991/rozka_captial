# 📝 How to Add Wallet Addresses from Screenshots

I've created an easy way for you to add the wallet addresses from your screenshots.

## Method 1: Using the Admin Interface (Easiest) ⭐

1. **Wait for Railway to deploy** (2-5 minutes after the last push)
2. **Log in as Super Admin** at your Railway URL
3. **Go to Admin Dashboard** → Click "Crypto Wallets" in the sidebar
4. **Click "Add Wallet"** button
5. **For each screenshot:**
   - Select the cryptocurrency type (BTC, USDT-BEP20, or USDT-TRC20)
   - Copy the wallet address from the screenshot
   - Paste it into the "Wallet Address" field
   - Click "Add Wallet"
6. **Repeat for all 3 wallets**

## Method 2: Using the Text File

1. **Open `WALLET_ADDRESSES.txt`** in this folder
2. **Copy wallet addresses from your screenshots** and paste them:
   ```
   BTC_ADDRESS=1L3BPwEuMW12FmZeWjKZymkY7XtzjrAhse
   USDT_BEP20_ADDRESS=0x95c30530b9c39c5960303be151b2a6d1834a0512
   USDT_TRC20_ADDRESS=TEqhR8NkqcpdTGc9jhR5W9oWLZgha1ppsH
   ```
3. **Save the file**
4. **Run the script:**
   ```bash
   ./add-wallets-from-file.sh
   ```

## Method 3: Direct SQL (Advanced)

If you prefer to add them directly via Railway CLI:

```bash
railway connect postgres
```

Then paste:
```sql
INSERT INTO crypto_wallets (id, crypto_type, network, wallet_address, enabled, created_at, updated_at)
VALUES 
  (gen_random_uuid()::text, 'BTC', 'BTC', 'YOUR_BTC_ADDRESS_HERE', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'USDT-BEP20', 'BEP20', 'YOUR_USDT_BEP20_ADDRESS_HERE', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'USDT-TRC20', 'TRC20', 'YOUR_USDT_TRC20_ADDRESS_HERE', true, NOW(), NOW());
```

## What to Look For in Screenshots

- **Bitcoin (BTC)**: Address starts with `1`, `3`, or `bc1`
- **USDT-BEP20**: Address starts with `0x` (like Ethereum addresses)
- **USDT-TRC20**: Address starts with `T` (TRON addresses)

The addresses are usually shown:
- Below the QR code
- In a text box with a "Copy" button
- As a long string of letters and numbers

## After Adding

✅ Crypto deposits will work immediately
✅ QR codes will appear
✅ Users can deposit Bitcoin and USDT

