# Mekness API Endpoints Documentation

**Base URL:** `https://mekness-production.up.railway.app`

All endpoints require authentication via session cookies unless otherwise specified.

---

## 🔐 Authentication Endpoints

### User Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/signup` | Register a new user account | ❌ No |
| `POST` | `/api/auth/signin` | Login user and create session | ❌ No |
| `POST` | `/api/auth/logout` | Logout user and destroy session | ✅ Yes |
| `GET` | `/api/auth/me` | Get current authenticated user details | ✅ Yes |
| `GET` | `/api/auth/check` | Check if user is authenticated | ❌ No |

**Example:**
```bash
# Signup
POST https://mekness-production.up.railway.app/api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "username": "johndoe",
  "fullName": "John Doe"
}
```

---

## 👤 User Profile Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/profile` | Get current user profile | ✅ Yes |
| `PATCH` | `/api/profile` | Update user profile information | ✅ Yes |

**Example:**
```bash
# Get Profile
GET https://mekness-production.up.railway.app/api/profile

# Update Profile
PATCH https://mekness-production.up.railway.app/api/profile
Content-Type: application/json

{
  "fullName": "John Doe Updated",
  "phone": "+1234567890",
  "address": "123 Main St",
  "city": "New York",
  "country": "USA"
}
```

---

## 💼 Trading Accounts Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/trading-accounts` | Get all trading accounts for current user | ✅ Yes |
| `POST` | `/api/trading-accounts` | Create a new trading account | ✅ Yes |
| `PATCH` | `/api/trading-accounts/:id` | Update trading account details | ✅ Yes |

**Example:**
```bash
# Get Trading Accounts
GET https://mekness-production.up.railway.app/api/trading-accounts

# Create Trading Account
POST https://mekness-production.up.railway.app/api/trading-accounts
Content-Type: application/json

{
  "type": "Live",
  "leverage": "1:500",
  "group": "Standard"
}
```

---

## 💰 Payment & Deposit Endpoints

### Stripe Payment Integration

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/stripe/create-payment-intent` | Create Stripe Checkout Session for deposit | ✅ Yes |
| `POST` | `/api/stripe/webhook` | Stripe webhook handler (for payment confirmations) | ❌ No* |
| `GET` | `/api/stripe/payment-status/:sessionId` | Check payment status by session ID | ✅ Yes |

**Example:**
```bash
# Create Payment Intent
POST https://mekness-production.up.railway.app/api/stripe/create-payment-intent
Content-Type: application/json

{
  "amount": 100,
  "tradingAccountId": "account-id",
  "paymentMethod": "card"
}
```

*Webhook endpoint requires Stripe signature verification

### Deposits

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/deposits` | Get all deposits for current user | ✅ Yes |
| `POST` | `/api/deposits` | Create a new deposit request | ✅ Yes |

**Example:**
```bash
# Get Deposits
GET https://mekness-production.up.railway.app/api/deposits

# Create Deposit
POST https://mekness-production.up.railway.app/api/deposits
Content-Type: application/json

{
  "accountId": "account-id",
  "amount": "100",
  "merchant": "Stripe"
}
```

---

## 💸 Withdrawal Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/withdrawals` | Get all withdrawal requests for current user | ✅ Yes |
| `POST` | `/api/withdrawals` | Create a new withdrawal request | ✅ Yes |

**Example:**
```bash
# Get Withdrawals
GET https://mekness-production.up.railway.app/api/withdrawals

# Create Withdrawal
POST https://mekness-production.up.railway.app/api/withdrawals
Content-Type: application/json

{
  "accountId": "account-id",
  "amount": "50",
  "method": "Bank Transfer",
  "bankDetails": {
    "accountNumber": "123456789",
    "bankName": "Example Bank"
  }
}
```

---

## 📄 Document Management Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/documents` | Get all uploaded documents for current user | ✅ Yes |
| `POST` | `/api/documents` | Upload a new document (ID, Proof of Address, etc.) | ✅ Yes |
| `GET` | `/api/documents/verification-status` | Get document verification status | ✅ Yes |

