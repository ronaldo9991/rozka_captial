# Stripe Payment Gateway Setup

This document explains how to configure Stripe payment gateway for the Mekness platform.

## Overview

Stripe is a leading payment gateway that supports credit/debit cards and cryptocurrency payments. This integration uses Stripe Checkout for a secure, hosted payment experience.

## Environment Variables

Add the following to your `.env` file:

```env
# Stripe Payment Gateway (Sandbox/Test Mode)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Frontend URL (for redirects)
FRONTEND_URL=http://localhost:3000  # Development
# FRONTEND_URL=https://yourdomain.com  # Production
```

For the frontend (client/.env or Vite environment variables):

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

## Getting Your Stripe API Keys

1. Sign up for a Stripe account at [https://stripe.com](https://stripe.com)
2. Navigate to your dashboard
3. Go to **Developers** → **API keys**
4. Copy your **Publishable key** (starts with `pk_test_` for test mode)
5. Copy your **Secret key** (starts with `sk_test_` for test mode)
6. For production, use keys starting with `pk_live_` and `sk_live_`

## API Endpoints

### Test Environment (Sandbox)
- Use test API keys (`sk_test_`, `pk_test_`)
- All transactions are simulated
- No real money is charged

### Production Environment
- Use live API keys (`sk_live_`, `pk_live_`)
- Real transactions are processed
- Real money is charged

## Payment Flow

1. **User initiates deposit** → Frontend calls `/api/stripe/create-payment-intent`
2. **Backend creates Checkout Session** → Stripe creates a checkout session
3. **User redirected** → User is redirected to Stripe Checkout page
4. **Payment completion** → Stripe redirects back with status
5. **Webhook notification** → Stripe sends webhook to `/api/stripe/webhook`
6. **Deposit approved** → System updates deposit status and credits account

## Webhook Configuration

Configure your Stripe webhook URL in the Stripe dashboard:

1. Go to **Developers** → **Webhooks** in Stripe Dashboard
2. Click **Add endpoint**
3. Enter your webhook URL:
   ```
   https://yourdomain.com/api/stripe/webhook
   ```
4. Select events to listen for:
   - `checkout.session.completed` (payment succeeded)
   - `checkout.session.async_payment_failed` (payment failed)
5. Copy the **Signing secret** (starts with `whsec_`) to `STRIPE_WEBHOOK_SECRET`

### Local Development

For local development, use Stripe CLI:

```bash
# Install Stripe CLI
# macOS: brew install stripe/stripe-cli/stripe
# Linux/Windows: See https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:5000/api/stripe/webhook

# Copy the webhook signing secret from the output
# It will look like: whsec_...
```

## Supported Payment Methods

Stripe supports:
- Credit/Debit Cards (Visa, Mastercard, Amex, etc.)
- Cryptocurrency (USDC, USDC on Polygon) - via Stripe Checkout
- Digital Wallets (Apple Pay, Google Pay) - automatically enabled

## Testing

### Test Cards

Use Stripe's test cards for testing:

**Success:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/34`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any 5 digits (e.g., `12345`)

**Decline:**
- Card: `4000 0000 0000 0002`
- Expiry: Any future date
- CVC: Any 3 digits

**3D Secure (requires authentication):**
- Card: `4000 0025 0000 3155`
- Expiry: Any future date
- CVC: Any 3 digits

### Test Mode

- All transactions in test mode are simulated
- No real money is charged
- Test cards work immediately
- Webhooks can be tested with Stripe CLI

## Migration from Fatoorah

All Fatoorah dependencies have been replaced:
- ✅ Fatoorah endpoints replaced with Stripe endpoints
- ✅ Frontend updated to use Stripe Checkout
- ✅ Webhook handler updated for Stripe events
- ✅ Database structure remains compatible (using `stripe_payments` table)

## Troubleshooting

### Payment Not Processing
- Verify `STRIPE_SECRET_KEY` is set correctly
- Check you're using test keys (`sk_test_`) for sandbox mode
- Ensure `VITE_STRIPE_PUBLISHABLE_KEY` is set in frontend
- Check browser console for errors

### Webhook Not Receiving Events
- Verify webhook URL is publicly accessible
- Check webhook is enabled in Stripe dashboard
- Verify `STRIPE_WEBHOOK_SECRET` matches the signing secret
- Review server logs for webhook errors
- For local testing, use Stripe CLI: `stripe listen --forward-to localhost:5000/api/stripe/webhook`

### Checkout Session Creation Fails
- Verify API key has correct permissions
- Check amount meets minimum requirements ($10)
- Ensure customer email is provided
- Review Stripe dashboard for error details

### Payment Status Not Updating
- Webhook may not be configured correctly
- Check webhook events are enabled in Stripe dashboard
- Verify webhook signature verification is working
- Check server logs for webhook processing errors

## Support

For Stripe API documentation and support:
- Documentation: [https://stripe.com/docs](https://stripe.com/docs)
- API Reference: [https://stripe.com/docs/api](https://stripe.com/docs/api)
- Support: Contact Stripe support through your dashboard
- Test Cards: [https://stripe.com/docs/testing](https://stripe.com/docs/testing)

## Security Notes

- Never commit API keys to version control
- Use environment variables for all keys
- Always verify webhook signatures
- Use HTTPS in production
- Keep Stripe SDK updated
