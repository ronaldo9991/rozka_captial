# Comprehensive Testing Guide

This guide provides step-by-step testing procedures for all features of the Mekness trading platform.

## Pre-Testing Setup

### 1. Environment Setup

Ensure all environment variables are properly configured:

```bash
# Check backend .env
cat .env | grep -E "DATABASE_URL|STRIPE_SECRET_KEY|MT5_ENABLED"

# Check frontend .env
cat client/.env | grep VITE_STRIPE_PUBLISHABLE_KEY
```

### 2. Database Setup

```bash
# Push database schema
npm run db:push

# Verify connection
psql $DATABASE_URL -c "SELECT 1"
```

### 3. Start Application

```bash
# Development mode
npm run dev

# Application should start on http://localhost:5000
```

## Testing Checklist

### Authentication Tests

#### Sign Up
- [ ] Navigate to `/signup`
- [ ] Fill in valid email, password, and full name
- [ ] Submit form
- [ ] Verify redirect to `/dashboard`
- [ ] Verify session is created

**Test Cases:**
- ✅ Valid registration
- ✅ Duplicate email (should fail with error)
- ✅ Weak password (should fail validation)
- ✅ Missing required fields (should show validation errors)

#### Sign In  
- [ ] Navigate to `/signin`
- [ ] Use registered credentials
- [ ] Submit form
- [ ] Verify redirect to `/dashboard` (user) or `/admin/dashboard` (admin)

**Test Cases:**
- ✅ Valid user login
- ✅ Valid admin login (auto-redirect to admin dashboard)
- ✅ Invalid credentials (should show error)
- ✅ Non-existent user (should show error)

#### Admin Login
- [ ] Sign in with admin credentials:
  - Username: `admin`
  - Password: `admin123`
- [ ] Verify redirect to `/admin/dashboard`
- [ ] Verify admin sidebar shows correct menu items

### User Dashboard Tests

#### Dashboard Home
- [ ] Navigate to `/dashboard`
- [ ] Verify StatCards display:
  - Total Balance
  - Total Deposits
  - Total Withdrawals
  - Active Accounts
- [ ] Verify LiveForexTicker shows real-time prices
- [ ] Verify AccountTypesCard displays account types
- [ ] Verify quick action cards (Deposit, Withdraw, Trade, Support)
- [ ] Check real-time updates (wait 10 seconds, data should refresh)

#### Trading Accounts
- [ ] Navigate to `/dashboard/trading-accounts`
- [ ] Click "Create New Account"
- [ ] Fill in account details:
  - Type: Live/Demo
  - Group: Standard/Pro/VIP
  - Leverage: 1:100/1:200/1:500
- [ ] Submit form
- [ ] Verify account created with:
  - Unique account ID
  - Random password
  - Balance: $0.00
- [ ] Test disabling/enabling account
- [ ] Verify real-time balance updates

**MT5 Integration (if enabled):**
- [ ] Create Live account
- [ ] Verify account created in MT5 server
- [ ] Sync account data
- [ ] Check balance matches MT5

#### Deposits

**Stripe Card Payment:**
- [ ] Navigate to `/dashboard/deposit`
- [ ] Select trading account
- [ ] Choose "Credit/Debit Card (Stripe)"
- [ ] Enter amount ($10 minimum)
- [ ] Click "Deposit"
- [ ] Use test card: `4242 4242 4242 4242`
  - Expiry: Any future date
  - CVC: Any 3 digits
  - ZIP: Any 5 digits
- [ ] Complete payment
- [ ] Verify:
  - Deposit appears in history
  - Status is "Pending" or "Approved"
  - Balance updates after approval
  - Notification received

**Stripe Cryptocurrency:**
- [ ] Navigate to `/dashboard/deposit`
- [ ] Select trading account
- [ ] Choose "Cryptocurrency (Stripe)"
- [ ] Select cryptocurrency (BTC/ETH/USDT/USDC)
- [ ] Enter amount ($10 minimum)
- [ ] Click "Deposit"
- [ ] Redirected to Stripe Checkout
- [ ] Complete checkout session
- [ ] Verify redirect back to dashboard
- [ ] Check deposit status and balance

**Test Cases:**
- ✅ Successful card payment
- ✅ Successful crypto payment
- ✅ Declined card (use `4000 0000 0000 0002`)
- ✅ Minimum amount validation ($10)
- ✅ Real-time status updates
- ✅ Balance synchronization

#### Withdrawals
- [ ] Navigate to `/dashboard/withdraw`
- [ ] Select trading account with balance
- [ ] Choose withdrawal method
- [ ] Enter amount (less than or equal to balance)
- [ ] Fill in bank details
- [ ] Submit withdrawal request
- [ ] Verify:
  - Withdrawal appears in history
  - Status is "Pending"
  - Notification received

