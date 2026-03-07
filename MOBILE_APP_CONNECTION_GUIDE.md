# Mobile App Connection Guide - Refresh Token Implementation

## 📋 Table of Contents
1. [Essential APIs](#essential-apis)
2. [Connection Setup](#connection-setup)
3. [Step-by-Step Integration](#step-by-step-integration)
4. [Code Examples](#code-examples)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

---

## 🔑 Essential APIs

### Base URL
```
Production: https://newmekness.com/api
Development: http://localhost:5000/api
```

### Authentication Flow (Refresh Token Pattern)
```
1. User signs in → Gets Access Token (15 min) + Refresh Token (30 days)
2. Access Token used for all API calls
3. When Access Token expires → Use Refresh Token to get new Access Token
4. Refresh Token stored securely, can be revoked
```

### 1. Authentication APIs (REQUIRED FIRST)

#### Sign In
```
POST /api/mobile/auth/signin
Content-Type: application/json

Request:
{
  "username": "user123",  // OR "email": "user@example.com"
  "password": "password123",
  "deviceId": "optional-device-id",
  "deviceName": "iPhone 14 Pro"
}

Response (200):
{
  "success": true,
  "accessToken": "eyJhbGci...",  // 15 minutes
  "refreshToken": "abc123...",   // 30 days
  "expiresIn": 900,              // 15 min in seconds
  "user": {
    "id": "user-id",
    "username": "user123",
    "email": "user@example.com",
    "fullName": "John Doe",
    "verified": true,
    "enabled": true
  }
}

Error (401):
{
  "message": "Invalid credentials"
}

Error (403) - Admin Account:
{
  "message": "Admin accounts cannot login through the mobile app. Please use the web admin panel.",
  "isAdmin": true
}
```

#### Sign Up
```
POST /api/mobile/auth/signup
Content-Type: application/json

Request:
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "phone": "+1234567890",
  "country": "United States",
  "city": "New York",
  "ref": "optional-referral-id",
  "deviceId": "optional-device-id",
  "deviceName": "iPhone 14 Pro"
}

Response (201):
{
  "success": true,
  "accessToken": "eyJhbGci...",
  "refreshToken": "abc123...",
  "expiresIn": 900,
  "user": { ... }
}

Error (400):
{
  "message": "Email already registered"
}
```

#### Refresh Token (NEW)
```
POST /api/mobile/auth/refresh
Content-Type: application/json

Request:
{
  "refreshToken": "abc123..."
}

Response (200):
{
  "accessToken": "new-access-token",
  "expiresIn": 900
}

Error (401):
{
  "message": "Invalid or expired refresh token"
}
```

#### Logout
```
POST /api/mobile/auth/logout
Authorization: Bearer <accessToken>
Content-Type: application/json

Request:
{
  "refreshToken": "abc123..."
}

Response (200):
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### Logout All Devices
```
POST /api/mobile/auth/logout-all
Authorization: Bearer <accessToken>

Response (200):
{
  "success": true,
  "message": "All devices logged out"
}
```

#### Get Devices List
```
GET /api/mobile/devices
Authorization: Bearer <accessToken>

Response (200):
[
  {
    "id": "device-id",
    "deviceName": "iPhone 14 Pro",
    "ipAddress": "192.168.1.1",
    "lastUsedAt": "2024-01-15T10:30:00Z",
    "createdAt": "2024-01-01T08:00:00Z"
  }
]
```

#### Revoke Device
```
DELETE /api/mobile/devices/:deviceId
Authorization: Bearer <accessToken>

Response (200):
{
  "success": true,
  "message": "Device revoked"
}
```

---

### 2. Core User APIs (All require Access Token)

**Important:** Use `accessToken` (not `refreshToken`) in the Authorization header for all API calls.

#### Get Current User
```
GET /api/auth/me
Headers: Authorization: Bearer <accessToken>

Response:
{
  "user": {
    "id": "user-id",
    "username": "user123",
    "email": "user@example.com",
    "fullName": "John Doe",
    ...
  }
}
```

#### Dashboard Stats
```
GET /api/dashboard/stats?accountId=optional
Headers: Authorization: Bearer <accessToken>

Response:
{
  "balance": "1000.00",
  "equity": "1050.00",
  "margin": "50.00",
  "profitLoss": "50.00",
  "totalAccounts": 3,
  "openTrades": 2,
  "totalDeposits": 5
}
```

#### Trading Accounts
```
GET /api/trading-accounts
Headers: Authorization: Bearer <accessToken>

Response:
[
  {
    "id": "account-id",
    "accountId": "12345678",
    "type": "Live",
    "balance": "1000.00",
    "equity": "1050.00",
    "margin": "50.00",
    "currency": "USD",
    "leverage": "1:100",
    ...
  }
]

POST /api/trading-accounts
Headers: Authorization: Bearer <accessToken>
Body:
{
  "type": "Live",  // Live, Demo, IB, Champion, NDB, Social, Bonus
  "group": "Standard",
  "leverage": "1:100"
}

PATCH /api/trading-accounts/:id
Headers: Authorization: Bearer <accessToken>
Body: { "type": "Demo", ... }
```

#### Deposits
```
GET /api/deposits
Headers: Authorization: Bearer <accessToken>

POST /api/deposits
Headers: Authorization: Bearer <accessToken>
Body:
{
  "amount": "100",
  "accountId": "account-id",
  "method": "Bank Transfer",
  "merchant": "Bank Name"
}

POST /api/stripe/create-payment-intent
Headers: Authorization: Bearer <accessToken>
Body:
{
  "amount": 100,
  "tradingAccountId": "account-id",
  "paymentMethod": "card"
}
Response: { "checkoutUrl": "https://checkout.stripe.com/..." }

GET /api/stripe/payment-status/:sessionId
Headers: Authorization: Bearer <accessToken>
Response: { "status": "completed", "deposit": {...} }
```

#### Withdrawals
```
GET /api/withdrawals
Headers: Authorization: Bearer <accessToken>

POST /api/withdrawals
Headers: Authorization: Bearer <accessToken>
Body:
{
  "amount": "50",
  "accountId": "account-id",
  "method": "Bank Transfer",
  "accountDetails": "Account number, etc."
}
```

#### Documents
```
GET /api/documents
Headers: Authorization: Bearer <accessToken>

POST /api/documents
Headers: Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
Body: FormData
  - type: "ID Proof" | "Address Proof" | "Bank Statement"
  - file: <file>

GET /api/documents/verification-status
Headers: Authorization: Bearer <accessToken>
Response:
{
  "isVerified": true,
  "verifiedCount": 1,
  "requiredCount": 1,
  "hasPending": false,
  "documents": [...]
}
```

#### Profile
```
GET /api/profile
Headers: Authorization: Bearer <accessToken>

PATCH /api/profile
Headers: Authorization: Bearer <accessToken>
Body:
{
  "fullName": "John Doe",
  "phone": "+1234567890",
  "country": "United States",
  "city": "New York",
  "address": "123 Main St"
}
```

#### Notifications
```
GET /api/notifications
Headers: Authorization: Bearer <accessToken>

PATCH /api/notifications/:id/read
Headers: Authorization: Bearer <accessToken>
```

#### Support Tickets
```
GET /api/support-tickets
Headers: Authorization: Bearer <accessToken>

POST /api/support-tickets
Headers: Authorization: Bearer <accessToken>
Body:
{
  "subject": "Help needed",
  "message": "I need assistance",
  "category": "Technical",
  "priority": "High"
}

POST /api/support-tickets/:id/reply
Headers: Authorization: Bearer <accessToken>
Body: { "message": "Reply text" }
```

---

## 🔧 Connection Setup

### Step 1: Backend Environment Variables

Add to your `.env` file or Railway environment variables:

```env
# JWT Configuration (REQUIRED)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=15m  # Access token (short-lived)
REFRESH_TOKEN_EXPIRES_IN=30d  # Refresh token (long-lived)

# Database (Already configured)
DATABASE_URL=postgresql://...

# Session Secret
SESSION_SECRET=your-session-secret

# Frontend URL
FRONTEND_URL=https://newmekness.com
```

**Generate JWT_SECRET:**
```bash
# Linux/Mac
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 2: CORS Configuration

CORS is already configured in `server/index.ts` to allow:
- `https://newmekness.com`
- `http://localhost:3000`
- `http://localhost:5173`

**For mobile apps:** CORS allows all origins by default for mobile apps (they don't have a domain). If you need to restrict, add your mobile app bundle ID.

### Step 3: Verify Backend is Running

```bash
# Check if server is running
curl https://newmekness.com/api/auth/check

# Test mobile signin endpoint
curl -X POST https://newmekness.com/api/mobile/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```

---

## 📱 Step-by-Step Integration

### Phase 1: Setup API Client

#### 1.1 Create API Configuration

```typescript
// config/api.ts
export const API_CONFIG = {
  BASE_URL: 'https://newmekness.com/api',
  TIMEOUT: 30000,
};

// For development
// export const API_CONFIG = {
//   BASE_URL: 'http://localhost:5000/api',
//   TIMEOUT: 30000,
// };
```

#### 1.2 Create API Client with Auto-Refresh Token

```typescript
// services/api.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { authService } from './auth';
import { API_CONFIG } from '../config/api';

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add access token to all requests
apiClient.interceptors.request.use(async (config) => {
  const accessToken = await SecureStore.getItemAsync('access_token');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Auto-refresh token on 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = await SecureStore.getItemAsync('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(
          `${API_CONFIG.BASE_URL}/mobile/auth/refresh`,
          { refreshToken },
          { baseURL: '' } // Override baseURL to use full URL
        );

        const { accessToken, expiresIn } = response.data;

        // Store new access token
        await SecureStore.setItemAsync('access_token', accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        await authService.logout();
        // Navigate to login screen
        // navigationRef.navigate('Login');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

---

### Phase 2: Authentication Service

```typescript
// services/auth.ts
import apiClient from './api';
import * as SecureStore from 'expo-secure-store';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import axios from 'axios';

export interface SignInRequest {
  username?: string;
  email?: string;
  password: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  country: string;
  city: string;
  ref?: string;
}

export interface AuthResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: any;
}

const getDeviceInfo = async () => {
  const deviceId = await SecureStore.getItemAsync('device_id') || 
                   `${Platform.OS}-${Date.now()}`;
  await SecureStore.setItemAsync('device_id', deviceId);
  
  return {
    deviceId,
    deviceName: `${Device.brand || 'Unknown'} ${Device.modelName || Device.model || 'Device'}`,
  };
};

export const authService = {
  // Sign In
  signin: async (credentials: SignInRequest): Promise<AuthResponse> => {
    const deviceInfo = await getDeviceInfo();
    
    const response = await apiClient.post('/mobile/auth/signin', {
      ...credentials,
      ...deviceInfo,
    });
    
    const { accessToken, refreshToken, expiresIn, user } = response.data;
    
    // Store tokens securely
    await SecureStore.setItemAsync('access_token', accessToken);
    await SecureStore.setItemAsync('refresh_token', refreshToken);
    await SecureStore.setItemAsync('user_data', JSON.stringify(user));
    
    return { accessToken, refreshToken, expiresIn, user };
  },

  // Sign Up
  signup: async (userData: SignUpRequest): Promise<AuthResponse> => {
    const deviceInfo = await getDeviceInfo();
    
    const response = await apiClient.post('/mobile/auth/signup', {
      ...userData,
      ...deviceInfo,
    });
    
    const { accessToken, refreshToken, expiresIn, user } = response.data;
    
    // Store tokens securely
    await SecureStore.setItemAsync('access_token', accessToken);
    await SecureStore.setItemAsync('refresh_token', refreshToken);
    await SecureStore.setItemAsync('user_data', JSON.stringify(user));
    
    return { accessToken, refreshToken, expiresIn, user };
  },

  // Refresh Token
  refreshToken: async (): Promise<{ accessToken: string; expiresIn: number }> => {
    const refreshToken = await SecureStore.getItemAsync('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(
      'https://newmekness.com/api/mobile/auth/refresh',
      { refreshToken }
    );

    const { accessToken, expiresIn } = response.data;
    await SecureStore.setItemAsync('access_token', accessToken);
    
    return { accessToken, expiresIn };
  },

  // Get Current User
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data.user;
  },

  // Logout
  logout: async () => {
    const refreshToken = await SecureStore.getItemAsync('refresh_token');
    const accessToken = await SecureStore.getItemAsync('access_token');
    
    // Revoke refresh token on server
    if (refreshToken && accessToken) {
      try {
        await axios.post(
          'https://newmekness.com/api/mobile/auth/logout',
          { refreshToken },
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
      } catch (error) {
        // Continue with local logout even if server call fails
        console.error('Logout server call failed:', error);
      }
    }
    
    // Clear local storage
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
    await SecureStore.deleteItemAsync('user_data');
  },

  // Logout All Devices
  logoutAll: async () => {
    await apiClient.post('/mobile/auth/logout-all');
    await authService.logout();
  },

  // Get Devices
  getDevices: async () => {
    const response = await apiClient.get('/mobile/devices');
    return response.data;
  },

  // Revoke Device
  revokeDevice: async (deviceId: string) => {
    await apiClient.delete(`/mobile/devices/${deviceId}`);
  },

  // Check if user is logged in
  isAuthenticated: async (): Promise<boolean> => {
    const accessToken = await SecureStore.getItemAsync('access_token');
    const refreshToken = await SecureStore.getItemAsync('refresh_token');
    return !!(accessToken && refreshToken);
  },

  // Get stored user data
  getStoredUser: async () => {
    const userData = await SecureStore.getItemAsync('user_data');
    return userData ? JSON.parse(userData) : null;
  },
};
```

---

### Phase 3: Core Services

#### 3.1 Dashboard Service

```typescript
// services/dashboard.ts
import apiClient from './api';

export const dashboardService = {
  getStats: async (accountId?: string) => {
    const url = accountId 
      ? `/dashboard/stats?accountId=${accountId}`
      : '/dashboard/stats';
    const response = await apiClient.get(url);
    return response.data;
  },
};
```

#### 3.2 Trading Accounts Service

```typescript
// services/tradingAccounts.ts
import apiClient from './api';

export const tradingAccountsService = {
  getAll: async () => {
    const response = await apiClient.get('/trading-accounts');
    return response.data;
  },

  create: async (data: {
    type: string;
    group?: string;
    leverage?: string;
  }) => {
    const response = await apiClient.post('/trading-accounts', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiClient.patch(`/trading-accounts/${id}`, data);
    return response.data;
  },
};
```

#### 3.3 Deposits Service

```typescript
// services/deposits.ts
import apiClient from './api';

export const depositsService = {
  getAll: async () => {
    const response = await apiClient.get('/deposits');
    return response.data;
  },

  create: async (data: {
    amount: string;
    accountId: string;
    method: string;
    merchant: string;
  }) => {
    const response = await apiClient.post('/deposits', data);
    return response.data;
  },

  createStripePayment: async (data: {
    amount: number;
    tradingAccountId: string;
    paymentMethod: string;
  }) => {
    const response = await apiClient.post('/stripe/create-payment-intent', data);
    return response.data;
  },

  checkPaymentStatus: async (sessionId: string) => {
    const response = await apiClient.get(`/stripe/payment-status/${sessionId}`);
    return response.data;
  },
};
```

#### 3.4 Documents Service

```typescript
// services/documents.ts
import apiClient from './api';

export const documentsService = {
  getAll: async () => {
    const response = await apiClient.get('/documents');
    return response.data;
  },

  upload: async (type: string, file: any) => {
    const formData = new FormData();
    formData.append('type', type);
    formData.append('file', {
      uri: file.uri,
      type: file.type,
      name: file.name,
    });

    const response = await apiClient.post('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getVerificationStatus: async () => {
    const response = await apiClient.get('/documents/verification-status');
    return response.data;
  },
};
```

---

## 💻 Code Examples

### Example 1: Login Screen

```typescript
// screens/LoginScreen.tsx
import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { authService } from '../services/auth';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }

    setLoading(true);
    try {
      const { accessToken, refreshToken, user } = await authService.signin({
        username,
        password,
      });
      
      // Tokens stored automatically in SecureStore
      navigation.replace('Dashboard');
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error.response?.data?.message || 'Invalid credentials'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Username or Email"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Login" onPress={handleLogin} disabled={loading} />
    </View>
  );
}
```

### Example 2: Dashboard Screen

```typescript
// screens/DashboardScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import apiClient from '../services/api';

export default function DashboardScreen() {
  const [stats, setStats] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // API client automatically handles token refresh
      const [statsData, accountsData] = await Promise.all([
        apiClient.get('/dashboard/stats'),
        apiClient.get('/trading-accounts'),
      ]);
      
      setStats(statsData.data);
      setAccounts(accountsData.data);
    } catch (error) {
      console.error('Failed to load data:', error);
      // If 401, user will be redirected to login automatically
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Text>Loading...</Text>;

  return (
    <View>
      <Text>Balance: ${stats?.balance}</Text>
      <Text>Equity: ${stats?.equity}</Text>
      <Text>Accounts: {stats?.totalAccounts}</Text>
      {/* Display accounts list */}
    </View>
  );
}

### Example 3: Document Upload

```typescript
// screens/DocumentUploadScreen.tsx
import React, { useState } from 'react';
import { View, Button, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { documentsService } from '../services/documents';

export default function DocumentUploadScreen() {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
      });

      if (result.canceled) return;

      setUploading(true);
      await documentsService.upload('ID Proof', {
        uri: result.assets[0].uri,
        type: result.assets[0].mimeType,
        name: result.assets[0].name,
      });
      
      Alert.alert('Success', 'Document uploaded successfully');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View>
      <Button
        title="Upload ID Proof"
        onPress={handleUpload}
        disabled={uploading}
      />
    </View>
  );
}
```

---

## 🧪 Testing

### Test 1: Sign In

```bash
curl -X POST https://newmekness.com/api/mobile/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "testpassword"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGci...",
  "user": { ... }
}
```

### Test 2: Refresh Token

```bash
curl -X POST https://newmekness.com/api/mobile/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "your-refresh-token"
  }'
```

### Test 3: Get Dashboard Stats (with access token)

```bash
curl -X GET https://newmekness.com/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response:**
```json
{
  "balance": "1000.00",
  "equity": "1050.00",
  "margin": "50.00",
  "profitLoss": "50.00",
  "totalAccounts": 3,
  "openTrades": 2,
  "totalDeposits": 5
}
```

### Test 4: Get Trading Accounts

```bash
curl -X GET https://newmekness.com/api/trading-accounts \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🔍 Troubleshooting

### Issue 1: "No token provided" (401)

**Problem:** Access token not being sent in request header.

**Solution:**
- Check if access token is stored: `SecureStore.getItemAsync('access_token')`
- Verify header format: `Authorization: Bearer <accessToken>`
- Check API client interceptor is working

### Issue 2: "Token expired" (401)

**Problem:** Access token has expired (default: 15 minutes).

**Solution:**
- Auto-refresh should happen automatically via interceptor
- If refresh fails, user will be logged out and redirected to login
- Check if refresh token is still valid (30 days)
- Verify `JWT_EXPIRES_IN` environment variable is set to `15m`

### Issue 3: "Invalid or expired refresh token" (401)

**Problem:** Refresh token has expired or been revoked.

**Solution:**
- Refresh tokens expire after 30 days
- User must sign in again to get new tokens
- Check if token was revoked via logout or device management

### Issue 4: "Admin accounts cannot login" (403)

**Problem:** Trying to login with admin account.

**Solution:**
- This is intentional - admins must use web panel
- Use a regular user account for mobile app

### Issue 5: CORS Error

**Problem:** Request blocked by CORS policy.

**Solution:**
- CORS is already configured for mobile apps
- Check if backend is running
- Verify base URL is correct

### Issue 6: Network Error / Connection Failed

**Problem:** Cannot reach backend server.

**Solution:**
- Check internet connection
- Verify base URL: `https://newmekness.com/api`
- Check if backend server is running
- Test with curl/Postman first

### Issue 7: "Invalid credentials" (401)

**Problem:** Wrong username/password.

**Solution:**
- Verify credentials are correct
- Check if account is enabled
- Ensure using regular user (not admin)

---

## ✅ Checklist

Before going live, verify:

- [ ] `JWT_SECRET` is set in backend environment
- [ ] `JWT_EXPIRES_IN` is configured (default: 15m for access token)
- [ ] `REFRESH_TOKEN_EXPIRES_IN` is configured (default: 30d)
- [ ] Refresh tokens table exists in database
- [ ] Backend is accessible at production URL
- [ ] Mobile app base URL points to production
- [ ] Access token and refresh token stored securely (SecureStore)
- [ ] Access token is included in all authenticated requests
- [ ] Auto-refresh interceptor is working
- [ ] Error handling is implemented (401, 403, 500)
- [ ] User can sign in successfully
- [ ] User can access dashboard
- [ ] Token refresh works automatically
- [ ] All core features work (deposits, withdrawals, etc.)

---



---

## 🔧 Backend Implementation (Required)

### Database Schema

Add this table to your database:

```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  device_id TEXT,
  device_name TEXT,
  ip_address TEXT,
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);
```

### Backend Endpoints

The backend needs to implement:
1. **Updated signin/signup** - Return both accessToken and refreshToken
2. **POST /api/mobile/auth/refresh** - Exchange refresh token for new access token
3. **POST /api/mobile/auth/logout** - Revoke refresh token
4. **POST /api/mobile/auth/logout-all** - Revoke all user's refresh tokens
5. **GET /api/mobile/devices** - List user's devices
6. **DELETE /api/mobile/devices/:deviceId** - Revoke specific device

### Key Implementation Points

- Access tokens: Short-lived (15 minutes), signed with JWT
- Refresh tokens: Long-lived (30 days), stored in database (can be revoked)
- Token hashing: Store SHA-256 hash of refresh token (not plain text)
- Device tracking: Store device info for management
- Auto-cleanup: Remove expired tokens periodically

---

## ✅ Benefits of Refresh Token Pattern

1. **Better Security**: Short-lived access tokens (15 min) reduce risk
2. **Better UX**: Seamless token refresh, no frequent logins
3. **Token Revocation**: Can revoke refresh tokens instantly
4. **Device Management**: Track and manage user devices
5. **Industry Standard**: Used by major platforms (Google, Facebook, etc.)

---

**Last Updated:** 2024
**Version:** 2.0.0 (Refresh Token Implementation)

