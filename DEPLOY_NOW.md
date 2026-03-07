# 🚀 DEPLOY TO PRODUCTION NOW

## ✅ Pre-Deployment Checklist

- [x] Project built successfully
- [x] Files ready in `dist/` folder
- [ ] Files uploaded to server
- [ ] Application restarted on server

## 📤 Step 1: Upload Files to Server

### Method 1: Using WinSCP (Recommended for Windows)

1. **Download WinSCP**: https://winscp.net/eng/download.php
2. **Connect to server**:
   - **Host**: `67.227.198.100`
   - **Username**: `root`
   - **Password**: (your server root password)
   - **Protocol**: SFTP
3. **Navigate to**: `/var/www/html/new.mekness.com/`
4. **Upload these files/folders**:
   - ✅ `dist/` folder (entire folder - drag and drop)
   - ✅ `package.json`
   - ✅ `package-lock.json`
   - ⚠️ `.env` file (create on server if doesn't exist)

### Method 2: Using PowerShell SCP (if you have SSH key)

```powershell
# Navigate to project directory
cd "d:\Project\Mekness Project"

# Upload files
scp -r dist root@67.227.198.100:/var/www/html/new.mekness.com/
scp package.json root@67.227.198.100:/var/www/html/new.mekness.com/
scp package-lock.json root@67.227.198.100:/var/www/html/new.mekness.com/
```

## 🔧 Step 2: SSH into Server and Deploy

### Connect to Server:
```bash
ssh root@67.227.198.100
```

### Once connected, run these commands:

```bash
# Navigate to project directory
cd /var/www/html/new.mekness.com/

# Install/update dependencies
npm ci --production

# Check if .env exists, if not create it
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << 'EOF'
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://cabinet:(9:!eg#-7Nd1@localhost:5432/cabinet
SESSION_SECRET=change-this-to-random-string-in-production
DOMAIN=https://new.mekness.com
EOF
    echo "✅ .env file created. Please edit it with: nano .env"
fi

# Stop old application (if running)
pm2 stop mekness-app 2>/dev/null || true
pm2 delete mekness-app 2>/dev/null || true

# Start new application
pm2 start dist/index.js --name mekness-app

# Save PM2 configuration
pm2 save

# Check status
pm2 status
pm2 logs mekness-app --lines 30
```

## ✅ Step 3: Verify Deployment

### Check Application Status:
```bash
# On server
pm2 status
curl http://localhost:5000
```

### Test URLs:
- **Client**: https://new.mekness.com/
- **Admin**: https://new.mekness.com/huwnymfphhrq/

## 🔄 Quick Update Script (For Future Updates)

Save this as `update.sh` on the server:

```bash
#!/bin/bash
cd /var/www/html/new.mekness.com/
npm ci --production
pm2 restart mekness-app
pm2 logs mekness-app --lines 20
```

Make it executable:
```bash
chmod +x update.sh
```

Then just run: `./update.sh` after uploading new files.

## 🐛 Troubleshooting

### If application doesn't start:

```bash
# Check logs
pm2 logs mekness-app

# Check if port is in use
netstat -tulpn | grep 5000

# Check Node.js version
node --version

# Check if dist/index.js exists
ls -la dist/index.js
```

### If website shows old version:

```bash
# Clear Nginx cache
sudo systemctl reload nginx

# Restart application
pm2 restart mekness-app

# Check Nginx configuration
sudo nginx -t
```

### If database connection fails:

```bash
# Test database connection
psql -U cabinet -d cabinet -h localhost

# Check PostgreSQL status
sudo systemctl status postgresql
```

## 📝 Important Notes

1. **Backup before deploying**: Always backup the current version
2. **Environment variables**: Make sure `.env` file has correct database credentials
3. **PM2**: Application should auto-restart on server reboot if `pm2 startup` was run
4. **Nginx**: Should be configured to proxy to `http://localhost:5000`

## 🎯 One-Line Deployment (After Files Uploaded)

```bash
cd /var/www/html/new.mekness.com/ && npm ci --production && pm2 restart mekness-app && pm2 logs mekness-app --lines 20
```
