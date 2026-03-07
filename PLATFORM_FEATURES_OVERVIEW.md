# Mekness Trading Platform - Complete Feature Overview

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Platform:** Mekness Trading Platform

---

## 📋 Table of Contents

1. [Admin Panel Features](#admin-panel-features)
2. [User Dashboard Features](#user-dashboard-features)
3. [Payment Methods](#payment-methods)
4. [Security Features](#security-features)
5. [Admin Roles & Permissions](#admin-roles--permissions)
6. [Key Statistics](#key-statistics)

---

## 🔐 ADMIN PANEL FEATURES

### **Dashboard & Overview**
- **Real-time Statistics Dashboard**
  - Total users count
  - Total deposits and withdrawals
  - Trading accounts summary
  - Pending approvals count
  - Open support tickets
  - Active trading activity

- **Quick Access**
  - One-click navigation to all management sections
  - Activity monitoring
  - System health indicators

---

### **Client Management**
- **View All Users**
  - Complete user database
  - Search and filter capabilities
  - User profile details
  - Account status (enabled/disabled)

- **User Actions**
  - Enable/disable user accounts
  - View user trading accounts
  - Check verification status
  - View transaction history
  - Monitor user activity

---

### **Account Management**

The platform supports multiple account types, each with specific features:

#### **Live Accounts**
- Real trading accounts with live market access
- MT5 integration
- Account Group and Leverage configuration
- Real-time balance updates

#### **IB Accounts (Introducing Broker)**
- Referral partner accounts
- Commission tracking
- Referral link management
- Trading volume monitoring

#### **Champion Accounts**
- Special promotional accounts
- Custom configurations
- Performance tracking

#### **NDB Accounts (No Deposit Bonus)**
- Bonus account management
- Leverage configuration
- No account group required

#### **Social Trading Accounts**
- Social trading features
- Community integration
- Leverage configuration

#### **Account Management Features**
- View all accounts by type
- Edit account details
- Enable/disable accounts
- Real-time account statistics
- Account creation and management

---

### **Payment & Financial Management**

#### **Deposits Management**
- **View All Deposits**
  - Complete deposit history
  - Filter by status (Pending, Approved, Completed, Rejected)
  - Search by user, amount, date
  - Payment method tracking

- **Deposit Processing**
  - Approve/reject deposits
  - Manual deposit processing
  - View deposit details and verification files
  - Track deposit status changes

#### **Withdrawals Management**
- **View All Withdrawals**
  - Complete withdrawal history
  - Filter by status
  - Search capabilities

- **Withdrawal Processing**
  - Approve/reject withdrawals
  - OTP verification system
  - Track withdrawal status
  - Manual processing options

#### **Topup Cards** (Super Admin Only)
- **Card Management**
  - Create virtual credit cards
  - Set card balance and PIN
  - Auto-generate card numbers
  - Assign cards to users

- **Card Features**
  - 16-digit card numbers
  - 4-digit PIN codes
  - Balance tracking
  - Usage monitoring
  - Transaction history

#### **Crypto Wallets** (Super Admin Only)
- **Wallet Configuration**
  - Bitcoin (BTC) wallet setup
  - USDT (BEP20) - Binance Smart Chain
  - USDT (TRC20) - TRON Network
  - Custom QR code uploads
  - Auto-generated QR codes

- **Wallet Management**
  - Enable/disable wallets
  - Update wallet addresses
  - Network configuration
  - Deposit tracking

---

### **IB Commission Management** (Super Admin Only)

#### **Comprehensive IB Tracking**
- **View All IB Accounts**
  - IB account list with statistics
  - Referral link management
  - Commission rates per IB
  - Wallet balances

#### **Referral Tracking**
- **Who Referred Whom**
  - Complete referral tree
  - See all users who signed up using referral links
  - Referral status (Accepted/Pending/Rejected)
  - Signup dates

#### **Trading Activity Monitoring**
- **Per-Referral Statistics**
  - Total deposits per referral
  - Trading volume (total volume traded)
  - Number of trades executed
  - Profit/loss per referral
  - Number of trading accounts
  - Last deposit date

#### **Commission Management**
- **Commission Settings**
  - Set custom commission rates per IB
  - View total commission earned
  - Track pending commissions
  - Commission calculation based on deposits

#### **Payout Processing**
- **Custom Payouts**
  - Manual amount payouts
  - Trade-based payouts (select specific deposits)
  - Commission calculation from selected trades
  - Add notes to payouts
  - Automatic wallet balance updates

#### **Statistics Dashboard**
- Total IB accounts
- Total referrals across all IBs
- Total deposits from referrals
- Total commissions earned
- Active referrals count

---

### **Fund Transfers**

#### **Internal Transfers**
- Transfer funds between user's own accounts
- View all internal transfers
- Approve/reject transfers
- Real-time statistics

#### **External Transfers**
- Transfer funds to another user's account
- View all external transfers
- Approve/reject transfers
- Track transfer history

---

### **Document Verification**
- **Document Review**
  - View uploaded documents (ID, Address Proof, Bank Statements)
  - Approve/reject documents
  - View verification status
  - Track pending verifications

- **Document Management**
  - Document status tracking
  - Rejection reasons
  - Verification history
  - User notification system

---

### **Support System**
- **Ticket Management**
  - View all support tickets
  - Filter by status (Open, In Progress, Resolved)
  - Priority management
  - Category assignment

- **Communication**
  - Reply to user inquiries
  - Assign tickets to admins
  - File attachments support
  - Ticket history tracking

---

### **MT5 Account Management**
- **Account Creation**
  - Create MT5 trading accounts
  - Link accounts to MT5 server
  - Generate account credentials

- **Account Management**
  - Sync account data from MT5
  - Test MT5 connection
  - View MT5 account details
  - Update MT5 credentials

---

### **Reports & Analytics**
- **Financial Reports**
  - Generate comprehensive reports
  - Transaction summaries
  - Export data for analysis
  - Performance metrics

- **Analytics**
  - User activity reports
  - Trading performance
  - Revenue tracking
  - Commission reports

---

### **Activity Logs**
- **System Monitoring**
  - Track all admin actions
  - View system events
  - Monitor user activities
  - Audit trail for compliance

- **Log Features**
  - Searchable logs
  - Filter by admin, user, action type
  - Date range filtering
  - Detailed activity descriptions

---

### **System Configuration** (Super Admin Only)

#### **Admin Management**
- Create new admin users
- Set admin roles (Super Admin, Middle Admin, Normal Admin)
- Enable/disable admins
- View admin activity

#### **Country Management**
- Assign countries to middle admins
- Country-specific access control
- Regional management

#### **Global Settings**
- System-wide configuration
- Payment gateway settings
- Email configuration
- Security settings

---

## 👤 USER DASHBOARD FEATURES

### **Dashboard Home**
- **Account Overview**
  - Total balance display
  - Real-time profit/loss
  - Open trades count
  - Total deposits count
  - Margin and equity information

- **Quick Actions**
  - Web Trading Terminal access
  - Open new trading account
  - Deposit funds
  - View trading history

- **Live Features**
  - Real-time forex ticker
  - Account type information
  - Market updates

---

### **Trading Accounts**
- **Account Creation**
  - Create Live accounts (requires Account Group + Leverage)
  - Create Demo accounts (requires Account Group + Leverage)
  - Create IB accounts (Leverage only)
  - Create Champion accounts (Leverage only)
  - Create NDB accounts (Leverage only)
  - Create Social Trading accounts (Leverage only)

- **Account Management**
  - View all accounts with balances
  - Account details: Account ID, Password, Leverage, Group
  - Enable/disable accounts
  - Copy account credentials
  - Real-time balance updates

- **Account Types & Requirements**
  - **Live & Demo**: Account Group + Leverage required
  - **IB, Champion, NDB, Social**: Leverage only (no account group)

---

### **Deposits**
- **Payment Methods**

  #### **MyFatoorah (Credit Card)**
  - Visa, Mastercard, American Express
  - Automatic processing
  - Instant balance updates
  - Minimum: $10

  #### **Topup Card**
  - Virtual card deposits
  - Enter card number and PIN
  - Optional amount (or use full card balance)
  - Automatic processing
  - Minimum: $10 (if amount specified)

  #### **Cryptocurrency**
  - Bitcoin (BTC)
  - USDT (BEP20) - Binance Smart Chain
  - USDT (TRC20) - TRON Network
  - Wallet address display
  - QR code for easy scanning
  - **Requires admin approval** (not automatic)
  - Minimum: $10

- **Deposit Features**
  - View deposit history
  - Track deposit status
  - Real-time updates
  - Email notifications

---

### **Withdrawals**
- **Withdrawal Request**
  - Request withdrawals from trading accounts
  - Enter withdrawal amount
  - Bank details required
  - OTP verification

- **Withdrawal Management**
  - View withdrawal history
  - Track withdrawal status
  - View approval/rejection reasons
  - Email notifications

---

### **Trading History**
- **Trade Viewing**
  - View all trades (open and closed)
  - Filter by account, date, symbol
  - See profit/loss per trade
  - Trading performance analysis

- **Trade Details**
  - Entry/exit prices
  - Volume and leverage
  - Commission and swap
  - Trade duration

---

### **IB Account** (For Introducing Brokers)
- **Referral Management**
  - View personal referral link
  - Copy referral link to share
  - Track referrals count
  - See referral status

- **Commission Tracking**
  - View commission balance
  - See total commission earned
  - Track pending commissions
  - Referral statistics

---

### **Fund Transfers**
- **Internal Transfer**
  - Move funds between your own accounts
  - Instant transfers
  - View transfer history

- **External Transfer**
  - Send funds to another user's account
  - Requires approval
  - Track transfer status

---

### **Documents**
- **Document Upload**
  - Upload ID proof
  - Upload address proof
  - Upload bank statements
  - Track upload status

- **Document Management**
  - View document status
  - See approval/rejection reasons
  - Re-upload if rejected
  - Document verification tracking

---

### **Downloads**
- **Trading Platform Downloads**
  - MT5 for Windows
  - MT5 for Android
  - MT5 for iOS
  - Platform features and information

---

### **Support**
- **Ticket System**
  - Create support tickets
  - View ticket history
  - Reply to admin messages
  - Track ticket status

- **Support Features**
  - File attachments
  - Priority levels
  - Category selection
  - Real-time notifications

---

### **Profile**
- **Account Information**
  - Update personal information
  - Change password
  - View account details
  - Email verification

- **Security Settings**
  - Password management
  - Two-factor authentication (2FA)
  - Active sessions management
  - Security preferences

---

## 💳 PAYMENT METHODS

### **Automatic Processing** ✅
1. **MyFatoorah (Credit Card)**
   - Instant processing
   - Automatic balance updates
   - No admin approval needed

2. **Topup Card**
   - Instant processing
   - Automatic balance updates
   - No admin approval needed

### **Manual Approval Required** ⏳
1. **Cryptocurrency Deposits**
   - Bitcoin (BTC)
   - USDT (BEP20)
   - USDT (TRC20)
   - Admin must verify blockchain transaction
   - Balance updated after approval

---

## 🔒 SECURITY FEATURES

### **User Security**
- ✅ Document verification required for withdrawals
- ✅ OTP verification for withdrawals
- ✅ Session-based authentication
- ✅ Password encryption (bcrypt)
- ✅ Email verification
- ✅ Account enable/disable controls

### **Admin Security**
- ✅ Role-based access control
- ✅ Super Admin, Middle Admin, Normal Admin roles
- ✅ Activity logging for all admin actions
- ✅ Session management
- ✅ Secure authentication

### **System Security**
- ✅ HTTPS encryption
- ✅ Secure cookie handling
- ✅ CORS protection
- ✅ Input validation
- ✅ SQL injection prevention
- ✅ XSS protection

---

## 👥 ADMIN ROLES & PERMISSIONS

### **Super Admin** 🔴
**Full Access to All Features:**
- ✅ Create and manage other admins
- ✅ Manage crypto wallets
- ✅ Manage topup cards
- ✅ IB commission management
- ✅ System configuration
- ✅ All client management features
- ✅ All financial operations
- ✅ All account management

### **Middle Admin** 🟡
**Most Features Except:**
- ❌ Cannot create admins
- ❌ Cannot manage crypto wallets
- ❌ Cannot manage topup cards
- ❌ Cannot access IB commissions
- ✅ Can be assigned to specific countries
- ✅ Can manage clients, deposits, withdrawals
- ✅ Can verify documents
- ✅ Can handle support tickets

### **Normal Admin** 🟢
**Limited Access:**
- ✅ Dashboard overview
- ✅ Document verification
- ✅ Support ticket management
- ❌ No financial operations
- ❌ No account management
- ❌ No client management (except viewing)

---

## 📊 KEY STATISTICS & METRICS

### **Admin Dashboard Shows:**
- Total users count
- Total deposits (pending, approved, completed)
- Total withdrawals (pending, approved, completed)
- Trading accounts by type
- Pending documents count
- Open support tickets
- Fund transfer statistics

### **User Dashboard Shows:**
- Account balance
- Profit/loss
- Open trades
- Total deposits
- Trading account count
- Commission balance (for IBs)

### **IB Commission Panel Shows:**
- Total IB accounts
- Total referrals
- Total deposits from referrals
- Trading volume per IB
- Number of trades per IB
- Commission earned vs pending
- Referral relationships (who referred whom)

---

## 🎯 KEY HIGHLIGHTS

### **Easy to Use**
- ✅ Intuitive interface
- ✅ Clear navigation
- ✅ Real-time updates
- ✅ Search and filter capabilities
- ✅ Mobile-responsive design

### **Comprehensive Tracking**
- ✅ Complete transaction history
- ✅ Referral tracking with trading activity
- ✅ Commission calculation and payouts
- ✅ Activity logs for compliance

### **Flexible Payment Options**
- ✅ Multiple payment methods
- ✅ Automatic and manual processing
- ✅ Cryptocurrency support
- ✅ Topup card system

### **Robust Security**
- ✅ Multi-level admin access
- ✅ Document verification
- ✅ OTP verification
- ✅ Complete audit trail

---

## 📝 NOTES

- All financial transactions are logged for audit purposes
- Real-time updates ensure data accuracy
- Email notifications keep users informed
- Support system provides quick issue resolution
- Referral system tracks complete trading activity, not just signups

---

**For Technical Support or Questions:**  
Contact the development team or refer to the system documentation.

**Platform URL:** https://new.mekness.com

---

*This document provides a comprehensive overview of all features available in the Mekness Trading Platform. All features are designed for ease of use with clear interfaces and real-time updates.*

