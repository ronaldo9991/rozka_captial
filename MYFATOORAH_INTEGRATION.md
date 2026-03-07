# MyFatoorah Payment Integration

## ✅ Integration Complete

Stripe has been **completely removed** and replaced with **MyFatoorah** as the payment gateway.

---

## 🔧 Configuration

### Required Environment Variables

Add these to your `.env` file or environment configuration:

```bash
# MyFatoorah API Configuration
MYFATOORAH_API_KEY=yIEC-qPztpBvzvB3LD5VqqO4PmImAbC6yZZ9BgPgzdn8Qmb_pGKH-0KHuAaUvyGKLY0rgwIC1jCE9OkQcdpN4VKqqbcOq7APvbRPHpL7Q8ytlbcP8Ma6Bgv9rfxELVKR-EAS_pQCDz6lnUvRymJEdtd0WNFOpFdQtcluO8n8uVZbOIQBn8zTKCkLIQ-raGd8NQ3isuH-Ttyn4htZrHi1YIdDtqFsLDXO0_0Zyj9SmmZP_WxPmD9pEDMEkMJ3vxHyeuF-Vf4p3zHx44D3T0amfDZTvduR1PDzlER6eN0OcixUAQm3oppt0AurejDgE95iZU81uqOCZaQC1ghs6KsUyuKvXwuLobQDiUnAq9FikwJRNiUH889afkkcK0beat-oLJhDFHNxllSzLmKFV4z_AIAhMXxIkU_15Z0uC9_rfglaJgUhl9EF_xbXqYnh3aLwj60iGaaZPkGs8t5tlq_8F8zTVKGNQVz4CD-6YTdjNCWmDgH0MOX4XtjgfAofSbBJaMOqC8DIymKjsUakHvV1PV6nx4UrEmnB3XrgY4HOgjJtTDLGzIx1GZH3SMBK8cN8MIcfDO8DTJx1pgHV3syp6_Ejvwx28AguLixnm2xDAzyii8hWPWIH6emSzGOlc2YEF7CHgalWG-WG7XrXukDYTRYc4ITFpoYrMQPGwQQqHxPUDAJnBbgba4qyBWVFI0XHvwa-sg
MYFATOORAH_COUNTRY_CODE=USA
MYFATOORAH_TEST_MODE=false

# Frontend URL (for callback redirects)
FRONTEND_URL=https://newmekness.com

# Backend URL (for MyFatoorah callbacks)
API_URL=https://newmekness.com/api
# OR
BACKEND_URL=https://newmekness.com/api
```

### Optional Environment Variables

```bash
# If not set, defaults to:
# - Production: https://api.myfatoorah.com
# - Test: https://apitest.myfatoorah.com
MYFATOORAH_BASE_URL=https://api.myfatoorah.com
```

---

## 📡 API Endpoints

### 1. Create Payment Invoice

**Endpoint:** `POST /api/myfatoorah/create-invoice`

**Request Body:**
```json
{
  "amount": 100,
  "tradingAccountId": "account-id-here"
}
```

**Response:**
```json
{
  "invoiceId": 123456,
  "invoiceURL": "https://myfatoorah.com/invoice/...",
  "depositId": "deposit-id-here"
}
```

**Usage:**
- User initiates deposit
- Frontend calls this endpoint
- User is redirected to `invoiceURL` to complete payment
- After payment, MyFatoorah redirects to callback URL

---

### 2. Payment Callback (Automatic)

**Endpoint:** `GET /api/myfatoorah/callback/:depositId`

**Query Parameters:**
- `paymentId` - MyFatoorah payment ID (from redirect)

**Flow:**
1. User completes payment on MyFatoorah
2. MyFatoorah redirects to: `/api/myfatoorah/callback/{depositId}?paymentId={paymentId}`
3. Backend verifies payment status
4. Updates deposit to "Completed"
5. Adds funds to trading account
6. Syncs with MT5 (if enabled)
7. Credits IB commission (if applicable)
8. Sends confirmation email
9. Redirects user to success page

