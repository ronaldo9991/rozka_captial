# Quick Deployment Checklist

## Pre-Deployment (Local)

- [ ] **Build the project**
  ```bash
  npm ci
  npm run build
  ```

- [ ] **Test locally**
  ```bash
  npm start
  ```
  Verify the application runs on http://localhost:5000

- [ ] **Create deployment package**
  ```powershell
  .\deploy-to-vps.ps1
  ```
  Or on Linux/Mac:
  ```bash
  ./deploy-to-vps.sh
  ```

## Server Setup (First Time Only)

- [ ] **SSH into server**
  ```bash
  ssh root@67.227.198.100
  ```

- [ ] **Install Node.js** (if not installed)
  ```bash
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt-get install -y nodejs
  ```

- [ ] **Install PM2**
  ```bash
  npm install -g pm2
  ```

- [ ] **Create project directory**
  ```bash
  mkdir -p /var/www/html/new.mekness.com
  cd /var/www/html/new.mekness.com
  ```

## Upload Files

- [ ] **Upload deployment package**
  - Using SCP: `scp deploy-package.tar.gz root@67.227.198.100:/var/www/html/new.mekness.com/`
  - Or using SFTP client (FileZilla, WinSCP)

- [ ] **Extract files**
  ```bash
  cd /var/www/html/new.mekness.com
  tar -xzf deploy-package.tar.gz
  ```

## Configuration

- [ ] **Create .env file**
  ```bash
  nano .env
  ```
  Add all required environment variables (see VPS_DEPLOYMENT_GUIDE.md)

- [ ] **Install dependencies**
  ```bash
  npm ci --production
  ```

- [ ] **Setup database**
  ```bash
  # Connect to PostgreSQL
  sudo -u postgres psql
  
  # Create database and user (if needed)
  CREATE DATABASE cabinet;
  CREATE USER cabinet WITH PASSWORD '(9:!eg#-7Nd1';
  GRANT ALL PRIVILEGES ON DATABASE cabinet TO cabinet;
  \q
  ```

- [ ] **Run migrations** (if needed)
  ```bash
  npm run db:push
  ```

## Start Application

- [ ] **Start with PM2**
  ```bash
  pm2 start dist/index.js --name mekness-app
  pm2 save
  pm2 startup
  ```

- [ ] **Verify it's running**
  ```bash
  pm2 status
  pm2 logs mekness-app
  ```

## Nginx Configuration

- [ ] **Create Nginx config**
  ```bash
  sudo nano /etc/nginx/sites-available/new.mekness.com
  ```
  (See VPS_DEPLOYMENT_GUIDE.md for full config)

- [ ] **Enable site**
  ```bash
  sudo ln -s /etc/nginx/sites-available/new.mekness.com /etc/nginx/sites-enabled/
  sudo nginx -t
  sudo systemctl reload nginx
  ```

## SSL/HTTPS Setup

- [ ] **Install SSL certificate** (Let's Encrypt recommended)
  ```bash
  sudo apt-get install certbot python3-certbot-nginx
  sudo certbot --nginx -d new.mekness.com
  ```

## Testing

- [ ] **Test client URL**
  - Visit: https://new.mekness.com/
  - Verify homepage loads

- [ ] **Test admin URL**
  - Visit: https://new.mekness.com/huwnymfphhrq/
  - Login with: superadmin@mekness.com / dutt@786@31

- [ ] **Test client login**
  - Visit: https://new.mekness.com/
  - Login with: rizwebs@gmail.com / D6x@EjiSa3kFvf2

- [ ] **Check logs for errors**
  ```bash
  pm2 logs mekness-app --lines 100
  ```

## Post-Deployment

- [ ] **Setup monitoring** (optional)
  ```bash
  pm2 install pm2-logrotate
  ```

- [ ] **Setup backups** (database, files)

- [ ] **Document any custom configurations**

## Update Deployment (Future)

- [ ] **Build new version locally**
  ```bash
  npm ci
  npm run build
  ```

- [ ] **Create new deployment package**
  ```powershell
  .\deploy-to-vps.ps1
  ```

- [ ] **Upload to server**
  ```bash
  scp deploy-package.tar.gz root@67.227.198.100:/var/www/html/new.mekness.com/
  ```

- [ ] **On server: Extract and restart**
  ```bash
  cd /var/www/html/new.mekness.com
  tar -xzf deploy-package.tar.gz
  npm ci --production
  pm2 restart mekness-app
  ```

## Troubleshooting

If something goes wrong:

1. **Check PM2 logs**
   ```bash
   pm2 logs mekness-app
   ```

2. **Check Nginx logs**
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

3. **Check if app is running**
   ```bash
   pm2 status
   curl http://localhost:5000
   ```

4. **Check database connection**
   ```bash
   psql -U cabinet -d cabinet -h localhost
   ```

5. **Check environment variables**
   ```bash
   pm2 env mekness-app
   ```

## Important Notes

- **Database credentials:**
  - Database: `cabinet`
  - User: `cabinet`
  - Password: `(9:!eg#-7Nd1`
  - Root password: `8yjhc<7VJMTT`

- **Admin credentials:**
  - Email: `superadmin@mekness.com`
  - Password: `dutt@786@31`

- **Client credentials:**
  - Email: `rizwebs@gmail.com`
  - Password: `D6x@EjiSa3kFvf2`

- **Server path:** `/var/www/html/new.mekness.com/`
