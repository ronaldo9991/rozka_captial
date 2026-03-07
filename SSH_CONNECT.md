# SSH Connection Guide

## Credentials
- **Server**: 67.227.198.100
- **Username**: root
- **Password**: hY>pWH|11~7E4E

## Connect to SSH

Run this command in PowerShell:
```powershell
ssh root@67.227.198.100
```

When prompted for password, enter: `hY>pWH|11~7E4E`

## After Connecting

Once you're connected, you'll see a prompt like: `root@server:~#`

Then run these commands to deploy:

```bash
# Navigate to project
cd /var/www/html/new.mekness.com/

# Check current files
ls -la

# Install dependencies
npm ci --production

# Restart application
pm2 restart mekness-app

# Check status
pm2 status

# View logs
pm2 logs mekness-app --lines 30
```

## Exit SSH

When done, type:
```bash
exit
```
