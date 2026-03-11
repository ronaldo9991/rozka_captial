# R.O.Z.K.A CAPTIAL — Trading Platform

A refined Web3-inspired front-end for the **R.O.Z.K.A CAPTIAL** (Rozka Capitals) trading ecosystem. This project delivers a full-stack trading platform with a black-and-gold palette, glassmorphism, animated grids, and immersive micro-interactions.

## ✨ Highlights
- **Modern hero experience** with particle fields, animated trading cards, and bold typography.
- **Compact navbar** and brand logo with gold styling.
- **Promotional and partnership cards** with pop-up transitions and section scroll targeting.
- **Account Types & Compare Spreads** in a unified section with interactive highlighting.
- **Downloads section** for MetaTrader 5 desktop, web, and mobile (with QR codes for App Store, Google Play, and Huawei AppGallery).
- **Forex and Contact pages** with counting animations and collapsible privacy policy.
- **Responsive design** for desktop, tablet, and mobile.

## 📁 Project Structure (Full-Stack Monorepo)
```
client/        # React + TypeScript front-end (Vite)
  src/
    components/  # Shared UI elements and custom sections
    pages/       # Home, About, Forex, Contact, Auth, Dashboards
server/        # Express API & routing (Session, admin endpoints)
shared/        # Shared schemas and types
```

## 🚀 Getting Started

### Development
```bash
# Install dependencies
npm install

# Run PostgreSQL (Docker)
docker compose up -d

# Run full-stack development server (frontend + backend)
npm run dev

# App runs on http://localhost:5050 (or PORT in .env)
```

### Production Build
```bash
npm run build
npm start
```

### Deployment
- See `DEPLOY_NOW.md` for a quick deploy.
- See `FULL_STACK_DEPLOY.md` for AWS App Runner, Docker, and EC2 options.

> Configure `.env` with `DATABASE_URL`, `SESSION_SECRET`, and other variables. These are not committed.

## 📦 Deployment Options
- **AWS App Runner**: See `FULL_STACK_DEPLOY.md`
- **Docker**: `docker build -t rozka-capitals .` then run on your platform
- **EC2**: See `AWS_DEPLOYMENT.md`

## 📝 License
Copyright © 2025 Rozka Capitals Limited. All rights reserved.
