# Extract Wallet Addresses from Screenshots

I found your three crypto deposit screenshots:
1. `WhatsApp Image 2025-11-22 at 10.18.37 PM.jpeg` - Likely BTC
2. `WhatsApp Image 2025-11-22 at 10.22.31 PM.jpeg` - Likely USDT-BEP20
3. `WhatsApp Image 2025-11-22 at 10.23.31 PM.jpeg` - Likely USDT-TRC20

## Please Provide Wallet Addresses

From the screenshots, please provide:

1. **Bitcoin (BTC) Wallet Address**: (starts with 1, 3, or bc1)
2. **USDT-BEP20 Wallet Address**: (starts with 0x)
3. **USDT-TRC20 Wallet Address**: (starts with T)

Once you provide them, I'll add them to the database automatically.

## Or Add Them Manually

If you prefer to add them yourself:

```bash
railway connect postgres
```

Then run:
```sql
INSERT INTO crypto_wallets (id, crypto_type, network, wallet_address, enabled, created_at, updated_at)
VALUES 
  (gen_random_uuid()::text, 'BTC', 'BTC', 'YOUR_BTC_ADDRESS', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'USDT-BEP20', 'BEP20', 'YOUR_USDT_BEP20_ADDRESS', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'USDT-TRC20', 'TRC20', 'YOUR_USDT_TRC20_ADDRESS', true, NOW(), NOW());
```

