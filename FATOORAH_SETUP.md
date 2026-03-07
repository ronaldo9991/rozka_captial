# Fatoorah Payment Gateway Setup

This document explains how to configure Fatoorah payment gateway for the Mekness platform.

## Overview

Fatoorah has replaced Stripe as the payment gateway. Fatoorah is a leading payment gateway in the Middle East, supporting multiple payment methods including credit/debit cards, bank transfers, and digital wallets.

## Environment Variables

Add the following to your `.env` file:

```env
# Fatoorah Payment Gateway
FATOORAH_API_KEY=your-fatoorah-api-key-here
FATOORAH_BASE_URL=https://apitest.myfatoorah.com  # Test environment
# FATOORAH_BASE_URL=https://api.myfatoorah.com     # Production environment
```

## Getting Your Fatoorah API Key

1. Sign up for a Fatoorah account at [https://myfatoorah.com](https://myfatoorah.com)
2. Navigate to your dashboard
3. Go to **API Settings** or **Developer** section
4. Copy your **API Key**
5. For testing, use the test API key from the test environment
6. For production, use your live API key

## API Endpoints

### Test Environment
- Base URL: `https://apitest.myfatoorah.com`
- Use this for development and testing

### Production Environment
- Base URL: `https://api.myfatoorah.com`
- Use this for live transactions

## Payment Flow

1. **User initiates deposit** → Frontend calls `/api/fatoorah/create-invoice`
2. **Backend creates invoice** → Fatoorah API creates payment invoice
3. **User redirected** → User is redirected to Fatoorah payment page
4. **Payment completion** → Fatoorah redirects back with status
5. **Webhook notification** → Fatoorah sends webhook to `/api/fatoorah/webhook`
6. **Deposit approved** → System updates deposit status and credits account

## Webhook Configuration

Configure your Fatoorah webhook URL in the Fatoorah dashboard:

```
https://yourdomain.com/api/fatoorah/webhook
```

For local development, use a service like ngrok:
```bash
ngrok http 3000
# Then use: https://your-ngrok-url.ngrok.io/api/fatoorah/webhook
```

## Supported Payment Methods

Fatoorah supports:
- Credit/Debit Cards (Visa, Mastercard, etc.)
- Bank Transfers
- Digital Wallets
- Cryptocurrency (if enabled in your Fatoorah account)

## Testing

Use Fatoorah's test cards for testing:
- **Success**: Use any valid test card number
- **Failure**: Use declined test cards from Fatoorah documentation

## Migration from Stripe

All Stripe dependencies have been removed:
- ✅ Stripe SDK removed from `package.json`
- ✅ Stripe endpoints replaced with Fatoorah endpoints
- ✅ Frontend updated to use Fatoorah payment flow
- ✅ Webhook handler updated for Fatoorah callbacks

## Troubleshooting

### Payment Not Processing
- Verify `FATOORAH_API_KEY` is set correctly
- Check `FATOORAH_BASE_URL` matches your environment (test/production)
- Ensure webhook URL is accessible and configured in Fatoorah dashboard

### Webhook Not Receiving Events
- Verify webhook URL is publicly accessible
- Check webhook is enabled in Fatoorah dashboard
- Review server logs for webhook errors

### Invoice Creation Fails
- Verify API key has correct permissions
- Check invoice amount meets minimum requirements
- Ensure customer data (email, phone) is provided

## Support

For Fatoorah API documentation and support:
- Documentation: [https://myfatoorah.readme.io](https://myfatoorah.readme.io)
- Support: Contact Fatoorah support through your dashboard

