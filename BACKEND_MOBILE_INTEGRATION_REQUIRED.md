# Backend Functions Required for Mobile App Integration

## Overview

This document lists all backend functions and database changes needed to ensure both the website and mobile app work seamlessly together using the same Railway database.

---

## 🔴 CRITICAL: Missing Functions

### 1. Refresh Token System (REQUIRED)

**Current Status:** ❌ NOT IMPLEMENTED
**Priority:** 🔴 CRITICAL

#### Database Schema Addition

Add `refresh_tokens` table to your database:

**For PostgreSQL (Railway):**
```sql
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

**For SQLite (Development):**
```sql
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  device_id TEXT,
  device_name TEXT,
  ip_address TEXT,
  user_agent TEXT,
  expires_at INTEGER NOT NULL,
  revoked INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  last_used_at INTEGER
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);
```

#### Schema Definition

Add to `shared/schema.ts`:

```typescript
// Refresh Tokens table
export const refreshTokens = tableBuilder("refresh_tokens", {
  id: textCol("id").primaryKey().$defaultFn(() => randomUUID()),
  userId: textCol("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: textCol("token_hash").notNull().unique(),
  deviceId: textCol("device_id"),
  deviceName: textCol("device_name"),
  ipAddress: textCol("ip_address"),
  userAgent: textCol("user_agent"),
  expiresAt: timestampCol("expires_at"),
  revoked: boolCol("revoked", false),
  createdAt: timestampCol("created_at", true),
  lastUsedAt: timestampCol("last_used_at"),
});

export const insertRefreshTokenSchema = createInsertSchema(refreshTokens).omit({
  id: true,
  createdAt: true,
});

export type InsertRefreshToken = z.infer<typeof insertRefreshTokenSchema>;
export type RefreshToken = typeof refreshTokens.$inferSelect;
```

#### Storage Interface Methods

Add to `server/storage.ts` interface:

```typescript
export interface IStorage {
  // ... existing methods ...
  
  // Refresh Tokens
  createRefreshToken(token: InsertRefreshToken): Promise<RefreshToken>;
  getRefreshTokenByHash(tokenHash: string): Promise<RefreshToken | undefined>;
  updateRefreshToken(id: string, updates: Partial<RefreshToken>): Promise<RefreshToken | undefined>;
  revokeRefreshToken(tokenHash: string): Promise<boolean>;
  revokeAllUserTokens(userId: string): Promise<number>;
  getUserDevices(userId: string): Promise<RefreshToken[]>;
  revokeDevice(userId: string, deviceId: string): Promise<boolean>;
  cleanupExpiredTokens(): Promise<number>;
}
```

#### Storage Implementation

Add to `server/db-storage.ts`:

```typescript
// Refresh Tokens
async createRefreshToken(token: InsertRefreshToken): Promise<RefreshToken> {
  const db = await getDb();
  const newToken = {
    id: randomUUID(),
    ...token,
    createdAt: new Date(),
  };
  await db.insert(refreshTokens).values(newToken);
  return newToken as RefreshToken;
}

async getRefreshTokenByHash(tokenHash: string): Promise<RefreshToken | undefined> {
  const db = await getDb();
  const result = await db
    .select()
    .from(refreshTokens)
    .where(and(
      eq(refreshTokens.tokenHash, tokenHash),
      eq(refreshTokens.revoked, false)
    ))
    .limit(1);
  return result[0];
}

async updateRefreshToken(id: string, updates: Partial<RefreshToken>): Promise<RefreshToken | undefined> {
  const db = await getDb();
  await db.update(refreshTokens)
    .set(updates)
    .where(eq(refreshTokens.id, id));
  return this.getRefreshTokenByHash(updates.tokenHash || '');
}

async revokeRefreshToken(tokenHash: string): Promise<boolean> {
  const db = await getDb();
  await db.update(refreshTokens)
    .set({ revoked: true })
    .where(eq(refreshTokens.tokenHash, tokenHash));
  return true;
}

async revokeAllUserTokens(userId: string): Promise<number> {
  const db = await getDb();
  const result = await db.update(refreshTokens)
    .set({ revoked: true })
    .where(eq(refreshTokens.userId, userId));
  return result.rowCount || 0;
}

async getUserDevices(userId: string): Promise<RefreshToken[]> {
  const db = await getDb();
  return await db
    .select()
    .from(refreshTokens)
    .where(and(
      eq(refreshTokens.userId, userId),
      eq(refreshTokens.revoked, false)
    ))
    .orderBy(desc(refreshTokens.lastUsedAt));
}

async revokeDevice(userId: string, deviceId: string): Promise<boolean> {
  const db = await getDb();
  await db.update(refreshTokens)
    .set({ revoked: true })
    .where(and(
      eq(refreshTokens.userId, userId),
      eq(refreshTokens.deviceId, deviceId)
    ));
  return true;
}

async cleanupExpiredTokens(): Promise<number> {
  const db = await getDb();
  const now = new Date();
  const result = await db.delete(refreshTokens)
    .where(sql`${refreshTokens.expiresAt} < ${now}`);
  return result.rowCount || 0;
}
```

#### API Endpoints to Add

Add to `server/routes.ts`:

```typescript
// 1. Update Mobile Signin Endpoint
app.post("/api/mobile/auth/signin", async (req, res) => {
  // ... existing validation ...
  
  // Generate tokens
  const accessToken = jwt.sign(
    { userId: user.id, type: 'access' },
    JWT_SECRET,
    { expiresIn: '15m' } // Short-lived access token
  );
  
  const refreshToken = crypto.randomBytes(32).toString('hex');
  const refreshTokenHash = crypto
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex');
  
  // Store refresh token in database
  await storage.createRefreshToken({
    userId: user.id,
    tokenHash: refreshTokenHash,
    deviceId: req.body.deviceId || 'unknown',
    deviceName: req.body.deviceName || 'Mobile App',
    ipAddress: getClientIp(req),
    userAgent: req.headers['user-agent'] || '',
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  });
  
  res.json({
    success: true,
    accessToken,
    refreshToken, // Send plain token (hash stored in DB)
    expiresIn: 900, // 15 minutes in seconds
    user: userWithoutPassword,
  });
});

// 2. Update Mobile Signup Endpoint (same pattern)

// 3. Refresh Token Endpoint
app.post("/api/mobile/auth/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token required" });
  }
  
  // Hash the token
  const tokenHash = crypto
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex');
  
  // Find token in database
  const storedToken = await storage.getRefreshTokenByHash(tokenHash);
  
  if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
  
  // Update last used
  await storage.updateRefreshToken(storedToken.id, {
    lastUsedAt: new Date(),
  });
  
  // Generate new access token
  const accessToken = jwt.sign(
    { userId: storedToken.userId, type: 'access' },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
  
  res.json({
    accessToken,
    expiresIn: 900,
  });
});

