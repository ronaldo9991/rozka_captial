# MT5 Server Configuration Required

## Issue
MT5 account creation is failing with **Error code 3 (Invalid parameters)**. This indicates a **server-side configuration issue** that must be resolved by the MT5 server administrator.

## Root Cause
The manager account (Login: 10010) can connect to the MT5 server, but cannot create trading accounts. This is typically due to:

1. **Missing Permissions**: Manager account doesn't have "Create accounts" permission enabled
2. **Missing Groups**: Trading groups don't exist on the MT5 server
3. **Group Configuration**: Groups exist but don't allow account creation via API

## Required MT5 Server Configuration

### 1. Enable Manager Account Permissions

In **MT5 Server Admin Panel**:

1. Open **Tools** → **Users** (or **Manager Accounts**)
2. Find manager account **10010**
3. Enable these permissions:
   - ✅ **Create accounts**
   - ✅ **Modify accounts**
   - ✅ **Delete accounts** (optional)
   - ✅ **Read client information**
   - ✅ **Manage deposits/withdrawals**

### 2. Create Trading Groups

Create the following groups in **MT5 Server Admin Panel**:

1. Open **Tools** → **Groups**
2. Create groups:
   - **Mekness-Standard** (for Live accounts)
   - **Mekness-Standard-Demo** (for Demo accounts, optional)

   OR configure the system to use existing groups like:
   - `demo` / `Demo`
   - `real` / `Real`
   - `live` / `Live`
   - `standard` / `Standard`

### 3. Group Configuration

For each trading group, ensure:
- ✅ Group allows account creation via API
- ✅ Group has proper leverage settings
- ✅ Group has trading permissions enabled
- ✅ Group currency is set (USD recommended)

## Current Manager Account Status

- **Login**: 10010
- **Name**: Mekness CRM
- **Group**: managers\administrators
- **Connection**: ✅ Working
- **Read Permissions**: ✅ Working
- **Create Account Permission**: ❌ **NOT WORKING**

## Testing

After configuration, test with:

```bash
cd /root/mekness
php test-mt5-permissions.php
```

This will verify if account creation works.

## Alternative Solution

If you cannot configure the MT5 server immediately, you can:

1. **Disable MT5 integration** temporarily:
   ```env
   MT5_ENABLED=false
   ```

2. **Use system-generated credentials** (current fallback):
   - Trading accounts will be created with system-generated credentials
   - Users can still trade, but won't have MT5 server integration
   - MT5 credentials can be created later when server is configured

## Contact

For MT5 server configuration assistance:
- **Email**: support@mekness.com
- **MT5 Server Provider**: Contact your MT5 hosting provider
- **Documentation**: https://www.mql5.com/en/docs/integration/webapi

## Next Steps

1. ✅ **Immediate**: Improved error messages deployed
2. ⏳ **Required**: MT5 server administrator must configure permissions
3. ⏳ **After Config**: Test account creation again
4. ⏳ **Verify**: Ensure credentials appear in user dashboard

---

**Status**: Waiting for MT5 server configuration
**Last Updated**: 2025-12-24