**Example:**
```bash
# Get Documents
GET https://mekness-production.up.railway.app/api/documents

# Upload Document
POST https://mekness-production.up.railway.app/api/documents
Content-Type: application/json

{
  "type": "ID",
  "file": "base64-encoded-file-data",
  "fileName": "passport.pdf"
}

# Check Verification Status
GET https://mekness-production.up.railway.app/api/documents/verification-status
```

---

## 🔔 Notification Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/notifications` | Get all notifications for current user | ✅ Yes |
| `PATCH` | `/api/notifications/:id/read` | Mark notification as read | ✅ Yes |

**Example:**
```bash
# Get Notifications
GET https://mekness-production.up.railway.app/api/notifications

# Mark as Read
PATCH https://mekness-production.up.railway.app/api/notifications/notification-id/read
```

---

## 📊 Dashboard & Statistics Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/dashboard/stats` | Get dashboard statistics (balance, equity, margin, etc.) | ✅ Yes |
| `GET` | `/api/trading-history` | Get trading history for current user | ✅ Yes |

**Example:**
```bash
# Get Dashboard Stats
GET https://mekness-production.up.railway.app/api/dashboard/stats

# Get Trading History
GET https://mekness-production.up.railway.app/api/trading-history
```

---

## 💱 Fund Transfer Endpoints

### Internal Transfers

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/fund-transfers/internal` | Get all internal transfers between accounts | ✅ Yes |
| `POST` | `/api/fund-transfers/internal` | Transfer funds between user's trading accounts | ✅ Yes |

**Example:**
```bash
# Get Internal Transfers
GET https://mekness-production.up.railway.app/api/fund-transfers/internal

# Create Internal Transfer
POST https://mekness-production.up.railway.app/api/fund-transfers/internal
Content-Type: application/json

{
  "fromAccountId": "account-1-id",
  "toAccountId": "account-2-id",
  "amount": "100"
}
```

### External Transfers

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/fund-transfers/external` | Get all external transfers | ✅ Yes |
| `POST` | `/api/fund-transfers/external` | Create external transfer to another user | ✅ Yes |

**Example:**
```bash
# Get External Transfers
GET https://mekness-production.up.railway.app/api/fund-transfers/external

# Create External Transfer
POST https://mekness-production.up.railway.app/api/fund-transfers/external
Content-Type: application/json

{
  "fromAccountId": "account-id",
  "toUserId": "recipient-user-id",
  "amount": "50"
}
```

---

## 🎯 IB (Introducing Broker) Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/ib/stats` | Get IB statistics (commissions, referrals, etc.) | ✅ Yes |

**Example:**
```bash
# Get IB Stats
GET https://mekness-production.up.railway.app/api/ib/stats
```

---

## 🎫 Support Ticket Endpoints

### User Support Tickets

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/support-tickets` | Get all support tickets for current user | ✅ Yes |
| `POST` | `/api/support-tickets` | Create a new support ticket | ✅ Yes |
| `POST` | `/api/support-tickets/:id/reply` | Reply to a support ticket | ✅ Yes |

**Example:**
```bash
# Get Support Tickets
GET https://mekness-production.up.railway.app/api/support-tickets

# Create Support Ticket
POST https://mekness-production.up.railway.app/api/support-tickets
Content-Type: application/json

{
  "subject": "Account Issue",
  "message": "I need help with my account",
  "category": "Account"
}

# Reply to Ticket
POST https://mekness-production.up.railway.app/api/support-tickets/ticket-id/reply
Content-Type: application/json

{
  "message": "Thank you for your response"
}
```

---

## 👨‍💼 Admin Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/admin/auth/signin` | Admin login and create session | ❌ No |
| `POST` | `/api/admin/auth/logout` | Admin logout and destroy session | ✅ Admin |
| `GET` | `/api/admin/auth/me` | Get current authenticated admin details | ✅ Admin |

**Example:**
```bash
# Admin Login
POST https://mekness-production.up.railway.app/api/admin/auth/signin
Content-Type: application/json

{
  "username": "admin",
  "password": "Admin@12345"
}

# Get Admin Info
GET https://mekness-production.up.railway.app/api/admin/auth/me
```

---