**Test Cases:**
- ✅ Valid withdrawal
- ✅ Insufficient balance (should fail)
- ✅ Invalid bank details (should fail validation)
- ✅ Real-time status updates

#### Trading History
- [ ] Navigate to `/dashboard/trading-history`
- [ ] Verify trading history displays (if any)
- [ ] Check columns: Ticket, Symbol, Type, Volume, Open Price, Close Price, Profit, Date
- [ ] Test filtering by status (Open/Closed)
- [ ] Verify real-time updates

**MT5 Integration (if enabled):**
- [ ] Click "Sync History"
- [ ] Verify trades imported from MT5
- [ ] Check profit calculations match MT5

#### Documents
- [ ] Navigate to `/dashboard/documents`
- [ ] Upload ID Proof (passport, license)
- [ ] Upload Address Proof (utility bill, bank statement)
- [ ] Verify:
  - Documents appear with "Pending" status
  - Notification sent
  - Status updates in real-time

**Test Cases:**
- ✅ Upload JPG/PNG/PDF
- ✅ File size validation (max 5MB)
- ✅ File type validation
- ✅ Status changes (Pending → Verified/Rejected)

#### Profile
- [ ] Navigate to `/dashboard/profile`
- [ ] Update profile fields:
  - Full Name
  - Phone
  - Country
  - City
  - Address
  - ZIP Code
- [ ] Submit changes
- [ ] Verify:
  - Success notification
  - Data persists after refresh
  - Real-time updates

#### Support Tickets
- [ ] Navigate to `/dashboard/support`
- [ ] Click "Create New Ticket"
- [ ] Fill in:
  - Subject
  - Priority
  - Message
- [ ] Submit ticket
- [ ] Verify:
  - Ticket created with "Open" status
  - Appears in ticket list
  - Notification sent
- [ ] Open ticket and add reply
- [ ] Verify reply appears in conversation
- [ ] Test real-time updates

### Admin Dashboard Tests

#### Admin Dashboard Overview
- [ ] Navigate to `/admin/dashboard`
- [ ] Verify statistics display:
  - Total Users
  - Pending Documents
  - Trading Accounts
  - Total Deposits
  - Active Admins
- [ ] Check real-time updates (data refreshes every 30 seconds)

#### Clients Management
- [ ] Navigate to `/admin/clients`
- [ ] Verify user list with columns:
  - ID
  - Name
  - Referral ID
  - Email
  - Phone
  - Country
  - Member Since
- [ ] Test actions:
  - Send account activation link
  - Impersonate user (super admin only)
  - Add funds (super admin only)
  - Remove funds (super admin only)

**Impersonation Test:**
- [ ] Click "Impersonate" on a user
- [ ] Verify redirect to user dashboard
- [ ] Perform actions as user
- [ ] Click "Stop Impersonation"
- [ ] Verify return to admin dashboard

**Funds Management:**
- [ ] Click "Add Funds" on a user
- [ ] Enter amount and reason
- [ ] Submit
- [ ] Verify:
  - User balance updated
  - Deposit record created
  - Activity logged
  - MT5 balance synced (if enabled)

#### Documents Verification
- [ ] Navigate to `/admin/documents`
- [ ] Filter by status (All/Pending/Verified/Rejected)
- [ ] Click "View" on a document
- [ ] Test actions:
  - Approve document
  - Reject document (with reason)
- [ ] Verify:
  - User notified
  - Document status updated
  - Activity logged

#### Deposits Management
- [ ] Navigate to `/admin/deposits`
- [ ] View pending deposits
- [ ] Click "View" on verification file
- [ ] Approve deposit
- [ ] Verify:
  - Deposit status → "Approved"
  - User balance updated
  - User notified
  - MT5 synced (if enabled)

#### Withdrawals Management
- [ ] Navigate to `/admin/withdrawals`
- [ ] View pending withdrawals
- [ ] Approve withdrawal
- [ ] Verify:
  - Withdrawal status → "Processing"
  - User notified
  - MT5 synced (if enabled)

#### Support Tickets
- [ ] Navigate to `/admin/support`
- [ ] View all support tickets
- [ ] Open a ticket
- [ ] Add admin reply
- [ ] Change status (Open/In Progress/Resolved/Closed)
- [ ] Verify:
  - User sees reply
  - Status updates in real-time
  - Activity logged

