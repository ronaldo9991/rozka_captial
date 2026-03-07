# Mekness Trading Platform - Complete Project Analysis

## 🎯 Project Overview

**Mekness** is a full-stack Forex trading platform with a modern Web3-inspired UI, featuring:
- User trading dashboard
- Multi-tier admin system (Super Admin, Middle Admin, Normal Admin)
- Trading account management
- Deposit/Withdrawal system with Stripe integration
- Document verification system
- Support ticket system
- MT5 (MetaTrader 5) integration
- IB (Introducing Broker) commission system

---

## 🏗️ Architecture

### Frontend Stack
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.20
- **Routing**: Wouter 3.3.5
- **UI Library**: Radix UI components
- **Styling**: Tailwind CSS 3.4.17
- **State Management**: TanStack Query (React Query) 5.60.5
- **Forms**: React Hook Form 7.55.0 + Zod 3.24.2
- **Animations**: Framer Motion 11.13.1
- **Charts**: Recharts 2.15.2
- **Icons**: Lucide React 0.453.0

### Backend Stack
- **Runtime**: Node.js (ESM modules)
- **Framework**: Express 4.21.2
- **Database**: SQLite (better-sqlite3) for local development
- **ORM**: Drizzle ORM 0.39.1
- **Authentication**: Express Session + Passport Local
- **Password Hashing**: bcryptjs 3.0.2
- **Payment Processing**: Stripe 17.3.1 (optional)
- **WebSockets**: ws 8.18.0 (for real-time features)

### Database Schema
The project uses SQLite with the following main tables:
- `users` - User accounts
- `trading_accounts` - Trading accounts (Live/Demo/Bonus)
- `deposits` - Deposit transactions
- `withdrawals` - Withdrawal requests
- `trading_history` - Trading records
- `documents` - KYC documents (ID Proof, Address Proof, etc.)
- `notifications` - User notifications
- `admin_users` - Admin accounts (3 tiers)
- `admin_country_assignments` - Country assignments for middle admins
- `activity_logs` - Immutable admin activity logs
- `support_tickets` - Support ticket system
- `support_ticket_replies` - Ticket replies
- `fund_transfers` - Internal/external fund transfers
- `ib_cb_wallets` - IB/CB commission wallets
- `stripe_payments` - Stripe payment tracking

---

## 📁 Project Structure

```
mekness-master/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # 93 React components
│   │   ├── pages/          # Page components
│   │   │   ├── Home.tsx
│   │   │   ├── SignIn.tsx
│   │   │   ├── SignUp.tsx
│   │   │   ├── dashboard/  # User dashboard pages
│   │   │   └── admin/      # Admin dashboard pages
│   │   ├── lib/            # Utilities
│   │   └── hooks/          # Custom hooks
│   └── public/             # Static assets
├── server/                 # Express backend
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes (2490+ lines!)
│   ├── db.ts              # Database connection
│   ├── storage.ts         # Database operations
│   ├── seed.ts            # Database seeding
│   ├── mt5-routes.ts      # MT5 integration routes
│   └── mt5-service.ts     # MT5 service layer
├── shared/                 # Shared types/schemas
│   └── schema.ts          # Drizzle schema definitions
├── mt5_api/               # PHP MT5 API files (legacy)
└── package.json           # Dependencies
```

---

## 🔑 Key Features

### 1. User Dashboard
- **Trading Accounts**: Create Live/Demo/Bonus accounts
- **Deposits**: Multiple payment methods (Stripe, Bank Transfer, Crypto)
- **Withdrawals**: Bank transfer, PayPal, Crypto
- **Trading History**: View all trades
- **Documents**: Upload ID/Address proof for verification
- **Profile Management**: Update personal information
- **Support Tickets**: Create and manage support tickets
- **Internal/External Transfers**: Transfer funds between accounts
- **IB Account**: View referral stats and commissions

### 2. Admin Dashboard (3 Tiers)

#### Super Admin
- Full system access
- View all users (no restrictions)
- Impersonate users
- Add/Remove funds from accounts
- Manage all admin users
- Assign countries to middle admins
- View all activity logs

#### Middle Admin
- View users from assigned countries only
- Approve/Reject documents
- Manage support tickets
- View deposits/withdrawals
- View trading accounts
- Cannot impersonate or manage funds

#### Normal Admin
- View all users
- Approve/Reject documents
- Manage support tickets
- View deposits/withdrawals
- View trading accounts
- Cannot impersonate or manage funds

### 3. Authentication System
- Session-based authentication
- User signup/signin
- Admin authentication (separate from user auth)
- Password hashing with bcrypt
- Session management with express-session