## 👥 Admin User Management Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/admin/users` | Get all users (with filters and pagination) | ✅ Admin |
| `GET` | `/api/admin/users/:id` | Get specific user details | ✅ Admin |
| `PATCH` | `/api/admin/users/:id` | Update user information | ✅ Admin |
| `PATCH` | `/api/admin/users/:id/toggle` | Enable/disable user account | ✅ Admin |
| `POST` | `/api/admin/users/:userId/add-funds` | Add funds to user account | ✅ Super Admin |
| `POST` | `/api/admin/users/:userId/remove-funds` | Remove funds from user account | ✅ Super Admin |
| `POST` | `/api/admin/users/:userId/impersonate` | Impersonate a user (login as them) | ✅ Super Admin |
| `POST` | `/api/admin/stop-impersonation` | Stop impersonating user | ✅ Admin |

**Example:**
```bash
# Get All Users
GET https://mekness-production.up.railway.app/api/admin/users?page=1&limit=10&search=john

# Get User Details
GET https://mekness-production.up.railway.app/api/admin/users/user-id

# Add Funds (Super Admin Only)
POST https://mekness-production.up.railway.app/api/admin/users/user-id/add-funds
Content-Type: application/json

{
  "amount": 100,
  "accountId": "account-id",
  "reason": "Bonus"
}
```

---

## 📋 Admin Document Management Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/admin/documents` | Get all documents pending verification | ✅ Admin |
| `PATCH` | `/api/admin/documents/:id/verify` | Verify/Approve a document | ✅ Admin |
| `PATCH` | `/api/admin/documents/:id/approve` | Approve a document | ✅ Admin |
| `PATCH` | `/api/admin/documents/:id/reject` | Reject a document | ✅ Admin |

**Example:**
```bash
# Get All Documents
GET https://mekness-production.up.railway.app/api/admin/documents?status=Pending

# Approve Document
PATCH https://mekness-production.up.railway.app/api/admin/documents/document-id/approve
Content-Type: application/json

{
  "notes": "Document verified successfully"
}
```

---

## 💵 Admin Deposit Management Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/admin/deposits` | Get all deposits (with filters) | ✅ Admin |
| `PATCH` | `/api/admin/deposits/:id/approve` | Approve a deposit | ✅ Super Admin |
| `PATCH` | `/api/admin/deposits/:id/reject` | Reject a deposit | ✅ Super Admin |

**Example:**
```bash
# Get All Deposits
GET https://mekness-production.up.railway.app/api/admin/deposits?status=Pending

# Approve Deposit (Super Admin Only)
PATCH https://mekness-production.up.railway.app/api/admin/deposits/deposit-id/approve
```

---

## 🏦 Admin Trading Account Management Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/admin/trading-accounts` | Get all trading accounts | ✅ Admin |
| `PATCH` | `/api/admin/trading-accounts/:id/toggle` | Enable/disable trading account | ✅ Admin |

**Example:**
```bash
# Get All Trading Accounts
GET https://mekness-production.up.railway.app/api/admin/trading-accounts

# Toggle Account Status
PATCH https://mekness-production.up.railway.app/api/admin/trading-accounts/account-id/toggle
```

---

## 🎫 Admin Support Ticket Management Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/admin/support-tickets` | Get all support tickets | ✅ Admin |
| `POST` | `/api/admin/support-tickets/:id/reply` | Reply to a support ticket as admin | ✅ Admin |
| `PATCH` | `/api/admin/support-tickets/:id/status` | Update ticket status (Open, In Progress, Resolved, Closed) | ✅ Admin |

**Example:**
```bash
# Get All Support Tickets
GET https://mekness-production.up.railway.app/api/admin/support-tickets?status=Open

# Reply to Ticket
POST https://mekness-production.up.railway.app/api/admin/support-tickets/ticket-id/reply
Content-Type: application/json

{
  "message": "We have resolved your issue"
}

# Update Ticket Status
PATCH https://mekness-production.up.railway.app/api/admin/support-tickets/ticket-id/status
Content-Type: application/json

{
  "status": "Resolved"
}
```

---

## 👨‍💼 Admin Management Endpoints (Super Admin Only)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/admin/admins` | Get all admin users | ✅ Super Admin |
| `POST` | `/api/admin/admins` | Create a new admin user | ✅ Super Admin |
| `PATCH` | `/api/admin/admins/:id` | Update admin user details | ✅ Super Admin |
| `GET` | `/api/admin/all-country-assignments` | Get all country assignments for admins | ✅ Super Admin |
| `POST` | `/api/admin/admins/:id/countries` | Assign countries to an admin | ✅ Super Admin |
| `DELETE` | `/api/admin/admins/:id/countries/:country` | Remove country assignment from admin | ✅ Super Admin |

