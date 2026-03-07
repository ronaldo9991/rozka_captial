# Rork.com Mobile App Development Prompt

## Project Overview

You are building a mobile application for **Rork.com** - a trading platform. The mobile app must connect to the existing Rork.com backend API and provide the same features as the web application.

**Backend API Base URL:** `https://rork.com/api` (or your production URL)

---

## Core Requirements

### 1. Authentication System (CRITICAL - Refresh Token Pattern)

Implement a **refresh token authentication system** with the following:

#### Authentication Flow:
1. User signs in → Gets **Access Token** (15 minutes) + **Refresh Token** (30 days)
2. Access Token used for all API calls
3. When Access Token expires → Automatically use Refresh Token to get new Access Token
4. Refresh Token stored securely, can be revoked

#### Required Endpoints:
- `POST /api/mobile/auth/signin` - Returns `{ accessToken, refreshToken, expiresIn, user }`
- `POST /api/mobile/auth/signup` - Returns `{ accessToken, refreshToken, expiresIn, user }`
- `POST /api/mobile/auth/refresh` - Exchange refresh token for new access token
- `POST /api/mobile/auth/logout` - Revoke refresh token
- `POST /api/mobile/auth/logout-all` - Revoke all devices
- `GET /api/mobile/devices` - List user's devices
- `DELETE /api/mobile/devices/:deviceId` - Revoke specific device

#### Implementation Requirements:
- Use **SecureStore** (expo-secure-store) or **Keychain** for token storage (NOT AsyncStorage)
- Implement **automatic token refresh** in API client interceptor
- Handle 401 errors by attempting refresh, then logout if refresh fails
- Track device information (deviceId, deviceName) on signin/signup

#### Security:
- Access tokens expire in 15 minutes
- Refresh tokens expire in 30 days
- Refresh tokens stored in database (can be revoked)
- Admin accounts cannot login through mobile app (blocked at backend)

---

### 2. API Client Setup

Create an API client with:
- Base URL: `https://rork.com/api` (configurable for dev/prod)
- Automatic access token injection in headers: `Authorization: Bearer <accessToken>`
- Automatic token refresh on 401 errors
- Error handling for network failures
- Request/response interceptors

**Example Structure:**
```typescript
// services/api.ts
- axios instance with baseURL
- Request interceptor: Add access token
- Response interceptor: Handle 401, auto-refresh
```

---

### 3. Core Features to Implement

#### Authentication Screens:
- **Login Screen**: Username/email + password
- **Signup Screen**: Email, password, fullName, phone, country, city
- **Forgot Password**: (if backend supports it)

#### Dashboard:
- **Home Screen**: Display balance, equity, margin, profit/loss, total accounts
- **Trading Accounts**: List all accounts, create new account, update account type
- **Account Details**: View account details, balance, equity, margin