#### Activity Logs
- [ ] Navigate to `/admin/logs`
- [ ] Verify all admin actions logged:
  - User creation
  - Document verification
  - Fund management
  - Impersonation
  - Admin management
- [ ] Check timestamps and details
- [ ] Test real-time updates

#### Admin Management (Super Admin Only)
- [ ] Navigate to `/admin/management`
- [ ] Create new admin:
  - Username
  - Password
  - Email
  - Full Name
  - Role (Super/Middle/Normal)
- [ ] Verify admin created
- [ ] Edit admin details
- [ ] Disable/Enable admin
- [ ] Delete admin (with confirmation)

### MT5 Integration Tests (If Enabled)

#### Account Creation
- [ ] Create Live trading account
- [ ] Verify account created in MT5
- [ ] Check credentials match
- [ ] Test login to MT5 platform

#### Balance Sync
- [ ] Make deposit
- [ ] Verify balance updates in MT5
- [ ] Manual sync: POST `/api/mt5/sync-account/:accountId`
- [ ] Verify balance matches

#### Trading History Sync
- [ ] Perform trades in MT5
- [ ] Sync history: POST `/api/mt5/sync-history/:accountId`
- [ ] Verify trades appear in dashboard
- [ ] Check profit calculations

#### Open Positions
- [ ] Open positions in MT5
- [ ] Get positions: GET `/api/mt5/positions/:accountId`
- [ ] Verify positions display correctly
- [ ] Check real-time updates

#### Profit Calculation
- [ ] Calculate profit: POST `/api/mt5/calculate-profit/:accountId`
- [ ] Verify profit matches MT5 records
- [ ] Test different time periods

### Performance Tests

#### Real-Time Updates
- [ ] Open dashboard in two browsers
- [ ] Make deposit in browser 1
- [ ] Verify update appears in browser 2 (within 30 seconds)
- [ ] Test with multiple actions

#### Load Testing
- [ ] Create 10+ trading accounts
- [ ] Make 20+ deposits
- [ ] Open 5+ support tickets
- [ ] Verify performance remains acceptable

#### Mobile Responsiveness
- [ ] Test on mobile devices/emulators
- [ ] Verify all pages responsive
- [ ] Test touch interactions
- [ ] Check mobile payment flows

### Security Tests

#### Session Management
- [ ] Log in
- [ ] Wait for session expiry (7 days)
- [ ] Verify automatic logout
- [ ] Test session hijacking prevention

#### Role-Based Access Control
- [ ] As normal user:
  - Try accessing `/admin` (should redirect)
  - Try admin API endpoints (should fail)
- [ ] As normal admin:
  - Try super admin actions (should fail)
  - Test country restrictions (if applicable)

#### Input Validation
- [ ] Test SQL injection attempts
- [ ] Test XSS attempts
- [ ] Test CSRF protection
- [ ] Verify all inputs sanitized

### Integration Tests

#### Stripe Webhooks
- [ ] Use Stripe CLI to test webhooks:
```bash
stripe listen --forward-to localhost:5000/api/stripe/webhook
stripe trigger payment_intent.succeeded
```
- [ ] Verify deposits auto-approved
- [ ] Check balance updates

#### Database Integrity
- [ ] Check foreign key constraints
- [ ] Test cascade deletes
- [ ] Verify transaction rollbacks on errors

## Bug Report Template

When you find a bug, document it as follows:

```markdown
**Bug Title:** Brief description

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happened

**Environment:**
- Browser: Chrome 120
- OS: Windows 11
- Node Version: v18.17.0

**Screenshots:**
[Attach if applicable]

**Console Errors:**
```
[Paste console errors]
```

**Additional Context:**
Any other relevant information
```

## Performance Benchmarks

Expected response times:
- Page load: < 2 seconds
- API calls: < 500ms
- Real-time updates: < 30 seconds
- Database queries: < 100ms

## Test Completion Checklist

- [ ] All authentication tests passed
- [ ] All user dashboard tests passed
- [ ] All admin dashboard tests passed
- [ ] All payment tests passed
- [ ] MT5 integration tests passed (if applicable)
- [ ] Performance tests passed
- [ ] Security tests passed
- [ ] Mobile responsiveness verified
- [ ] No critical bugs found
- [ ] Documentation updated

## Automated Testing (Future)

Consider implementing:
- Unit tests with Jest
- Integration tests with Supertest
- E2E tests with Playwright/Cypress
- Load testing with k6 or Artillery

```bash
# Example test structure
npm test                 # Run all tests
npm run test:unit       # Unit tests only
npm run test:e2e        # E2E tests only
npm run test:load       # Load tests
```

---

**Note:** This is a living document. Update it as new features are added or existing ones are modified.