### 4. Payment Integration
- **Stripe**: Card payments, crypto payments
- **Webhook Support**: Automatic deposit processing
- **Payment Intent API**: Secure payment processing
- **Commission System**: Automatic IB commission crediting

### 5. MT5 Integration
- Optional MT5 server integration
- Account creation in MT5
- Balance synchronization
- Trade history sync
- Configurable via environment variables

### 6. Document Verification
- Upload ID Proof, Address Proof, Bank Statement
- Admin approval/rejection workflow
- Status tracking (Pending/Verified/Rejected)
- Required for trading account creation

### 7. Support Ticket System
- User can create tickets
- Admin can reply and manage tickets
- Status tracking (Open/In Progress/Resolved/Closed)
- Priority levels (Low/Medium/High/Urgent)
- Categories (Technical/Account/Payment/Trading/Other)

### 8. IB (Introducing Broker) System
- Referral ID system
- Commission tracking (default 5%)
- IB wallet management
- Commission earned from referred users' deposits
- Real-time commission calculations

---

## 🚀 Running the Project

### Prerequisites
- Node.js v18 or higher
- npm or yarn

### Setup Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Database**
   ```bash
   npm run db:push
   ```
   This creates the SQLite database and all tables.

3. **Configure Environment**
   Create a `.env` file (already created):
   ```env
   SESSION_SECRET=your-secret-key
   PORT=5000
   NODE_ENV=development
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:5000`

### Database Seeding
The server automatically seeds the database on startup with:
- **Demo User**: `demo@mekness.com` / `demo123`
- **Super Admin**: `superadmin` / `Admin@12345`
- **Middle Admin**: `middleadmin` / `Middle@12345`
- **Normal Admin**: `normaladmin` / `Normal@12345`

---

## 🔐 Default Credentials

### User Account
- **Email**: `demo@mekness.com`
- **Password**: `demo123`

### Admin Accounts
1. **Super Admin**
   - Username: `superadmin`
   - Password: `Admin@12345`

2. **Middle Admin**
   - Username: `middleadmin`
   - Password: `Middle@12345`

3. **Normal Admin**
   - Username: `normaladmin`
   - Password: `Normal@12345`

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `GET /api/auth/check` - Check auth status

### Trading Accounts
- `GET /api/trading-accounts` - List user's accounts
- `POST /api/trading-accounts` - Create new account
- `PATCH /api/trading-accounts/:id` - Update account

### Deposits
- `GET /api/deposits` - List deposits
- `POST /api/deposits` - Create deposit
- `POST /api/stripe/create-payment-intent` - Stripe payment
- `POST /api/stripe/webhook` - Stripe webhook

### Withdrawals
- `GET /api/withdrawals` - List withdrawals
- `POST /api/withdrawals` - Create withdrawal

### Documents
- `GET /api/documents` - List documents
- `POST /api/documents` - Upload document
- `GET /api/documents/verification-status` - Check verification

### Support Tickets
- `GET /api/support-tickets` - List tickets
- `POST /api/support-tickets` - Create ticket
- `POST /api/support-tickets/:id/reply` - Reply to ticket

### Admin Endpoints
- `POST /api/admin/auth/signin` - Admin login
- `GET /api/admin/users` - List users (filtered by role)
- `PATCH /api/admin/users/:id` - Update user
- `GET /api/admin/documents` - List all documents
- `PATCH /api/admin/documents/:id/verify` - Verify/reject document
- `GET /api/admin/deposits` - List deposits
- `PATCH /api/admin/deposits/:id/approve` - Approve deposit
- `POST /api/admin/users/:userId/add-funds` - Add funds (super admin)
- `POST /api/admin/users/:userId/impersonate` - Impersonate user (super admin)
- And many more...

---

## 🎨 UI/UX Features

### Design System
- **Color Scheme**: Black & Gold (Web3-inspired)
- **Glassmorphism**: Modern glass effects
- **Animations**: Framer Motion for smooth transitions
- **Responsive**: Mobile, tablet, desktop support
- **Dark Theme**: Optimized for dark backgrounds

### Key Components
- PublicHeader - Navigation bar
- HeroSection - Landing page hero
- FeatureCards - Feature showcase
- TradingPlatformsMockup - Platform display
- AccountTypesWithSpreads - Account comparison
- DownloadsSection - MT5 download links
- DashboardLayout - User dashboard wrapper
- AdminDashboard - Admin panel

---

## 🔧 Configuration

### Environment Variables
```env
# Required
SESSION_SECRET=your-secret-key
PORT=5000
NODE_ENV=development

# Optional
DATABASE_URL=./local.db
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
MT5_ENABLED=false
MT5_SERVER=...
MT5_LOGIN=...
MT5_PASSWORD=...
FRONTEND_URL=http://localhost:5000
```

