# VPS Deployment Guide for Mekness Project

## Server Information
- **Server Path**: `/var/www/html/new.mekness.com/`
- **Admin URL**: `https://new.mekness.com/huwnymfphhrq/`
- **Client URL**: `https://new.mekness.com/`
- **Database**: PostgreSQL
- **phpMyAdmin**: `http://67.227.198.100/phpmyadmin/`

## Prerequisites

1. **SSH Access** to the VPS server
2. **Node.js** (v18 or higher) installed on the server
3. **PM2** or similar process manager
4. **Nginx** or Apache configured for reverse proxy
5. **PostgreSQL** database access

## Step 1: Build the Project Locally

```bash
# Navigate to project directory
cd "d:\Project\Mekness Project"

# Install dependencies
npm ci

# Build the project
npm run build
```

This will:
- Build the frontend (Vite)
- Build the backend (esbuild)
- Create a `dist/` folder with production files

## Step 2: Prepare Environment Variables

Create a `.env` file on the server with the following variables:

```env
NODE_ENV=production
PORT=5000

# Database Configuration
DATABASE_URL=postgresql://cabinet:password@localhost:5432/cabinet
# Or use the provided credentials:
# DATABASE_URL=postgresql://cabinet:(9:!eg#-7Nd1@localhost:5432/cabinet

# Session Secret (generate a random string)
SESSION_SECRET=your-session-secret-here

# Stripe Keys (if using Stripe)
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLIC_KEY=your-stripe-public-key

# Email Configuration (if using nodemailer)
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-email-password

# Domain
DOMAIN=https://new.mekness.com
```

## Step 3: Transfer Files to VPS

### Option A: Using SCP (from your local machine)

```bash
# Create a deployment package
tar -czf mekness-deploy.tar.gz dist/ package.json package-lock.json .env

# Transfer to server
scp mekness-deploy.tar.gz root@67.227.198.100:/var/www/html/new.mekness.com/

# SSH into server
ssh root@67.227.198.100
```

### Option B: Using Git (Recommended)

```bash
# On the server
cd /var/www/html/new.mekness.com/
git clone <your-repo-url> .
git checkout main  # or your production branch
```

## Step 4: Server Setup

### SSH into the server:
```bash
ssh root@67.227.198.100
```

### Navigate to project directory:
```bash
cd /var/www/html/new.mekness.com/
```

### Install Node.js (if not installed):
```bash
# Using NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### Install PM2 (Process Manager):
```bash
npm install -g pm2
```

### Install dependencies:
```bash
npm ci --production
```

### Create .env file:
```bash
nano .env
# Paste your environment variables here
# Save with Ctrl+X, then Y, then Enter
```

## Step 5: Database Setup

### Connect to PostgreSQL:
```bash
sudo -u postgres psql
```

### Create database and user (if not exists):
```sql
CREATE DATABASE cabinet;
CREATE USER cabinet WITH PASSWORD '(9:!eg#-7Nd1';
GRANT ALL PRIVILEGES ON DATABASE cabinet TO cabinet;
\q
```

### Run database migrations (if needed):
```bash
npm run db:push
```

## Step 6: Start the Application

### Using PM2:
```bash
# Start the application
pm2 start dist/index.js --name mekness-app

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### Or using npm directly:
```bash
npm start
```

## Step 7: Configure Nginx Reverse Proxy

Create or edit Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/new.mekness.com
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name new.mekness.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name new.mekness.com;

    # SSL Configuration (adjust paths to your certificates)
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Increase body size for file uploads
    client_max_body_size 100M;

    # Proxy to Node.js application
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

    # Static files (if serving separately)
    location /static/ {
        alias /var/www/html/new.mekness.com/dist/client/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/new.mekness.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Step 8: Configure Firewall

```bash
# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow SSH (if not already allowed)
sudo ufw allow 22/tcp

# Enable firewall
sudo ufw enable
```

## Step 9: Verify Deployment

1. **Check if the application is running:**
   ```bash
   pm2 status
   pm2 logs mekness-app
   ```

2. **Test the URLs:**
   - Client: `https://new.mekness.com/`
   - Admin: `https://new.mekness.com/huwnymfphhrq/`

3. **Check Nginx logs:**
   ```bash
   sudo tail -f /var/log/nginx/error.log
   sudo tail -f /var/log/nginx/access.log
   ```

## Step 10: Update Deployment (Future)

When you need to update:

```bash
# SSH into server
ssh root@67.227.198.100

# Navigate to project
cd /var/www/html/new.mekness.com/

# Pull latest changes (if using Git)
git pull origin main

# Or upload new files via SCP

# Rebuild (if needed)
npm ci
npm run build

# Restart application
pm2 restart mekness-app

# Check status
pm2 status
pm2 logs mekness-app --lines 50
```

## Troubleshooting

### Application not starting:
```bash
# Check logs
pm2 logs mekness-app

# Check if port is in use
sudo netstat -tulpn | grep 5000

# Check environment variables
pm2 env mekness-app
```

### Database connection issues:
```bash
# Test database connection
psql -U cabinet -d cabinet -h localhost

# Check PostgreSQL status
sudo systemctl status postgresql
```

### Nginx issues:
```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### Permission issues:
```bash
# Fix ownership
sudo chown -R www-data:www-data /var/www/html/new.mekness.com/

# Fix permissions
sudo chmod -R 755 /var/www/html/new.mekness.com/
```

## Security Checklist

- [ ] Change default passwords
- [ ] Use strong session secrets
- [ ] Enable HTTPS with valid SSL certificates
- [ ] Configure firewall properly
- [ ] Keep Node.js and dependencies updated
- [ ] Set up regular backups
- [ ] Monitor application logs
- [ ] Use environment variables for sensitive data
- [ ] Enable rate limiting
- [ ] Configure CORS properly

## Maintenance Commands

```bash
# View application status
pm2 status

# View logs
pm2 logs mekness-app

# Restart application
pm2 restart mekness-app

# Stop application
pm2 stop mekness-app

# Delete application from PM2
pm2 delete mekness-app

# Monitor resources
pm2 monit
```

## Support

If you encounter issues:
1. Check PM2 logs: `pm2 logs mekness-app`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Check system logs: `journalctl -u nginx -f`
4. Verify environment variables are set correctly
5. Ensure database is accessible and configured