---

### 3. Check Payment Status (Manual)

**Endpoint:** `GET /api/myfatoorah/payment-status/:paymentId`

**Response:**
```json
{
  "paymentId": "payment-id",
  "invoiceId": 123456,
  "status": "Paid",
  "amount": 100,
  "currency": "USD",
  "depositId": "deposit-id-or-null"
}
```

---

## 🔄 Payment Flow

```
1. User clicks "Deposit" → Frontend calls POST /api/myfatoorah/create-invoice
2. Backend creates deposit record (status: "Pending")
3. Backend creates MyFatoorah invoice
4. User redirected to MyFatoorah payment page
5. User completes payment
6. MyFatoorah redirects to: GET /api/myfatoorah/callback/:depositId?paymentId=...
7. Backend verifies payment with MyFatoorah API
8. If paid:
   - Update deposit status to "Completed"
   - Add funds to trading account
   - Sync with MT5 (if enabled)
   - Credit IB commission (if applicable)
   - Send confirmation email
   - Redirect to success page
9. If failed:
   - Update deposit status to "Rejected"
   - Redirect to error page
```

---

## 🗑️ Removed Stripe Code

The following Stripe-related code has been **completely removed**:

- ✅ Stripe import and initialization
- ✅ `POST /api/stripe/create-payment-intent` → Replaced with `POST /api/myfatoorah/create-invoice`
- ✅ `POST /api/stripe/webhook` → Replaced with `GET /api/myfatoorah/callback/:depositId`
- ✅ `GET /api/stripe/payment-status/:sessionId` → Replaced with `GET /api/myfatoorah/payment-status/:paymentId`
- ✅ All Stripe payment database operations (no longer needed)

---

## 📦 Files Modified

1. **`server/routes.ts`**
   - Removed Stripe import and initialization
   - Added MyFatoorah service import
   - Replaced all Stripe endpoints with MyFatoorah endpoints

2. **`server/services/myfatoorah.ts`** (NEW)
   - MyFatoorah API client
   - Invoice creation
   - Payment status checking
   - TypeScript types and interfaces

---

## 🔐 Security Notes

1. **API Key Storage**: Store `MYFATOORAH_API_KEY` in environment variables, never commit to git
2. **HTTPS Required**: MyFatoorah callbacks require HTTPS in production
3. **Payment Verification**: Always verify payment status with MyFatoorah API before processing
4. **Idempotency**: Callback handler checks if deposit is already completed to prevent duplicate processing

---

## 🧪 Testing

### Test Mode

Set `MYFATOORAH_TEST_MODE=true` to use test environment:
- Test API: `https://apitest.myfatoorah.com`
- Test credentials from MyFatoorah dashboard

### Test Payment Flow

1. Create invoice with test amount
2. Use MyFatoorah test card numbers
3. Verify callback is received
4. Check deposit status is updated
5. Verify trading account balance is updated

---

## 📝 Notes

- **Country Code**: Currently set to `USA` (defaults to main API endpoint)
- **Currency**: USD (hardcoded, can be changed in service)
- **Minimum Deposit**: $10 (enforced in endpoint)
- **MT5 Integration**: Automatically syncs deposits to MT5 if enabled
- **IB Commission**: Automatically credits commission if user was referred

---

## 🚀 Deployment Checklist

- [ ] Set `MYFATOORAH_API_KEY` environment variable
- [ ] Set `MYFATOORAH_COUNTRY_CODE` (default: USA)
- [ ] Set `MYFATOORAH_TEST_MODE=false` for production
- [ ] Set `FRONTEND_URL` for callback redirects
- [ ] Set `API_URL` or `BACKEND_URL` for MyFatoorah callbacks
- [ ] Test payment flow in test mode first
- [ ] Verify HTTPS is enabled (required for production)
- [ ] Monitor callback logs for any issues

---

**Last Updated**: December 23, 2025
**Status**: ✅ Complete - Stripe removed, MyFatoorah integrated










