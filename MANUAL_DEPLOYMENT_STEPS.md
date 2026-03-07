# Manual Deployment Guide - Step by Step

## Prerequisites
- ✅ Project built (dist/ folder exists)
- ✅ SSH/SCP available
- ✅ Server password ready

---

## STEP 1: Upload Files to Server

### 1.1 Upload dist folder
Open PowerShell in Cursor and run:
```powershell
cd "d:\Project\Mekness Project"
scp -r dist root@67.227.198.100:/var/www/html/new.mekness.com/
```
**What happens:**
- You'll be asked: "Are you sure you want to continue connecting (yes/no)?"
- Type: `yes` and press Enter
- You'll be asked for password
- Type your **root SSH password** (won't show on screen)
- Press Enter
- Wait for upload to complete (may take a few minutes)

### 1.2 Upload package.json
```powershell
scp package.json root@67.227.198.100:/var/www/html/new.mekness.com/
```
- Enter password when prompted

### 1.3 Upload package-lock.json
```powershell
scp package-lock.json root@67.227.198.100:/var/www/html/new.mekness.com/
```
- Enter password when prompted

**✅ Step 1 Complete when all 3 files are uploaded**

---

## STEP 2: Connect to Server

### 2.1 SSH into server
```powershell
ssh root@67.227.198.100
```
- Type `yes` if asked about host authenticity
- Enter your **root SSH password**
- You should see a command prompt like: `root@server:~#`

**✅ Step 2 Complete when you see the server command prompt**

---

## STEP 3: Navigate to Project Directory

### 3.1 Go to project folder
```bash
cd /var/www/html/new.mekness.com/
```

### 3.2 Verify files are there
```bash
ls -la
```
You should see:
- `dist/` folder
- `package.json`
- `package-lock.json`

**✅ Step 3 Complete when you see the files**

---

## STEP 4: Install Dependencies

### 4.1 Install production dependencies
```bash
npm ci --production
```
**What happens:**
- Downloads and installs required packages
- May take 1-2 minutes
- Wait for it to finish

**✅ Step 4 Complete when you see "added X packages" message**

---

## STEP 5: Restart Application

### 5.1 Restart with PM2
```bash
pm2 restart mekness-app
```

### 5.2 Check status
```bash
pm2 status
```
You should see `mekness-app` with status `online`

### 5.3 View logs
```bash
pm2 logs mekness-app --lines 30
```
**What to look for:**
- No error messages
- Should see "Server running on port 5000" or similar

**✅ Step 5 Complete when app is running**

---

## STEP 6: Verify Deployment

### 6.1 Test locally on server
```bash
curl http://localhost:5000
```
Should return HTML content (not an error)

### 6.2 Exit server
```bash
exit
```
Returns you to your local PowerShell

### 6.3 Test website
Open in browser:
- **Client**: https://new.mekness.com/
- **Admin**: https://new.mekness.com/huwnymfphhrq/

**✅ Step 6 Complete when website loads correctly**

---

## Troubleshooting

### If upload fails:
- Check your internet connection
- Verify server IP: `67.227.198.100`
- Make sure password is correct
- Try uploading one file at a time

### If SSH connection fails:
- Verify password is correct
- Try: `ssh -v root@67.227.198.100` (verbose mode)
- Check if server is accessible: `ping 67.227.198.100`

### If npm ci fails:
- Check if Node.js is installed: `node --version`
- Should be v18 or higher
- If not installed, install Node.js on server

### If PM2 restart fails:
- Check if app exists: `pm2 list`
- If not, start it: `pm2 start dist/index.js --name mekness-app`
- Check logs: `pm2 logs mekness-app`

### If website doesn't load:
- Check if app is running: `pm2 status`
- Check Nginx: `sudo systemctl status nginx`
- Check logs: `pm2 logs mekness-app`

---

## Quick Command Reference

**On your local machine (PowerShell):**
```powershell
# Upload files
scp -r dist root@67.227.198.100:/var/www/html/new.mekness.com/
scp package.json root@67.227.198.100:/var/www/html/new.mekness.com/
scp package-lock.json root@67.227.198.100:/var/www/html/new.mekness.com/

# Connect to server
ssh root@67.227.198.100
```

**On the server (after SSH):**
```bash
# Navigate
cd /var/www/html/new.mekness.com/

# Install dependencies
npm ci --production

# Restart app
pm2 restart mekness-app

# Check status
pm2 status
pm2 logs mekness-app --lines 30
```

---

## Success Checklist

- [ ] Files uploaded successfully
- [ ] Connected to server via SSH
- [ ] Navigated to project directory
- [ ] Dependencies installed
- [ ] Application restarted with PM2
- [ ] PM2 shows app as "online"
- [ ] Website loads at https://new.mekness.com/
- [ ] Admin panel loads at https://new.mekness.com/huwnymfphhrq/

---

**Ready to start? Begin with STEP 1.1 above!**

