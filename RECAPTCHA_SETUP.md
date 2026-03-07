# Google reCAPTCHA v2 Setup Guide

This guide will help you set up Google reCAPTCHA v2 for the Sign Up and Login forms.

## 📋 Prerequisites

1. A Google account
2. Access to Google reCAPTCHA Admin Console

## 🔧 Step 1: Get reCAPTCHA Keys

1. **Go to Google reCAPTCHA Admin Console**
   - Visit: https://www.google.com/recaptcha/admin/create

2. **Create a new site**
   - **Label**: Mekness Trading Platform (or your preferred name)
   - **reCAPTCHA type**: Select **"reCAPTCHA v2"** → **"I'm not a robot" Checkbox**
   - **Domains**: Add your domains:
     - `localhost` (for local development)
     - `mekness-production.up.railway.app` (your Railway domain)
     - Your custom domain if you have one
   - **Accept the reCAPTCHA Terms of Service**
   - Click **"Submit"**

3. **Copy your keys**
   - **Site Key** (Public Key): This will be used in the frontend
   - **Secret Key** (Private Key): This will be used in the backend
   - ⚠️ **Keep the Secret Key secure!**

## 🔐 Step 2: Add Environment Variables

### Local Development (.env file)

Create or update your `.env` file in the project root:

```env
# Google reCAPTCHA v2
VITE_RECAPTCHA_SITE_KEY=your_site_key_here
RECAPTCHA_SECRET_KEY=your_secret_key_here
```

### Railway Deployment

1. Go to your Railway project dashboard
2. Click on your service
3. Go to **"Variables"** tab
4. Add the following environment variables:

```
VITE_RECAPTCHA_SITE_KEY=your_site_key_here
RECAPTCHA_SECRET_KEY=your_secret_key_here
```

**Important Notes:**
- `VITE_RECAPTCHA_SITE_KEY` is prefixed with `VITE_` so it's available in the frontend
- `RECAPTCHA_SECRET_KEY` is server-side only (not prefixed with `VITE_`)
- After adding variables, Railway will automatically redeploy

## ✅ Step 3: Verify Installation

1. **Restart your development server** (if running locally):
   ```bash
   npm run dev
   ```

2. **Test the Sign Up form:**
   - Go to `/signup`
   - Fill out the form
   - You should see the reCAPTCHA checkbox
   - Complete the verification
   - Submit the form

3. **Test the Sign In form:**
   - Go to `/signin`
   - Fill out the form
   - You should see the reCAPTCHA checkbox
   - Complete the verification
   - Submit the form

## 🎨 Features

- ✅ **Dark theme** - reCAPTCHA automatically matches your dark theme
- ✅ **Automatic reset** - reCAPTCHA resets on form errors
- ✅ **Validation** - Form submission is blocked until reCAPTCHA is completed
- ✅ **Error handling** - Clear error messages if verification fails

## 🔍 Troubleshooting

### reCAPTCHA not showing

1. **Check environment variables:**
   - Make sure `VITE_RECAPTCHA_SITE_KEY` is set
   - Restart your dev server after adding variables

2. **Check domain whitelist:**
   - Make sure your domain is added in Google reCAPTCHA console
   - For localhost, make sure `localhost` is added (not `127.0.0.1`)

3. **Check browser console:**
   - Open browser DevTools (F12)
   - Check for any JavaScript errors
   - Look for reCAPTCHA-related errors

### "reCAPTCHA verification failed" error

1. **Check Secret Key:**
   - Make sure `RECAPTCHA_SECRET_KEY` is set correctly
   - Verify it matches the Secret Key from Google console

2. **Check network:**
   - Make sure your server can reach `https://www.google.com/recaptcha/api/siteverify`
   - Check for firewall or network restrictions

3. **Check logs:**
   - Check server logs for reCAPTCHA verification errors
   - Look for detailed error messages

### reCAPTCHA works locally but not on Railway

1. **Add Railway domain to reCAPTCHA:**
   - Go to Google reCAPTCHA console
   - Edit your site settings
   - Add `mekness-production.up.railway.app` to domains
   - Or add your custom domain

2. **Verify environment variables:**
   - Check Railway Variables tab
   - Make sure both keys are set correctly
   - Redeploy after adding variables

## 📝 Testing

### Test Mode

For testing, you can use Google's test keys:

**Site Key (always passes):**
```
6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
```

**Secret Key (always passes):**
```
6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
```

⚠️ **Note:** These test keys only work on `localhost`. For production, use your real keys.

## 🔒 Security Notes

1. **Never commit keys to git:**
   - Keys are in `.env` which should be in `.gitignore`
   - Never share Secret Key publicly

2. **Use different keys for development and production:**
   - Create separate reCAPTCHA sites for dev and prod
   - Use different environment variables

3. **Monitor reCAPTCHA analytics:**
   - Check Google reCAPTCHA console regularly
   - Monitor for suspicious activity
   - Adjust security settings if needed

## 📚 Additional Resources

- [Google reCAPTCHA Documentation](https://developers.google.com/recaptcha/docs/display)
- [reCAPTCHA v2 Guide](https://developers.google.com/recaptcha/docs/v2)
- [react-google-recaptcha Documentation](https://www.npmjs.com/package/react-google-recaptcha)

