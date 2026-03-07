# Mekness Web3 Trading Platform

A refined Web3-inspired front-end for the Mekness trading ecosystem. This project reimagines the official Mekness website with a black-and-gold palette, glassmorphism, animated grids, and immersive micro-interactions while keeping all content aligned with data from [mekness.com](https://mekness.com).

## ✨ Highlights
- **Modern hero experience** with particle fields, animated trading cards, and bold typography.
- **Floating Web3 navbar** and enhanced brand logo with neon glow.
- **Promotional and partnership cards** rebuilt with pop-up transitions and section scroll targeting.
- **Account Types & Compare Spreads** merged into a unified section featuring interactive highlighting.
- **Downloads section** for MetaTrader 5 desktop, web, and mobile (with QR codes for App Store, Google Play, and Huawei AppGallery).
- **Dedicated Forex and Contact pages** adapted from Mekness content, including counting animations and collapsible privacy policy.
- **Responsive design** tuned for desktop, tablet, and mobile with reduced scroll gaps and proportional spacing.

## 📁 Project Structure (Full-Stack Monorepo)
```
client/        # React + TypeScript front-end (Vite)
  src/
    components/  # Shared UI elements and custom sections
    pages/       # Home, About, Forex, Contact, Auth, Dashboards
server/        # Express API & routing (Session management, admin endpoints)
shared/        # Shared schemas and types
```

## 🚀 Getting Started

### Development
```bash
# Install dependencies
npm install

# Run full-stack development server (frontend + backend)
npm run dev

# App runs on http://localhost:5000
```

### Production Build
```bash
# Build everything (frontend + backend)
npm run build

# Run production server
npm start
```

### Deployment

**🚀 Quick Deploy (5 minutes)**: See `DEPLOY_NOW.md`

**📚 Full Guide**: See `FULL_STACK_DEPLOY.md` for complete deployment options:
- AWS App Runner (Recommended - Full-stack in one service)
- Docker (Container deployment)
- EC2 (Direct server deployment)

> The Express server expects environment variables (e.g., session secret, database URLs) via `.env`. These values are excluded from version control.

## 📦 Deployment Options

### AWS App Runner (Recommended)
- **Full-stack monorepo**: Frontend + Backend together
- **Build**: Uses `apprunner.yaml` (already configured)
- **Cost**: ~$10-15/month
- **Guide**: See `FULL_STACK_DEPLOY.md`

### Docker
- **Containerized**: Works anywhere Docker runs
- **Build**: `docker build -t mekness-app .`
- **Run**: `docker run -p 5000:5000 mekness-app`
- **Deploy**: ECS, Fargate, or any container platform

### EC2
- **Direct control**: Full server access
- **Cost**: ~$8-10/month (t3.micro)
- **Setup**: See `AWS_DEPLOYMENT.md`

All deployment configurations are included in the repository!

## 🔗 Key Resources
- Official Mekness site: https://mekness.com
- MT5 downloads reference: https://mekness.com/downloads

## 📝 License
Copyright © 2025 Mekness Limited. All rights reserved.
