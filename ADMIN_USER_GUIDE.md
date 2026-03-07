# Admin User Guide - Mekness Dashboard

## Admin Login Instructions

### How to Login as Admin

1. **Navigate to Sign-In Page**: Go to `/signin` (the normal user sign-in page)

2. **Enter Credentials**: 
   - **Email/Username**: Enter your admin username (or email - the system will extract the username automatically)
   - **Password**: Enter your admin password

3. **Automatic Detection**: 
   - The system will automatically detect if you're an admin
   - You'll be redirected to `/admin/dashboard` if authentication is successful
   - If admin login fails, it will try user authentication as fallback

### Example Login Flow:
```
User enters credentials → System tries admin auth → Success? → Redirect to /admin/dashboard
                                                  → Failure? → Try user auth → Redirect to /dashboard
```

---

## Admin Dashboard Features

### Dashboard Overview (`/admin/dashboard`)
**Real-time updates every 30 seconds**

View key metrics:
- Total registered users
- Pending documents for verification
- Total trading accounts
- Total deposits and withdrawals
- Active admin users

---

### Clients Management (`/admin/clients`)
**Real-time updates every 60 seconds**

Features:
- View all registered users
- Search and filter clients
- View client details (ID, Name, Email, Phone, Country)
- Send account activation links
- Impersonate users (for support purposes)
- Copy referral IDs

Actions available:
- 📧 Send Activation Link
- 👤 Impersonate User
- 📋 Copy Referral ID

---

### Deposits Management (`/admin/deposits`)
**Real-time updates every 15 seconds**

Features:
- View all deposit requests
- Filter by status (Pending, Approved, Rejected)
- View verification files
- Approve or reject deposits
- Add deposit amounts to trading accounts

Workflow:
1. User submits deposit request
2. Admin reviews verification file
3. Admin approves or rejects
4. If approved, amount is added to user's account

---

### Withdrawals Management (`/admin/withdrawals`)
**Real-time updates every 15 seconds**

Features:
- View all withdrawal requests
- Filter by status
- Process withdrawals
- Reject with reason
- Track withdrawal history

---

### Accounts Management (`/admin/accounts`)

Features:
- View all trading accounts
- Monitor account balances
- Track account activity
- Manage account settings

---

### Documents Management
**Real-time updates every 15 seconds**

Features:
- View pending document verifications
- Approve or reject documents
- View document history
- Track verification status

Document types:
- ID Proof (Passport, Driver's License, National ID)
- Address Proof (Utility bill, Bank statement)
- Bank Statement

---

### Support Tickets (`/admin/support`)
**Real-time updates every 30 seconds**

Features:
- View all support tickets
- Respond to tickets
- Mark tickets as resolved
- Track ticket history
- Filter by status (Open, In Progress, Resolved, Closed)

---

### Activity Logs (`/admin/logs`)
**Real-time updates every 30 seconds**

Features:
- View all admin actions
- Track who did what and when
- Audit trail for security
- Filter by admin, action type, or date

---

### Fund Transfers (`/admin/fund-transfer`)

Features:
- View internal fund transfer requests
- Approve or reject transfers
- Track transfer history

---

### IB/CB Wallets (`/admin/ib-cb-wallets`)

Features:
- Manage Introducing Broker wallets
- Manage Corporate Broker wallets
- Track commissions
- Process payouts

---

### Commissions Management (`/admin/commissions`)

Features:
- View commission structures
- Calculate commissions
- Process commission payments
- Track commission history

---

### Admin Management (`/admin/management`)
**Super Admin Only**

Features:
- Create new admin users
- Assign admin roles (Super Admin, Middle Admin, Normal Admin)
- Enable/disable admin accounts
- Assign country restrictions
- View admin activity

Admin Roles:
- **Super Admin**: Full access to all features
- **Middle Admin**: Limited access, cannot manage other admins
- **Normal Admin**: Read-only access to most features

---

## Real-Time Updates

All admin pages feature automatic data refreshing:

| Page | Refresh Interval |
|------|-----------------|
| Dashboard | 30 seconds |
| Clients | 60 seconds |
| Deposits | 15 seconds |
| Withdrawals | 15 seconds |
| Documents | 15 seconds |
| Support | 30 seconds |
| Logs | 30 seconds |

**Benefits:**
- No need to manually refresh pages
- Always see the latest data
- Immediate notification of new requests
- Better response time to user needs

---

## Admin Permissions

### Super Admin Can:
- ✅ View all data
- ✅ Approve/reject all requests
- ✅ Create and manage other admins
- ✅ View all activity logs
- ✅ Access all countries
- ✅ Change system settings

### Middle Admin Can:
- ✅ View assigned country data
- ✅ Approve/reject requests in assigned countries
- ✅ View activity logs
- ❌ Cannot create/manage admins
- ❌ Cannot access all countries

### Normal Admin Can:
- ✅ View data (read-only)
- ✅ View assigned country data
- ❌ Cannot approve/reject requests
- ❌ Cannot create/manage admins
- ❌ Cannot access all countries

---

## Best Practices

### Security:
1. Always log out when done
2. Don't share admin credentials
3. Use strong passwords
4. Monitor activity logs regularly

### Efficiency:
1. Use search and filters to find specific data
2. Bookmark frequently used pages
3. Keep multiple tabs open for different sections
4. Use the live updates - no need to refresh

### User Support:
1. Respond to support tickets promptly
2. Verify documents within 24-48 hours
3. Process deposits/withdrawals quickly
4. Use impersonate feature for troubleshooting

---

## Troubleshooting

### Can't Login?
- Verify you're using the correct admin username
- Check if your admin account is enabled
- Contact a Super Admin if locked out

### Not Seeing Data?
- Check if real-time updates are working
- Verify your permissions for that section
- Check your country assignment (if applicable)

### Need Help?
- Contact Super Admin
- Review activity logs for audit trail
- Check this guide for feature documentation

---

## Support

For technical support or questions about the admin dashboard:
- Email: admin-support@mekness.com
- Internal ticket system: Create a support ticket
- Emergency: Contact Super Admin directly

