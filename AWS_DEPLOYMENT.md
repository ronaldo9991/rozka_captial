# AWS Deployment Guide for Mekness Trading Platform

This guide covers multiple AWS deployment options optimized for development with your $100 AWS credits.

## 💰 Estimated Monthly Costs

| Option | Monthly Cost | Best For |
|--------|-------------|----------|
| **AWS App Runner** | ~$10-15 | Simplest, automated |
| **EC2 t3.micro + SQLite** | ~$8-10 | Full control, cheapest |
| **EC2 t3.micro + RDS db.t3.micro** | ~$20-25 | Production-ready |
| **Elastic Beanstalk** | ~$12-18 | Platform as a Service |

## 🚀 Option 1: AWS App Runner (Recommended for Simplicity)

**Best for**: Quick setup, automatic scaling, no server management  
**Cost**: ~$10-15/month  
**Difficulty**: ⭐ Easy

### Prerequisites
1. AWS Account with credits
2. Docker installed locally (optional, for testing)
3. AWS CLI configured

### Steps

1. **Push code to GitHub/GitLab**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Create App Runner Service**
   - Go to AWS Console → App Runner → Create service
   - Choose "Source code repository"
   - Connect your GitHub/GitLab account
   - Select your repository
   - Configure:
     - **Build command**: `npm ci && npm run build`
     - **Start command**: `npm start`
     - **Port**: `5000`
     - **Environment variables**:
       ```
       NODE_ENV=production
       PORT=5000
       SESSION_SECRET=<generate-random-string>
       ```

3. **Deploy**
   - Click "Create & Deploy"
   - Wait ~5-10 minutes for deployment
   - Your app will be available at: `https://<your-service>.us-east-1.awsapprunner.com`

### Testing Locally with Docker
```bash
docker build -t mekness-app .
docker run -p 5000:5000 -e SESSION_SECRET=your-secret mekness-app
```

---

## 🖥️ Option 2: EC2 Instance (Best Control & Value)

**Best for**: Full control, cost-effective, development flexibility  
**Cost**: ~$8-10/month (t3.micro)  
**Difficulty**: ⭐⭐ Medium

### Steps

1. **Launch EC2 Instance**
   - Go to EC2 → Launch Instance
   - Choose: **Amazon Linux 2023** or **Ubuntu 22.04 LTS**
   - Instance type: **t3.micro** (Free tier eligible, or $0.0104/hour ≈ $7.50/month)
   - Create/select key pair (download .pem file)
   - Security Group: Allow HTTP (80), HTTPS (443), and Custom TCP 5000
   - Launch instance

2. **Connect to Instance**
   ```bash
   ssh -i your-key.pem ec2-user@<your-instance-ip>
   ```

3. **Install Node.js and Dependencies**
   ```bash
   # On Amazon Linux 2023
   sudo dnf install -y git
   curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
   sudo dnf install -y nodejs

   # Verify installation
   node --version  # Should be v20.x
   npm --version
   ```

4. **Clone and Setup Application**
   ```bash
   # Clone your repository
   git clone <your-repo-url>
   cd mekness-main

   # Install dependencies
   npm ci

   # Build application
   npm run build

   # Create .env file
   nano .env
   ```
   Add to `.env`:
   ```
   NODE_ENV=production
   PORT=5000
   SESSION_SECRET=<generate-random-string>
   ```

5. **Install PM2 (Process Manager)**
   ```bash
   sudo npm install -g pm2
   pm2 start dist/index.js --name mekness
   pm2 startup  # Follow instructions to enable auto-start
   pm2 save
   ```