### Database Configuration
- **Local Development**: SQLite (better-sqlite3)
- **Production**: Can be switched to PostgreSQL
- **Migrations**: Drizzle Kit for schema management

---

## 📊 Database Schema Highlights

### Users Table
- Unique referral IDs
- Referral tracking (referredBy)
- Verification status
- Account enable/disable

### Trading Accounts
- Multiple account types (Live/Demo/Bonus)
- Account groups (Standard/Pro/VIP/Startup/Student)
- Leverage settings (1:100, 1:200, 1:500)
- Balance, equity, margin tracking

### Deposits/Withdrawals
- Multiple payment methods
- Status tracking (Pending/Completed/Failed)
- Transaction IDs
- Verification file uploads

### Activity Logs
- Immutable audit trail
- Tracks all admin actions
- IP address logging
- Entity-based logging

---

## 🛠️ Development Workflow

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - TypeScript type checking
- `npm run db:push` - Push database schema changes

### Code Structure
- **Type Safety**: Full TypeScript coverage
- **Validation**: Zod schemas for all inputs
- **Error Handling**: Comprehensive error handling
- **Logging**: Activity logs for admin actions
- **Security**: Password hashing, session management

---

## 🔒 Security Features

1. **Password Security**
   - bcrypt hashing (10 rounds)
   - No password in responses

2. **Session Management**
   - HTTP-only cookies
   - Secure cookies in production
   - 7-day session expiry

3. **Input Validation**
   - Zod schema validation
   - SQL injection prevention (Drizzle ORM)
   - XSS protection

4. **Admin Access Control**
   - Role-based permissions
   - Activity logging
   - Country-based filtering (middle admin)

5. **Payment Security**
   - Stripe secure payment processing
   - Webhook signature verification
   - Transaction tracking

---

## 📈 Performance Optimizations

1. **Code Splitting**
   - Lazy loading for all pages
   - Vendor chunk separation
   - Route-based splitting

2. **Database**
   - Indexed queries
   - Efficient joins
   - Connection pooling (PostgreSQL)

3. **Frontend**
   - React Query for caching
   - Optimistic updates
   - Debounced inputs

---

## 🧪 Testing

### Test Accounts
- Demo user for user dashboard testing
- Three admin tiers for permission testing
- Pre-seeded data for development

### Manual Testing Checklist
- [ ] User signup/signin
- [ ] Trading account creation
- [ ] Deposit/withdrawal flows
- [ ] Document upload/verification
- [ ] Support ticket creation
- [ ] Admin document approval
- [ ] Admin deposit approval
- [ ] IB commission calculation
- [ ] Fund transfers (internal/external)

---

## 🚢 Deployment

### Build Process
```bash
npm run build
```
- Builds frontend to `dist/public`
- Bundles backend to `dist/index.js`
- Syncs static files

### Deployment Options
- **Vercel**: Frontend + API routes
- **Render/Railway**: Backend services
- **Netlify**: Static frontend
- **Docker**: Containerized deployment

---

## 📝 Key Files to Understand

1. **server/routes.ts** (2490 lines) - All API endpoints
2. **shared/schema.ts** - Database schema
3. **server/storage.ts** - Database operations
4. **client/src/App.tsx** - Routing configuration
5. **server/index.ts** - Server setup
6. **server/seed.ts** - Initial data seeding

---

## 🎯 Next Steps

1. **Review the codebase** - Explore components and pages
2. **Test features** - Use default credentials to test
3. **Customize** - Modify UI, add features
4. **Deploy** - Set up production environment
5. **Configure Stripe** - Add payment processing
6. **Set up MT5** - Configure MetaTrader integration

---

## 📚 Additional Documentation

- `ADMIN_CREDENTIALS.md` - Admin login details
- `SETUP.md` - Setup instructions
- `README.md` - Project overview
- `ADMIN_USER_GUIDE.md` - Admin features guide
- `STRIPE_SETUP.md` - Stripe configuration
- `MT5_INTEGRATION_GUIDE.md` - MT5 setup

---

## ✨ Summary

This is a **production-ready, feature-rich Forex trading platform** with:
- ✅ Modern React frontend with beautiful UI
- ✅ Robust Express backend with comprehensive API
- ✅ Multi-tier admin system
- ✅ Payment processing (Stripe)
- ✅ Document verification workflow
- ✅ Support ticket system
- ✅ IB commission system
- ✅ MT5 integration support
- ✅ Full TypeScript coverage
- ✅ Comprehensive security measures

**The project is fully set up and ready to run locally!**

---

*Last Updated: November 15, 2025*

