# API Domain Troubleshooting Guide

## Issue: `https://newmekness.com/api` Cannot Be Reached

### Current Status

✅ **Server is running locally** (PM2 process `mekness-api` is online)
❌ **Domain DNS not configured** (`newmekness.com` returns NXDOMAIN)

---

## Problem Diagnosis

1. **DNS Issue**: The domain `newmekness.com` doesn't resolve to any IP address
2. **Possible Deployment**: Your `vercel.json` suggests Vercel deployment, but domain may not be connected
3. **Local Server**: PM2 is running on port 5000 locally, but not accessible via domain

---

## Solutions

### Option 1: Configure DNS for Vercel Deployment (Recommended)

If you're using **Vercel** for hosting:

1. **Check Vercel Dashboard:**
   - Go to https://vercel.com/dashboard
   - Select your project
   - Go to **Settings** → **Domains**
   - Add `newmekness.com` and `www.newmekness.com`

2. **Update DNS Records:**
   - Go to your domain registrar (where you bought `newmekness.com`)
   - Add these DNS records:
     ```
     Type: A
     Name: @
     Value: 76.76.21.21
     
     Type: CNAME
     Name: www
     Value: cname.vercel-dns.com
     ```
   - Or use Vercel's nameservers if provided

3. **Wait for DNS Propagation:**
   - DNS changes can take 24-48 hours
   - Check with: `nslookup newmekness.com`

4. **Verify in Vercel:**
   - Check that domain shows as "Valid" in Vercel dashboard
   - Redeploy if needed

---

### Option 2: Use Railway for Hosting

If you want to use **Railway** (since you're using Railway database):

1. **Deploy to Railway:**
   ```bash
   # Install Railway CLI
   npm i -g @railway/cli
   
   # Login
   railway login
   
   # Link project
   railway link
   
   # Deploy
   railway up
   ```

2. **Configure Domain in Railway:**
   - Go to Railway dashboard
   - Select your service
   - Go to **Settings** → **Networking**
   - Add custom domain: `newmekness.com`
   - Railway will provide DNS records to add

3. **Update DNS:**
   - Add the CNAME record Railway provides to your domain registrar

---

### Option 3: Use Current Server (PM2) with Reverse Proxy

If you want to keep using PM2 on your current server:

1. **Install Nginx:**
   ```bash
   sudo apt update
   sudo apt install nginx
   ```

2. **Configure Nginx:**
   Create `/etc/nginx/sites-available/newmekness.com`:
   ```nginx
   server {
       listen 80;
       server_name newmekness.com www.newmekness.com;
       
       # Redirect HTTP to HTTPS
       return 301 https://$server_name$request_uri;
   }
   
   server {
       listen 443 ssl http2;
       server_name newmekness.com www.newmekness.com;
       
       ssl_certificate /path/to/ssl/cert.pem;
       ssl_certificate_key /path/to/ssl/key.pem;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. **Enable Site:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/newmekness.com /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

4. **Get SSL Certificate (Let's Encrypt):**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d newmekness.com -d www.newmekness.com
   ```

5. **Update DNS:**
   - Point `newmekness.com` A record to your server's IP address
   - Point `www.newmekness.com` CNAME to `newmekness.com`

---

## Quick Test Commands

### Check DNS Resolution:
```bash
nslookup newmekness.com
dig newmekness.com
```

### Check Server Status:
```bash
pm2 list
pm2 logs mekness-api
```

### Test Local API:
```bash
curl http://localhost:5000/api/health
# or
curl http://localhost:5000/api/dashboard/stats
```

### Test with IP (if you know server IP):
```bash
curl http://YOUR_SERVER_IP:5000/api/health
```

---

## Current Server Configuration

Based on your setup:

- **Local Server**: Running on port `5000` via PM2
- **Process Name**: `mekness-api`
- **Status**: ✅ Online
- **Deployment Config**: `vercel.json` exists (suggests Vercel deployment)

---

## Recommended Action Plan

1. **Immediate**: Test if local server works:
   ```bash
   curl http://localhost:5000/api/health
   ```

2. **Short-term**: 
   - If using Vercel: Configure domain in Vercel dashboard
   - If using Railway: Deploy to Railway and configure domain
   - If using current server: Set up Nginx reverse proxy

3. **DNS Configuration**: 
   - Add DNS records at your domain registrar
   - Wait for propagation (24-48 hours)

4. **SSL Certificate**: 
   - Get SSL certificate (Let's Encrypt is free)
   - Configure HTTPS

---

## Verification Steps

After fixing DNS:

1. **Check DNS resolves:**
   ```bash
   nslookup newmekness.com
   # Should return an IP address
   ```

2. **Test API endpoint:**
   ```bash
   curl https://newmekness.com/api/health
   # Should return JSON response
   ```

3. **Check in browser:**
   - Visit: `https://newmekness.com/api/health`
   - Should see JSON response

---

## Common Issues

### Issue: "Site cannot be reached"
- **Cause**: DNS not configured or domain not pointing to server
- **Fix**: Configure DNS records at domain registrar

### Issue: "Connection refused"
- **Cause**: Server not running or firewall blocking
- **Fix**: Check PM2 status, check firewall rules

### Issue: "SSL certificate error"
- **Cause**: No SSL certificate or expired
- **Fix**: Install Let's Encrypt certificate

### Issue: "502 Bad Gateway"
- **Cause**: Nginx can't reach backend server
- **Fix**: Check PM2 is running, check Nginx proxy_pass URL

---

## Need Help?

1. Check PM2 logs: `pm2 logs mekness-api`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Check server status: `pm2 status`
4. Test local API: `curl http://localhost:5000/api/health`

---

**Last Updated**: 2024
**Status**: DNS Configuration Required

