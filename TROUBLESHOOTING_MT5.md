# MT5 Account Creation - Troubleshooting Guide

## Current Status

**Issue**: MT5 account creation is failing with Error Code 3 (Invalid Parameters)

**Root Cause**: MT5 server configuration issue - Manager account (10010) doesn't have permission to create accounts

## What's Working ✅

1. ✅ Backend code is correct
2. ✅ MT5 connection is successful
3. ✅ Error messages are being returned
4. ✅ Frontend button is functional
5. ✅ Error handling is in place

## What's NOT Working ❌

1. ❌ MT5 account creation (blocked by server permissions)
2. ❌ Manager account (10010) cannot create accounts
3. ❌ Trading groups may not exist or be configured

## Quick Fixes Applied

### 1. Frontend Improvements
- ✅ Button disabled during creation (prevents multiple clicks)
- ✅ Loading state ("Creating MT5 Accounts...")
- ✅ Better error message display (20 seconds for config issues)
- ✅ Improved response parsing
- ✅ Timeout handling (30 seconds)

### 2. Backend Improvements
- ✅ Detailed error messages
- ✅ Configuration issue flagging
- ✅ Better error logging

## Testing Steps

1. **Check Browser Console**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Click "Create MT5 Accounts" button
   - Look for any JavaScript errors

2. **Check Network Tab**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Click "Create MT5 Accounts" button
   - Find the `/api/user/mt5-accounts/create` request
   - Check the response (should show 500 with error message)

3. **Check Server Logs**
   ```bash
   pm2 logs mekness-api --lines 50
   ```
   - Should show: "MT5 server configuration issue..."

## Expected Behavior

When you click "Create MT5 Accounts":

1. ✅ Button becomes disabled
2. ✅ Button text changes to "Creating MT5 Accounts..."
3. ✅ Request is sent to server
4. ✅ Server returns 500 error (because MT5 server isn't configured)
5. ✅ Error toast appears with detailed message
6. ✅ Button becomes enabled again

## If Button Doesn't Work

Check for JavaScript errors:
1. Open browser console (F12)
2. Look for red error messages
3. Check if the button click handler is being called

## If Error Message Doesn't Show

1. Check if toast notifications are working (try other actions)
2. Check browser console for errors
3. Verify the response is being parsed correctly

## If Account Creation Still Fails

This is **expected** until MT5 server is configured. The account creation will fail with Error Code 3 until:

1. ✅ Manager account (10010) has "Create accounts" permission
2. ✅ Trading groups exist on MT5 server
3. ✅ Groups allow account creation via API

## Next Steps

1. **Immediate**: Test the button - it should show error message
2. **Required**: Configure MT5 server (see `MT5_SERVER_CONFIGURATION_REQUIRED.md`)
3. **After Config**: Test account creation again

## Contact

If issues persist:
- Check browser console for errors
- Check server logs: `pm2 logs mekness-api`
- Email: support@mekness.com

---

**Last Updated**: 2025-12-24


