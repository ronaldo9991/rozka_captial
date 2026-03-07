# AWS Quick Start Guide

**Got $100 AWS credits? Let's deploy in 15 minutes!**

## 🎯 Recommended: AWS App Runner (Easiest)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Ready for AWS deployment"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Step 2: Deploy on App Runner
1. Go to [AWS Console](https://console.aws.amazon.com/) → **App Runner** → **Create service**
2. Choose **Source code repository** → Connect GitHub
3. Select your repository
4. Configure:
   - **Build command**: `npm ci && npm run build`
   - **Start command**: `npm start`
   - **Port**: `5000`
5. Add environment variables:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `SESSION_SECRET=<generate-random-32-chars>`
6. Click **Create & Deploy**

**Done!** Your app will be live at: `https://<service>.us-east-1.awsapprunner.com`

**Cost**: ~$10-15/month → **~6-10 months with $100 credits!**

---

## 🖥️ Alternative: EC2 (More Control)

### Step 1: Launch EC2 Instance
1. EC2 → Launch Instance
2. Choose: **Amazon Linux 2023**
3. Instance: **t3.micro** (Free tier eligible)
4. Create key pair (download .pem)
5. Security Group: Allow HTTP (80), HTTPS (443), Custom TCP (5000)
6. Launch!

### Step 2: Connect & Setup
```bash
# Connect
ssh -i your-key.pem ec2-user@<instance-ip>

# Run setup script
wget https://raw.githubusercontent.com/<your-repo>/main/ec2-setup.sh
chmod +x ec2-setup.sh
./ec2-setup.sh

# Clone repo
cd /opt/mekness
git clone <your-repo-url> .

# Deploy
chmod +x deploy-aws.sh
./deploy-aws.sh
```

**Cost**: ~$8-10/month → **~10-12 months with $100 credits!**

---

## 📊 Cost Comparison

| Option | Monthly | With $100 | Setup Time |
|--------|---------|-----------|------------|
| **App Runner** | $10-15 | 6-10 months | ⭐⭐⭐⭐⭐ 5 min |
| **EC2 t3.micro** | $8-10 | 10-12 months | ⭐⭐⭐ 15 min |
| **EC2 + RDS** | $20-25 | 4-5 months | ⭐⭐ 30 min |

---

## 🔑 Environment Variables

Create `.env` file or set in AWS Console:

```env
NODE_ENV=production
PORT=5000
SESSION_SECRET=<random-32-chars>
```

Generate SESSION_SECRET:
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

---

## 📚 Full Documentation

See [AWS_DEPLOYMENT.md](./AWS_DEPLOYMENT.md) for detailed guides, troubleshooting, and advanced configurations.

---

## ✅ Checklist

- [ ] AWS account with credits
- [ ] Code pushed to GitHub/GitLab
- [ ] Chosen deployment option
- [ ] Environment variables configured
- [ ] Application deployed and accessible
- [ ] Monitoring/billing alerts set up

**Need help?** Check the full deployment guide or AWS documentation!