6. **Setup Nginx (Reverse Proxy - Optional but Recommended)**
   ```bash
   sudo dnf install -y nginx
   sudo systemctl start nginx
   sudo systemctl enable nginx
   ```

   Create Nginx config:
   ```bash
   sudo nano /etc/nginx/conf.d/mekness.conf
   ```
   Add:
   ```nginx
   server {
       listen 80;
       server_name <your-domain-or-ec2-ip>;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### Update Application
```bash
cd mekness-main
git pull
npm ci
npm run build
pm2 restart mekness
```

---

## 🎯 Option 3: EC2 + RDS PostgreSQL (Production Ready)

**Best for**: Production workloads, scalable database  
**Cost**: ~$20-25/month (t3.micro EC2 + db.t3.micro RDS)  
**Difficulty**: ⭐⭐⭐ Advanced

### Additional Steps (after EC2 setup above)

1. **Create RDS PostgreSQL Instance**
   - Go to RDS → Create database
   - Engine: **PostgreSQL** (version 15+)
   - Template: **Free tier** or **Dev/Test**
   - DB instance class: **db.t3.micro** (~$15/month)
   - Storage: 20 GB (free tier includes 20 GB)
   - Master username/password: Set your credentials
   - VPC: Same as EC2 instance
   - Security group: Allow PostgreSQL (5432) from EC2 security group

2. **Get RDS Endpoint**
   - After creation, note the endpoint (e.g., `mekness-db.xxxxx.us-east-1.rds.amazonaws.com`)

3. **Update Application**
   - You'll need to migrate schema from SQLite to PostgreSQL
   - Update `shared/schema.ts` to use `pgTable` instead of `sqliteTable`
   - Update `server/db.ts` to use PostgreSQL driver
   - Update `.env`:
     ```
     DATABASE_URL=postgresql://username:password@your-rds-endpoint:5432/mekness
     ```

---

## 🌐 Option 4: Elastic Beanstalk (Platform as a Service)

**Best for**: AWS-managed platform, easy deployments  
**Cost**: ~$12-18/month  
**Difficulty**: ⭐⭐ Medium

### Steps

1. **Install EB CLI**
   ```bash
   pip install awsebcli --upgrade --user
   ```

2. **Initialize Elastic Beanstalk**
   ```bash
   cd mekness-main
   eb init -p "Node.js" -r us-east-1
   ```

3. **Create Environment**
   ```bash
   eb create mekness-dev-env
   ```

4. **Set Environment Variables**
   ```bash
   eb setenv NODE_ENV=production SESSION_SECRET=<your-secret>
   ```

5. **Deploy**
   ```bash
   eb deploy
   eb open  # Opens your app in browser
   ```

---

## 📋 Environment Variables Setup

Create a `.env` file on your server or set in AWS Console:

```env
NODE_ENV=production
PORT=5000
SESSION_SECRET=<generate-random-string>
# Optional: For PostgreSQL
# DATABASE_URL=postgresql://user:pass@host:5432/dbname
# Optional: For Stripe (if configured)
# STRIPE_SECRET_KEY=sk_...
# STRIPE_PUBLISHABLE_KEY=pk_...
```

Generate SESSION_SECRET:
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

---

## 🔒 Security Best Practices

1. **Never commit `.env` file** - It's in `.gitignore`
2. **Use IAM roles** instead of access keys when possible
3. **Enable HTTPS** - Use AWS Certificate Manager + Application Load Balancer
4. **Restrict security groups** - Only allow necessary ports
5. **Regular updates** - Keep dependencies and OS updated
6. **Backup database** - Enable automated RDS backups if using RDS

---

## 📊 Monitoring & Logs

### CloudWatch (Built-in AWS monitoring)
- EC2: Check instance metrics, set up alarms
- App Runner: Automatic log streaming to CloudWatch
- RDS: Database performance insights

### Application Logs
- **PM2**: `pm2 logs mekness`
- **CloudWatch Logs**: Integrate with AWS services
- **EB**: `eb logs`

---

## 💡 Cost Optimization Tips

1. **Use t3.micro** for development (free tier eligible for new accounts)
2. **Stop EC2 instances** when not in use (save ~70% of compute costs)
3. **Use S3** for static assets (very cheap, ~$0.023/GB/month)
4. **CloudFront CDN** - Free 1TB/month for first year
5. **Set up billing alerts** - Get notified at $50, $75, $90

---

## 🚨 Troubleshooting

### Application won't start
```bash
# Check logs
pm2 logs mekness
# Or
journalctl -u your-service -f
```

### Port already in use
```bash
lsof -i :5000
kill -9 <PID>
```

### Can't connect to database
- Check security groups
- Verify RDS endpoint
- Check database credentials

### Out of memory
- Upgrade to t3.small ($15/month)
- Or optimize application memory usage

---

## 🎯 Recommended Setup for $100 Budget

**Best Value Setup:**
- **EC2 t3.micro**: $7.50/month (or free tier)
- **S3 for backups**: $0.50/month
- **CloudWatch**: $1-2/month
- **Data transfer**: $1-2/month
- **Total**: ~$10-15/month

This gives you **6-10 months** of development time with $100 credits!

---

## 📚 Additional Resources

- [AWS Free Tier](https://aws.amazon.com/free/)
- [EC2 Pricing](https://aws.amazon.com/ec2/pricing/)
- [RDS Pricing](https://aws.amazon.com/rds/pricing/)
- [App Runner Pricing](https://aws.amazon.com/apprunner/pricing/)

---

## 🔄 Next Steps

1. Choose your deployment option
2. Set up AWS account and configure CLI
3. Push code to version control
4. Follow deployment steps for chosen option
5. Monitor costs in AWS Billing Dashboard

**Need help?** Check AWS documentation or reach out for specific issues!

