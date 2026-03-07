# Mobile App Connection Guide - newmekness.com API

## Overview

This guide explains how to connect your mobile app to the newmekness.com API backend, which uses the same Railway PostgreSQL database as the website.

---

## 🔑 Authentication Flow

The mobile app uses **JWT (JSON Web Tokens)** with a **refresh token pattern** for secure, long-lived sessions.

### Token Types

1. **Access Token** (Short-lived: 15 minutes)
   - Used for API requests
   - Sent in `Authorization: Bearer <token>` header
   - Expires quickly for security

2. **Refresh Token** (Long-lived: 30 days)
   - Used to get new access tokens
   - Stored securely on device (SecureStore/Keychain)
   - Can be revoked by user or server

---

## 📡 API Base URL

```
https://newmekness.com/api
```

**Note:** If `newmekness.com` is not resolving, check DNS configuration. The API should be accessible at this domain.

---

## 🔐 Authentication Endpoints

### 1. Sign In

**POST** `/api/mobile/auth/signin`

**Request Body:**
```json
{
  "username": "user123",  // or "email": "user@example.com"
  "password": "password123",
  "deviceId": "unique-device-id",  // Optional
  "deviceName": "iPhone 15 Pro"     // Optional
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "a1b2c3d4e5f6...",
  "expiresIn": 900,
  "user": {
    "id": "user-id",
    "username": "user123",
    "email": "user@example.com",
    "fullName": "John Doe",
    // ... other user fields (password excluded)
  }
}
```

**Response (Error - 401):**
```json
{
  "message": "Invalid credentials"
}
```

**Response (Error - 403):**
```json
{
  "message": "Admin accounts cannot login through the mobile app. Please use the web admin panel.",
  "isAdmin": true
}
```

---

### 2. Sign Up

**POST** `/api/mobile/auth/signup`

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "securePassword123",
  "fullName": "Jane Doe",
  "phone": "+1234567890",
  "country": "United States",
  "city": "New York",
  "ref": "referral-id",  // Optional
  "deviceId": "unique-device-id",  // Optional
  "deviceName": "Android Phone"     // Optional
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "a1b2c3d4e5f6...",
  "expiresIn": 900,
  "user": {
    "id": "new-user-id",
    "username": "newuser1234",
    "email": "newuser@example.com",
    // ... other user fields
  }
}
```

---

### 3. Refresh Access Token

**POST** `/api/mobile/auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "a1b2c3d4e5f6..."
}
```

**Response (Success - 200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900
}
```

**Response (Error - 401):**
```json
{
  "message": "Invalid or expired refresh token"
}
```

---

### 4. Logout (Single Device)

**POST** `/api/mobile/auth/logout`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "refreshToken": "a1b2c3d4e5f6..."
}
```

**Response:**
```json
{
  "success": true
}
```

---

### 5. Logout All Devices

**POST** `/api/mobile/auth/logout-all`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "success": true
}
```

---

### 6. Get User Devices

**GET** `/api/mobile/devices`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
[
  {
    "id": "device-id-1",
    "deviceName": "iPhone 15 Pro",
    "ipAddress": "192.168.1.1",
    "lastUsedAt": "2024-01-15T10:30:00Z",
    "createdAt": "2024-01-10T08:00:00Z"
  },
  // ... more devices
]
```

---

### 7. Revoke Specific Device

**DELETE** `/api/mobile/devices/:deviceId`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "success": true
}
```

---

## 🔧 Mobile App Implementation

### 1. Store Tokens Securely

**React Native (Expo):**
```typescript
import * as SecureStore from 'expo-secure-store';

// Store tokens
await SecureStore.setItemAsync('accessToken', accessToken);
await SecureStore.setItemAsync('refreshToken', refreshToken);

// Retrieve tokens
const accessToken = await SecureStore.getItemAsync('accessToken');
const refreshToken = await SecureStore.getItemAsync('refreshToken');
```

**React Native (Bare):**
```typescript
import * as Keychain from 'react-native-keychain';

// Store tokens
await Keychain.setGenericPassword('accessToken', accessToken);
await Keychain.setGenericPassword('refreshToken', refreshToken);
```

---

### 2. API Client Setup

