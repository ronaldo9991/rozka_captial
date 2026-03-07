# AWS Amplify 404 Error - Fix Guide

## 🔍 The Problem

You're getting a 404 error because **AWS Amplify can only host static websites** (HTML, CSS, JS files), but your Mekness application is a **full-stack app** with:
- ✅ **Frontend**: React app (can be hosted on Amplify)
- ❌ **Backend**: Express.js server (CANNOT run on Amplify)

## ⚠️ Important Note

**AWS Amplify cannot run Node.js/Express servers.** You have two options:

---

## 🎯 Option 1: Split Deployment (Recommended)

**Deploy frontend to Amplify + backend to App Runner/EC2**

### Step 1: Update API endpoints in your React app

Your React app makes API calls to `/api/*`. You'll need to point these to your backend URL:

Create/update `client/src/lib/api.ts` or update your API calls to use an environment variable:

```typescript
const API_URL = import.meta.env.VITE_API_URL || '/api';

export const apiCall = async (endpoint: string, options?: RequestInit) => {
  return fetch(`${API_URL}${endpoint}`, options);
};
```

### Step 2: Deploy Backend to AWS App Runner (Easiest)

1. **Go to AWS App Runner** → Create service
2. Connect your GitHub repo
3. Configure:
   - **Build command**: `npm ci && npm run build`
   - **Start command**: `npm start`
   - **Port**: `5000`
4. Note the App Runner URL: `https://your-app.us-east-1.awsapprunner.com`

### Step 3: Configure Amplify Frontend

1. In **AWS Amplify Console** → Your app → **Environment variables**
2. Add: `VITE_API_URL=https://your-app.us-east-1.awsapprunner.com`
3. **Redeploy** the frontend

### Step 4: Update Amplify Build

The `amplify.yml` file is already created - it builds just the frontend. After deploying the backend:
- Frontend will be at: `https://main.dxnhbsoo5szm1.amplifyapp.com`
- Backend will be at: `https://your-app.us-east-1.awsapprunner.com`

---

## 🚀 Option 2: Full Stack on AWS App Runner (Better for Full-Stack Apps)

**Deploy the entire app (frontend + backend) to AWS App Runner**

This is simpler because everything runs together in one service.

### Steps:

1. **Go to AWS Console** → **App Runner** → **Create service**
2. **Source**: Connect your GitHub repository
3. **Configure**:
   - **Build command**: `npm ci && npm run build`
   - **Start command**: `npm start`
   - **Port**: `5000`
4. **Environment variables**:
   ```
   NODE_ENV=production
   PORT=5000
   SESSION_SECRET=<your-secret-key>
   ```
5. Click **Create & Deploy**

**Done!** Your full-stack app will be at: `https://your-service.us-east-1.awsapprunner.com`

**Cost**: ~$10-15/month (vs $0 for Amplify static hosting, but you get the backend working!)

---

## 📋 Quick Fix Steps (Right Now)

### Immediate Fix for Amplify (Frontend Only):

1. **Commit the new files**:
   ```bash
   git add amplify.yml package.json
   git commit -m "Add Amplify configuration for frontend-only build"
   git push
   ```

2. **In AWS Amplify Console**:
   - Go to your app
   - Click **Redeploy this version** or push a new commit
   - Wait for build to complete

3. **The frontend will load**, but API calls will fail until you deploy the backend

### Then Deploy Backend:

1. Use **AWS App Runner** (Option 2 above) for the full stack
2. OR use **EC2** (see `AWS_DEPLOYMENT.md`)

---

## 🔧 Current Amplify.yml Configuration

The `amplify.yml` file I created:
- ✅ Builds only the frontend (`npm run build:frontend`)
- ✅ Serves from `dist/public` (where Vite outputs static files)
- ✅ Handles SPA routing (redirects all routes to index.html)
- ✅ Adds security headers

---

## 💡 Recommendation

**For a full-stack app like yours, use AWS App Runner** instead of Amplify:

| Service | Frontend | Backend | Cost | Setup |
|---------|----------|---------|------|-------|
| **Amplify** | ✅ | ❌ | Free | Easy |
| **App Runner** | ✅ | ✅ | $10-15/mo | Easy |
| **EC2** | ✅ | ✅ | $8-10/mo | Medium |

**Best choice**: **AWS App Runner** - it's designed for full-stack apps like yours!

---

## 🆘 Still Getting 404?

1. **Check build logs** in Amplify Console
2. **Verify** `dist/public/index.html` exists after build
3. **Check** that `baseDirectory: dist/public` matches your Vite output
4. **Try rebuilding** from Amplify Console

---

## 📚 Next Steps

1. **Choose Option 1 or 2** above
2. **If staying with Amplify**: Deploy backend separately
3. **If using App Runner**: Migrate to App Runner (recommended)

See `AWS_DEPLOYMENT.md` for detailed deployment guides!