**Example:**
```bash
# Get All Admins
GET https://mekness-production.up.railway.app/api/admin/admins

# Create Admin (Super Admin Only)
POST https://mekness-production.up.railway.app/api/admin/admins
Content-Type: application/json

{
  "username": "newadmin",
  "email": "admin@example.com",
  "password": "SecurePass123!",
  "fullName": "New Admin",
  "role": "normal_admin"
}

# Assign Countries to Admin
POST https://mekness-production.up.railway.app/api/admin/admins/admin-id/countries
Content-Type: application/json

{
  "countries": ["USA", "UK", "Canada"]
}
```

---

## 📊 Admin Statistics & Reports Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/admin/stats` | Get admin dashboard statistics | ✅ Admin |
| `GET` | `/api/admin/accounts/stats` | Get trading accounts statistics | ✅ Admin |
| `GET` | `/api/admin/activity-logs` | Get admin activity logs | ✅ Admin |
| `GET` | `/api/admin/referrals` | Get all referral information | ✅ Admin |
| `PATCH` | `/api/admin/referrals/:id/accept` | Accept a referral | ✅ Admin |
| `PATCH` | `/api/admin/referrals/:id/reject` | Reject a referral | ✅ Admin |
| `PATCH` | `/api/admin/referrals/:id/commission-rate` | Update commission rate for referral | ✅ Admin |
| `POST` | `/api/admin/referrals/:id/payout` | Process payout for IB commission | ✅ Admin |

**Example:**
```bash
# Get Admin Stats
GET https://mekness-production.up.railway.app/api/admin/stats

# Get Activity Logs
GET https://mekness-production.up.railway.app/api/admin/activity-logs?limit=50

# Accept Referral
PATCH https://mekness-production.up.railway.app/api/admin/referrals/referral-id/accept
```

---

## 🔌 MT5 Integration Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/mt5/sync/:accountId` | Sync MT5 account data | ✅ Yes |
| `POST` | `/api/mt5/sync-all` | Sync all MT5 accounts (admin only) | ✅ Admin |

**Example:**
```bash
# Sync MT5 Account
GET https://mekness-production.up.railway.app/api/mt5/sync/account-id

# Sync All Accounts (Admin Only)
POST https://mekness-production.up.railway.app/api/mt5/sync-all
```

---

## 🔒 Authentication & Authorization

### Session-Based Authentication
All endpoints (except public ones) require session-based authentication:
- User endpoints require user session (`req.session.userId`)
- Admin endpoints require admin session (`req.session.adminId`)

### Role-Based Access Control
- **Normal Admin**: Can manage users, documents, deposits, support tickets
- **Middle Admin**: Same as Normal Admin + country-based restrictions
- **Super Admin**: Full access including admin management, fund management, impersonation

### Error Responses

All endpoints return standard HTTP status codes:

- `200 OK` - Success
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

**Error Response Format:**
```json
{
  "message": "Error description"
}
```

---

## 📝 Notes

1. **Base URL**: All endpoints are relative to `https://mekness-production.up.railway.app`
2. **Content-Type**: Most POST/PATCH requests require `Content-Type: application/json`
3. **Session Cookies**: Authentication is handled via HTTP-only session cookies
4. **CORS**: Configured to allow requests from the frontend domain
5. **Rate Limiting**: Consider implementing rate limiting for production
6. **Webhooks**: Stripe webhook endpoint requires signature verification

---

## 🧪 Testing

Use tools like:
- **Postman**: Import endpoints and test with session cookies
- **cURL**: Test endpoints from command line
- **Browser DevTools**: Test from browser console

**Example cURL:**
```bash
# Login
curl -X POST https://mekness-production.up.railway.app/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  -c cookies.txt

# Use session cookie for authenticated requests
curl -X GET https://mekness-production.up.railway.app/api/profile \
  -b cookies.txt
```

---

**Last Updated:** January 2025  
**API Version:** 1.0  
**Deployment:** Railway Production

