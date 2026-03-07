# Full-Stack Monorepo Deployment Guide

**Deploy your Mekness full-stack app (Frontend + Backend) in one go!**

## 🎯 Quick Deploy: AWS App Runner (Recommended)

This is the **easiest and best option** for full-stack monorepo deployment.

### Step 1: Prepare Your Repository

1. **Commit all changes**:
   ```bash
   git add .
   git commit -m "Full-stack monorepo ready for deployment"
   git push origin main
   ```

2. **Verify build works locally**:
   ```bash
   npm run build
   npm start
   # Test at http://localhost:5000
   ```

### Step 2: Deploy to AWS App Runner

1. **Go to AWS Console**:
   - Navigate to **AWS App Runner**
   - Click **Create service**

2. **Source Configuration**:
   - Choose **Source code repository**
   - Connect your GitHub/GitLab account
   - Select repository: `mekness-main` (or your repo name)
   - Branch: `main`
   - Deployment trigger: **Automatic** (deploys on every push)

3. **Build Configuration**:
   - Use **apprunner.yaml** from your repository
   - (It's already configured! ✅)

4. **Service Configuration**:
   - Service name: `mekness-app` (or your choice)
   - Virtual CPU: **0.25 vCPU** (sufficient for development)
   - Memory: **0.5 GB** (sufficient for development)
   - Port: **5000**

5. **Environment Variables**:
   Click **Add environment variable** and add:
   ```
   NODE_ENV = production
   PORT = 5000
   SESSION_SECRET = <generate-random-32-char-string>
   ```
   
   **Generate SESSION_SECRET**:
   ```bash
   # Linux/Mac
   openssl rand -base64 32
   
   # Windows PowerShell
   -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
   ```

6. **Review and Create**:
   - Review configuration
   - Click **Create & Deploy**

7. **Wait for Deployment**:
   - Build takes ~5-10 minutes
   - Watch build logs in real-time
   - Service URL will be provided when ready

**Done!** Your full-stack app is live at: `https://your-app.us-east-1.awsapprunner.com`

### Step 3: Verify Deployment

1. **Visit your service URL**
2. **Check frontend**: Homepage loads
3. **Check API**: Sign up / Sign in works
4. **Check logs**: AWS App Runner → Your service → Logs

---

## 🐳 Alternative: Docker Deployment

### Build Docker Image
```bash
docker build -t mekness-app .
```

### Run Locally (Test)
```bash
docker run -p 5000:5000 \
  -e NODE_ENV=production \
  -e PORT=5000 \
  -e SESSION_SECRET=your-secret-here \
  mekness-app
```

### Deploy to AWS ECS/Fargate

1. **Push to ECR** (Elastic Container Registry):
   ```bash
   aws ecr create-repository --repository-name mekness-app
   docker tag mekness-app:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/mekness-app:latest
   docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/mekness-app:latest
   ```

2. **Create ECS Service**:
   - Use Fargate (serverless)
   - Configure task definition
   - Set environment variables
   - Create service

**Cost**: ~$15-20/month for Fargate

---

## 🖥️ Alternative: EC2 Deployment

### One-Time Setup
```bash
# SSH into EC2 instance
ssh -i your-key.pem ec2-user@<instance-ip>

# Run setup script
wget https://raw.githubusercontent.com/<your-repo>/main/ec2-setup.sh
chmod +x ec2-setup.sh
./ec2-setup.sh
```

### Deploy Application
```bash
# Clone repository
cd /opt/mekness
git clone <your-repo-url> .

# Deploy
chmod +x deploy-aws.sh
./deploy-aws.sh
```

### Update Application
```bash
cd /opt/mekness
git pull
npm run build
pm2 restart mekness
```

**Cost**: ~$8-10/month (t3.micro)

---

## 📋 Deployment Checklist

Before deploying:

- [ ] ✅ Code pushed to version control
- [ ] ✅ `apprunner.yaml` configured
- [ ] ✅ `Dockerfile` present (if using Docker)
- [ ] ✅ Environment variables documented
- [ ] ✅ Build tested locally (`npm run build && npm start`)
- [ ] ✅ Database initialized (`npm run db:push` - if needed)
- [ ] ✅ SESSION_SECRET generated
- [ ] ✅ Deployment platform chosen
- [ ] ✅ Monitoring/logging configured

After deploying:

- [ ] ✅ Service URL accessible
- [ ] ✅ Frontend loads correctly
- [ ] ✅ API endpoints working (`/api/*`)
- [ ] ✅ Authentication working (sign up/sign in)
- [ ] ✅ Static files loading (CSS, JS, images)
- [ ] ✅ Database working
- [ ] ✅ Logs accessible
- [ ] ✅ HTTPS enabled (automatic with App Runner)
- [ ] ✅ Domain configured (optional)

---

## 🔧 Troubleshooting

### Build Fails

**Check build logs**:
- Look for TypeScript errors
- Verify all dependencies installed
- Check Node.js version (requires 20+)

**Common fixes**:
```bash
# Clean and rebuild
npm run clean
rm -rf node_modules package-lock.json
npm install
npm run build
```

### App Returns 404

**Check**:
1. Static files in `dist/public/`
2. Server serves from correct directory
3. Routes configured correctly

**Fix**:
```bash
# Verify build output
ls -la dist/
ls -la dist/public/
```

### API Calls Fail

**Check**:
1. Backend server running
2. Routes registered correctly
3. No CORS issues (shouldn't be - same origin)

**Debug**:
```bash
# Check server logs
# Verify /api/* routes exist
```

### Database Issues

**SQLite file permissions**:
```bash
# Ensure write permissions
chmod 666 local.db
```

**Migration needed**:
```bash
npm run db:push
```

---

## 💰 Cost Comparison

| Option | Monthly Cost | Setup Time | Best For |
|--------|-------------|------------|----------|
| **AWS App Runner** | $10-15 | ⭐⭐⭐⭐⭐ 5 min | Recommended |
| **EC2 t3.micro** | $8-10 | ⭐⭐⭐ 15 min | Development |
| **ECS Fargate** | $15-20 | ⭐⭐⭐ 20 min | Production |
| **Docker on EC2** | $8-10 | ⭐⭐⭐⭐ 10 min | Custom needs |

**With $100 credits**: 6-12 months of development! 🎉

---

## 🔄 Continuous Deployment

### Automatic Deploys (GitHub)

**AWS App Runner**:
- ✅ Automatically deploys on every push to `main`
- ✅ No additional configuration needed

**Manual Deploy**:
```bash
git push origin main
# App Runner automatically builds and deploys
```

### Manual Deploy Script

Create `deploy.sh`:
```bash
#!/bin/bash
set -e
echo "🚀 Deploying..."
git push origin main
echo "✅ Pushed to GitHub"
echo "⏳ Waiting for App Runner to deploy..."
echo "🔗 Check: https://your-app.us-east-1.awsapprunner.com"
```

---

## 📊 Monitoring

### App Runner Logs
- AWS Console → App Runner → Your service → Logs
- Real-time log streaming
- Search and filter capabilities

### Application Metrics
- CPU usage
- Memory usage
- Request count
- Response time

### Set Up Alarms
1. Go to CloudWatch
2. Create alarms for:
   - High CPU usage
   - High memory usage
   - Error rates
   - Request latency

---

## 🎯 Next Steps

1. **Deploy to App Runner** (easiest)
2. **Set up custom domain** (optional)
3. **Configure monitoring/alerts**
4. **Set up backups** (database, files)
5. **Enable CI/CD** (automatic deployments)
6. **Set up staging environment** (optional)

---

## 📚 Related Docs

- `MONOREPO_SETUP.md` - Monorepo structure and development
- `AWS_DEPLOYMENT.md` - Detailed AWS options
- `AWS_QUICK_START.md` - Quick reference

---

**Ready to deploy?** Follow the AWS App Runner steps above! 🚀

