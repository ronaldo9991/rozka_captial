# Quick Deploy Instructions

## Current Status
✅ Project built successfully
✅ Files ready in `dist/` folder
❌ **NOT YET DEPLOYED TO SERVER**

## To Deploy Now:

### Step 1: Upload Files to Server

**Option A: Using WinSCP or FileZilla (Easiest)**
1. Download WinSCP: https://winscp.net/eng/download.php
2. Connect to server:
   - Host: `67.227.198.100`
   - Username: `root`
   - Password: (your server password)
   - Protocol: SFTP
3. Navigate to: `/var/www/html/new.mekness.com/`
4. Upload these files/folders:
   - `dist/` folder (entire folder)
   - `package.json`
   - `package-lock.json`
   - `.env` file (create this on server with your config)

**Option B: Using SCP Command (if you have SSH)**
```bash
# From your local machine
scp -r dist package.json package-lock.json root@67.227.198.100:/var/www/html/new.mekness.com/
```

### Step 2: SSH into Server

```bash
ssh root@67.227.198.100
```

### Step 3: Navigate to Project Directory

```bash
cd /var/www/html/new.mekness.com/
```

### Step 4: Install Dependencies

```bash
npm ci --production
```

### Step 5: Create .env File

```bash
nano .env
```

Add these variables:
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://cabinet:(9:!eg#-7Nd1@localhost:5432/cabinet
SESSION_SECRET=your-random-secret-key-here-change-this
DOMAIN=https://new.mekness.com
```

Save: `Ctrl+X`, then `Y`, then `Enter`

### Step 6: Install PM2 (if not installed)

```bash
npm install -g pm2
```

### Step 7: Start Application

```bash
# Stop old version if running
pm2 stop mekness-app 2>/dev/null || true
pm2 delete mekness-app 2>/dev/null || true

# Start new version
pm2 start dist/index.js --name mekness-app

# Save PM2 configuration
pm2 save

# Setup auto-start on boot
pm2 startup
```

### Step 8: Check Status

```bash
pm2 status
pm2 logs mekness-app --lines 50
```

### Step 9: Verify Nginx is Configured

Check if Nginx is pointing to port 5000:
```bash
sudo nano /etc/nginx/sites-available/new.mekness.com
```

Should have:
```nginx
location / {
    proxy_pass http://localhost:5000;
    ...
}
```

Reload Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Step 10: Test the Website

Visit:
- https://new.mekness.com/
- https://new.mekness.com/huwnymfphhrq/

## Troubleshooting

If the site doesn't work:

1. **Check if app is running:**
   ```bash
   pm2 status
   curl http://localhost:5000
   ```

2. **Check logs:**
   ```bash
   pm2 logs mekness-app
   ```

3. **Check Nginx:**
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

4. **Check port:**
   ```bash
   sudo netstat -tulpn | grep 5000
   ```

5. **Restart everything:**
   ```bash
   pm2 restart mekness-app
   sudo systemctl restart nginx
   ```

## Quick Commands Reference

```bash
# View app status
pm2 status

# View logs
pm2 logs mekness-app

# Restart app
pm2 restart mekness-app

# Stop app
pm2 stop mekness-app

# View Nginx logs
sudo tail -f /var/log/nginx/error.log
```