```typescript
const API_BASE_URL = 'https://newmekness.com/api';

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const accessToken = await SecureStore.getItemAsync('accessToken');
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      ...options.headers,
    },
  });

  // If token expired, try to refresh
  if (response.status === 401) {
    const newAccessToken = await refreshAccessToken();
    if (newAccessToken) {
      // Retry request with new token
      return apiRequest(endpoint, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${newAccessToken}`,
        },
      });
    }
  }

  return response;
}

async function refreshAccessToken(): Promise<string | null> {
  try {
    const refreshToken = await SecureStore.getItemAsync('refreshToken');
    if (!refreshToken) return null;

    const response = await fetch(`${API_BASE_URL}/mobile/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      await SecureStore.setItemAsync('accessToken', data.accessToken);
      return data.accessToken;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
    // Redirect to login
  }
  return null;
}
```

---

### 3. Auto-Refresh Token Logic

```typescript
// Check token expiration before each request
async function getValidAccessToken(): Promise<string | null> {
  const accessToken = await SecureStore.getItemAsync('accessToken');
  if (!accessToken) return null;

  try {
    // Decode JWT to check expiration
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    const expiresAt = payload.exp * 1000; // Convert to milliseconds
    const now = Date.now();

    // If token expires in less than 5 minutes, refresh it
    if (expiresAt - now < 5 * 60 * 1000) {
      return await refreshAccessToken();
    }

    return accessToken;
  } catch (error) {
    // If token is invalid, try to refresh
    return await refreshAccessToken();
  }
}
```

---

## 📋 Available API Endpoints (After Authentication)

Once authenticated, you can use all existing website API endpoints with the `Authorization: Bearer <accessToken>` header:

- `GET /api/dashboard/stats` - Get user dashboard statistics
- `GET /api/dashboard/trading-accounts` - Get user trading accounts
- `GET /api/dashboard/deposits` - Get user deposits
- `GET /api/dashboard/withdrawals` - Get user withdrawals
- `POST /api/dashboard/deposits` - Create deposit
- `POST /api/dashboard/withdrawals` - Create withdrawal
- `GET /api/dashboard/trading-history` - Get trading history
- `GET /api/dashboard/documents` - Get user documents
- `POST /api/dashboard/documents` - Upload document
- `GET /api/dashboard/notifications` - Get notifications
- `POST /api/support/tickets` - Create support ticket
- `GET /api/support/tickets` - Get support tickets
- ... and more

---

## 🚨 Important Notes

1. **Admin Accounts:** Admin users cannot login through the mobile app. They must use the web admin panel.

2. **Token Security:**
   - Never store tokens in plain text
   - Always use secure storage (SecureStore/Keychain)
   - Refresh tokens before they expire
   - Revoke tokens on logout

3. **Error Handling:**
   - Handle 401 (Unauthorized) by refreshing token
   - Handle 403 (Forbidden) for admin accounts
   - Handle 500 (Server Error) gracefully

4. **Device Management:**
   - Track device IDs for security
   - Allow users to see and revoke devices
   - Implement logout all devices feature

---

## 🔍 Troubleshooting

### Issue: "site cannot be reached" for newmekness.com

**Solution:**
1. Check DNS configuration for `newmekness.com`
2. Verify the domain points to your server IP
3. Check if the server is running
4. Verify SSL certificate is valid

### Issue: "Invalid credentials" on signin

**Solution:**
1. Verify username/email and password are correct
2. Check if user account is enabled
3. Ensure you're not trying to login as admin

### Issue: Token refresh fails

**Solution:**
1. Check if refresh token is still valid (not expired/revoked)
2. Verify refresh token is stored correctly
3. Check server logs for errors

---

## ✅ Verification Checklist

- [ ] Mobile app can sign in with newmekness.com API
- [ ] Mobile app can sign up new users
- [ ] Access tokens are stored securely
- [ ] Refresh tokens are stored securely
- [ ] Token auto-refresh works
- [ ] Logout works correctly
- [ ] Device management works
- [ ] All API endpoints work with JWT tokens
- [ ] Admin accounts are blocked from mobile login
- [ ] Both mobile and website use same database

---

## 📞 Support

If you encounter issues:
1. Check server logs
2. Verify database connection
3. Test endpoints with curl/Postman first
4. Verify environment variables are set correctly

---

**Last Updated:** 2024
**Status:** ✅ Ready for Mobile App Integration

