# Full-Stack Monorepo Setup Guide

This project is structured as a **full-stack monorepo** with unified deployment.

## 📁 Monorepo Structure

```
mekness-main/
├── client/              # Frontend (React + Vite + TypeScript)
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── lib/         # Utilities (API client, query client)
│   │   └── main.tsx     # Entry point
│   └── index.html       # HTML template
│
├── server/              # Backend (Express + TypeScript)
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes
│   ├── db.ts            # Database configuration
│   ├── vite.ts          # Static file serving
│   └── storage.ts       # Data storage layer
│
├── shared/              # Shared code (types, schemas)
│   └── schema.ts        # Drizzle ORM schemas
│
├── scripts/             # Build scripts
│   └── sync-static.mjs  # Sync static assets
│
├── package.json         # Root package.json (monorepo root)
├── Dockerfile           # Container configuration
├── apprunner.yaml       # AWS App Runner config
└── amplify.yml          # AWS Amplify config (frontend only)
```

## 🚀 How It Works

### Development Mode
```bash
npm run dev
```
- Starts Express server on port 5000
- Serves React app via Vite middleware
- Hot module replacement (HMR) enabled
- API routes: `/api/*`
- Frontend: Everything else

### Production Build
```bash
npm run build
```

This runs:
1. **Frontend Build**: `vite build`
   - Outputs to: `dist/public/`
   - Creates optimized React bundle

2. **Backend Build**: `esbuild server/index.ts`
   - Outputs to: `dist/index.js`
   - Bundles Express server

3. **Static Sync**: `scripts/sync-static.mjs`
   - Syncs frontend build to server's static directory

### Production Run
```bash
npm start
```
- Runs: `node dist/index.js`
- Express server serves:
  - Static files from `dist/public/`
  - API routes from `/api/*`
  - SPA fallback (all routes → `index.html`)

## 🔗 API Integration

The frontend uses **relative API paths** (`/api/*`), which means:
- ✅ Works seamlessly in production (same domain)
- ✅ Works in development (Vite proxy not needed)
- ✅ No CORS issues
- ✅ Automatic cookie/session handling

Example API calls:
```typescript
// In client/src/lib/queryClient.ts
fetch('/api/auth/signin', { ... })
fetch('/api/admin/stats', { ... })
```

## 📦 Package Management

**Single `package.json`** at root:
- All dependencies in one place
- Shared between client and server
- Simpler dependency resolution
- TypeScript paths configured for `@shared`

### TypeScript Path Aliases
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./client/src/*"],
      "@shared/*": ["./shared/*"]
    }
  }
}
```

## 🌐 Deployment Options

### Option 1: AWS App Runner (Recommended - Full-Stack)
```bash
# Configured in apprunner.yaml
# Builds both frontend and backend together
# Deploys as single service
```

**Features:**
- ✅ Full-stack in one service
- ✅ Automatic scaling
- ✅ HTTPS included
- ✅ Environment variables support
- ✅ Cost: ~$10-15/month

### Option 2: Docker Container
```bash
docker build -t mekness-app .
docker run -p 5000:5000 -e SESSION_SECRET=xxx mekness-app
```

**Features:**
- ✅ Works on any platform
- ✅ Consistent environments
- ✅ Can deploy to ECS, Fargate, etc.

### Option 3: EC2 Instance
```bash
# SSH into EC2
./ec2-setup.sh    # One-time setup
./deploy-aws.sh   # Deploy application
```

**Features:**
- ✅ Full control
- ✅ Cost-effective (~$8-10/month)
- ✅ Good for development

### Option 4: Split Deployment
- **Frontend**: AWS Amplify (static hosting)
- **Backend**: AWS App Runner or EC2

**Note**: Requires API URL configuration for frontend.

## 🔧 Build Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build both frontend and backend |
| `npm run build:frontend` | Build only React app |
| `npm run build:backend` | Build only Express server |
| `npm start` | Run production server |
| `npm run check` | TypeScript type checking |
| `npm run clean` | Clean build artifacts |

## 📝 Environment Variables

Create `.env` file (or set in deployment platform):

```env
# Server Configuration
NODE_ENV=production
PORT=5000

# Session Management
SESSION_SECRET=<generate-random-32-char-string>

# Database (optional - defaults to SQLite)
DATABASE_URL=file:./local.db

# Stripe (optional)
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
```

## 🗄️ Database

Currently uses **SQLite** (perfect for monorepo):
- ✅ No separate database service needed
- ✅ File-based: `local.db`
- ✅ Works great for development and small apps
- ✅ Can migrate to PostgreSQL later if needed

**For PostgreSQL:**
- Update `server/db.ts` to use PostgreSQL driver
- Update `shared/schema.ts` to use `pgTable` instead of `sqliteTable`
- Set `DATABASE_URL=postgresql://...`

## 🔐 Security

- ✅ Sessions: Express-session with secure cookies
- ✅ Authentication: Passport.js
- ✅ Passwords: bcryptjs hashing
- ✅ CORS: Not needed (same origin)
- ✅ HTTPS: Configured in production
- ✅ Environment variables: Never committed

## 📊 Architecture

```
┌─────────────────────────────────────────┐
│         User's Browser                   │
└──────────────┬──────────────────────────┘
               │ HTTPS
               ▼
┌─────────────────────────────────────────┐
│      AWS App Runner / EC2                │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │    Express Server (dist/index.js)│   │
│  │                                   │   │
│  │  ┌────────────┐  ┌─────────────┐ │   │
│  │  │  Static    │  │   API       │ │   │
│  │  │  Files     │  │   Routes    │ │   │
│  │  │ /          │  │ /api/*      │ │   │
│  │  └────────────┘  └─────────────┘ │   │
│  │                                   │   │
│  │         └──────┬────────┘         │   │
│  │                ▼                  │   │
│  │         ┌─────────────┐           │   │
│  │         │  Database   │           │   │
│  │         │  (SQLite)   │           │   │
│  │         └─────────────┘           │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## 🎯 Advantages of This Monorepo Setup

1. **Single Deployment**: Frontend + backend deploy together
2. **Type Safety**: Shared types between client and server
3. **No CORS Issues**: Same origin for API calls
4. **Simpler Development**: One command to start everything
5. **Unified Dependencies**: One `package.json` to manage
6. **Code Sharing**: `shared/` folder for common code
7. **Build Optimization**: Frontend and backend built together

## 🚀 Quick Deploy Checklist

- [ ] Code pushed to GitHub/GitLab
- [ ] Environment variables configured
- [ ] `.env` file created (or variables set in deployment platform)
- [ ] Database initialized (`npm run db:push` if needed)
- [ ] Build tested locally (`npm run build && npm start`)
- [ ] Deployment platform configured (App Runner, EC2, etc.)
- [ ] Domain/URL verified
- [ ] HTTPS configured
- [ ] Monitoring/logging set up

## 📚 Related Documentation

- `AWS_DEPLOYMENT.md` - Detailed AWS deployment guide
- `AWS_QUICK_START.md` - Quick start guide
- `AMPLIFY_FIX.md` - Amplify-specific deployment
- `Dockerfile` - Container configuration

## 💡 Tips

1. **Development**: Always use `npm run dev` for hot reload
2. **Testing Build**: Run `npm run build && npm start` before deploying
3. **Type Checking**: Run `npm run check` to catch TypeScript errors
4. **Clean Build**: If issues occur, run `npm run clean && npm install && npm run build`
5. **Database**: SQLite file is in repo root - don't commit `local.db*` files

---

**Need help?** Check the deployment guides or AWS documentation!

