# Mobile App API Integration Guide

This document describes how to connect a mobile app to the Mekness backend API.

## Overview

The backend now supports both:
- **Web App**: Session-based authentication (cookies)
- **Mobile App**: JWT token-based authentication

Both authentication methods work simultaneously and share the same database.

---

## Base URL

```
Production: https://newmekness.com/api
Development: http://localhost:5000/api
```

---

## Authentication

### Mobile Sign In

**Endpoint:** `POST /api/mobile/auth/signin`

**Request Body:**
```json
{
  "username": "user123",  // or "email": "user@example.com"
  "password": "password123"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-id",
    "username": "user123",
    "email": "user@example.com",
    "fullName": "John Doe",
    "verified": true,
    "enabled": true
  }
}
```

**Response (Error - 401):**
```json
{
  "message": "Invalid credentials"
}
```

### Mobile Sign Up

**Endpoint:** `POST /api/mobile/auth/signup`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "phone": "+1234567890",
  "country": "United States",
  "city": "New York",
  "ref": "optional-referral-id"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-id",
    "username": "user123",
    "email": "user@example.com",
    "fullName": "John Doe",
    "verified": false,
    "enabled": true
  }
}
```

---

## Using JWT Tokens

After receiving a JWT token from signin/signup, include it in all authenticated requests:

**Header:**
```
Authorization: Bearer <your-jwt-token>
```

**Example:**
```javascript
fetch('https://newmekness.com/api/dashboard/stats', {
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    'Content-Type': 'application/json'
  }
})
```

---

## Available API Endpoints

All existing web API endpoints work with JWT authentication. Simply include the `Authorization: Bearer <token>` header.

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/trading-accounts` - Get all trading accounts
- `GET /api/trading-history` - Get trading history

### Deposits
- `GET /api/deposits` - Get all deposits
- `POST /api/deposits` - Create deposit request
- `POST /api/stripe/create-payment-intent` - Create Stripe payment
- `GET /api/stripe/payment-status/:sessionId` - Check payment status

### Withdrawals
- `GET /api/withdrawals` - Get all withdrawals
- `POST /api/withdrawals` - Create withdrawal request

### Fund Transfers
- `GET /api/fund-transfers/internal` - Get internal transfers
- `POST /api/fund-transfers/internal` - Create internal transfer
- `GET /api/fund-transfers/external` - Get external transfers
- `POST /api/fund-transfers/external` - Create external transfer

### Documents
- `GET /api/documents` - Get user documents
- `POST /api/documents` - Upload document
- `GET /api/documents/verification-status` - Get verification status

### Profile
- `GET /api/profile` - Get user profile
- `PATCH /api/profile` - Update user profile

### Notifications
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/:id/read` - Mark notification as read

---

## Error Handling

All endpoints return errors in this format:

```json
{
  "message": "Error description"
}
```

**Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (invalid/expired token)
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

**Token Expired (401):**
```json
{
  "message": "Token expired"
}
```

**Invalid Token (401):**
```json
{
  "message": "Invalid token"
}
```

---

## Environment Variables

Add these to your `.env` file:

```env
# JWT Configuration (REQUIRED for mobile app)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Session Secret (for web app)
SESSION_SECRET=your-session-secret-key

# Database
DATABASE_URL=mysql://user:password@localhost:3306/database

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

---

## CORS Configuration

CORS is already configured to allow requests from:
- `https://newmekness.com`
- `http://localhost:3000`
- `http://localhost:5173`

To add your mobile app domain, update `server/index.ts`:

```typescript
app.use(cors({
  origin: [
    'https://newmekness.com',
    'http://localhost:3000',
    'your-mobile-app-domain.com',
  ],
  credentials: true,
  // ...
}));
```

---

## Mobile App Implementation Example

### React Native Example

```typescript
// services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://newmekness.com/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (token expired)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
      // Navigate to login screen
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### Authentication Service

```typescript
// services/auth.ts
import apiClient from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  signin: async (username: string, password: string) => {
    const response = await apiClient.post('/mobile/auth/signin', {
      username,
      password,
    });
    
    const { token, user } = response.data;
    await AsyncStorage.setItem('auth_token', token);
    await AsyncStorage.setItem('user_data', JSON.stringify(user));
    
    return { token, user };
  },

  signup: async (userData: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    country: string;
    city: string;
  }) => {
    const response = await apiClient.post('/mobile/auth/signup', userData);
    
    const { token, user } = response.data;
    await AsyncStorage.setItem('auth_token', token);
    await AsyncStorage.setItem('user_data', JSON.stringify(user));
    
    return { token, user };
  },

  logout: async () => {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user_data');
  },
};
```

---

## Testing

### Test Mobile Sign In

```bash
curl -X POST https://newmekness.com/api/mobile/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "testpassword"
  }'
```

### Test Authenticated Request

```bash
curl -X GET https://newmekness.com/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Security Notes

1. **Never expose JWT_SECRET** in client code
2. **Use HTTPS** in production
3. **Store tokens securely** in mobile app (use secure storage)
4. **Handle token expiration** - redirect to login when token expires
5. **Validate all input** on both client and server

---

## Support

For issues or questions:
1. Check server logs for errors
2. Verify JWT_SECRET is set correctly
3. Ensure CORS is configured for your domain
4. Test endpoints with curl/Postman first

---

**Last Updated:** 2024
**Version:** 1.0.0

