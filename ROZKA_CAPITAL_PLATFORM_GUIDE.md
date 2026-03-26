# Rozka Capital Platform Guide

## Purpose

This document explains how the Rozka Capital platform works for:

- Public users (website visitors)
- Authenticated users (client dashboard)
- Admin users (Normal Admin, Middle Admin, Super Admin)

It is designed as a practical operations reference for product, support, and technical teams.

---

## 1) Platform Overview

Rozka Capital is a full-stack trading platform with:

- Public marketing website
- User authentication and client dashboard
- Admin panel for operations, support, compliance, and finance workflows

High-level architecture:

- Frontend: React + TypeScript (Vite)
- Backend: Node.js + Express API
- Shared types/schema: `shared/`
- Main frontend routes: defined in `client/src/App.tsx`

---

## 2) Public Website (Visitor Side)

### Main Public Routes

Core public pages include:

- `/` (Home)
- `/about`
- `/forex`
- `/contact`
- `/complaints`
- `/introducing-broker`
- `/deposits-withdrawals`
- `/trading-contest`
- `/what-is-forex`
- `/forex-advantages`
- `/forexpedia`
- `/deposit-bonus`
- `/no-deposit-bonus`

### Contact & Brand Info

Current support/contact conventions:

- Support email: `support@rozkacapitals.com`
- Info email: `info@rozkacapitals.com`
- Address (official):  
  Rozka Capitals Limited, Ground Floor, The Sotheby Building, Rodney Village, Rodney Bay, Gros-Islet Saint Lucia.

### Floating Help Button

- The floating help widget is shown on public/user pages.
- It is hidden on admin routes (`/admin*`).

---

## 3) User Authentication & Access

### User Auth Pages

- `/signin`
- `/signup`
- `/forgot-password`
- `/reset-password`

### Auth Behavior (General)

- Users sign in with credentials.
- Session/cookie-based authentication is used by API requests.
- After login, users can access `/dashboard/*` routes.

---

## 4) User Dashboard (Client Area)

### Dashboard Route Structure

User pages are under `/dashboard` and rendered via `DashboardLayout`.

Key routes:

- `/dashboard` (home)
- `/dashboard/documents`
- `/dashboard/accounts`
- `/dashboard/deposit`
- `/dashboard/withdraw`
- `/dashboard/history`
- `/dashboard/profile`
- `/dashboard/support`
- `/dashboard/downloads`
- `/dashboard/internal-transfer`
- `/dashboard/external-transfer`
- `/dashboard/ib-account`

### What Users Can Do

1. **Profile management**  
   Update personal details, contact fields, and account profile information.

2. **Document verification**  
   Submit compliance/KYC documents for admin review.

3. **Trading accounts**  
   View/manage trading account records and statuses.

4. **Deposits and withdrawals**  
   Submit funding requests and monitor status.

5. **Transfer operations**  
   Use internal/external transfer screens where enabled.

6. **Support tickets**  
   Open and track support interactions.

7. **IB features**  
   Access introducing broker account data where applicable.

---

## 5) Admin Panel Entry Points

### Admin Login URLs

- `/admin/login`
- `/admin/secure-login`

Both login pages submit credentials to admin auth API and redirect users by role after successful authentication.

### Admin Session Logic

Typical flow:

1. Login form posts to `POST /api/admin/auth/signin`
2. Session cookie is established
3. Admin status verified via `GET /api/admin/auth/me`
4. Redirect based on role:
   - Normal Admin -> `/admin/documents`
   - Middle/Super Admin -> `/admin/dashboard`

---

## 6) Admin Route Model

All admin pages are under `/admin/*` and resolved through `AdminDashboard` route handling.

Important routes:

- `/admin/dashboard`
- `/admin/clients`
- `/admin/clients/:id`
- `/admin/accounts`
- `/admin/accounts/live`
- `/admin/accounts/ib`
- `/admin/accounts/champion`
- `/admin/accounts/ndb`
- `/admin/accounts/social-trading`
- `/admin/accounts/bonus-shifting`
- `/admin/documents`
- `/admin/deposits`
- `/admin/withdrawals`
- `/admin/withdrawals-otp`
- `/admin/fund-transfer`
- `/admin/fund-transfer/internal`
- `/admin/fund-transfer/external`
- `/admin/referrals`
- `/admin/commissions`
- `/admin/ib-cb-wallets`
- `/admin/crypto-wallets`
- `/admin/ib-commissions`
- `/admin/topup`
- `/admin/topup-cards`
- `/admin/support`
- `/admin/logs`
- `/admin/reports`
- `/admin/create-admins`