// 4. Logout Endpoint
app.post("/api/mobile/auth/logout", requireMobileAuth, async (req, res) => {
  const { refreshToken } = req.body;
  
  if (refreshToken) {
    const tokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');
    
    await storage.revokeRefreshToken(tokenHash);
  }
  
  res.json({ success: true });
});

// 5. Logout All Devices
app.post("/api/mobile/auth/logout-all", requireMobileAuth, async (req, res) => {
  const userId = getCurrentUserId(req);
  await storage.revokeAllUserTokens(userId!);
  res.json({ success: true });
});

// 6. Get Devices
app.get("/api/mobile/devices", requireMobileAuth, async (req, res) => {
  const userId = getCurrentUserId(req);
  const devices = await storage.getUserDevices(userId!);
  res.json(devices.map(device => ({
    id: device.deviceId,
    deviceName: device.deviceName,
    ipAddress: device.ipAddress,
    lastUsedAt: device.lastUsedAt,
    createdAt: device.createdAt,
  })));
});

// 7. Revoke Device
app.delete("/api/mobile/devices/:deviceId", requireMobileAuth, async (req, res) => {
  const userId = getCurrentUserId(req);
  const { deviceId } = req.params;
  await storage.revokeDevice(userId!, deviceId);
  res.json({ success: true });
});
```

---

### 2. Environment Variables

Add to `.env` or Railway environment variables:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=15m  # Access token (short-lived)
REFRESH_TOKEN_EXPIRES_IN=30d  # Refresh token (long-lived)

# Database (Already configured for Railway)
DATABASE_URL=postgresql://...  # Railway PostgreSQL URL
```

---