#### Financial Operations:
- **Deposits**: List deposits, create deposit, Stripe payment integration
- **Withdrawals**: List withdrawals, create withdrawal request
- **Fund Transfers**: Internal transfers (between user's accounts), external transfers

#### Documents:
- **Document List**: View all uploaded documents
- **Upload Document**: Upload ID Proof, Address Proof, Bank Statement
- **Verification Status**: Check verification status

#### Profile:
- **View Profile**: Display user information
- **Edit Profile**: Update fullName, phone, country, city, address

#### Notifications:
- **Notifications List**: View all notifications
- **Mark as Read**: Update notification read status

#### Support:
- **Support Tickets**: List tickets, create ticket, reply to ticket

#### IB (Introducing Broker):
- **IB Stats**: View referral stats, commissions, wallet balance

---

### 4. Technical Stack

#### Recommended:
- **Framework**: React Native (Expo) or Flutter
- **State Management**: Redux Toolkit / Zustand / Context API
- **Navigation**: React Navigation (if React Native)
- **HTTP Client**: Axios
- **Storage**: expo-secure-store (for tokens), AsyncStorage (for other data)
- **UI Library**: React Native Paper / NativeBase / Shadcn UI (if available)

#### Required Packages (React Native):
```json
{
  "axios": "^1.6.0",
  "@react-native-async-storage/async-storage": "^1.19.0",
  "expo-secure-store": "~12.0.0",
  "expo-device": "~5.0.0",
  "@react-navigation/native": "^6.1.0",
  "@react-navigation/stack": "^6.3.0"
}
```

---

### 5. API Integration Details

#### All API Endpoints Require:
- Header: `Authorization: Bearer <accessToken>`
- Content-Type: `application/json` (except file uploads)

#### Key Endpoints:

**Authentication:**
- `POST /api/mobile/auth/signin`
- `POST /api/mobile/auth/signup`
- `POST /api/mobile/auth/refresh`
- `POST /api/mobile/auth/logout`

**Dashboard:**
- `GET /api/dashboard/stats`
- `GET /api/trading-accounts`
- `POST /api/trading-accounts`
- `PATCH /api/trading-accounts/:id`

**Deposits:**
- `GET /api/deposits`
- `POST /api/deposits`
- `POST /api/stripe/create-payment-intent`
- `GET /api/stripe/payment-status/:sessionId`

**Withdrawals:**
- `GET /api/withdrawals`
- `POST /api/withdrawals`

**Documents:**
- `GET /api/documents`
- `POST /api/documents` (multipart/form-data)
- `GET /api/documents/verification-status`

**Profile:**
- `GET /api/profile`
- `PATCH /api/profile`

**Notifications:**
- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`

**Support:**
- `GET /api/support-tickets`
- `POST /api/support-tickets`
- `POST /api/support-tickets/:id/reply`

**IB Stats:**
- `GET /api/ib/stats`

---

### 6. Error Handling

Implement comprehensive error handling:
- **401 Unauthorized**: Auto-refresh token, logout if refresh fails
- **403 Forbidden**: Show appropriate message (e.g., admin blocked)
- **400 Bad Request**: Display validation errors
- **500 Server Error**: Show generic error message
- **Network Errors**: Show connection error, retry option

**Error Response Format:**
```json
{
  "message": "Error description"
}
```

---

### 7. UI/UX Requirements

#### Design Principles:
- Clean, modern interface
- Consistent with web application design
- Responsive layouts
- Loading states for all async operations
- Error messages clearly displayed
- Pull-to-refresh where appropriate

#### Key Screens:
1. **Splash Screen**: App logo, loading indicator
2. **Login/Signup**: Clean forms with validation
3. **Dashboard**: Cards/widgets showing key metrics
4. **Trading Accounts**: List view with account details
5. **Deposits/Withdrawals**: Transaction history with filters
6. **Documents**: Upload interface with camera/gallery access
7. **Profile**: Editable form with save functionality

#### Navigation:
- Bottom tab navigation for main sections
- Stack navigation for detail screens
- Drawer navigation (optional) for settings

---

### 8. Security Requirements

1. **Token Storage**: Use SecureStore/Keychain (encrypted storage)
2. **HTTPS Only**: All API calls must use HTTPS
3. **Token Validation**: Verify token format before storing
4. **Auto-Logout**: Logout user if refresh token fails
5. **Biometric Auth**: Optional - add Face ID/Touch ID for app unlock
6. **Certificate Pinning**: Consider implementing for production

---

### 9. Testing Requirements

#### Unit Tests:
- Authentication service
- API client interceptors
- Token refresh logic

#### Integration Tests:
- Sign in flow
- Token refresh flow
- API calls with authentication

#### Manual Testing:
- Test on iOS and Android
- Test with expired tokens
- Test network failures
- Test offline scenarios

---

### 10. Environment Configuration

Create environment files:
```typescript
// config/env.ts
export const API_CONFIG = {
  BASE_URL: __DEV__ 
    ? 'http://localhost:5000/api'  // Development
    : 'https://rork.com/api',       // Production
  TIMEOUT: 30000,
};
```

---

### 11. State Management

Implement state management for:
- **Auth State**: Current user, tokens, login status
- **Dashboard Data**: Stats, accounts, balances
- **Transactions**: Deposits, withdrawals, transfers
- **Documents**: Document list, verification status
- **Notifications**: Notification list, unread count

**Recommended Pattern:**
```typescript
// Store structure
{
  auth: {
    user: User | null,
    accessToken: string | null,
    refreshToken: string | null,
    isAuthenticated: boolean,
  },
  dashboard: {
    stats: Stats | null,
    accounts: Account[],
    loading: boolean,
  },
  // ... other slices
}
```

---

### 12. Offline Support (Optional but Recommended)

- Cache user data locally
- Queue API requests when offline
- Show offline indicator
- Sync when connection restored

---

### 13. Performance Optimization

- Implement request caching where appropriate
- Use React.memo for expensive components
- Lazy load screens
- Optimize images
- Debounce search inputs
- Pagination for long lists

---

### 14. Push Notifications (Future Enhancement)

Plan for:
- Firebase Cloud Messaging (FCM) integration
- Notification permissions
- Background notification handling
- Deep linking from notifications

---

### 15. Deployment Checklist

Before release:
- [ ] All API endpoints tested
- [ ] Token refresh working correctly
- [ ] Error handling comprehensive
- [ ] UI tested on multiple devices
- [ ] Performance optimized
- [ ] Security measures implemented
- [ ] App icons and splash screens configured
- [ ] App store listings prepared
- [ ] Privacy policy and terms of service links
- [ ] Analytics integrated (optional)

---

## Implementation Priority

### Phase 1 (MVP - Week 1-2):
1. Authentication (signin, signup, refresh token)
2. API client setup
3. Dashboard screen
4. Trading accounts list

### Phase 2 (Core Features - Week 3-4):
5. Deposits/Withdrawals
6. Documents upload
7. Profile management
8. Notifications

### Phase 3 (Enhancements - Week 5-6):
9. Support tickets
10. IB stats
11. Device management
12. UI polish

---

## Reference Documentation

See `MOBILE_APP_CONNECTION_GUIDE.md` for:
- Complete API endpoint documentation
- Code examples
- Error handling patterns
- Testing procedures
- Troubleshooting guide

---

## Important Notes

1. **Backend Connection**: Ensure backend implements refresh token endpoints before starting mobile development
2. **Token Security**: Never log tokens, never commit tokens to version control
3. **Error Messages**: User-friendly error messages, avoid technical jargon
4. **Loading States**: Always show loading indicators for async operations
5. **Validation**: Client-side validation before API calls
6. **Testing**: Test on real devices, not just simulators

---

## Success Criteria

The mobile app is considered complete when:
- ✅ Users can sign in and stay logged in (refresh token working)
- ✅ All core features accessible and functional
- ✅ Smooth user experience (no crashes, fast loading)
- ✅ Error handling works correctly
- ✅ Works on both iOS and Android
- ✅ Ready for App Store/Play Store submission

---

**Project Name:** Rork.com Mobile App
**Backend API:** https://rork.com/api
**Authentication:** Refresh Token Pattern
**Last Updated:** 2024


