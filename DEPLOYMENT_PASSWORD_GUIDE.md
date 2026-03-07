# Password Guide for Deployment

## Current Situation
You're being prompted for the **root user's SSH password** to connect to the server.

## What Password to Use

The password being asked is:
- **NOT** the admin login password (superadmin@mekness.com / dutt@786@31)
- **NOT** the client login password (rizwebs@gmail.com / D6x@EjiSa3kFvf2)
- **NOT** the database password

It's the **root SSH password** for the VPS server (67.227.198.100).

## Where to Find the Root Password

1. **VPS Provider Dashboard**
   - Check your hosting provider's control panel
   - Look for "Server Access" or "SSH Credentials"
   - May be in "Server Details" or "Access Information"

2. **Email from VPS Provider**
   - Check the initial setup email from your hosting provider
   - Usually contains root password or setup instructions

3. **Server Control Panel**
   - If you have cPanel, Plesk, or similar
   - Check "Server Access" or "SSH Access" section

4. **Password Manager**
   - Check if you saved it when setting up the server

## If You Don't Have the Root Password

### Option 1: Reset Root Password (via VPS Provider)
1. Log into your VPS provider's dashboard
2. Find your server (67.227.198.100)
3. Look for "Reset Password" or "Change Root Password"
4. Set a new password
5. Use that new password for SSH

### Option 2: Use SSH Key Authentication (Recommended)
This avoids needing to enter a password each time.

**On your local machine (Windows):**
```powershell
# Generate SSH key (if you don't have one)
ssh-keygen -t rsa -b 4096

# Copy public key to server (will still need password once)
type $env:USERPROFILE\.ssh\id_rsa.pub | ssh root@67.227.198.100 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

### Option 3: Contact Server Administrator
If someone else set up the server, ask them for the root password.

## Common Password Locations

- **VPS Provider**: DigitalOcean, Linode, Vultr, AWS, etc. - Check their dashboard
- **Server Management Panel**: Webmin, cPanel, Plesk
- **Initial Setup Email**: From when the server was first created
- **Password Manager**: LastPass, 1Password, etc.

## Security Note

Once you have access, consider:
1. Setting up SSH key authentication (more secure)
2. Disabling password authentication
3. Using a non-root user with sudo access

## Next Steps

Once you have the root password:
1. Type it when prompted (it won't show on screen for security)
2. Press Enter
3. The upload will continue

If you continue getting "Permission denied":
- Double-check the password (case-sensitive)
- Make sure Caps Lock is off
- Try resetting the password via your VPS provider