### 3. Database Migration

#### For PostgreSQL (Railway):

Run this SQL in your Railway PostgreSQL database:

```sql
-- Create refresh_tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires ON refresh_tokens(expires_at);
```

#### Update Migration Files

Add to `server/pg-migrations.ts`:

```typescript
`CREATE TABLE IF NOT EXISTS refresh_tokens (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  device_id TEXT,
  device_name TEXT,
  ip_address TEXT,
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP
)`,

`CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id)`,
`CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON refresh_tokens(token_hash)`,
`CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires ON refresh_tokens(expires_at)`,
```

---

### 4. Update Existing Mobile Endpoints

**Current Issue:** Mobile signin/signup return single `token` field
**Required:** Return `accessToken` and `refreshToken`

**Files to Update:**
- `server/routes.ts` - Lines 206-393 (mobile auth endpoints)

**Change:**
```typescript
// OLD:
res.json({
  success: true,
  token,  // ❌ Single token
  user: userWithoutPassword,
});

// NEW:
res.json({
  success: true,
  accessToken,    // ✅ Short-lived (15 min)
  refreshToken,  // ✅ Long-lived (30 days)
  expiresIn: 900,
  user: userWithoutPassword,
});
```

---

### 5. Token Cleanup Job (Optional but Recommended)

Add periodic cleanup of expired tokens:

```typescript
// In server/index.ts or create a separate cron job
setInterval(async () => {
  try {
    const deleted = await storage.cleanupExpiredTokens();
    console.log(`Cleaned up ${deleted} expired refresh tokens`);
  } catch (error) {
    console.error('Token cleanup error:', error);
  }
}, 24 * 60 * 60 * 1000); // Run daily
```

---

## ✅ Verification Checklist

After implementation, verify:

- [ ] `refresh_tokens` table exists in Railway database
- [ ] Mobile signin returns `accessToken` and `refreshToken`
- [ ] Mobile signup returns `accessToken` and `refreshToken`
- [ ] `POST /api/mobile/auth/refresh` endpoint works
- [ ] `POST /api/mobile/auth/logout` endpoint works
- [ ] `POST /api/mobile/auth/logout-all` endpoint works
- [ ] `GET /api/mobile/devices` endpoint works
- [ ] `DELETE /api/mobile/devices/:deviceId` endpoint works
- [ ] Website login still works (session-based)
- [ ] Mobile login works with Railway database
- [ ] Both use same user accounts from Railway database
- [ ] Admin accounts blocked from mobile (already implemented)

---

## 🔧 Railway Database Connection

### Ensure Both Web and Mobile Use Same Database

**Current Setup:** ✅ Already configured
- Website uses `DATABASE_URL` from Railway
- Mobile app connects to same API endpoints
- Both use same `users` table

**Verification:**
1. Create user on website → Should be able to login on mobile
2. Create user on mobile → Should be able to login on website
3. Both should see same data (accounts, deposits, etc.)

---

## 📝 Implementation Order

1. **Step 1:** Add `refresh_tokens` table to Railway database
2. **Step 2:** Add schema definition to `shared/schema.ts`
3. **Step 3:** Add storage methods to `server/storage.ts` and `server/db-storage.ts`
4. **Step 4:** Update mobile signin/signup endpoints
5. **Step 5:** Add refresh token endpoints
6. **Step 6:** Add device management endpoints
7. **Step 7:** Test with mobile app
8. **Step 8:** Deploy to production

---

## 🚨 Important Notes

1. **Backward Compatibility:** Existing mobile apps using single `token` will break. Consider:
   - Versioning API endpoints (`/api/v2/mobile/auth/signin`)
   - Or update mobile app simultaneously
   - Or support both formats temporarily

2. **Database Migration:** Run migration on Railway database before deploying code changes

3. **Environment Variables:** Update `JWT_EXPIRES_IN` to `15m` (from `7d`)

4. **Testing:** Test thoroughly:
   - Token refresh flow
   - Device management
   - Logout functionality
   - Website still works

---

## 📞 Support

If you encounter issues:
1. Check Railway database logs
2. Verify `refresh_tokens` table exists
3. Check environment variables are set
4. Test endpoints with curl/Postman first
5. Verify database connection is working

---

**Last Updated:** 2024
**Status:** Implementation Required


