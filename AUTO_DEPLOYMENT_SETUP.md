# 🔄 Auto-Deployment Setup Guide

This guide explains how to set up automatic redeployment when the master branch is updated on GitHub.

## ✅ What's Already Set Up

- ✅ Webhook endpoint: `/api/webhook/deploy`
- ✅ Deployment script: `webhook-deploy.sh`
- ✅ Live deployment script: `deploy-live.sh`

## 🚀 Setting Up GitHub Webhook

### Step 1: Generate Webhook Secret (Optional but Recommended)

```bash
# On your server
openssl rand -hex 32
```

Save this secret - you'll need it in Step 3.

### Step 2: Add Secret to Environment Variables

Add to your `.env` file:

```bash
GITHUB_WEBHOOK_SECRET=your-generated-secret-here
```

Then restart PM2:

```bash
pm2 restart mekness-api --update-env
pm2 save
```

### Step 3: Configure GitHub Webhook

1. **Go to your GitHub repository**: https://github.com/ronaldo9991/mekness
2. **Click**: Settings → Webhooks → Add webhook
3. **Configure the webhook**:
   - **Payload URL**: `https://new.mekness.com/api/webhook/deploy`
   - **Content type**: `application/json`
   - **Secret**: (paste the secret from Step 1)
   - **Which events**: Select "Just the push event"
   - **Active**: ✅ Checked
4. **Click**: "Add webhook"

### Step 4: Test the Webhook

1. Make a small change to your repository
2. Push to master branch:
   ```bash
   git add .
   git commit -m "Test auto-deployment"
   git push origin master
   ```
3. Check GitHub webhook delivery:
   - Go to: Settings → Webhooks → Your webhook
   - Click on "Recent Deliveries"
   - You should see a successful delivery (green checkmark)
4. Check deployment logs:
   ```bash
   tail -f /root/mekness/logs/webhook-deploy.log
   ```
5. Verify deployment:
   ```bash
   pm2 logs mekness-api --lines 20
   ```

## 📋 How It Works

1. **GitHub Push Event**: When you push to master branch
2. **GitHub Sends Webhook**: POST request to `/api/webhook/deploy`
3. **Server Validates**: Checks if it's a push to master branch
4. **Deployment Triggered**: Runs `webhook-deploy.sh` which executes `deploy-live.sh`
5. **Deployment Process**:
   - Pulls latest code from master
   - Installs dependencies (if package.json changed)
   - Builds the application
   - Restarts PM2 server

## 🔍 Monitoring

### Check Webhook Logs

```bash
# View webhook deployment log
tail -f /root/mekness/logs/webhook-deploy.log

# View PM2 logs
pm2 logs mekness-api

# Check webhook endpoint
curl -X POST https://new.mekness.com/api/webhook/deploy \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: push" \
  -d '{"ref":"refs/heads/master","head_commit":{"id":"test","message":"test"}}'
```

### Check Deployment Status

```bash
# Server status
pm2 status mekness-api

# Latest commit
cd /root/mekness && git log -1 --oneline

# Build time
ls -lh /root/mekness/dist/index.js
```

## 🔒 Security Notes

1. **Webhook Secret**: Always use a secret to prevent unauthorized deployments
2. **HTTPS Only**: The webhook endpoint should only be accessible via HTTPS
3. **IP Whitelisting**: Consider adding GitHub IP whitelisting in Nginx (optional)
4. **Rate Limiting**: The endpoint doesn't have rate limiting - consider adding it for production

## 🛠️ Troubleshooting

### Webhook Not Triggering

1. **Check GitHub Webhook Status**:
   - Go to: Settings → Webhooks → Recent Deliveries
   - Check for failed deliveries (red X)
   - Click on a delivery to see the error

2. **Check Server Logs**:
   ```bash
   pm2 logs mekness-api | grep webhook
   ```

3. **Test Webhook Manually**:
   ```bash
   curl -X POST http://localhost:5000/api/webhook/deploy \
     -H "Content-Type: application/json" \
     -H "X-GitHub-Event: push" \
     -d '{"ref":"refs/heads/master"}'
   ```

### Deployment Fails

1. **Check Deployment Logs**:
   ```bash
   tail -50 /root/mekness/logs/webhook-deploy.log
   ```

2. **Check Git Status**:
   ```bash
   cd /root/mekness
   git status
   git log -1
   ```

3. **Check PM2 Status**:
   ```bash
   pm2 status
   pm2 logs mekness-api --lines 50
   ```

### Manual Deployment

If auto-deployment fails, you can always deploy manually:

```bash
cd /root/mekness
bash deploy-live.sh
```

## 📝 Next Steps

After setting up the webhook:

1. ✅ Test with a small commit
2. ✅ Verify deployment in logs
3. ✅ Check that the site updates correctly
4. ✅ Monitor first few deployments

## 🎉 Success!

Once configured, every push to the master branch will automatically:
- Pull the latest code
- Install new dependencies (if any)
- Rebuild the application
- Restart the server

Your deployment is now fully automated! 🚀