---

## 7) Admin Roles & Permissions

### A) Super Admin

Access level:

- Full access to all admin sections
- Can access sensitive configuration and management modules
- Can create/manage other admin accounts

Typical scope:

- All client operations
- All finance operations
- Wallet/payment configurations
- Logs, reports, support, document review
- Admin management

### B) Middle Admin

Access level:

- Broad operational access
- Usually restricted from highest-risk or system-owner controls depending on policy

Typical scope:

- Client, finance, compliance, and support operations
- Monitoring and execution tasks

### C) Normal Admin

Access level:

- Limited access by design

Current enforced behavior in frontend:

- Allowed routes primarily:
  - `/admin/documents`
  - `/admin/support`
  - `/admin/dashboard`
- Restricted route visits are blocked and redirected to `/admin/documents`.

---

## 8) Admin Functional Areas

### 8.1 Dashboard Overview

Purpose:

- Operational snapshot (counts, pending items, key workload indicators)

Used by:

- All roles (with role-specific visibility rules)

### 8.2 Clients

Purpose:

- Search, view, and manage client profiles
- Open client detail page (`/admin/clients/:id`)

### 8.3 Accounts

Purpose:

- Navigate and manage account categories:
  - Live, IB, Champion, NDB, Social Trading, Bonus Shifting

### 8.4 Documents (Compliance/KYC)

Purpose:

- Review pending verification documents
- Approve/reject as per compliance process

### 8.5 Deposits & Withdrawals

Purpose:

- Process user funding requests
- Review request details and set status updates

### 8.6 Fund Transfers

Purpose:

- Manage internal/external transfer records and workflows

### 8.7 Referrals & Commissions

Purpose:

- Track referral relationships
- Manage commission-related modules

### 8.8 Wallets / Payment Modules

Purpose:

- Maintain wallet references and payment-side settings

### 8.9 Support

Purpose:

- Review tickets, update statuses, send replies

### 8.10 Logs & Reports

Purpose:

- Audit admin activity
- View/export operational reporting data

### 8.11 Admin Creation

Purpose:

- Create/manage admin users (Super Admin only)

---

## 9) End-to-End Workflow (User -> Admin)

### 9.1 Onboarding

1. User signs up (`/signup`)
2. User signs in (`/signin`)
3. User completes profile/documents in dashboard
4. Admin reviews KYC/doc status in `/admin/documents`

### 9.2 Funding

1. User submits deposit/withdraw request in dashboard
2. Admin reviews request in `/admin/deposits` or `/admin/withdrawals`
3. Admin updates status
4. User sees updated status in dashboard history

### 9.3 Support Handling

1. User submits support message/ticket in `/dashboard/support`
2. Admin handles queue in `/admin/support`
3. Admin replies/changes status
4. User receives status/reply visibility in user area

---

## 10) Security & Access Notes

- Admin panel uses dedicated admin auth endpoints.
- Session-based auth with cookie credentials is required.
- Role checks are enforced in admin UI route handling.
- Sensitive pages (e.g. admin creation, wallet controls) are restricted.
- Public helper UI is suppressed on admin routes for operational safety.

---

## 11) Operational Links (Quick Copy)

### Public

- Home: `/`
- Contact: `/contact`
- Complaints: `/complaints`

### User

- Sign in: `/signin`
- Dashboard: `/dashboard`
- User support: `/dashboard/support`

### Admin

- Admin login: `/admin/login`
- Secure login: `/admin/secure-login`
- Admin dashboard: `/admin/dashboard`
- Documents: `/admin/documents`
- Support: `/admin/support`

---

## 12) Team Usage Guidance

### For Support Team

- Use this document to route user issues to correct page/queue.
- Treat `support@rozkacapitals.com` as primary support contact.

### For Operations/Admin Team

- Use role-appropriate routes only.
- Process compliance and funding in corresponding admin modules.
- Use logs/reports for audit trail verification.

### For Technical Team

- Keep route definitions synchronized with `client/src/App.tsx`.
- Ensure backend role checks mirror frontend restrictions.
- Maintain consistent contact/address data across UI and templates.

---

## 13) Current Canonical Business Identity (UI)

- Company: Rozka Capitals Limited
- Support email: `support@rozkacapitals.com`
- Info email: `info@rozkacapitals.com`
- Official address:
  Rozka Capitals Limited, Ground Floor, The Sotheby Building, Rodney Village, Rodney Bay, Gros-Islet Saint Lucia.

