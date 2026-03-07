# Deploy from Cursor - Step by Step

## Prerequisites Check

First, let's check if you have SSH/SCP installed. Run this in Cursor terminal:

```powershell
Get-Command ssh
Get-Command scp
```

## Option 1: If SSH/SCP is Available

### Step 1: Run the simple deployment script

```powershell
cd "d:\Project\Mekness Project"
.\deploy-simple.ps1
```

This will:
- Upload `dist/` folder
- Upload `package.json` and `package-lock.json`
- Deploy on server automatically

You'll be prompted for your server password twice (once for SCP, once for SSH).

## Option 2: If SSH/SCP is NOT Available

### Install OpenSSH Client (Windows)

1. **Open PowerShell as Administrator** (right-click > Run as Administrator)
2. Run:
   ```powershell
   Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0
   ```
3. Or via Settings:
   - Settings > Apps > Optional Features
   - Add a feature > OpenSSH Client > Install

### Then run the deployment script

```powershell
cd "d:\Project\Mekness Project"
.\deploy-simple.ps1
```

## Option 3: Manual Step-by-Step (All in Cursor Terminal)

### Step 1: Upload files

```powershell
cd "d:\Project\Mekness Project"

# Upload dist folder
scp -r dist root@67.227.198.100:/var/www/html/new.mekness.com/

# Upload package files
scp package.json root@67.227.198.100:/var/www/html/new.mekness.com/
scp package-lock.json root@67.227.198.100:/var/www/html/new.mekness.com/
```

### Step 2: Deploy on server

```powershell
# Connect and deploy in one command
ssh root@67.227.198.100 "cd /var/www/html/new.mekness.com/ && npm ci --production && pm2 restart mekness-app && pm2 logs mekness-app --lines 20"
```

### Or connect interactively:

```powershell
# Connect to server
ssh root@67.227.198.100

# Then run these commands on the server:
cd /var/www/html/new.mekness.com/
npm ci --production
pm2 restart mekness-app
pm2 logs mekness-app --lines 30
```

## Option 4: Using PowerShell SSH (Alternative)

If you have PowerShell 7+ with SSH support:

```powershell
# Upload files
$session = New-PSSession -HostName 67.227.198.100 -UserName root
Copy-Item -Path "dist" -Destination "/var/www/html/new.mekness.com/" -ToSession $session -Recurse
Copy-Item -Path "package.json" -Destination "/var/www/html/new.mekness.com/" -ToSession $session
Copy-Item -Path "package-lock.json" -Destination "/var/www/html/new.mekness.com/" -ToSession $session

# Deploy
Invoke-Command -Session $session -ScriptBlock {
    cd /var/www/html/new.mekness.com/
    npm ci --production
    pm2 restart mekness-app
}
```

## Troubleshooting

### "scp is not recognized"
- Install OpenSSH Client (see Option 2 above)

### "Permission denied"
- Make sure you're using the correct password
- Check if SSH key authentication is set up

### "Connection refused"
- Check if the server IP is correct: `67.227.198.100`
- Verify server is accessible: `ping 67.227.198.100`

### Files uploaded but app not updating
- Make sure you ran `npm ci --production` on server
- Make sure you ran `pm2 restart mekness-app`
- Check logs: `pm2 logs mekness-app`

## Quick Commands Reference

```powershell
# Check if SSH is available
Get-Command ssh

# Upload files
scp -r dist root@67.227.198.100:/var/www/html/new.mekness.com/

# Deploy
ssh root@67.227.198.100 "cd /var/www/html/new.mekness.com/ && npm ci --production && pm2 restart mekness-app"

# Check status
ssh root@67.227.198.100 "pm2 status"
```

## Verify Deployment

After deployment, test:
- https://new.mekness.com/
- https://new.mekness.com/huwnymfphhrq/
