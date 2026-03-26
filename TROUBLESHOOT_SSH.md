# Troubleshooting SSH "Permission Denied" Error

## Common Causes

### 1. **Wrong Password**
- Password is case-sensitive
- Check for typos
- Make sure Caps Lock is off
- Password might have special characters that need careful typing

### 2. **Wrong Username**
- You might not be using `root`
- Try other common usernames:
  - `admin`
  - `ubuntu` (for Ubuntu servers)
  - `debian` (for Debian servers)
  - `centos` (for CentOS servers)
  - Your actual username if you created one

### 3. **SSH Password Authentication Disabled**
- Server might only allow SSH key authentication
- Need to use SSH keys instead of password

### 4. **User Account Issues**
- Root login might be disabled
- Account might be locked
- Need to use sudo user instead

## Solutions

### Solution 1: Verify Username
Try different usernames:

```powershell
# Try root
ssh root@67.227.198.100

# Try admin
ssh admin@67.227.198.100

# Try ubuntu (common for Ubuntu servers)
ssh ubuntu@67.227.198.100
```

### Solution 2: Check if Password Authentication is Enabled
The server might require SSH keys. Check your VPS provider dashboard for:
- "SSH Keys" section
- "Access Methods"
- Whether password auth is enabled

### Solution 3: Reset Root Password via VPS Provider
1. Log into your VPS provider dashboard
2. Find server: 67.227.198.100
3. Look for:
   - "Reset Root Password"
   - "Change Password"
   - "Server Access" > "Reset Password"
4. Set a new password
5. Wait a few minutes for it to take effect
6. Try connecting again

### Solution 4: Use VPS Provider's Console/Web Terminal
Many VPS providers offer:
- Web-based console/terminal
- VNC access
- Browser-based SSH

This lets you access the server without SSH password.

### Solution 5: Check Server Access Method
Your server might use:
- **SSH Keys only** (no password)
- **Password + SSH Key**
- **Password only**

Check your VPS provider's documentation for your server's access method.

### Solution 6: Contact VPS Provider Support
If nothing works:
1. Contact your VPS provider's support
2. Ask them to:
   - Reset the root password
   - Enable password authentication
   - Provide SSH access credentials

## Quick Diagnostic Commands

Try these to get more information:

```powershell
# Try verbose SSH to see what's happening
ssh -v root@67.227.198.100

# Check if server is reachable
ping 67.227.198.100

# Try with different authentication methods
ssh -o PreferredAuthentications=password root@67.227.198.100
```

## Alternative: Use VPS Provider's File Manager

If SSH doesn't work, you can:
1. Use your VPS provider's file manager/upload tool
2. Upload files through their web interface
3. Then use their web terminal to run deployment commands

## What Information Do You Have?

To help further, please check:
- [ ] What VPS provider are you using? (DigitalOcean, Linode, Vultr, AWS, etc.)
- [ ] Do you have access to the VPS provider's dashboard?
- [ ] Can you see server details/access information there?
- [ ] Is there a "Console" or "Web Terminal" option?
- [ ] Do you have SSH keys set up?

