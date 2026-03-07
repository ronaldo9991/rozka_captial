# MyFatoorah Test Mode Configuration

**Date:** December 23, 2025
**Status:** ✅ **TEST MODE ENABLED**

---

## ✅ Configuration Updated

### Changes Made:
- ✅ `MYFATOORAH_TEST_MODE`: Changed from `false` to `true`
- ✅ Server restarted with new configuration
- ✅ Service will now use test API endpoint: `https://apitest.myfatoorah.com`

---

## 🧪 Test Mode Details

### API Endpoints:
- **Test Mode**: `https://apitest.myfatoorah.com`
- **Production Mode**: `https://api.myfatoorah.com`

### Current Configuration:
```javascript
MYFATOORAH_TEST_MODE: 'true'
MYFATOORAH_COUNTRY_CODE: 'USA'
MYFATOORAH_API_KEY: 'configured'
```

---

## ⚠️ Important Notes

### Test API Key:
- Some API keys work for both test and production
- Some require separate test credentials
- If test mode fails, check MyFatoorah dashboard for test API key

### Test Mode Benefits:
- ✅ Safe testing without real charges
- ✅ Test payment flows
- ✅ Verify integration before production
- ✅ Use test card numbers

---

## 🔄 Switching Back to Production

To switch back to production mode:

1. Edit `ecosystem.config.cjs`:
   ```javascript
   MYFATOORAH_TEST_MODE: 'false'
   ```

2. Restart server:
   ```bash
   pm2 restart mekness-api --update-env
   ```

---

## ✅ Test Mode Status

**Current Mode:** 🧪 **TEST MODE ENABLED**

The system is now configured to use MyFatoorah test environment for all payment operations.

---

**Last Updated:** December 23, 2025










