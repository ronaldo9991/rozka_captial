
import type { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { getDb } from "./db";
import { insertDepositSchema, insertWithdrawalSchema, insertDocumentSchema, insertTradingAccountSchema, insertUserSchema, insertAdminUserSchema, insertAdminCountryAssignmentSchema, fundTransfers, insertTopupCardSchema, type Document as DbDocument, type User, type TradingAccount, type Deposit, type Withdrawal } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { randomUUID } from "crypto";
import { registerMT5Routes } from "./mt5-routes";
import { mt5Service, mt5ServiceDemo, validateMT5Connection } from "./mt5-service";
import { getMyFatoorahService } from "./services/myfatoorah";
import {
  sendWelcomeEmail,
  sendVerificationEmail,
  sendDepositConfirmationEmail,
  sendDepositPendingEmail,
  sendWithdrawalRequestEmail,
  sendWithdrawalApprovedEmail,
  sendWithdrawalRejectedEmail,
  sendDocumentUploadedEmail,
  sendDocumentVerifiedEmail,
  sendDocumentRejectedEmail,
  sendSupportTicketCreatedEmail,
  sendSupportTicketReplyEmail,
  sendSupportTicketResolvedEmail,
  sendIBCommissionEmail,
  sendIBPayoutEmail,
  sendTradingAccountCreatedEmail,
} from "./services/email";

// MyFatoorah API Configuration
// Service is initialized on-demand via getMyFatoorahService()

// JWT Configuration for Mobile App
const JWT_SECRET: string = process.env.JWT_SECRET || "binofox-jwt-secret-change-in-production";
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || "15m"; // Short-lived access token
const REFRESH_TOKEN_EXPIRES_IN: string = process.env.REFRESH_TOKEN_EXPIRES_IN || "30d"; // Long-lived refresh token

// Extend express-session types
declare module "express-session" {
  interface SessionData {
    userId?: string;
    adminId?: string;
    adminLoginAttempts?: number;
    originalAdminId?: string;
  }
}

export async function registerRoutes(app: Express): Promise<void> {
  // Register MT5 routes first
  registerMT5Routes(app);

  // CRITICAL: Register DELETE routes FIRST before any GET/POST routes with same path pattern
  // This ensures DELETE requests are matched before static middleware can intercept them
  
  // Middleware to get authenticated user
  const getCurrentUserId = (req: any): string | undefined => {
    return req.session?.userId;
  };

  // Admin helper functions
  const getCurrentAdminId = (req: any): string | undefined => {
    return req.session?.adminId;
  };

  const requireAdmin = async (req: any, res: any): Promise<boolean> => {
    const adminId = getCurrentAdminId(req);
    if (!adminId) {
      res.status(401).json({ message: "Admin authentication required" });
      return false;
    }
    const admin = await storage.getAdminUser(adminId);
    if (!admin || !admin.enabled) {
      res.status(401).json({ message: "Admin authentication required" });
      return false;
    }
    return true;
  };

  const requireSuperAdmin = async (req: any, res: any): Promise<boolean> => {
    const adminId = getCurrentAdminId(req);
    if (!adminId) {
      console.error("[requireSuperAdmin] No adminId in session. Session data:", {
        hasSession: !!req.session,
        sessionKeys: req.session ? Object.keys(req.session) : [],
        adminId: req.session?.adminId,
        userId: req.session?.userId,
      });
      res.status(401).json({ message: "Super admin access required" });
      return false;
    }
    const admin = await storage.getAdminUser(adminId);
    if (!admin || !admin.enabled) {
      console.error("[requireSuperAdmin] Admin not found or disabled:", {
        adminId,
        adminExists: !!admin,
        adminEnabled: admin?.enabled,
      });
      res.status(401).json({ message: "Super admin access required" });
      return false;
    }
    
    // Normalize role check - handle various formats
    const adminRole = String(admin.role || "").trim().toLowerCase().replace(/[-\s_]+/g, "_");
    const isSuperAdmin = adminRole === "super_admin" || adminRole === "superadmin";
    
    // Debug logging
    console.log("[requireSuperAdmin] Role check:", {
      adminId: admin.id,
      username: admin.username,
      rawRole: admin.role,
      normalizedRole: adminRole,
      isSuperAdmin,
    });
    
    if (!isSuperAdmin) {
      res.status(403).json({ message: "Super admin access required" });
      return false;
    }
    return true;
  };

  // Helper function to get assigned countries for middle admin
  const getAssignedCountriesForAdmin = async (adminId: string, adminRole: string): Promise<string[] | null> => {
    const normalizedRole = String(adminRole || "").trim().toLowerCase().replace(/[-\s_]+/g, "_");
    if (normalizedRole === "middle_admin" || normalizedRole === "middleadmin") {
      const assignments = await storage.getAdminCountryAssignments(adminId);
      return assignments.map(a => a.country);
    }
    return null; // null means no filtering (super admin or normal admin)
  };

  // CRITICAL: Register DELETE route FIRST before any other routes
  // This ensures DELETE requests are matched before static middleware can intercept
  app.delete("/api/admin/users/:id", async (req, res, next) => {
    // CRITICAL: Set Content-Type immediately to prevent static middleware from overwriting
    res.setHeader("Content-Type", "application/json");
    
    try {
      console.log("[DELETE /api/admin/users/:id] Request received for user:", req.params.id);
      const canProceed = await requireSuperAdmin(req, res);
      if (!canProceed) {
        console.log("[DELETE /api/admin/users/:id] Super admin check failed");
        // Response already sent by requireSuperAdmin - ensure it's ended
        if (!res.headersSent) {
          res.end();
        }
        return;
      }

      const adminId = getCurrentAdminId(req);
      const userId = req.params.id;

      console.log("[DELETE /api/admin/users/:id] Admin:", adminId, "deleting user:", userId);

      const user = await storage.getUser(userId);
      if (!user) {
        console.log("[DELETE /api/admin/users/:id] User not found:", userId);
        res.status(404).json({ message: "User not found" });
        res.end(); // Explicitly end response
        return;
      }

      // Delete the user and all related data
      console.log("[DELETE /api/admin/users/:id] Starting deletion process...");
      const deleted = await storage.deleteUser(userId);
      if (!deleted) {
        console.error("[DELETE /api/admin/users/:id] Deletion returned false");
        res.status(500).json({ message: "Failed to delete user" });
        res.end(); // Explicitly end response
        return;
      }

      // Log the activity
      try {
        await logActivity(
          adminId!,
          "DELETE_USER",
          "user",
          userId,
          `Deleted user: ${user.email} (${user.username})`
        );
      } catch (logError) {
        console.error("[DELETE /api/admin/users/:id] Failed to log activity:", logError);
      }

      console.log("[DELETE /api/admin/users/:id] User deleted successfully");
      res.status(200).json({ message: "User deleted successfully" });
      res.end(); // CRITICAL: Explicitly end response to prevent any middleware from running after
    } catch (error: any) {
      console.error("[DELETE /api/admin/users/:id] Error:", error);
      res.status(500).json({ message: error?.message || "Failed to delete user" });
      res.end(); // Explicitly end response
    }
  });
  
  // Add middleware to check admin role for different operations
  const requireMiddleAdminOrSuper = async (req: any, res: any): Promise<boolean> => {
    const adminId = getCurrentAdminId(req);
    if (!adminId) {
      res.status(401).json({ message: "Admin authentication required" });
      return false;
    }
    const admin = await storage.getAdminUser(adminId);
    if (!admin || !admin.enabled) {
      res.status(401).json({ message: "Admin authentication required" });
      return false;
    }
    
    const adminRole = String(admin.role || "").trim().toLowerCase().replace(/[-\s_]+/g, "_");
    const isSuperAdmin = adminRole === "super_admin" || adminRole === "superadmin";
    const isMiddleAdmin = adminRole === "middle_admin" || adminRole === "middleadmin";
    
    if (!isSuperAdmin && !isMiddleAdmin) {
      res.status(403).json({ message: "Middle admin or super admin access required" });
      return false;
    }
    
    return true;
  };

  // Helper function to block normal admins from accessing routes
  // Normal admins can only access: dashboard (stats), documents, and support tickets
  const blockNormalAdmin = async (req: any, res: any): Promise<boolean> => {
    const adminId = getCurrentAdminId(req);
    if (!adminId) {
      return true; // Let requireAdmin handle this
    }
    const admin = await storage.getAdminUser(adminId);
    if (!admin) {
      return true; // Let requireAdmin handle this
    }
    
    const adminRole = String(admin.role || "").trim().toLowerCase().replace(/[-\s_]+/g, "_");
    const isNormalAdmin = adminRole === "normal_admin" || adminRole === "normaladmin";
    
    if (isNormalAdmin) {
      res.status(403).json({ message: "Access denied. Normal admins can only access dashboard, pending documents, and support tickets." });
      return false;
    }
    
    return true;
  };

  const logActivity = async (
    adminId: string | null,
    action: string,
    entity: string,
    entityId: string | null,
    details?: string,
    userId?: string | null,
    ipAddress?: string | null
  ) => {
    try {
      await storage.createActivityLog({
        adminId: adminId || null,
        userId: userId || null,
        action,
        entity,
        entityId: entityId || null,
        details,
        ipAddress: ipAddress || null,
      });
    } catch (error) {
      console.error("Failed to log activity:", error);
    }
  };

  // Helper to get client IP address
  const getClientIp = (req: any): string | null => {
    return (
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.headers["x-real-ip"] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      null
    );
  };

  // JWT Middleware for mobile authentication
  const requireMobileAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(' ')[1]; // Bearer TOKEN

      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; username: string; email?: string };
        // Set session for compatibility with existing code that checks getCurrentUserId
        req.session.userId = decoded.userId;
        next();
      } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
          return res.status(401).json({ message: "Token expired" });
        }
        return res.status(401).json({ message: "Invalid token" });
      }
    } catch (error: any) {
      return res.status(401).json({ message: "Authentication failed" });
    }
  };

  // ============================================
  // MOBILE APP AUTHENTICATION ENDPOINTS (JWT)
  // ============================================

  // Mobile signin endpoint - returns JWT token
  app.post("/api/mobile/auth/signin", async (req, res) => {
    try {
      const { username, password, email } = req.body;
      
      // Support both username and email login
      const loginIdentifier = username || email;
      if (!loginIdentifier || !password) {
        return res.status(400).json({ message: "Username/email and password are required" });
      }

      // IMPORTANT: Check if this is an admin account - admins cannot login through mobile app
      // Check by username first
      let admin = await storage.getAdminUserByUsername(loginIdentifier);
      if (!admin && loginIdentifier.includes("@")) {
        // If not found by username and looks like email, check by email
        admin = await storage.getAdminUserByEmail(loginIdentifier);
      }

      if (admin) {
        // Verify the password matches to confirm it's actually an admin
        const validAdminPassword = await bcrypt.compare(password, admin.password);
        if (validAdminPassword) {
          return res.status(403).json({ 
            message: "Admin accounts cannot login through the mobile app. Please use the web admin panel.",
            isAdmin: true
          });
        }
        // If password doesn't match, continue to check regular user (don't reveal it's an admin account)
      }

      // Find user by username or email
      let user = await storage.getUserByUsername(loginIdentifier);
      if (!user) {
        user = await storage.getUserByEmail(loginIdentifier);
      }

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check if user is enabled
      if (!user.enabled) {
        return res.status(401).json({ message: "Account is disabled" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate access token (short-lived)
      const accessToken = jwt.sign(
        { 
          userId: user.id, 
          username: user.username,
          email: user.email,
          type: 'access'
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
      );

      // Generate refresh token (long-lived)
      const refreshToken = crypto.randomBytes(32).toString('hex');
      const refreshTokenHash = crypto
        .createHash('sha256')
        .update(refreshToken)
        .digest('hex');

      // Calculate expiration date (30 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      // Store refresh token in database
      await storage.createRefreshToken({
        userId: user.id,
        tokenHash: refreshTokenHash,
        deviceId: req.body.deviceId || 'unknown',
        deviceName: req.body.deviceName || req.headers['user-agent'] || 'Mobile App',
        ipAddress: getClientIp(req) || null,
        userAgent: req.headers['user-agent'] || null,
        expiresAt,
        revoked: false,
      });

      // Log user signin
      await logActivity(
        null,
        "mobile_user_signin",
        "user",
        user.id,
        `Mobile user ${user.fullName || user.username} signed in`,
        user.id,
        getClientIp(req)
      );

      // Return tokens and user data (without password)
      const { password: _, ...userWithoutPassword } = user;
      res.json({
        success: true,
        accessToken,
        refreshToken, // Send plain token (hash stored in DB)
        expiresIn: 900, // 15 minutes in seconds
        user: userWithoutPassword,
      });
    } catch (error: any) {
      console.error("Mobile signin error:", error);
      res.status(500).json({ message: "Login failed", error: error.message });
    }
  });

  // Mobile signup endpoint - returns JWT token
  app.post("/api/mobile/auth/signup", async (req, res) => {
    try {
      const { email, password, fullName, phone, country, city, ref } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      if (!phone || !country || !city) {
        return res.status(400).json({ message: "Phone number, country, and city are required" });
      }

      // Ensure database is ready
      const { ensureDbReady } = await import("./db.js");
      await ensureDbReady();

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create username from email
      const username = email.split("@")[0] + Math.floor(Math.random() * 1000);

      // Generate unique numeric referral ID (6-10 digits, matching legacy referral format)
      let referralId: string = "";
      let isUnique = false;
      while (!isUnique) {
        referralId = Math.floor(100000 + Math.random() * 900000).toString();
        const existing = await storage.getUserByReferralId(referralId);
        if (!existing) {
          isUnique = true;
        }
      }

      // Create user
      const userData = insertUserSchema.parse({
        username,
        email,
        password: hashedPassword,
        fullName: fullName || username,
        phone,
        country,
        city,
        referralId,
      });

      // Generate email verification token
      const emailVerificationToken = crypto.randomBytes(32).toString('hex');
      const emailVerificationExpires = new Date();
      emailVerificationExpires.setHours(emailVerificationExpires.getHours() + 24); // 24 hours expiry

      // Create user first (with only InsertUser fields)
      const newUser = await storage.createUser(userData);

      // Update user with email verification fields (not in InsertUser schema)
      const updatedUser = await storage.updateUser(newUser.id, {
        emailVerificationToken,
        emailVerificationExpires,
        emailVerified: false,
      });
      
      if (!updatedUser) {
        throw new Error("Failed to create user");
      }

      // Generate access token (short-lived)
      const accessToken = jwt.sign(
        { 
          userId: newUser.id, 
          username: newUser.username,
          email: newUser.email,
          type: 'access'
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
      );

      // Generate refresh token (long-lived)
      const refreshToken = crypto.randomBytes(32).toString('hex');
      const refreshTokenHash = crypto
        .createHash('sha256')
        .update(refreshToken)
        .digest('hex');

      // Calculate expiration date (30 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      // Store refresh token in database
      await storage.createRefreshToken({
        userId: newUser.id,
        tokenHash: refreshTokenHash,
        deviceId: req.body.deviceId || 'unknown',
        deviceName: req.body.deviceName || req.headers['user-agent'] || 'Mobile App',
        ipAddress: getClientIp(req) || null,
        userAgent: req.headers['user-agent'] || null,
        expiresAt,
        revoked: false,
      });

      // Log user signup
      await logActivity(
        null,
        "mobile_user_signup",
        "user",
        newUser.id,
        `Mobile user ${newUser.fullName || newUser.username} signed up`,
        newUser.id,
        getClientIp(req)
      );

      // Send email verification email (first time only)
      try {
        const FRONTEND_URL = process.env.FRONTEND_URL || 'https://binofox.com';
        const verificationLink = `${FRONTEND_URL}/verify-email?token=${emailVerificationToken}`;
        await sendVerificationEmail(
          newUser.email,
          newUser.fullName || newUser.username,
          verificationLink
        );
        console.log(`[Mobile Signup] Verification email sent to ${newUser.email}`);
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
        // Don't fail the request if email fails
      }

      // Send welcome email
      try {
        const { isEmailConfigured } = await import("./services/email");
        if (isEmailConfigured()) {
          if (newUser.referralId) {
            await sendWelcomeEmail(
              newUser.email,
              newUser.fullName || newUser.username,
              newUser.referralId
            );
          }
          console.log(`[Mobile Signup] Welcome email sent to ${newUser.email}`);
        }
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
        // Don't fail the request if email fails
      }

      // Return tokens and user data (without password)
      const { password: _, ...userWithoutPassword } = newUser;
      res.status(201).json({
        success: true,
        accessToken,
        refreshToken, // Send plain token (hash stored in DB)
        expiresIn: 900, // 15 minutes in seconds
        user: userWithoutPassword,
      });
    } catch (error: any) {
      console.error("Mobile signup error:", error);
      res.status(500).json({ message: "Registration failed", error: error.message });
    }
  });

  // Refresh token endpoint
  app.post("/api/mobile/auth/refresh", async (req, res) => {
    try {
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
      
      if (!storedToken) {
        return res.status(401).json({ message: "Invalid refresh token" });
      }

      if (storedToken.revoked) {
        return res.status(401).json({ message: "Refresh token has been revoked" });
      }

      if (storedToken.expiresAt && storedToken.expiresAt < new Date()) {
        return res.status(401).json({ message: "Refresh token has expired" });
      }
      
      // Get user to generate new access token
      const user = await storage.getUser(storedToken.userId);
      if (!user || !user.enabled) {
        return res.status(401).json({ message: "User account is disabled" });
      }

      // Update last used timestamp
      await storage.updateRefreshToken(storedToken.id, {
        lastUsedAt: new Date(),
      });
      
      // Generate new access token
      const accessToken = jwt.sign(
        { 
          userId: storedToken.userId, 
          username: user.username,
          email: user.email,
          type: 'access'
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
      );
      
      res.json({
        accessToken,
        expiresIn: 900, // 15 minutes in seconds
      });
    } catch (error: any) {
      console.error("Refresh token error:", error);
      res.status(500).json({ message: "Failed to refresh token", error: error.message });
    }
  });

  // Logout endpoint (revoke single refresh token)
  app.post("/api/mobile/auth/logout", requireMobileAuth, async (req, res) => {
    try {
      const { refreshToken } = req.body;
      
      if (refreshToken) {
        const tokenHash = crypto
          .createHash('sha256')
          .update(refreshToken)
          .digest('hex');
        
        await storage.revokeRefreshToken(tokenHash);
      }
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Logout failed", error: error.message });
    }
  });

  // Logout all devices endpoint
  app.post("/api/mobile/auth/logout-all", requireMobileAuth, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      await storage.revokeAllUserTokens(userId);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Logout all error:", error);
      res.status(500).json({ message: "Logout failed", error: error.message });
    }
  });

  // Get user devices endpoint
  app.get("/api/mobile/devices", requireMobileAuth, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const devices = await storage.getUserDevices(userId);
      res.json(devices.map(device => ({
        id: device.deviceId,
        deviceName: device.deviceName,
        ipAddress: device.ipAddress,
        lastUsedAt: device.lastUsedAt,
        createdAt: device.createdAt,
      })));
    } catch (error: any) {
      console.error("Get devices error:", error);
      res.status(500).json({ message: "Failed to get devices", error: error.message });
    }
  });

  // Revoke specific device endpoint
  app.delete("/api/mobile/devices/:deviceId", requireMobileAuth, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { deviceId } = req.params;
      await storage.revokeDevice(userId, deviceId);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Revoke device error:", error);
      res.status(500).json({ message: "Failed to revoke device", error: error.message });
    }
  });

  // Email verification endpoint
  app.get("/api/auth/verify-email", async (req, res) => {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== 'string') {
        return res.status(400).json({ message: "Verification token is required" });
      }

      // Find user by verification token
      const allUsers = await storage.getAllUsers();
      const user = allUsers.find(u => u.emailVerificationToken === token);

      if (!user) {
        return res.status(400).json({ message: "Invalid or expired verification token" });
      }

      // Check if token has expired
      if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
        return res.status(400).json({ message: "Verification token has expired. Please request a new one." });
      }

      // Check if already verified
      if (user.emailVerified) {
        return res.status(400).json({ message: "Email is already verified" });
      }

      // Update user to mark email as verified
      await storage.updateUser(user.id, {
        emailVerified: true,
        emailVerificationToken: null, // Clear token after verification
        emailVerificationExpires: null,
      });

      // Log verification
      await logActivity(
        null,
        "email_verified",
        "user",
        user.id,
        `User ${user.fullName || user.username} verified their email`,
        user.id,
        getClientIp(req)
      );

      // Send welcome email after verification
      try {
        const FRONTEND_URL = process.env.FRONTEND_URL || 'https://binofox.com';
        await sendWelcomeEmail(
          user.email,
          user.fullName || user.username,
          user.referralId || ''
        );
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
        // Don't fail the request if email fails
      }

      res.json({ 
        success: true, 
        message: "Email verified successfully! You can now access all features." 
      });
    } catch (error: any) {
      console.error("Email verification error:", error);
      res.status(500).json({ message: "Failed to verify email", error: error.message });
    }
  });

  // Resend verification email endpoint
  app.post("/api/auth/resend-verification", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if user exists or not for security
        return res.json({ 
          success: true, 
          message: "If an account exists with this email, a verification link has been sent." 
        });
      }

      // Check if already verified
      if (user.emailVerified) {
        return res.status(400).json({ message: "Email is already verified" });
      }

      // Generate new verification token
      const emailVerificationToken = crypto.randomBytes(32).toString('hex');
      const emailVerificationExpires = new Date();
      emailVerificationExpires.setHours(emailVerificationExpires.getHours() + 24);

      // Update user with new token
      await storage.updateUser(user.id, {
        emailVerificationToken,
        emailVerificationExpires,
      });

      // Send verification email
      try {
        const FRONTEND_URL = process.env.FRONTEND_URL || 'https://binofox.com';
        const verificationLink = `${FRONTEND_URL}/verify-email?token=${emailVerificationToken}`;
        await sendVerificationEmail(
          user.email,
          user.fullName || user.username,
          verificationLink
        );
        console.log(`[Resend Verification] Email sent to ${user.email}`);
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
        return res.status(500).json({ message: "Failed to send verification email" });
      }

      res.json({ 
        success: true, 
        message: "Verification email sent successfully" 
      });
    } catch (error: any) {
      console.error("Resend verification error:", error);
      res.status(500).json({ message: "Failed to resend verification email", error: error.message });
    }
  });

  // ============================================
  // WEB AUTHENTICATION ENDPOINTS (Session-based)
  // ============================================

  // Authentication endpoints
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, fullName, phone, country, city, ref } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      if (!phone || !country || !city) {
        return res.status(400).json({ message: "Phone number, country, and city are required" });
      }

      // Ensure database is ready
      const { ensureDbReady } = await import("./db.js");
      await ensureDbReady();

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create username from email
      const username = email.split("@")[0] + Math.floor(Math.random() * 1000);

      // Generate unique numeric referral ID (6-10 digits, matching legacy referral format)
      let referralId: string = "";
      let isUnique = false;
      const allUsers = await storage.getAllUsers();
      
      while (!isUnique) {
        // Generate 8-digit numeric ID (10000000 to 99999999)
        const numericId = Math.floor(10000000 + Math.random() * 90000000);
        referralId = numericId.toString();
        
        // Check if this ID already exists
        isUnique = !allUsers.some(u => u.referralId === referralId);
      }
      
      // Ensure referralId is assigned (TypeScript safety check)
      if (!referralId) {
        throw new Error("Failed to generate referral ID");
      }

      // Find referrer if ref parameter is provided (support both old numeric and new format)
      let referrerId = null;
      if (ref) {
        // Remove "REF" prefix if present (for backward compatibility)
        const cleanRef = ref.replace(/^REF/i, '');
        const referrer = await storage.getAllUsers().then(users => 
          users.find(u => u.referralId === cleanRef || u.referralId === ref)
        );
        if (referrer) {
          referrerId = referrer.id;
        }
      }

      // Generate email verification token
      const emailVerificationToken = crypto.randomBytes(32).toString('hex');
      const emailVerificationExpires = new Date();
      emailVerificationExpires.setHours(emailVerificationExpires.getHours() + 24); // 24 hours expiry

      // Create user first (with only InsertUser fields)
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        email,
        fullName: fullName || username, // Use username as fallback if fullName not provided
        phone: phone || null,
        country: country || null,
        city: city || null,
        referralId, // User's own referral ID
        referredBy: referrerId || null, // ID of the user who referred them
        referralStatus: referrerId ? "Pending" : null, // Set to Pending if referred, null if not
      });

      // Update user with email verification fields (not in InsertUser schema)
      const updatedUser = await storage.updateUser(user.id, {
        emailVerificationToken,
        emailVerificationExpires,
        emailVerified: false,
      });
      
      if (!updatedUser) {
        throw new Error("Failed to create user");
      }

      // Set session
      req.session.userId = updatedUser.id;
      req.session.save();

      // Log user signup
      await logActivity(
        null,
        "user_signup",
        "user",
        updatedUser.id,
        `User ${fullName || username} signed up with email ${email}`,
        updatedUser.id,
        getClientIp(req)
      );

      // Send email verification email (first time only)
      const FRONTEND_URL = process.env.FRONTEND_URL || 'https://binofox.com';
      const verificationLink = `${FRONTEND_URL}/verify-email?token=${emailVerificationToken}`;
      sendVerificationEmail(email, fullName || username, verificationLink).catch(err => {
        console.error("Failed to send verification email:", err);
      });

      // Send welcome email
      try {
        const { isEmailConfigured } = await import("./services/email");
        if (isEmailConfigured() && referralId) {
          await sendWelcomeEmail(email, fullName || username, referralId);
          console.log(`[Web Signup] Welcome email sent to ${email}`);
        }
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
        // Don't fail the request if email fails
      }

      // Return updated user without password
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.status(201).json({ user: userWithoutPassword });
    } catch (error: any) {
      console.error("Signup error:", error);
      const errorMessage = error?.message || "Failed to create account";
      console.error("Full error details:", {
        message: errorMessage,
        stack: error?.stack,
        code: error?.code,
        detail: error?.detail,
      });
      // Provide more helpful error messages
      let userFacingMessage = errorMessage;
      if (errorMessage.includes("relation") || errorMessage.includes("table") || errorMessage.includes("does not exist")) {
        userFacingMessage = "Database tables not initialized. Please run migrations: npm run db:push";
      } else if (errorMessage.includes("referral_code") || errorMessage.includes("not-null constraint")) {
        userFacingMessage = "Database schema mismatch. Please contact support.";
        console.error("[Signup] Schema error - referral_code constraint issue");
      }
      
      res.status(500).json({ 
        message: userFacingMessage
      });
    }
  });

  // Helper function to verify reCAPTCHA
  async function verifyRecaptcha(token: string): Promise<boolean> {
    if (!token) {
      console.warn("[reCAPTCHA] No token provided");
      return false;
    }
    
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
      console.warn("[reCAPTCHA] RECAPTCHA_SECRET_KEY not set, allowing login");
      return true; // Allow in development if key not set
    }
    
    try {
      const response = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${secretKey}&response=${token}`,
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(5000),
      });
      
      if (!response.ok) {
        console.error(`[reCAPTCHA] HTTP error: ${response.status}`);
        return false;
      }
      
      const data = await response.json();
      
      if (!data.success) {
        console.warn("[reCAPTCHA] Verification failed:", data['error-codes'] || 'Unknown error');
        return false;
      }
      
      return true;
    } catch (error: any) {
      // If it's a network/timeout error, be lenient in development
      if (process.env.NODE_ENV !== "production") {
        console.warn("[reCAPTCHA] Verification error (allowing in dev):", error.message);
        return true;
      }
      console.error("[reCAPTCHA] Verification error:", error);
      return false;
    }
  }

  app.post("/api/auth/signin", async (req, res) => {
    try {
      const { email, password, recaptchaToken } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Verify reCAPTCHA for customer login (more lenient)
      if (recaptchaToken) {
        const isValidRecaptcha = await verifyRecaptcha(recaptchaToken);
        if (!isValidRecaptcha) {
          // In production, be strict. In development, allow with warning
          if (process.env.NODE_ENV === "production" && process.env.RECAPTCHA_SECRET_KEY) {
            console.warn(`[SignIn] reCAPTCHA verification failed for ${email}`);
            return res.status(400).json({ message: "reCAPTCHA verification failed. Please try again." });
          } else {
            console.warn(`[SignIn] reCAPTCHA verification failed but allowing in dev mode for ${email}`);
            // Continue with login in development
          }
        }
      } else {
        // In production, require reCAPTCHA. In development, allow without it if key not set
        if (process.env.NODE_ENV === "production" && process.env.RECAPTCHA_SECRET_KEY) {
          return res.status(400).json({ message: "reCAPTCHA verification is required" });
        } else {
          console.warn(`[SignIn] No reCAPTCHA token provided for ${email}, allowing in dev mode`);
        }
      }

      // Helper function to retry database operations
      const retryDbOperation = async <T>(
        operation: () => Promise<T>,
        retries = 2,
        delay = 100
      ): Promise<T> => {
        for (let i = 0; i <= retries; i++) {
          try {
            return await operation();
          } catch (error: any) {
            if (error.code === 'ECONNRESET' || error.code === 'ECONNREFUSED' || error.message?.includes('ECONNRESET')) {
              if (i < retries) {
                console.warn(`[SignIn] Database connection error, retrying (${i + 1}/${retries})...`);
                await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
                continue;
              }
            }
            throw error;
          }
        }
        throw new Error('Database operation failed after retries');
      };

      // Check if this email belongs to an admin user
      // If admin tries to login from client form, redirect to admin login page
      let admin;
      try {
        admin = await retryDbOperation(() => storage.getAdminUserByEmail(email));
      } catch (error: any) {
        console.error(`[SignIn] Database error checking admin:`, error);
        // Continue to check regular user - don't fail on admin check
        admin = undefined;
      }

      if (admin) {
        // Verify the password matches to confirm it's actually an admin
        const validAdminPassword = await bcrypt.compare(password, admin.password);
        if (validAdminPassword) {
          // Check if admin is enabled
          if (!admin.enabled) {
            return res.status(401).json({ message: "Account is disabled" });
          }

          // Don't create session - redirect to admin login page instead
          // This ensures admin must use the dedicated admin login page
          return res.status(403).json({ 
            message: "Admin accounts must use the admin login page",
            redirectTo: "/admin/login",
            isAdmin: true
          });
        }
      }

      // Find user with retry logic
      let user;
      try {
        user = await retryDbOperation(() => storage.getUserByEmail(email));
      } catch (error: any) {
        console.error(`[SignIn] Database error finding user:`, error);
        return res.status(500).json({ 
          message: "Database connection error. Please try again in a moment.",
          retry: true
        });
      }

      if (!user) {
        console.warn(`[SignIn] User not found: ${email}`);
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Check if user is enabled
      if (user.enabled === false) {
        console.warn(`[SignIn] Disabled account attempt: ${email}`);
        return res.status(401).json({ message: "Account is disabled. Please contact support." });
      }

      // Check password
      if (!user.password) {
        console.error(`[SignIn] User ${email} has no password hash`);
        return res.status(500).json({ message: "Account configuration error. Please contact support." });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        console.warn(`[SignIn] Invalid password for: ${email}`);
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Set session
      try {
        req.session.userId = user.id;
        await new Promise<void>((resolve, reject) => {
          req.session.save((err) => {
            if (err) {
              console.error("[SignIn] Session save error:", err);
              reject(err);
            } else {
              resolve();
            }
          });
        });
      } catch (sessionError: any) {
        console.error("[SignIn] Session error:", sessionError);
        return res.status(500).json({ message: "Failed to create session. Please try again." });
      }

      // Log user signin (don't block on this, use retry)
      retryDbOperation(
        () => logActivity(
          null,
          "user_signin",
          "user",
          user.id,
          `User ${user.fullName || user.username} signed in`,
          user.id,
          getClientIp(req)
        ),
        1, // Only 1 retry for logging
        50 // Shorter delay
      ).catch(err => console.error("[SignIn] Activity log error:", err));

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      console.log(`[SignIn] Success: ${email}`);
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      console.error("[SignIn] Unexpected error:", error);
      console.error("[SignIn] Error stack:", error.stack);
      res.status(500).json({ 
        message: "Failed to sign in. Please try again or contact support.",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }
  });

  // Forgot Password - Send reset email
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email);
      
      // Always return success to prevent email enumeration
      // But only send email if user exists
      if (user && user.enabled) {
        // Generate reset token
        const crypto = await import("crypto");
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetExpires = new Date(Date.now() + 3600000); // 1 hour from now
        
        // Save reset token to database
        await storage.updateUser(user.id, {
          passwordResetToken: resetToken,
          passwordResetExpires: resetExpires,
        });

        // Generate reset link
        const baseUrl = process.env.FRONTEND_URL || process.env.VITE_API_URL || "https://binofox.com";
        const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

        // Send reset email
        try {
          const { sendPasswordResetEmail } = await import("./services/email");
          await sendPasswordResetEmail(
            user.email,
            user.fullName || user.username,
            resetLink
          );
        } catch (emailError) {
          console.error("[API /auth/forgot-password] Email send error:", emailError);
          // Don't fail the request if email fails
        }
      }

      // Always return success to prevent email enumeration
      res.json({ 
        message: "If an account with that email exists, a password reset link has been sent." 
      });
    } catch (error: any) {
      console.error("[API /auth/forgot-password] Error:", error);
      res.status(500).json({ message: "Failed to process request" });
    }
  });

  // Reset Password - Update password with token
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;
      
      if (!token || !password) {
        return res.status(400).json({ message: "Token and password are required" });
      }

      // Validate password complexity
      const passwordRules = /^(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
      if (!passwordRules.test(password)) {
        return res.status(400).json({ 
          message: "Password must be at least 8 characters and include a number and a special character" 
        });
      }

      // Find user by reset token
      const user = await storage.getUserByResetToken(token);
      
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      // Check if token is expired
      if (user.passwordResetExpires && new Date(user.passwordResetExpires) < new Date()) {
        return res.status(400).json({ message: "Reset token has expired. Please request a new one." });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update password and clear reset token
      await storage.updateUser(user.id, {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      });

      res.json({ message: "Password has been reset successfully" });
    } catch (error: any) {
      console.error("[API /auth/reset-password] Error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Check authentication status (returns user data directly)
  app.get("/api/auth/check", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Forex rates cache (in-memory, 5 minute TTL)
  let forexCache: { data: any; timestamp: number } | null = null;
  const FOREX_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  // Get gold price from a free API
  const getGoldPrice = async (): Promise<number> => {
    try {
      // Using a simple approach - calculate from USD rates
      // For gold, we'll use a reasonable estimate or fetch from another source
      // Note: ExchangeRate-API doesn't have gold, so we'll use a fallback
      return 2350; // Approximate gold price in USD per ounce
    } catch (error) {
      console.error("Gold price fetch error:", error);
      return 2350; // Fallback price
    }
  };

  // Live Forex Rates Endpoint
  app.get("/api/forex/live", async (req, res) => {
    try {
      // Check cache first
      if (forexCache && Date.now() - forexCache.timestamp < FOREX_CACHE_TTL) {
        return res.json(forexCache.data);
      }

      // Fetch from ExchangeRate-API (free, no API key required)
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }

      const data = await response.json();
      const rates = data.rates || {};

      // Get gold price
      const goldPrice = await getGoldPrice();

      // Transform to our format
      // Note: ExchangeRate-API returns rates as "1 USD = X Currency"
      // So EUR/USD = rates.EUR, GBP/USD = rates.GBP, AUD/USD = rates.AUD
      // For USD/JPY and USD/CHF, the API already gives us the correct rate (USD per JPY/CHF)
      const forexRates = {
        "EUR/USD": rates.EUR || 1.0834,
        "GBP/USD": rates.GBP || 1.2654,
        "USD/JPY": rates.JPY || 149.82,
        "AUD/USD": rates.AUD || 0.6543,
        "USD/CHF": rates.CHF || 0.8832,
        "XAU/USD": goldPrice, // Gold price in USD per ounce
      };

      // Update cache
      forexCache = {
        data: forexRates,
        timestamp: Date.now(),
      };

      res.json(forexRates);
    } catch (error) {
      console.error("Forex rates fetch error:", error);
      
      // Return cached data if available, even if expired
      if (forexCache) {
        return res.json(forexCache.data);
      }

      // Fallback to static data
      res.json({
        "EUR/USD": 1.0834,
        "GBP/USD": 1.2654,
        "USD/JPY": 149.82,
        "AUD/USD": 0.6543,
        "USD/CHF": 0.8832,
        "XAU/USD": 2356.32,
      });
    }
  });

  // Trading Accounts
  // Request MT5 account creation for current user (if they don't have credentials)
  // NOTE: Due to MT5 manager permissions, this creates a support ticket for manual processing
  app.post("/api/user/mt5-accounts/create", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if user already has MT5 credentials
      if (user.mt5LiveLogin && user.mt5DemoLogin) {
        return res.json({
          live: { login: user.mt5LiveLogin, password: user.mt5LivePassword || "", server: "BinofoxLimited-Live" },
          demo: { login: user.mt5DemoLogin, password: user.mt5DemoPassword || "", server: "BinofoxLimited-Demo" },
          message: "MT5 accounts already exist",
        });
      }
      
      // Check if there's already a pending MT5 request for this user
      const existingTickets = await storage.getSupportTickets(userId);
      const pendingMT5Request = existingTickets.find(
        (t: any) => t.category === "MT5 Account Request" && t.status === "Open"
      );
      
      if (pendingMT5Request) {
        return res.json({
          message: "MT5 account request already submitted. Our team will process it within 24 hours.",
          requestId: pendingMT5Request.id,
          status: "pending",
        });
      }
      
      // Create a support ticket for MT5 account request
      console.log(`[MT5 Request] Creating ticket for user ${user.email}`);
      
      const ticketData = {
        userId: userId,
        subject: "MT5 Account Creation Request",
        message: `User ${user.fullName || user.username} (${user.email}) has requested MT5 trading account creation.\n\n` +
          `User Details:\n` +
          `- Name: ${user.fullName || user.username}\n` +
          `- Email: ${user.email}\n` +
          `- Country: ${user.country || "Not specified"}\n` +
          `- Phone: ${user.phone || "Not specified"}\n\n` +
          `Requested Accounts:\n` +
          `- Live Account: ${user.mt5LiveLogin ? "Already exists" : "Requested"}\n` +
          `- Demo Account: ${user.mt5DemoLogin ? "Already exists" : "Requested"}\n\n` +
          `Suggested Group Names:\n` +
          `- Live: real\\Binofox-Standard\n` +
          `- Demo: demo\\Binofox_Demo\n\n` +
          `Please create the MT5 accounts in MT5 Manager Terminal and update the user credentials in the admin panel.`,
        status: "Open",
        priority: "High",
        category: "MT5 Account Request",
      };
      
      const ticket = await storage.createSupportTicket(ticketData);
      
      // Log activity
      try {
        await storage.createActivityLog({
          userId: userId,
          action: "MT5_ACCOUNT_REQUEST",
          entity: "support_ticket",
          entityId: ticket.id,
          details: `MT5 account request submitted (Ticket: ${ticket.id})`,
          ipAddress: getClientIp(req) || "unknown",
        });
      } catch (logError) {
        console.error("[MT5 Account Request] Failed to log activity:", logError);
        // Don't fail the request if logging fails
      }
      
      console.log(`[MT5 Request] Ticket created for ${user.email}: ${ticket.id}`);
      
      res.json({
        success: true,
        message: "MT5 account request submitted successfully! Our team will create your account and send the login details to your email within 24 hours.",
        requestId: ticket.id,
        status: "pending",
      });
      
    } catch (error: any) {
      console.error("[MT5 Account Request] Error:", error);
      res.status(500).json({ 
        message: "Failed to submit MT5 account request. Please contact support@binofox.com",
        error: error.message 
      });
    }
  });

  // Legacy endpoint - tries automatic creation (may fail due to permissions)
  app.post("/api/user/mt5-accounts/create-auto", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (process.env.MT5_ENABLED !== "true") {
        return res.status(400).json({ message: "MT5 integration is disabled" });
      }
      
      const results: any = {
        live: null,
        demo: null,
        errors: [],
      };
      
      // Create Live MT5 account if it doesn't exist
      if (!user.mt5LiveLogin) {
        try {
          console.log(`[MT5] Creating Live MT5 account for user ${user.email}`);
          const liveMt5Result = await mt5Service.createAccount({
            name: user.fullName || user.username,
            email: user.email,
            group: process.env.MT5_GROUP_LIVE || "real\\Binofox-Standard",
            leverage: 100,
            country: user.country || "",
            currency: "USD",
          });
          
          await storage.updateUser(userId, {
            mt5LiveLogin: liveMt5Result.login,
            mt5LivePassword: liveMt5Result.password,
          });
          
          results.live = {
            login: liveMt5Result.login,
            password: liveMt5Result.password,
            server: "BinofoxLimited-Live",
          };
          
          console.log(`[MT5] Live account created for ${user.email}:`, {
            login: liveMt5Result.login,
          });
        } catch (mt5Error: any) {
          console.error(`[MT5] Failed to create Live account for ${user.email}:`, mt5Error);
          const mt5Group = process.env.MT5_GROUP_LIVE || "real";
          const errorMsg = mt5Error.message?.includes("Error code: 3") 
            ? `MT5 server configuration issue: Manager account may not have permission to create accounts, or the group '${mt5Group}' doesn't exist on the MT5 server. Please contact MT5 server administrator to verify the group name or update MT5_GROUP_LIVE environment variable.`
            : mt5Error.message;
          results.errors.push({ type: "live", error: errorMsg });
        }
      } else {
        results.live = {
          login: user.mt5LiveLogin,
          password: user.mt5LivePassword || "",
          server: "BinofoxLimited-Live",
        };
      }
      
      // Create Demo MT5 account if it doesn't exist
      if (!user.mt5DemoLogin) {
        try {
          console.log(`[MT5] Creating Demo MT5 account for user ${user.email}`);
          const demoMt5Result = await mt5ServiceDemo.createAccount({
            name: user.fullName || user.username,
            email: user.email,
            group: process.env.MT5_GROUP_DEMO || "demo",
            leverage: 100,
            country: user.country || "",
            currency: "USD",
          });
          
          await storage.updateUser(userId, {
            mt5DemoLogin: demoMt5Result.login,
            mt5DemoPassword: demoMt5Result.password,
          });
          
          results.demo = {
            login: demoMt5Result.login,
            password: demoMt5Result.password,
            server: "BinofoxLimited-Demo",
          };
          
          console.log(`[MT5] Demo account created for ${user.email}:`, {
            login: demoMt5Result.login,
          });
        } catch (mt5Error: any) {
          console.error(`[MT5] Failed to create Demo account for ${user.email}:`, mt5Error);
          const mt5Group = process.env.MT5_GROUP_DEMO || "demo";
          const errorMsg = mt5Error.message?.includes("Error code: 3") 
            ? `MT5 server configuration issue: Manager account may not have permission to create accounts, or the group '${mt5Group}' doesn't exist on the MT5 server. Please contact MT5 server administrator to verify the group name or update MT5_GROUP_DEMO environment variable.`
            : mt5Error.message;
          results.errors.push({ type: "demo", error: errorMsg });
        }
      } else {
        results.demo = {
          login: user.mt5DemoLogin,
          password: user.mt5DemoPassword || "",
          server: "BinofoxLimited-Demo",
        };
      }
      
      if (results.errors.length > 0 && !results.live && !results.demo) {
        // Check if all errors are permission/configuration issues
        const allConfigErrors = results.errors.every((e: any) => e.error?.includes("Error code: 3") || e.error?.includes("configuration issue"));
        const errorMessage = allConfigErrors 
          ? `MT5 server configuration issue: The manager account (10010) may not have permission to create accounts, or the trading groups don't exist on the MT5 server. Please contact your MT5 server administrator to: 1) Enable 'Create accounts' permission for manager account 10010, 2) Verify that groups '${process.env.MT5_GROUP_LIVE || "real"}' (live) and '${process.env.MT5_GROUP_DEMO || "demo"}' (demo) exist on the MT5 server, or update MT5_GROUP_LIVE and MT5_GROUP_DEMO environment variables.`
          : "Failed to create MT5 accounts";
        
        return res.status(500).json({ 
          message: errorMessage,
          errors: results.errors,
          help: "Contact support@binofox.com for assistance with MT5 account creation.",
          configIssue: true, // Flag to indicate this is a configuration issue
          requiresServerConfig: true
        });
      }
      
      res.json(results);
    } catch (error: any) {
      console.error("[MT5 Create Accounts] Error:", error);
      
      // Check for specific MT5 connection errors
      const isConnectionError = error.message?.includes("Invalid account") || 
        error.message?.includes("Error code: 1001") ||
        error.message?.includes("No connection") ||
        error.message?.includes("Error code: 10");
        
      res.status(500).json({ 
        message: isConnectionError 
          ? "MT5 server is being configured. Please contact support@binofox.com for assistance."
          : "Failed to create MT5 accounts. Please try again or contact support.",
        error: error.message,
        configIssue: isConnectionError,
        help: "Contact support@binofox.com for MT5 account assistance."
      });
    }
  });

  // Get user MT5 credentials (one Live and one Demo account)
  app.get("/api/user/mt5-credentials", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      console.log("[MT5 Credentials API] Fetching for user:", user.email, {
        userId: userId,
        hasLiveLogin: !!user.mt5LiveLogin,
        hasDemoLogin: !!user.mt5DemoLogin,
        liveLogin: user.mt5LiveLogin || null,
        demoLogin: user.mt5DemoLogin || null,
        livePassword: user.mt5LivePassword ? "***" : null,
        demoPassword: user.mt5DemoPassword ? "***" : null,
      });
      
      const credentials: any = {};
      if (user.mt5LiveLogin) {
        credentials.live = {
          login: user.mt5LiveLogin,
          password: user.mt5LivePassword || "",
          server: "BinofoxLimited-Live",
        };
      }
      if (user.mt5DemoLogin) {
        credentials.demo = {
          login: user.mt5DemoLogin,
          password: user.mt5DemoPassword || "",
          server: "BinofoxLimited-Demo",
        };
      }
      
      console.log("[MT5 Credentials API] Returning credentials:", {
        hasLive: !!credentials.live,
        hasDemo: !!credentials.demo,
        liveLogin: credentials.live?.login || null,
        demoLogin: credentials.demo?.login || null,
      });
      
      res.json(credentials);
    } catch (error) {
      console.error("[MT5 Credentials] Error:", error);
      res.status(500).json({ message: "Failed to fetch MT5 credentials" });
    }
  });

  app.get("/api/trading-accounts", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const accounts = await storage.getTradingAccounts(userId);
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trading accounts" });
    }
  });

  app.post("/api/trading-accounts", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const type = req.body.type || "Demo";
      const group = req.body.group || "Standard";
      const leverage = req.body.leverage || "1:100";

      // Generate website account credentials (for internal use)
      const accountId = (Math.floor(Math.random() * 90000000) + 10000000).toString();
      const password = Math.random().toString(36).substring(2, 10).toUpperCase();

      // Determine if this is a Live or Demo account type for MT5
      // All account types (Live, IB, Champion, etc.) use Live MT5 account
      // Demo account types use Demo MT5 account
      const isLiveAccount = type !== "Demo";
      const mt5AccountType = isLiveAccount ? "Live" : "Demo";

      // Check if user already has MT5 account for this type (Live or Demo)
      const existingMt5Login = isLiveAccount ? user.mt5LiveLogin : user.mt5DemoLogin;
      const existingMt5Password = isLiveAccount ? user.mt5LivePassword : user.mt5DemoPassword;

      let mt5Login = existingMt5Login || "";
      let mt5Password = existingMt5Password || "";
      let mt5AccountData = null;

      // If user doesn't have MT5 account for this type, try to create one as fallback
      // Note: MT5 accounts should already be created after document verification
      // This is a fallback in case MT5 wasn't enabled during verification or creation failed
      // Trading account will be created even if MT5 fails (with system credentials)
      if (!existingMt5Login && process.env.MT5_ENABLED === "true") {
        console.log(`[MT5] User ${user.email} doesn't have ${mt5AccountType} MT5 account - creating as fallback during trading account creation`);
        try {
          // Use appropriate MT5 service based on account type
          const mt5ServiceToUse = isLiveAccount ? mt5Service : mt5ServiceDemo;
          
          console.log(`[MT5] Creating ${mt5AccountType} MT5 account for user ${user.email}:`, {
            name: user.fullName || user.username,
            email: user.email,
            group: `Binofox-${group}`,
            leverage: parseInt(leverage.split(":")[1]),
          });
          
          const mt5Result = await mt5ServiceToUse.createAccount({
            name: user.fullName || user.username,
            email: user.email,
            group: `Binofox-${group}`,
            leverage: parseInt(leverage.split(":")[1]),
            country: user.country || "",
            currency: "USD",
          });
          
          // MT5 has assigned the login and password
          mt5Login = mt5Result.login;
          mt5Password = mt5Result.password;
          mt5AccountData = mt5Result.account;
          
          // Store MT5 credentials in user table
          const userUpdate: any = {};
          if (isLiveAccount) {
            userUpdate.mt5LiveLogin = mt5Login;
            userUpdate.mt5LivePassword = mt5Password;
          } else {
            userUpdate.mt5DemoLogin = mt5Login;
            userUpdate.mt5DemoPassword = mt5Password;
          }
          await storage.updateUser(userId, userUpdate);
          
          console.log("[MT5] Account created and stored successfully:", {
            login: mt5Login,
            password: mt5Password.substring(0, 2) + "***",
            type: mt5AccountType,
          });
        } catch (mt5Error: any) {
          console.error("[MT5] Account creation failed (will continue with system credentials):", {
            error: mt5Error.message,
            userEmail: user.email,
            type: mt5AccountType,
            fullError: mt5Error,
          });
          // MT5 failed, but we'll still create the trading account with system credentials
          // MT5 credentials will remain empty and can be created later
          console.log("[Account] Continuing with system-generated credentials only");
          // Log detailed error for debugging
          if (mt5Error.message?.includes("Error code: 3")) {
            console.error("[MT5] Connection error (code 3) - Check MT5 server connectivity and credentials");
            console.error("[MT5] Server IP:", isLiveAccount ? process.env.MT5_SERVER_IP : process.env.MT5_SERVER_IP_DEMO);
            console.error("[MT5] Server Port:", isLiveAccount ? process.env.MT5_SERVER_PORT : process.env.MT5_SERVER_PORT_DEMO);
            console.error("[MT5] Manager Login:", isLiveAccount ? process.env.MT5_SERVER_WEB_LOGIN : process.env.MT5_SERVER_WEB_LOGIN_DEMO);
          }
        }
      } else if (existingMt5Login) {
        console.log(`[MT5] Reusing existing ${mt5AccountType} MT5 account for user ${user.email}:`, {
          login: mt5Login,
        });
      }
      
      // Create trading account with website-generated credentials
      const validatedData = insertTradingAccountSchema.parse({
        userId,
        type,
        group,
        leverage,
        accountId: accountId, // Website-generated account ID
        password: password, // Website-generated password
        balance: mt5AccountData ? mt5AccountData.balance.toString() : "0",
        equity: mt5AccountData ? mt5AccountData.equity.toString() : "0",
        margin: mt5AccountData ? mt5AccountData.margin.toString() : "0",
        freeMargin: mt5AccountData ? mt5AccountData.freeMargin.toString() : "0",
        marginLevel: mt5AccountData ? mt5AccountData.marginLevel.toString() : "0",
        currency: "USD",
        server: isLiveAccount ? "BinofoxLimited-Live" : "BinofoxLimited-Demo",
      });
      
      const account = await storage.createTradingAccount(validatedData);
      
      // Send trading account created email
      if (user?.email) {
        sendTradingAccountCreatedEmail(
          user.email,
          user.fullName || user.username,
          accountId.toString(),
          type,
          leverage
        ).catch(err => console.error("Failed to send trading account email:", err));
      }
      
      res.status(201).json(account);
    } catch (error) {
      console.error("Trading account creation error:", error);
      res.status(400).json({ message: "Failed to create trading account" });
    }
  });

  app.patch("/api/trading-accounts/:id", async (req, res) => {
    try {
      const updated = await storage.updateTradingAccount(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ message: "Account not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update account" });
    }
  });

  // Admin - Get all crypto wallets
  app.get("/api/admin/crypto-wallets", async (req, res) => {
    try {
      if (!(await requireAdmin(req, res))) return;
      if (!(await blockNormalAdmin(req, res))) return;
      const wallets = await storage.getAllCryptoWallets();
      res.json(wallets);
    } catch (error: any) {
      console.error("[Admin Crypto Wallets] Error:", error);
      console.error("[Admin Crypto Wallets] Error details:", {
        message: error.message,
        stack: error.stack,
        code: error.code,
        name: error.name,
      });
      res.status(500).json({ 
        message: "Failed to get crypto wallets",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }
  });

  // Admin - Create or update crypto wallet
  app.post("/api/admin/crypto-wallets", async (req, res) => {
    try {
      if (!(await requireSuperAdmin(req, res))) return;
      const { cryptoType, network, walletAddress, qrCodeUrl, enabled } = req.body;
      
      if (!cryptoType || !network || !walletAddress) {
        return res.status(400).json({ message: "cryptoType, network, and walletAddress are required" });
      }

      // Check if wallet already exists
      const existing = await storage.getCryptoWallet(cryptoType);
      
      if (existing) {
        // Update existing
        const updated = await storage.updateCryptoWallet(existing.id, {
          network,
          walletAddress,
          qrCodeUrl: qrCodeUrl !== undefined ? qrCodeUrl : existing.qrCodeUrl,
          enabled: enabled !== undefined ? enabled : existing.enabled,
        });
        res.json(updated);
      } else {
        // Create new
        const newWallet = await storage.createCryptoWallet({
          cryptoType,
          network,
          walletAddress,
          qrCodeUrl: qrCodeUrl || null,
          enabled: enabled !== undefined ? enabled : true,
        });
        res.json(newWallet);
      }
    } catch (error: any) {
      console.error("[Admin Crypto Wallets] Error:", error);
      res.status(500).json({ message: "Failed to save crypto wallet" });
    }
  });

  // Crypto Wallets - Get wallet address for a crypto type
  app.get("/api/crypto/wallet/:cryptoType", async (req, res) => {
    try {
      const { cryptoType } = req.params;
      const wallet = await storage.getCryptoWallet(cryptoType);
      
      if (!wallet) {
        return res.status(404).json({ message: `Wallet address not configured for ${cryptoType}` });
      }
      
      res.json({
        cryptoType: wallet.cryptoType,
        network: wallet.network,
        walletAddress: wallet.walletAddress,
        qrCodeUrl: wallet.qrCodeUrl || null,
      });
    } catch (error: any) {
      console.error("[Crypto Wallet] Error:", error);
      res.status(500).json({ message: "Failed to get wallet address" });
    }
  });

  // ===================== TOPUP CARDS ROUTES =====================
  
  // Admin - Get all topup cards (Super Admin only)
  app.get("/api/admin/topup-cards", async (req, res) => {
    try {
      if (!(await requireSuperAdmin(req, res))) return;
      // Super admin only, no need for blockNormalAdmin
      const cards = await storage.getAllTopupCards();
      // Don't return CVV in the response (masked)
      const safeCards = cards.map(card => ({
        ...card,
        cvv: "***", // Mask CVV
        pin: "***"  // Mask PIN
      }));
      res.json(safeCards);
    } catch (error: any) {
      console.error("[Admin Topup Cards] Error:", error);
      res.status(500).json({ message: "Failed to get topup cards" });
    }
  });

  // Admin - Get topup card details with PIN (Super Admin only)
  app.get("/api/admin/topup-cards/:id", async (req, res) => {
    try {
      if (!(await requireSuperAdmin(req, res))) return;
      const { id } = req.params;
      const card = await storage.getTopupCard(id);
      if (!card) {
        return res.status(404).json({ message: "Card not found" });
      }
      // Return card with PIN (CVV) for admin viewing
      const cardWithPin = {
        ...card,
        pin: card.cvv, // PIN is stored as CVV
      };
      res.json(cardWithPin);
    } catch (error: any) {
      console.error("[Admin Topup Cards] Error:", error);
      res.status(500).json({ message: "Failed to get topup card" });
    }
  });

  // Admin - Create topup card (Super Admin only)
  app.post("/api/admin/topup-cards", async (req, res) => {
    try {
      if (!(await requireSuperAdmin(req, res))) return;
      
      const adminId = getCurrentAdminId(req);
      if (!adminId) {
        return res.status(401).json({ message: "Admin authentication required" });
      }

      const { cardNumber, cardHolderName, expiryMonth, expiryYear, cvv, initialBalance, currency, autoGenerate } = req.body;
      
      // Force USD currency only
      const finalCurrency = "USD";
      
      let finalCardNumber: string;
      let finalCvv: string;
      let finalExpiryMonth: string;
      let finalExpiryYear: string;

      // Auto-generate card details if requested
      if (autoGenerate) {
        // Generate random 16-digit card number
        let generatedCardNumber: string = "";
        let exists = true;
        let attempts = 0;
        while (exists && attempts < 10) {
          generatedCardNumber = Array.from({ length: 16 }, () => Math.floor(Math.random() * 10)).join('');
          const formatted = generatedCardNumber.match(/.{1,4}/g)?.join('-') || generatedCardNumber;
          const existing = await storage.getTopupCardByCardNumber(formatted);
          exists = !!existing;
          attempts++;
        }
        if (exists || !generatedCardNumber) {
          return res.status(500).json({ message: "Failed to generate unique card number" });
        }
        finalCardNumber = generatedCardNumber.match(/.{1,4}/g)?.join('-') || generatedCardNumber;
        
        // Generate 4-digit PIN (stored as CVV) - ensure it's always 4 digits with leading zeros if needed
        const generatedPin = Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)).join('');
        finalCvv = String(generatedPin).padStart(4, "0");
        
        // Set expiry to 5 years from now
        const now = new Date();
        finalExpiryMonth = String(now.getMonth() + 1).padStart(2, '0');
        finalExpiryYear = String(now.getFullYear() + 5);
      } else {
        // Use provided details
        if (!cardNumber || !cardHolderName || !expiryMonth || !expiryYear || !cvv) {
          return res.status(400).json({ message: "All card details are required" });
        }

        // Validate card number format (remove dashes for storage)
        const cleanCardNumber = cardNumber.replace(/-/g, '');
        if (cleanCardNumber.length !== 16 || !/^\d+$/.test(cleanCardNumber)) {
          return res.status(400).json({ message: "Invalid card number format" });
        }

        // Format card number with dashes for display
        finalCardNumber = cleanCardNumber.match(/.{1,4}/g)?.join('-') || cleanCardNumber;
        // Ensure CVV/PIN is exactly 4 digits (pad with leading zeros if needed)
        finalCvv = String(cvv || "").trim().padStart(4, "0");
        finalExpiryMonth = String(expiryMonth).padStart(2, '0');
        finalExpiryYear = String(expiryYear);
      }

      // Check if card already exists
      const existing = await storage.getTopupCardByCardNumber(finalCardNumber);
      if (existing) {
        return res.status(400).json({ message: "Card number already exists" });
      }

      const newCard = await storage.createTopupCard({
        cardNumber: finalCardNumber,
        cardHolderName: cardHolderName || "Binofox Limited",
        expiryMonth: finalExpiryMonth,
        expiryYear: finalExpiryYear,
        cvv: finalCvv,
        balance: initialBalance || "0",
        currency: finalCurrency, // Always USD
        createdByAdminId: adminId,
        enabled: true,
      });

      // Log activity
      try {
        await logActivity(
          adminId,
          "CREATE_TOPUP_CARD",
          "topup_card",
          newCard.id,
          `Created topup card: ${finalCardNumber.substring(0, 4)}****${finalCardNumber.substring(finalCardNumber.length - 4)}`
        );
      } catch (logError) {
        console.error("[Admin Topup Cards] Failed to log activity:", logError);
      }

      // Return card with PIN (CVV) only on creation for admin to see
      // In subsequent requests, CVV will be masked
      const responseCard = { 
        ...newCard, 
        pin: finalCvv, // Return PIN as 'pin' field for clarity
        cvv: finalCvv  // Also return CVV for initial display
      };
      res.json(responseCard);
    } catch (error: any) {
      console.error("[Admin Topup Cards] Error:", error);
      res.status(500).json({ message: "Failed to create topup card", error: error.message });
    }
  });

  // Admin - Load funds to topup card (Super Admin only)
  app.post("/api/admin/topup-cards/:id/load-funds", async (req, res) => {
    try {
      if (!(await requireSuperAdmin(req, res))) return;
      
      const adminId = getCurrentAdminId(req);
      const { id } = req.params;
      const { amount } = req.body;

      if (!amount || parseFloat(amount) <= 0) {
        return res.status(400).json({ message: "Valid amount is required" });
      }

      const card = await storage.getTopupCard(id);
      if (!card) {
        return res.status(404).json({ message: "Card not found" });
      }

      const updatedCard = await storage.loadFundsToCard(id, amount);
      if (!updatedCard) {
        return res.status(500).json({ message: "Failed to load funds" });
      }

      // Log activity
      try {
        await logActivity(
          adminId!,
          "LOAD_TOPUP_CARD",
          "topup_card",
          id,
          `Loaded $${amount} to card ending in ${card.cardNumber.substring(card.cardNumber.length - 4)}`
        );
      } catch (logError) {
        console.error("[Admin Topup Cards] Failed to log activity:", logError);
      }

      const safeCard = { ...updatedCard, cvv: "***" };
      res.json(safeCard);
    } catch (error: any) {
      console.error("[Admin Topup Cards] Error:", error);
      res.status(500).json({ message: "Failed to load funds" });
    }
  });

  // Admin - Assign topup card to user (Super Admin only)
  app.post("/api/admin/topup-cards/:id/assign", async (req, res) => {
    try {
      if (!(await requireSuperAdmin(req, res))) return;
      
      const adminId = getCurrentAdminId(req);
      const { id } = req.params;
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const card = await storage.getTopupCard(id);
      if (!card) {
        return res.status(404).json({ message: "Card not found" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const updatedCard = await storage.assignCardToUser(id, userId);
      if (!updatedCard) {
        return res.status(500).json({ message: "Failed to assign card" });
      }

      // Log activity
      try {
        await logActivity(
          adminId!,
          "ASSIGN_TOPUP_CARD",
          "topup_card",
          id,
          `Assigned card ending in ${card.cardNumber.substring(card.cardNumber.length - 4)} to user: ${user.email}`
        );
      } catch (logError) {
        console.error("[Admin Topup Cards] Failed to log activity:", logError);
      }

      const safeCard = { ...updatedCard, cvv: "***" };
      res.json(safeCard);
    } catch (error: any) {
      console.error("[Admin Topup Cards] Error:", error);
      res.status(500).json({ message: "Failed to assign card" });
    }
  });

  // Admin - Update topup card (Super Admin only)
  app.patch("/api/admin/topup-cards/:id", async (req, res) => {
    try {
      if (!(await requireSuperAdmin(req, res))) return;
      
      const { id } = req.params;
      const updates = req.body;

      // Don't allow updating card number, CVV should be handled separately if needed
      delete updates.cardNumber;
      if (updates.cvv) {
        // CVV will be encrypted in the update method
      }

      const updatedCard = await storage.updateTopupCard(id, updates);
      if (!updatedCard) {
        return res.status(404).json({ message: "Card not found" });
      }

      const safeCard = { ...updatedCard, cvv: "***" };
      res.json(safeCard);
    } catch (error: any) {
      console.error("[Admin Topup Cards] Error:", error);
      res.status(500).json({ message: "Failed to update card" });
    }
  });

  // Admin - Get topup card usage/transactions (Super Admin only)
  app.get("/api/admin/topup-cards/:id/usage", async (req, res) => {
    try {
      if (!(await requireSuperAdmin(req, res))) return;
      
      const { id } = req.params;
      const card = await storage.getTopupCard(id);
      if (!card) {
        return res.status(404).json({ message: "Card not found" });
      }

      // Get all deposits that used topup cards
      const allDeposits = await storage.getAllDeposits();
      const topupCardDeposits = allDeposits.filter((d: any) => d.merchant === "Topup Card");
      
      // Get activity logs for topup card deposits
      const allActivityLogs = await storage.getAllActivityLogs();
      const activityLogs = allActivityLogs
        .filter((log: any) => log.entityType === "deposit")
        .slice(0, 10000);

      // Filter logs that mention this card number
      const cardUsageLogs = activityLogs.filter((log: any) => 
        log.description && 
        log.description.includes("topup card") &&
        (log.description.includes(card.cardNumber.substring(0, 4)) || 
         log.description.includes(card.cardNumber.replace(/-/g, '').substring(0, 4)))
      );

      // Get deposit details for these logs
      const usageData = cardUsageLogs.map((log: any) => {
        const deposit = topupCardDeposits.find((d: any) => d.id === log.entityId);
        const user = deposit ? allDeposits.find((d: any) => d.id === log.entityId) : null;
        return {
          depositId: log.entityId,
          userId: log.userId,
          amount: deposit?.amount || "0",
          currency: deposit?.currency || "USD",
          status: deposit?.status || "Unknown",
          depositDate: deposit?.depositDate || log.createdAt,
          createdAt: log.createdAt,
          description: log.description,
        };
      });

      res.json({
        cardId: card.id,
        cardNumber: card.cardNumber,
        usageCount: usageData.length,
        totalAmount: usageData.reduce((sum: number, u: any) => sum + parseFloat(u.amount || "0"), 0).toFixed(2),
        transactions: usageData,
      });
    } catch (error: any) {
      console.error("[Admin Topup Cards Usage] Error:", error);
      res.status(500).json({ message: "Failed to get card usage" });
    }
  });

  // Admin - Get all topup card usage summary
  app.get("/api/admin/topup-cards/usage/summary", async (req, res) => {
    try {
      if (!(await requireSuperAdmin(req, res))) return;

      const allDeposits = await storage.getAllDeposits();
      const topupCardDeposits = allDeposits.filter((d: any) => d.merchant === "Topup Card");
      
      // Get activity logs for topup card deposits
      const allActivityLogs = await storage.getAllActivityLogs();
      const activityLogs = allActivityLogs
        .filter((log: any) => log.entityType === "deposit")
        .slice(0, 10000);

      const topupCardLogs = activityLogs.filter((log: any) => 
        log.description && log.description.includes("topup card")
      );

      // Group by card number (extract from description)
      const usageByCard: Record<string, any> = {};
      
      topupCardLogs.forEach((log: any) => {
        const match = log.description?.match(/(\d{4})\*\*\*\*(\d{4})/);
        if (match) {
          const cardPrefix = match[1];
          const cardSuffix = match[2];
          const cardKey = `${cardPrefix}****${cardSuffix}`;
          
          if (!usageByCard[cardKey]) {
            usageByCard[cardKey] = {
              cardNumber: cardKey,
              usageCount: 0,
              totalAmount: 0,
              transactions: [],
            };
          }
          
          const deposit = topupCardDeposits.find((d: any) => d.id === log.entityId);
          if (deposit) {
            usageByCard[cardKey].usageCount++;
            usageByCard[cardKey].totalAmount += parseFloat(deposit.amount || "0");
            usageByCard[cardKey].transactions.push({
              depositId: deposit.id,
              userId: log.userId,
              amount: deposit.amount,
              currency: deposit.currency,
              status: deposit.status,
              depositDate: deposit.depositDate,
              createdAt: log.createdAt,
            });
          }
        }
      });

      res.json({
        summary: Object.values(usageByCard),
        totalTransactions: topupCardDeposits.length,
        totalAmount: topupCardDeposits.reduce((sum: number, d: any) => sum + parseFloat(d.amount || "0"), 0).toFixed(2),
      });
    } catch (error: any) {
      console.error("[Admin Topup Cards Usage Summary] Error:", error);
      res.status(500).json({ message: "Failed to get usage summary" });
    }
  });

  // User - Get my topup cards
  app.get("/api/topup-cards/my-cards", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const cards = await storage.getTopupCardsByUser(userId);
      // Don't return CVV in the response
      const safeCards = cards.map(card => ({
        ...card,
        cvv: "***" // Mask CVV
      }));
      res.json(safeCards);
    } catch (error: any) {
      console.error("[User Topup Cards] Error:", error);
      res.status(500).json({ message: "Failed to get topup cards" });
    }
  });

  // User - Use topup card for deposit
  app.post("/api/topup-cards/:cardId/deposit", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { cardId } = req.params;
      const { amount, tradingAccountId } = req.body;

      if (!amount || !tradingAccountId) {
        return res.status(400).json({ message: "Amount and trading account ID are required" });
      }

      const card = await storage.getTopupCard(cardId);
      if (!card || !card.enabled) {
        return res.status(404).json({ message: "Card not found or disabled" });
      }

      // Verify card is assigned to this user
      if (card.assignedToUserId !== userId) {
        return res.status(403).json({ message: "This card is not assigned to you" });
      }

      const depositAmount = parseFloat(amount);
      if (isNaN(depositAmount) || depositAmount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      // Verify trading account belongs to user
      const accounts = await storage.getTradingAccounts(userId);
      const account = accounts.find(acc => acc.id === tradingAccountId);
      if (!account) {
        return res.status(400).json({ message: "Invalid trading account" });
      }

      // Check card balance
      const cardBalance = parseFloat(card.balance || "0");
      if (cardBalance < depositAmount) {
        return res.status(400).json({ message: "Insufficient balance on card" });
      }

      // Use card for deposit (deduct from card balance)
      const success = await storage.useCardForDeposit(cardId, amount);
      if (!success) {
        return res.status(400).json({ message: "Failed to process payment from card" });
      }

      // Create deposit record
      const deposit = await storage.createDeposit({
        userId,
        accountId: tradingAccountId,
        merchant: "Topup Card",
        amount: amount,
        currency: card.currency || "USD",
        status: "Completed", // Instant completion for topup cards
        depositDate: new Date(),
      });
      
      // Update completedAt after creation since it's not in InsertDeposit schema
      if (deposit) {
        await storage.updateDeposit(deposit.id, { completedAt: new Date() });
      }

      // Add funds to trading account
      const currentBalance = parseFloat(account.balance || "0");
      const newBalance = (currentBalance + depositAmount).toFixed(2);
      await storage.updateTradingAccount(tradingAccountId, {
        balance: newBalance,
        equity: newBalance,
      });

      // Send confirmation email
      try {
        const user = await storage.getUser(userId);
        if (user) {
          await sendDepositConfirmationEmail(
            user.email,
            user.fullName || user.username,
            amount,
            "Topup Card",
            tradingAccountId,
            deposit.id
          );
        }
      } catch (emailError) {
        console.error("[Topup Card Deposit] Failed to send email:", emailError);
      }

      res.json({
        success: true,
        deposit,
        message: "Deposit completed successfully",
      });
    } catch (error: any) {
      console.error("[User Topup Card Deposit] Error:", error);
      res.status(500).json({ message: "Failed to process deposit", error: error.message });
    }
  });

  // Topup Card Deposit by Card Number and PIN (for users entering card details manually)
  app.post("/api/topup-cards/verify-and-deposit", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { cardNumber, pin, amount, tradingAccountId } = req.body;

      if (!cardNumber || !pin || !tradingAccountId) {
        return res.status(400).json({ message: "Card number, PIN, and trading account ID are required" });
      }

      // Clean and format card number (remove dashes/spaces)
      const cleanCardNumber = cardNumber.replace(/[-\s]/g, '');
      if (cleanCardNumber.length !== 16 || !/^\d+$/.test(cleanCardNumber)) {
        return res.status(400).json({ message: "Invalid card number format. Must be 16 digits." });
      }

      // Format card number with dashes for lookup
      const formattedCardNumber = cleanCardNumber.match(/.{1,4}/g)?.join('-') || cleanCardNumber;

      // Find card by card number
      const card = await storage.getTopupCardByCardNumber(formattedCardNumber);
      if (!card || !card.enabled) {
        return res.status(404).json({ message: "Card not found or disabled" });
      }

      // Verify PIN (stored as CVV, which is encrypted with bcrypt)
      // Normalize PIN: trim whitespace, ensure string type, pad with leading zeros if needed
      const normalizedPin = String(pin || "").trim().padStart(4, "0");
      
      // CVV is stored encrypted with bcrypt, so we need to compare using bcrypt.compare
      const isPinValid = await bcrypt.compare(normalizedPin, card.cvv);
      
      console.log("[Topup Card Verify] PIN verification:", {
        providedPin: pin,
        normalizedPin,
        storedCvvHash: card.cvv ? card.cvv.substring(0, 20) + "..." : "null",
        isPinValid,
        cardId: card.id,
        cardNumber: formattedCardNumber.substring(0, 4) + "****" + formattedCardNumber.substring(formattedCardNumber.length - 4)
      });
      
      if (!isPinValid) {
        return res.status(401).json({ message: "Invalid PIN" });
      }

      // Verify trading account belongs to user
      const accounts = await storage.getTradingAccounts(userId);
      const account = accounts.find(acc => acc.id === tradingAccountId);
      if (!account) {
        return res.status(400).json({ message: "Invalid trading account" });
      }

      // Check card balance
      const cardBalance = parseFloat(card.balance || "0");
      if (cardBalance <= 0) {
        return res.status(400).json({ message: `Card has no balance. Available: ${card.currency} ${cardBalance.toFixed(2)}` });
      }

      // If amount is provided, use it; otherwise use the full card balance
      let depositAmount: number;
      if (amount) {
        depositAmount = parseFloat(amount);
        if (isNaN(depositAmount) || depositAmount <= 0) {
          return res.status(400).json({ message: "Invalid amount" });
        }
        if (cardBalance < depositAmount) {
          return res.status(400).json({ message: `Insufficient balance on card. Available: ${card.currency} ${cardBalance.toFixed(2)}` });
        }
      } else {
        // Use full card balance if no amount specified
        depositAmount = cardBalance;
      }

      // Use card for deposit (deduct from card balance)
      // Use depositAmount (which is either the provided amount or full balance)
      const success = await storage.useCardForDeposit(card.id, depositAmount.toString());
      if (!success) {
        return res.status(400).json({ message: "Failed to process payment from card" });
      }

      // Create deposit record
      const deposit = await storage.createDeposit({
        userId,
        accountId: tradingAccountId,
        merchant: "Topup Card",
        amount: depositAmount.toString(), // Use calculated depositAmount
        currency: card.currency || "USD",
        status: "Completed", // Instant completion for topup cards
        depositDate: new Date(),
      });
      
      // Update completedAt after creation since it's not in InsertDeposit schema
      if (deposit) {
        await storage.updateDeposit(deposit.id, { completedAt: new Date() });
      }

      // Add funds to trading account
      const currentBalance = parseFloat(account.balance || "0");
      const newBalance = (currentBalance + depositAmount).toFixed(2);
      await storage.updateTradingAccount(tradingAccountId, {
        balance: newBalance,
        equity: newBalance,
      });

      // Log activity for monitoring
      try {
        await logActivity(
          null,
          "TOPUP_CARD_DEPOSIT",
          "deposit",
          deposit.id,
          `User ${userId} used topup card ${formattedCardNumber.substring(0, 4)}****${formattedCardNumber.substring(formattedCardNumber.length - 4)} for deposit of ${depositAmount} ${card.currency}`,
          userId,
          getClientIp(req)
        );
      } catch (logError) {
        console.error("[Topup Card Deposit] Failed to log activity:", logError);
      }

      // Send confirmation email
      try {
        const user = await storage.getUser(userId);
        if (user) {
          await sendDepositConfirmationEmail(
            user.email,
            user.fullName || user.username,
            depositAmount.toString(),
            "Topup Card",
            tradingAccountId,
            deposit.id
          );
        }
      } catch (emailError) {
        console.error("[Topup Card Deposit] Failed to send email:", emailError);
      }

      res.json({
        success: true,
        deposit,
        message: "Deposit completed successfully",
      });
    } catch (error: any) {
      console.error("[Topup Card Verify and Deposit] Error:", error);
      res.status(500).json({ message: "Failed to process deposit", error: error.message });
    }
  });

  // Crypto Deposit - Create a crypto deposit request
  // Bank Wire Deposit Creation
  app.post("/api/bank-wire/create-deposit", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { amount, tradingAccountId, bankDetails } = req.body;

      if (!amount || amount < 10) {
        return res.status(400).json({ message: "Minimum deposit is $10" });
      }

      if (!bankDetails || !bankDetails.bankName || !bankDetails.accountNumber || 
          !bankDetails.routingNumber || !bankDetails.swiftCode || !bankDetails.accountHolderName || 
          !bankDetails.bankAddress) {
        return res.status(400).json({ message: "All bank details are required" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const account = await storage.getTradingAccount(tradingAccountId);
      if (!account || account.userId !== userId) {
        return res.status(404).json({ message: "Trading account not found" });
      }

      // Create deposit with bank wire details stored in verificationFile as JSON
      const deposit = await storage.createDeposit({
        userId,
        accountId: tradingAccountId,
        merchant: "bank_wire",
        amount: amount.toString(),
        currency: "USD",
        status: "Pending",
        transactionId: `BW-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        verificationFile: JSON.stringify(bankDetails), // Store bank details as JSON
        depositDate: new Date(),
      });

      // Create notification
      await storage.createNotification({
        userId,
        title: "Bank Wire Deposit Submitted",
        message: `Your bank wire deposit of $${amount} has been submitted. Admin will process it within 1-3 business days.`,
        type: "info",
      });

      res.json({ 
        depositId: deposit.id,
        message: "Bank wire deposit request submitted successfully",
      });
    } catch (error: any) {
      console.error("Bank wire deposit creation error:", error);
      res.status(500).json({ message: "Failed to create bank wire deposit", error: error.message });
    }
  });

  app.post("/api/crypto/create-deposit", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { amount, tradingAccountId, cryptocurrency } = req.body;

      if (!amount || amount < 10) {
        return res.status(400).json({ message: "Minimum deposit is $10" });
      }

      if (!cryptocurrency || !["BTC", "USDT-BEP20", "USDT-TRC20"].includes(cryptocurrency)) {
        return res.status(400).json({ message: "Invalid cryptocurrency type" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get wallet address for the selected crypto
      const wallet = await storage.getCryptoWallet(cryptocurrency);
      if (!wallet) {
        return res.status(404).json({ message: `Wallet address not configured for ${cryptocurrency}` });
      }
      
      if (!wallet.enabled) {
        return res.status(400).json({ message: `Wallet for ${cryptocurrency} is currently disabled. Please contact support.` });
      }
      
      if (!wallet.walletAddress) {
        return res.status(400).json({ message: `Wallet address not set for ${cryptocurrency}. Please contact support.` });
      }

      // Create deposit record
      const cryptoLabel = cryptocurrency === "BTC" ? "Bitcoin (BTC)" : 
                         cryptocurrency === "USDT-BEP20" ? "USDT (BEP20)" : 
                         "USDT (TRC20)";

      const deposit = await storage.createDeposit({
        userId,
        accountId: tradingAccountId,
        merchant: cryptoLabel,
        amount: amount.toString(),
        status: "Pending",
        transactionId: "", // User will provide transaction hash after sending
      });

      res.json({
        depositId: deposit.id,
        walletAddress: wallet.walletAddress,
        network: wallet.network,
        cryptoType: wallet.cryptoType,
        qrCodeUrl: wallet.qrCodeUrl || null,
        amount: amount.toString(),
      });
    } catch (error: any) {
      console.error("[Crypto Deposit] Error:", error);
      res.status(500).json({ message: "Failed to create crypto deposit" });
    }
  });

  // MyFatoorah - Create payment invoice
  app.post("/api/myfatoorah/create-invoice", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { amount, tradingAccountId } = req.body;

      if (!amount || amount < 10) {
        return res.status(400).json({ message: "Minimum deposit is $10" });
      }

      const myfatoorah = getMyFatoorahService();
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Create deposit record first
      const deposit = await storage.createDeposit({
        userId,
        accountId: tradingAccountId,
        merchant: "MyFatoorah",
        amount: amount.toString(),
        status: "Pending",
        transactionId: "", // Will be updated after invoice creation
      });

      // Get frontend URL for callbacks
      let frontendUrl = process.env.FRONTEND_URL;
      if (!frontendUrl || frontendUrl === 'undefined' || frontendUrl.includes('undefined')) {
        frontendUrl = process.env.RAILWAY_PUBLIC_DOMAIN 
          ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` 
          : "https://binofox.com";
        console.log("[MyFatoorah] FRONTEND_URL was invalid, using fallback:", frontendUrl);
      }

      // Get backend URL for callbacks
      let backendUrl = process.env.API_URL || process.env.BACKEND_URL || frontendUrl;
      // Remove trailing /api if present to avoid double /api/api/
      backendUrl = backendUrl.replace(/\/api\/?$/, '');
      const callbackUrl = `${backendUrl}/api/myfatoorah/callback/${deposit.id}`;
      const errorUrl = `${frontendUrl}/dashboard/deposit?canceled=true&depositId=${deposit.id}`;

      console.log("[MyFatoorah] Creating invoice - Frontend URL:", frontendUrl);
      console.log("[MyFatoorah] Callback URL:", callbackUrl);

      // Create MyFatoorah invoice
      const invoiceResponse = await myfatoorah.createInvoice({
        NotificationOption: "Lnk",
        DisplayCurrencyIso: "USD",
        InvoiceValue: amount,
        CustomerName: user.fullName || user.username,
        CustomerEmail: user.email,
        CallBackUrl: callbackUrl,
        ErrorUrl: errorUrl,
        CustomerReference: deposit.id,
      });

      if (!invoiceResponse.Data || !invoiceResponse.Data.InvoiceURL) {
        throw new Error("Failed to create invoice: " + invoiceResponse.Message);
      }

      // Update deposit with invoice ID
      await storage.updateDeposit(deposit.id, {
        transactionId: invoiceResponse.Data.InvoiceId.toString(),
      });

      res.json({
        invoiceId: invoiceResponse.Data.InvoiceId,
        invoiceURL: invoiceResponse.Data.InvoiceURL,
        depositId: deposit.id,
      });
    } catch (error: any) {
      console.error("[MyFatoorah] Invoice creation error:", error);
      res.status(500).json({ message: error.message || "Failed to create invoice" });
    }
  });

  // MyFatoorah - Payment callback handler
  app.get("/api/myfatoorah/callback/:depositId", async (req, res) => {
    try {
      const { depositId } = req.params;
      const { paymentId } = req.query;

      console.log(`[MyFatoorah Callback] Processing payment for deposit ${depositId}, paymentId: ${paymentId}`);

      if (!paymentId) {
        return res.redirect(`${process.env.FRONTEND_URL || 'https://binofox.com'}/dashboard/deposit?error=missing_payment_id`);
      }

      const deposit = await storage.getDeposit(depositId);
      if (!deposit) {
        console.error(`[MyFatoorah Callback] Deposit not found: ${depositId}`);
        return res.redirect(`${process.env.FRONTEND_URL || 'https://binofox.com'}/dashboard/deposit?error=deposit_not_found`);
      }

      // Skip if already processed
      if (deposit.status === "Completed") {
        console.log(`[MyFatoorah Callback] Deposit ${deposit.id} already completed, redirecting to success`);
        return res.redirect(`${process.env.FRONTEND_URL || 'https://binofox.com'}/dashboard/deposit?success=true&depositId=${deposit.id}`);
      }

      // Check payment status with MyFatoorah
      const myfatoorah = getMyFatoorahService();
      const paymentStatus = await myfatoorah.getPaymentStatus(paymentId as string, "PaymentId");

      if (!paymentStatus.Data) {
        console.error(`[MyFatoorah Callback] Payment status check failed for paymentId: ${paymentId}`);
        return res.redirect(`${process.env.FRONTEND_URL || 'https://binofox.com'}/dashboard/deposit?error=payment_check_failed&depositId=${deposit.id}`);
      }

      const invoiceStatus = paymentStatus.Data.InvoiceStatus;
      const invoiceAmount = paymentStatus.Data.InvoiceValue || parseFloat(deposit.amount);

      console.log(`[MyFatoorah Callback] Payment status: ${invoiceStatus}, Amount: ${invoiceAmount}`);

      // Only process if payment is successful
      if (invoiceStatus !== "Paid") {
        console.log(`[MyFatoorah Callback] Payment status is ${invoiceStatus}, marking as rejected`);
        await storage.updateDepositStatus(depositId, "Rejected");
        return res.redirect(`${process.env.FRONTEND_URL || 'https://binofox.com'}/dashboard/deposit?error=payment_failed&depositId=${deposit.id}`);
      }

      // Update deposit status
      await storage.updateDepositStatus(depositId, "Completed");
      await storage.updateDeposit(depositId, {
        transactionId: paymentId as string,
        completedAt: new Date(),
      });

      const tradingAccountId = deposit.accountId;
      
      // Send deposit confirmation email
      const depositUser = await storage.getUser(deposit.userId);
      if (depositUser?.email) {
        sendDepositConfirmationEmail(
          depositUser.email,
          depositUser.fullName || depositUser.username,
          invoiceAmount.toFixed(2),
          "MyFatoorah",
          tradingAccountId,
          paymentId as string
        ).catch(err => console.error("Failed to send deposit confirmation email:", err));
      }

      // Add amount to trading account
      if (tradingAccountId) {
        const account = await storage.getTradingAccount(tradingAccountId);
        if (account) {
          const depositAmount = invoiceAmount;
          const newBalance = (parseFloat(account.balance || "0") + depositAmount).toString();
          await storage.updateTradingAccount(tradingAccountId, { balance: newBalance });

          // Sync with MT5 if enabled
          if (process.env.MT5_ENABLED === "true" && account.type === "Live") {
            try {
              await mt5Service.updateBalance(
                account.accountId,
                depositAmount,
                `MyFatoorah deposit: ${paymentId}`
              );
              console.log(`MT5 balance updated for account ${account.accountId}: +$${depositAmount}`);
            } catch (mt5Error) {
              console.error("Failed to sync deposit with MT5:", mt5Error);
              // Continue even if MT5 sync fails - local balance is updated
            }
          }

          // Credit commission to IB wallet if user was referred and referral is accepted
          const user = await storage.getUser(deposit.userId);
          if (user && user.referredBy && user.referralStatus === "Accepted") {
            try {
              const ibWallets = await storage.getIBCBWallets(user.referredBy);
              let ibWallet = ibWallets.find(w => w.walletType === "IB");
              
              if (!ibWallet) {
                ibWallet = await storage.createIBCBWallet({
                  userId: user.referredBy,
                  walletType: "IB",
                  balance: "0",
                  currency: "USD",
                  commissionRate: "5.0",
                  totalCommission: "0",
                  enabled: true,
                });
              }

              const commissionRate = parseFloat(ibWallet.commissionRate || "5.0");
              const commission = depositAmount * (commissionRate / 100);
              const newBalance = (parseFloat(ibWallet.balance || "0") + commission).toString();
              const newTotalCommission = (parseFloat(ibWallet.totalCommission || "0") + commission).toString();
              
              await storage.updateIBCBWallet(ibWallet.id, {
                balance: newBalance,
                totalCommission: newTotalCommission,
                updatedAt: new Date(),
              });

              await storage.createNotification({
                userId: user.referredBy,
                title: "Commission Earned",
                message: `You earned $${commission.toFixed(2)} commission from ${user.fullName || user.email}'s deposit.`,
                type: "success",
              });
              
              // Send IB commission email
              const ibUser = await storage.getUser(user.referredBy);
              if (ibUser?.email) {
                sendIBCommissionEmail(
                  ibUser.email,
                  ibUser.fullName || ibUser.username,
                  commission.toFixed(2),
                  user.fullName || user.email,
                  "Deposit",
                  depositAmount.toFixed(2)
                ).catch(err => console.error("Failed to send IB commission email:", err));
              }
            } catch (error) {
              console.error("Failed to credit IB commission:", error);
            }
          }
        }
      }

      // Redirect to success page
      res.redirect(`${process.env.FRONTEND_URL || 'https://binofox.com'}/dashboard/deposit?success=true&depositId=${deposit.id}`);
    } catch (error: any) {
      console.error("[MyFatoorah Callback] Error:", error);
      res.redirect(`${process.env.FRONTEND_URL || 'https://binofox.com'}/dashboard/deposit?error=callback_error`);
    }
  });

  // MyFatoorah - Check payment status (for manual verification)
  app.get("/api/myfatoorah/payment-status/:paymentId", async (req, res) => {
    try {
      const { paymentId } = req.params;
      console.log(`[MyFatoorah Payment Status] Checking payment: ${paymentId}`);

      const myfatoorah = getMyFatoorahService();
      const paymentStatus = await myfatoorah.getPaymentStatus(paymentId, "PaymentId");

      if (!paymentStatus.Data) {
        return res.status(404).json({ 
          message: "Payment not found",
          error: paymentStatus.Message 
        });
      }

      // Find deposit by transaction ID (invoice ID)
      const deposit = await storage.getDepositByTransactionId(paymentStatus.Data.InvoiceId.toString());
      
      const responseData = {
        paymentId,
        invoiceId: paymentStatus.Data.InvoiceId,
        status: paymentStatus.Data.InvoiceStatus,
        amount: paymentStatus.Data.InvoiceValue,
        currency: "USD",
        depositId: deposit?.id || null,
      };
      
      console.log(`[MyFatoorah Payment Status] Response:`, responseData);
      res.json(responseData);
    } catch (error: any) {
      console.error("[MyFatoorah Payment Status] Error:", error);
      res.status(500).json({ message: error.message || "Failed to get payment status" });
    }
  });

  // Deposits
  app.get("/api/deposits", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const deposits = await storage.getDeposits(userId);
      res.json(deposits);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch deposits" });
    }
  });

  app.post("/api/deposits", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const validatedData = insertDepositSchema.parse({
        ...req.body,
        userId,
        transactionId: `TXN${Date.now()}`,
      });
      
      const deposit = await storage.createDeposit(validatedData);
      
      // Create notification
      await storage.createNotification({
        userId,
        title: "Deposit Initiated",
        message: `Your deposit of $${deposit.amount} is being processed.`,
        type: "info",
      });
      
      // Send deposit pending email
      const user = await storage.getUser(userId);
      if (user?.email) {
        sendDepositPendingEmail(
          user.email,
          user.fullName || user.username,
          deposit.amount,
          deposit.merchant
        ).catch(err => console.error("Failed to send deposit email:", err));
      }
      
      res.status(201).json(deposit);
    } catch (error) {
      console.error("Deposit error:", error);
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Withdrawals
  app.get("/api/withdrawals", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const withdrawals = await storage.getWithdrawals(userId);
      res.json(withdrawals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch withdrawals" });
    }
  });

  app.post("/api/withdrawals", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const validatedData = insertWithdrawalSchema.parse({
        ...req.body,
        userId,
      });
      
      const withdrawal = await storage.createWithdrawal(validatedData);
      
      // Get user info for activity log
      const user = await storage.getUser(userId);
      const account = await storage.getTradingAccount(withdrawal.accountId);
      
      // Create notification for user
      await storage.createNotification({
        userId,
        title: "Withdrawal Request Received",
        message: `Your withdrawal request of $${withdrawal.amount} is being processed.`,
        type: "info",
      });
      
      // Send withdrawal request email
      if (user?.email) {
        sendWithdrawalRequestEmail(
          user.email,
          user.fullName || user.username,
          withdrawal.amount,
          withdrawal.method,
          account?.accountId || withdrawal.accountId
        ).catch(err => console.error("Failed to send withdrawal email:", err));
      }
      
      // Log activity for admin visibility (system activity)
      // Note: This creates a system-level activity that admins can see
      try {
        // Get first super admin to associate activity with, or create system activity
        const allAdmins = await storage.getAllAdminUsers();
        const superAdmin = allAdmins.find(a => {
          const role = String(a.role || "").trim().toLowerCase().replace(/[-\s_]+/g, "_");
          return role === "super_admin" || role === "superadmin";
        });
        
        if (superAdmin) {
          await logActivity(
            superAdmin.id,
            "withdrawal_requested",
            "withdrawal",
            withdrawal.id,
            `New withdrawal request: $${withdrawal.amount} from ${user?.email || userId} (Account: ${account?.accountId || withdrawal.accountId})`
          );
        }
      } catch (logError) {
        // Don't fail withdrawal creation if activity logging fails
        console.error("Failed to log withdrawal activity:", logError);
      }
      
      res.status(201).json(withdrawal);
    } catch (error) {
      console.error("Withdrawal error:", error);
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Trading History
  app.get("/api/trading-history", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const accountId = req.query.accountId as string | undefined;
      const history = await storage.getTradingHistory(userId, accountId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trading history" });
    }
  });

  // Check if user has verified documents (required for trading)
  app.get("/api/documents/verification-status", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const documents = await storage.getDocuments(userId);
      const requiredTypes = ["ID Proof"]; // Only ID Proof is required
      
      const verifiedDocs = documents.filter(
        doc => doc.status === "Verified" && requiredTypes.includes(doc.type)
      );
      
      const isVerified = verifiedDocs.length >= requiredTypes.length;
      const pendingDocs = documents.filter(doc => doc.status === "Pending");
      
      res.json({
        isVerified,
        verifiedCount: verifiedDocs.length,
        requiredCount: requiredTypes.length,
        hasPending: pendingDocs.length > 0,
        hasDocuments: documents.length > 0,
        totalDocuments: documents.length,
        documents: documents,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to check verification status" });
    }
  });

  // Documents
  app.get("/api/documents", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const documents = await storage.getDocuments(userId);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.post("/api/documents", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const validatedData = insertDocumentSchema.parse({
        ...req.body,
        userId,
      });
      
      const document = await storage.createDocument(validatedData);
      
      // Create notification
      await storage.createNotification({
        userId,
        title: "Document Uploaded",
        message: `Your ${document.type} has been uploaded and is under review.`,
        type: "success",
      });
      
      // Send document uploaded email
      const user = await storage.getUser(userId);
      if (user?.email) {
        sendDocumentUploadedEmail(
          user.email,
          user.fullName || user.username,
          document.type
        ).catch(err => console.error("Failed to send document upload email:", err));
      }
      
      res.status(201).json(document);
    } catch (error: any) {
      console.error("Document upload error:", error);
      const errorMessage = error?.message || "Invalid request data";
      res.status(400).json({ message: errorMessage });
    }
  });

  // Notifications
  app.get("/api/notifications", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const notifications = await storage.getNotifications(userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      await storage.markNotificationAsRead(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // User Profile
  app.get("/api/profile", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // Don't send password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.patch("/api/profile", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Don't allow password update through this endpoint
      const { password, id, ...allowedUpdates } = req.body;
      
      const updated = await storage.updateUser(userId, allowedUpdates);
      if (!updated) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password: _, ...userWithoutPassword } = updated;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Fund Transfers - Internal (between user's own accounts)
  app.get("/api/fund-transfers/internal", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const allTransfers = await storage.getFundTransfers(userId);
      // Filter internal transfers (both accounts belong to the same user)
      const userAccounts = await storage.getTradingAccounts(userId);
      const accountIds = new Set(userAccounts.map(acc => acc.id));
      
      const internalTransfers = allTransfers.filter(transfer => 
        accountIds.has(transfer.fromAccountId) && accountIds.has(transfer.toAccountId)
      );

      res.json(internalTransfers);
    } catch (error) {
      console.error("Failed to fetch internal transfers:", error);
      res.status(500).json({ message: "Failed to fetch transfers" });
    }
  });

  app.post("/api/fund-transfers/internal", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { fromAccountId, toAccountId, amount, notes } = req.body;

      if (!fromAccountId || !toAccountId || !amount) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Verify both accounts belong to the user
      const userAccounts = await storage.getTradingAccounts(userId);
      const fromAccount = userAccounts.find(acc => acc.id === fromAccountId);
      const toAccount = userAccounts.find(acc => acc.id === toAccountId);

      if (!fromAccount || !toAccount) {
        return res.status(400).json({ message: "Invalid account(s)" });
      }

      if (fromAccountId === toAccountId) {
        return res.status(400).json({ message: "Source and destination accounts cannot be the same" });
      }

      const transferAmount = parseFloat(amount);
      if (isNaN(transferAmount) || transferAmount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      const currentBalance = parseFloat(fromAccount.balance || "0");
      if (currentBalance < transferAmount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      // Create transfer record
      const transfer = await storage.createFundTransfer({
        userId,
        fromAccountId,
        toAccountId,
        amount: transferAmount.toString(),
        currency: "USD",
        status: "Completed", // Internal transfers are instant
        notes: notes || null,
      });

      // Update balances
      const newFromBalance = (currentBalance - transferAmount).toString();
      const newToBalance = (parseFloat(toAccount.balance || "0") + transferAmount).toString();

      await storage.updateTradingAccount(fromAccountId, { balance: newFromBalance });
      await storage.updateTradingAccount(toAccountId, { balance: newToBalance });

      // Create notification
      await storage.createNotification({
        userId,
        title: "Internal Transfer Completed",
        message: `Successfully transferred $${transferAmount.toFixed(2)} from ${fromAccount.accountId} to ${toAccount.accountId}.`,
        type: "success",
      });

      res.status(201).json(transfer);
    } catch (error) {
      console.error("Internal transfer error:", error);
      res.status(500).json({ message: "Failed to process transfer" });
    }
  });

  // IB Account Stats
  app.get("/api/ib/stats", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get or create IB wallet
      let ibWallet = (await storage.getIBCBWallets(userId)).find(w => w.walletType === "IB");
      if (!ibWallet) {
        // Create IB wallet with default 5% commission rate
        ibWallet = await storage.createIBCBWallet({
          userId,
          walletType: "IB",
          balance: "0",
          currency: "USD",
          commissionRate: "5.0", // Default 5% commission
          totalCommission: "0",
          enabled: true,
        });
      }

      // Find all users who were referred by this user (referredBy === user.id)
      const allUsers = await storage.getAllUsers();
      const allReferrals = allUsers.filter(u => u.referredBy === userId);
      
      // Only count accepted referrals for commission calculations
      const acceptedReferrals = allReferrals.filter(u => u.referralStatus === "Accepted");

      // Calculate referral stats - only for accepted referrals
      let totalDeposits = 0;
      let totalCommission = parseFloat(ibWallet.totalCommission || "0");
      const referralDetails = await Promise.all(
        allReferrals.map(async (refUser) => {
          const deposits = await storage.getDeposits(refUser.id);
          const completedDeposits = deposits.filter(d => d.status === "Completed" || d.status === "Approved");
          const userTotalDeposits = completedDeposits.reduce((sum, d) => sum + parseFloat(d.amount), 0);
          
          // Only calculate commission if referral is accepted
          let commission = 0;
          if (refUser.referralStatus === "Accepted") {
            commission = userTotalDeposits * (parseFloat(ibWallet.commissionRate || "0") / 100);
            totalDeposits += userTotalDeposits;
          }

          return {
            id: refUser.id,
            email: refUser.email,
            fullName: refUser.fullName || refUser.username,
            joinedAt: refUser.createdAt || new Date(),
            totalDeposits: userTotalDeposits.toFixed(2),
            commissionEarned: commission.toFixed(2),
            status: completedDeposits.length > 0 ? "Active" as const : "Inactive" as const,
            referralStatus: refUser.referralStatus || "Pending",
          };
        })
      );

      // Calculate pending commission (from pending deposits of accepted referrals only)
      let pendingCommission = 0;
      for (const refUser of acceptedReferrals) {
        const deposits = await storage.getDeposits(refUser.id);
        const pendingDeposits = deposits.filter(d => d.status === "Pending");
        const pendingAmount = pendingDeposits.reduce((sum, d) => sum + parseFloat(d.amount), 0);
        pendingCommission += pendingAmount * (parseFloat(ibWallet.commissionRate || "0") / 100);
      }
      
      // Count active referrals (only accepted ones with deposits)
      const activeReferrals = referralDetails.filter(r => 
        r.status === "Active" && r.referralStatus === "Accepted"
      );

      res.json({
        totalReferrals: allReferrals.length,
        acceptedReferrals: acceptedReferrals.length,
        activeReferrals: activeReferrals.length,
        totalCommission: totalCommission.toFixed(2),
        pendingCommission: pendingCommission.toFixed(2),
        wallet: ibWallet,
        referrals: referralDetails.sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()),
      });
    } catch (error) {
      console.error("Failed to fetch IB stats:", error);
      res.status(500).json({ message: "Failed to fetch IB statistics" });
    }
  });

  // ========== ADMIN REFERRAL MANAGEMENT ==========

  // Admin - Get all referrals (pending, accepted, rejected)
  app.get("/api/admin/referrals", async (req, res) => {
    try {
      const canProceed = await requireAdmin(req, res);
      if (!canProceed) return;
      if (!(await blockNormalAdmin(req, res))) return;

      const allUsers = await storage.getAllUsers();
      
      // Get all users who have been referred (referredBy is not null)
      const referredUsers = allUsers.filter(u => u.referredBy !== null && u.referredBy !== undefined);
      
      // Enrich with referrer information
      const referrals = referredUsers.map(user => {
        const referrer = user.referredBy ? allUsers.find(u => u.id === user.referredBy) : null;
        return {
          id: user.id,
          userId: user.id,
          email: user.email,
          fullName: user.fullName || user.username || "Unknown",
          phone: user.phone || null,
          country: user.country || null,
          city: user.city || null,
          joinedAt: user.createdAt ? new Date(user.createdAt) : new Date(),
          referralStatus: user.referralStatus || "Pending",
          referrerId: user.referredBy,
          referrerName: referrer?.fullName || referrer?.username || "Unknown",
          referrerEmail: referrer?.email || "Unknown",
          referrerReferralId: referrer?.referralId || "Unknown",
        };
      });

      // Sort by created date (newest first)
      referrals.sort((a, b) => {
        const dateA = a.joinedAt instanceof Date ? a.joinedAt : new Date(a.joinedAt);
        const dateB = b.joinedAt instanceof Date ? b.joinedAt : new Date(b.joinedAt);
        return dateB.getTime() - dateA.getTime();
      });

      res.json(referrals);
    } catch (error: any) {
      console.error("Failed to fetch referrals:", error);
      res.status(500).json({ message: "Failed to fetch referrals", error: error?.message });
    }
  });

  // Admin - Accept referral
  app.patch("/api/admin/referrals/:id/accept", async (req, res) => {
    try {
      const canProceed = await requireAdmin(req, res);
      if (!canProceed) return;

      const adminId = getCurrentAdminId(req);
      const userId = req.params.id;

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!user.referredBy) {
        return res.status(400).json({ message: "User was not referred by anyone" });
      }

      // Ensure referral is in Pending status (can only accept after signup)
      if (user.referralStatus !== "Pending") {
        return res.status(400).json({ 
          message: `Referral cannot be accepted. Current status: ${user.referralStatus || "Not set"}. Only pending referrals can be accepted.` 
        });
      }

      // Update referral status
      const updated = await storage.updateUser(userId, {
        referralStatus: "Accepted",
      });

      // Log activity
      await logActivity(
        adminId!,
        "ACCEPT_REFERRAL",
        "user",
        userId,
        `Accepted referral for user ${user.email} referred by ${user.referredBy}`
      );

      // Create or enable IB wallet for the referrer if not exists
      const referrer = await storage.getUser(user.referredBy);
      if (referrer) {
        let ibWallet = (await storage.getIBCBWallets(user.referredBy)).find(w => w.walletType === "IB");
        if (!ibWallet) {
          ibWallet = await storage.createIBCBWallet({
            userId: user.referredBy,
            walletType: "IB",
            balance: "0",
            currency: "USD",
            commissionRate: "5.0", // Default 5% commission
            totalCommission: "0",
            enabled: true,
          });
        } else if (!ibWallet.enabled) {
          await storage.updateIBCBWallet(ibWallet.id, { enabled: true });
        }
      }

      res.json(updated);
    } catch (error: any) {
      console.error("Failed to accept referral:", error);
      res.status(500).json({ message: "Failed to accept referral", error: error?.message });
    }
  });

  // Admin - Reject referral
  app.patch("/api/admin/referrals/:id/reject", async (req, res) => {
    try {
      const canProceed = await requireAdmin(req, res);
      if (!canProceed) return;

      const adminId = getCurrentAdminId(req);
      const userId = req.params.id;
      const { reason } = req.body;

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!user.referredBy) {
        return res.status(400).json({ message: "User was not referred by anyone" });
      }

      // Update referral status
      const updated = await storage.updateUser(userId, {
        referralStatus: "Rejected",
      });

      // Log activity
      await logActivity(
        adminId!,
        "REJECT_REFERRAL",
        "user",
        userId,
        `Rejected referral for user ${user.email} referred by ${user.referredBy}. Reason: ${reason || "No reason provided"}`
      );

      res.json(updated);
    } catch (error: any) {
      console.error("Failed to reject referral:", error);
      res.status(500).json({ message: "Failed to reject referral", error: error?.message });
    }
  });

  // Admin - Update IB Commission Rate
  app.patch("/api/admin/referrals/:id/commission-rate", async (req, res) => {
    try {
      const canProceed = await requireAdmin(req, res);
      if (!canProceed) return;

      const adminId = getCurrentAdminId(req);
      const userId = req.params.id; // This is the referrer's user ID (IB broker)
      const { commissionRate } = req.body;

      if (!commissionRate || isNaN(parseFloat(commissionRate)) || parseFloat(commissionRate) < 0 || parseFloat(commissionRate) > 100) {
        return res.status(400).json({ message: "Invalid commission rate. Must be between 0 and 100." });
      }

      // Get the IB wallet for this user
      const ibWallets = await storage.getIBCBWallets(userId);
      const ibWallet = ibWallets.find(w => w.walletType === "IB");

      if (!ibWallet) {
        return res.status(404).json({ message: "IB wallet not found for this user" });
      }

      // Update commission rate
      await storage.updateIBCBWallet(ibWallet.id, {
        commissionRate: parseFloat(commissionRate).toFixed(2),
        updatedAt: new Date(),
      });

      // Log activity
      const user = await storage.getUser(userId);
      await logActivity(
        adminId!,
        "UPDATE_COMMISSION_RATE",
        "ib_wallet",
        ibWallet.id,
        `Updated commission rate to ${commissionRate}% for IB broker ${user?.email || userId}`
      );

      const updatedWallet = await storage.getIBCBWallet(ibWallet.id);
      res.json(updatedWallet);
    } catch (error: any) {
      console.error("Failed to update commission rate:", error);
      res.status(500).json({ message: "Failed to update commission rate", error: error?.message });
    }
  });

  // Admin - Send money from IB wallet to broker (IB Payout)
  app.post("/api/admin/referrals/:id/payout", async (req, res) => {
    try {
      const canProceed = await requireAdmin(req, res);
      if (!canProceed) return;

      const adminId = getCurrentAdminId(req);
      const userId = req.params.id; // This is the referrer's user ID (IB broker)
      const { amount, notes } = req.body;

      if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        return res.status(400).json({ message: "Invalid amount. Must be greater than 0." });
      }

      const payoutAmount = parseFloat(amount);

      // Get the IB wallet for this user
      const ibWallets = await storage.getIBCBWallets(userId);
      const ibWallet = ibWallets.find(w => w.walletType === "IB");

      if (!ibWallet) {
        return res.status(404).json({ message: "IB wallet not found for this user" });
      }

      const currentBalance = parseFloat(ibWallet.balance || "0");
      if (currentBalance < payoutAmount) {
        return res.status(400).json({ 
          message: `Insufficient balance. Available: $${currentBalance.toFixed(2)}, Requested: $${payoutAmount.toFixed(2)}` 
        });
      }

      // Deduct amount from IB wallet
      const newBalance = (currentBalance - payoutAmount).toString();
      await storage.updateIBCBWallet(ibWallet.id, {
        balance: newBalance,
        updatedAt: new Date(),
      });

      // Log activity
      const user = await storage.getUser(userId);
      await logActivity(
        adminId!,
        "IB_PAYOUT",
        "ib_wallet",
        ibWallet.id,
        `Sent $${payoutAmount.toFixed(2)} payout to IB broker ${user?.email || userId}. ${notes || ""}`
      );

      // Create notification for IB broker
      await storage.createNotification({
        userId,
        title: "IB Payout Processed",
        message: `Your payout of $${payoutAmount.toFixed(2)} has been processed and sent to your broker account.`,
        type: "success",
      });
      
      // Send IB payout email
      if (user?.email) {
        sendIBPayoutEmail(
          user.email,
          user.fullName || user.username,
          payoutAmount.toFixed(2),
          notes || ""
        ).catch(err => console.error("Failed to send IB payout email:", err));
      }

      const updatedWallet = await storage.getIBCBWallet(ibWallet.id);
      res.json({
        success: true,
        message: `Successfully sent $${payoutAmount.toFixed(2)} to IB broker`,
        wallet: updatedWallet,
        payoutAmount: payoutAmount.toFixed(2),
      });
    } catch (error: any) {
      console.error("Failed to process IB payout:", error);
      res.status(500).json({ message: "Failed to process IB payout", error: error?.message });
    }
  });

  // Admin - Get all IB accounts with comprehensive stats
  app.get("/api/admin/ib-accounts", async (req, res) => {
    try {
      if (!(await requireSuperAdmin(req, res))) return;
      
      // Get all IB wallets
      const allIbWallets = await storage.getIBCBWallets();
      const ibWallets = allIbWallets.filter(w => w.walletType === "IB");
      
      // Get all users to find referrers
      const allUsers = await storage.getAllUsers();
      
      // Build comprehensive IB account stats
      const ibAccounts = await Promise.all(
        ibWallets.map(async (wallet) => {
          const user = allUsers.find(u => u.id === wallet.userId);
          if (!user) return null;
          
          // Find all users referred by this IB
          const referrals = allUsers.filter(u => u.referredBy === user.id);
          const acceptedReferrals = referrals.filter(u => u.referralStatus === "Accepted");
          
          // Calculate stats from referrals
          let totalDeposits = 0;
          let totalCommissionEarned = 0;
          let activeReferrals = 0;
          let totalTradingVolume = 0;
          let totalTrades = 0;
          
          for (const refUser of acceptedReferrals) {
            const deposits = await storage.getDeposits(refUser.id);
            const completedDeposits = deposits.filter(d => d.status === "Completed" || d.status === "Approved");
            const userTotalDeposits = completedDeposits.reduce((sum, d) => sum + parseFloat(d.amount), 0);
            
            // Get trading volume
            const accounts = await storage.getTradingAccounts(refUser.id);
            for (const account of accounts) {
              try {
                const history = await storage.getTradingHistory(refUser.id, account.id);
                totalTrades += history.length;
                for (const trade of history) {
                  totalTradingVolume += parseFloat(trade.volume || "0");
                }
              } catch (err) {
                // Skip if trading history fails
              }
            }
            
            if (userTotalDeposits > 0) {
              activeReferrals++;
              totalDeposits += userTotalDeposits;
              const commissionRate = parseFloat(wallet.commissionRate || "5.0");
              totalCommissionEarned += userTotalDeposits * (commissionRate / 100);
            }
          }
          
          return {
            userId: user.id,
            email: user.email,
            fullName: user.fullName || user.username,
            referralId: user.referralId,
            referralLink: user.referralId ? `${process.env.FRONTEND_URL || process.env.VITE_API_URL || "https://binofox.com"}/signup?ref=${user.referralId}` : null,
            wallet: {
              id: wallet.id,
              balance: wallet.balance,
              currency: wallet.currency,
              commissionRate: wallet.commissionRate,
              totalCommission: wallet.totalCommission,
              enabled: wallet.enabled,
            },
            stats: {
              totalReferrals: referrals.length,
              acceptedReferrals: acceptedReferrals.length,
              activeReferrals,
              totalDeposits: totalDeposits.toFixed(2),
              totalCommissionEarned: totalCommissionEarned.toFixed(2),
              pendingCommission: (parseFloat(wallet.totalCommission || "0") - totalCommissionEarned).toFixed(2),
              totalTradingVolume: totalTradingVolume.toFixed(2),
              totalTrades,
            },
            createdAt: wallet.createdAt,
            updatedAt: wallet.updatedAt,
          };
        })
      );
      
      // Filter out null entries
      const validIbAccounts = ibAccounts.filter(acc => acc !== null);
      
      res.json(validIbAccounts);
    } catch (error: any) {
      console.error("[Admin IB Accounts] Error:", error);
      res.status(500).json({ message: "Failed to fetch IB accounts", error: error?.message });
    }
  });

  // Admin - Get referral deposits for IB account
  app.get("/api/admin/ib-accounts/:userId/referral-deposits", async (req, res) => {
    try {
      if (!(await requireSuperAdmin(req, res))) return;
      
      const { userId } = req.params;
      
      // Get the IB user
      const ibUser = await storage.getUser(userId);
      if (!ibUser) {
        return res.status(404).json({ message: "IB user not found" });
      }
      
      // Get all users referred by this IB
      const allUsers = await storage.getAllUsers();
      const referrals = allUsers.filter(u => u.referredBy === ibUser.id);
      const acceptedReferrals = referrals.filter(u => u.referralStatus === "Accepted");
      
      // Get all deposits from accepted referrals
      const allDeposits: any[] = [];
      for (const refUser of acceptedReferrals) {
        const deposits = await storage.getDeposits(refUser.id);
        const completedDeposits = deposits.filter(d => d.status === "Completed" || d.status === "Approved");
        for (const deposit of completedDeposits) {
          allDeposits.push({
            ...deposit,
            referralUserId: refUser.id,
            referralEmail: refUser.email,
            referralName: refUser.fullName || refUser.username,
          });
        }
      }
      
      // Sort by date (newest first)
      allDeposits.sort((a, b) => {
        const dateA = new Date(a.depositDate || a.createdAt || 0).getTime();
        const dateB = new Date(b.depositDate || b.createdAt || 0).getTime();
        return dateB - dateA;
      });
      
      res.json(allDeposits);
    } catch (error: any) {
      console.error("[Admin IB Referral Deposits] Error:", error);
      res.status(500).json({ message: "Failed to fetch referral deposits", error: error?.message });
    }
  });

  // Admin - Get detailed referral information with trading history
  app.get("/api/admin/ib-accounts/:userId/referrals", async (req, res) => {
    try {
      if (!(await requireSuperAdmin(req, res))) return;
      
      const { userId } = req.params;
      
      // Get the IB user
      const ibUser = await storage.getUser(userId);
      if (!ibUser) {
        return res.status(404).json({ message: "IB user not found" });
      }
      
      // Get all users referred by this IB
      const allUsers = await storage.getAllUsers();
      const referrals = allUsers.filter(u => u.referredBy === ibUser.id);
      
      // Build detailed referral information
      const referralDetails = await Promise.all(
        referrals.map(async (refUser) => {
          // Get deposits
          const deposits = await storage.getDeposits(refUser.id);
          const completedDeposits = deposits.filter(d => d.status === "Completed" || d.status === "Approved");
          const totalDeposits = completedDeposits.reduce((sum, d) => sum + parseFloat(d.amount || "0"), 0);
          
          // Get trading accounts
          const accounts = await storage.getTradingAccounts(refUser.id);
          
          // Get trading history for all accounts
          let totalVolume = 0;
          let totalTrades = 0;
          let totalProfit = 0;
          
          for (const account of accounts) {
            try {
              const history = await storage.getTradingHistory(refUser.id, account.id);
              totalTrades += history.length;
              for (const trade of history) {
                const volume = parseFloat(trade.volume || "0");
                totalVolume += volume;
                if (trade.profit) {
                  totalProfit += parseFloat(trade.profit);
                }
              }
            } catch (err) {
              // Skip if trading history fails
              console.error(`Failed to get trading history for account ${account.id}:`, err);
            }
          }
          
          return {
            userId: refUser.id,
            email: refUser.email,
            fullName: refUser.fullName || refUser.username,
            username: refUser.username,
            referralStatus: refUser.referralStatus,
            signupDate: refUser.createdAt,
            totalDeposits: totalDeposits.toFixed(2),
            totalTrades,
            totalVolume: totalVolume.toFixed(2),
            totalProfit: totalProfit.toFixed(2),
            accountCount: accounts.length,
            lastDepositDate: completedDeposits.length > 0 
              ? completedDeposits.sort((a, b) => {
                  const dateA = new Date(a.depositDate || a.createdAt || 0).getTime();
                  const dateB = new Date(b.depositDate || b.createdAt || 0).getTime();
                  return dateB - dateA;
                })[0].depositDate || completedDeposits[0].createdAt
              : null,
          };
        })
      );
      
      // Sort by signup date (newest first)
      referralDetails.sort((a, b) => {
        const dateA = new Date(a.signupDate || 0).getTime();
        const dateB = new Date(b.signupDate || 0).getTime();
        return dateB - dateA;
      });
      
      res.json(referralDetails);
    } catch (error: any) {
      console.error("[Admin IB Referrals] Error:", error);
      res.status(500).json({ message: "Failed to fetch referral details", error: error?.message });
    }
  });

  // Admin - Create custom payout (can exceed wallet balance)
  app.post("/api/admin/ib-accounts/:userId/custom-payout", async (req, res) => {
    try {
      if (!(await requireSuperAdmin(req, res))) return;
      
      const adminId = getCurrentAdminId(req);
      const { userId } = req.params;
      const { amount, notes } = req.body;
      
      if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        return res.status(400).json({ message: "Invalid amount. Must be greater than 0." });
      }
      
      const payoutAmount = parseFloat(amount);
      
      // Get the IB wallet
      const ibWallets = await storage.getIBCBWallets(userId);
      const ibWallet = ibWallets.find(w => w.walletType === "IB");
      
      if (!ibWallet) {
        return res.status(404).json({ message: "IB wallet not found for this user" });
      }
      
      // Add custom payout to wallet balance (this is a bonus/custom payout)
      const currentBalance = parseFloat(ibWallet.balance || "0");
      const newBalance = (currentBalance + payoutAmount).toString();
      const newTotalCommission = (parseFloat(ibWallet.totalCommission || "0") + payoutAmount).toString();
      
      await storage.updateIBCBWallet(ibWallet.id, {
        balance: newBalance,
        totalCommission: newTotalCommission,
        updatedAt: new Date(),
      });
      
      // Log activity
      const user = await storage.getUser(userId);
      await logActivity(
        adminId!,
        "IB_CUSTOM_PAYOUT",
        "ib_wallet",
        ibWallet.id,
        `Custom payout of $${payoutAmount.toFixed(2)} added to IB broker ${user?.email || userId}. ${notes || ""}`
      );
      
      // Create notification
      await storage.createNotification({
        userId,
        title: "Custom IB Payout Added",
        message: `A custom payout of $${payoutAmount.toFixed(2)} has been added to your IB wallet. ${notes || ""}`,
        type: "success",
      });
      
      // Send email
      if (user?.email) {
        sendIBPayoutEmail(
          user.email,
          user.fullName || user.username,
          payoutAmount.toFixed(2),
          notes || "Custom payout from admin"
        ).catch(err => console.error("Failed to send IB payout email:", err));
      }
      
      const updatedWallet = await storage.getIBCBWallet(ibWallet.id);
      res.json({
        success: true,
        message: `Successfully added custom payout of $${payoutAmount.toFixed(2)} to IB wallet`,
        wallet: updatedWallet,
        payoutAmount: payoutAmount.toFixed(2),
      });
    } catch (error: any) {
      console.error("[Admin Custom Payout] Error:", error);
      res.status(500).json({ message: "Failed to process custom payout", error: error?.message });
    }
  });

  // Fund Transfers - External (to another user's account)
  app.get("/api/fund-transfers/external", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const allTransfers = await storage.getFundTransfers(userId);
      // Filter external transfers (toAccountId is not in user's accounts)
      const userAccounts = await storage.getTradingAccounts(userId);
      const accountIds = new Set(userAccounts.map(acc => acc.id));
      
      const externalTransfers = allTransfers.filter(transfer => 
        accountIds.has(transfer.fromAccountId) && !accountIds.has(transfer.toAccountId)
      );

      res.json(externalTransfers);
    } catch (error) {
      console.error("Failed to fetch external transfers:", error);
      res.status(500).json({ message: "Failed to fetch transfers" });
    }
  });

  app.post("/api/fund-transfers/external", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { fromAccountId, toAccountNumber, amount, otpMethod } = req.body;

      if (!fromAccountId || !toAccountNumber || !amount) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Verify source account belongs to user
      const userAccounts = await storage.getTradingAccounts(userId);
      const fromAccount = userAccounts.find(acc => acc.id === fromAccountId);

      if (!fromAccount) {
        return res.status(400).json({ message: "Invalid source account" });
      }

      // Find destination account by account number
      // Normalize the account number (trim whitespace, convert to string)
      const normalizedAccountNumber = String(toAccountNumber || "").trim();
      
      if (!normalizedAccountNumber) {
        return res.status(400).json({ message: "Destination account number is required" });
      }

      const allAccounts = await storage.getAllTradingAccounts();
      
      // Try to find account by accountId (case-insensitive, trimmed comparison)
      const toAccount = allAccounts.find(acc => {
        if (!acc.accountId) return false;
        const normalizedAccId = String(acc.accountId).trim();
        return normalizedAccId === normalizedAccountNumber || 
               normalizedAccId.toLowerCase() === normalizedAccountNumber.toLowerCase();
      });

      if (!toAccount) {
        // Log for debugging
        console.error(`[External Transfer] Account not found: ${normalizedAccountNumber}. Total accounts: ${allAccounts.length}`);
        console.error(`[External Transfer] Sample accountIds: ${allAccounts.slice(0, 5).map(a => a.accountId).join(", ")}`);
        return res.status(400).json({ 
          message: `Destination account "${normalizedAccountNumber}" not found. Please verify the account number.` 
        });
      }

      if (toAccount.userId === userId) {
        return res.status(400).json({ message: "Use Internal Transfer for your own accounts" });
      }

      const transferAmount = parseFloat(amount);
      if (isNaN(transferAmount) || transferAmount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      // Calculate fee (2.5%)
      const fee = transferAmount * 0.025;
      const totalDeduction = transferAmount + fee;

      const currentBalance = parseFloat(fromAccount.balance || "0");
      if (currentBalance < totalDeduction) {
        return res.status(400).json({ message: `Insufficient balance. Need $${totalDeduction.toFixed(2)} (amount + 2.5% fee)` });
      }

      // Create transfer record (Pending - requires admin approval)
      const transfer = await storage.createFundTransfer({
        userId,
        fromAccountId,
        toAccountId: toAccount.id, // Store the actual account ID
        amount: transferAmount.toString(),
        currency: "USD",
        status: "Pending", // External transfers require approval
        notes: `External transfer to ${toAccountNumber}. Fee: $${fee.toFixed(2)}. OTP Method: ${otpMethod}`,
      });

      // Deduct amount + fee from source account immediately
      const newFromBalance = (currentBalance - totalDeduction).toString();
      await storage.updateTradingAccount(fromAccountId, { balance: newFromBalance });

      // Create notification
      await storage.createNotification({
        userId,
        title: "External Transfer Initiated",
        message: `Transfer of $${transferAmount.toFixed(2)} to ${toAccountNumber} is pending approval. Fee: $${fee.toFixed(2)}.`,
        type: "info",
      });

      res.status(201).json({
        ...transfer,
        fee: fee.toFixed(2),
        totalDeduction: totalDeduction.toFixed(2),
        message: "Transfer initiated. Please verify with OTP if required.",
      });
    } catch (error) {
      console.error("External transfer error:", error);
      res.status(500).json({ message: "Failed to process transfer" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const accountId = req.query.accountId as string | undefined;
      
      const accounts = await storage.getTradingAccounts(userId);
      const trades = await storage.getTradingHistory(userId, accountId);
      const deposits = await storage.getDeposits(userId);
      
      // ALWAYS calculate totals across ALL accounts (not filtered by accountId)
      // This ensures dashboard shows total balance across all accounts
      const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance || "0"), 0);
      const totalEquity = accounts.reduce((sum, acc) => sum + parseFloat(acc.equity || "0"), 0);
      const totalMargin = accounts.reduce((sum, acc) => sum + parseFloat(acc.margin || "0"), 0);
      
      // Filter accounts if accountId is provided (for trades only)
      let filteredAccounts = accounts;
      if (accountId) {
        filteredAccounts = accounts.filter(acc => acc.id === accountId);
      }
      
      // Calculate total P/L from closed trades (for selected account or all)
      const totalProfitLoss = trades
        .filter(t => t.status === "Closed" && t.profit)
        .reduce((sum, t) => sum + parseFloat(t.profit!), 0);
      
      res.json({
        balance: totalBalance.toFixed(2),
        equity: totalEquity.toFixed(2),
        margin: totalMargin.toFixed(2),
        profitLoss: totalProfitLoss.toFixed(2),
        totalAccounts: accounts.length, // Always show total accounts count
        openTrades: trades.filter(t => t.status === "Open").length,
        totalDeposits: deposits.filter(d => d.status === "Completed").length,
      });
    } catch (error) {
      console.error("Stats error:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // ===================== ADMIN ROUTES =====================

  // Admin Authentication
  app.post("/api/admin/auth/signin", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      console.log("[API /admin/auth/signin] Login attempt for username:", username);
      
      if (!username || !password) {
        console.log("[API /admin/auth/signin] Missing credentials");
        return res.status(400).json({ message: "Username and password are required" });
      }

      // Find admin - try username first, then email if not found
      let admin;
      try {
        // First try to find by username
        admin = await storage.getAdminUserByUsername(username);
        console.log("[API /admin/auth/signin] Admin lookup by username result:", admin ? "Found" : "Not found");
        
        // If not found by username, try by email (in case user entered email instead)
        if (!admin && username.includes("@")) {
          admin = await storage.getAdminUserByEmail(username);
          console.log("[API /admin/auth/signin] Admin lookup by email result:", admin ? "Found" : "Not found");
        }
      } catch (dbError: any) {
        console.error("[API /admin/auth/signin] Database error during admin lookup:", dbError);
        return res.status(500).json({ 
          message: "Database error during authentication",
          error: process.env.NODE_ENV === "development" ? dbError.message : undefined
        });
      }

      if (!admin) {
        console.log("[API /admin/auth/signin] Admin not found for username/email:", username);
        return res.status(401).json({ message: "Invalid username or password" });
      }

      // Check if admin is enabled
      if (!admin.enabled) {
        console.log("[API /admin/auth/signin] Admin account disabled:", username);
        return res.status(401).json({ message: "Invalid username or password" });
      }

      // Check password
      let validPassword = false;
      try {
        if (!admin.password) {
          console.error("[API /admin/auth/signin] Admin password is missing in database");
          return res.status(500).json({ message: "Account configuration error" });
        }
        validPassword = await bcrypt.compare(password, admin.password);
        console.log("[API /admin/auth/signin] Password validation result:", validPassword);
      } catch (bcryptError: any) {
        console.error("[API /admin/auth/signin] Password comparison error:", bcryptError);
        return res.status(500).json({ 
          message: "Authentication error",
          error: process.env.NODE_ENV === "development" ? bcryptError.message : undefined
        });
      }

      if (!validPassword) {
        console.log("[API /admin/auth/signin] Invalid password for username:", username);
        return res.status(401).json({ message: "Invalid username or password" });
      }

      // Set session - single login attempt grants immediate access
      req.session.adminId = admin.id;
      req.session.adminLoginAttempts = 1; // Set to 1 to indicate successful login
      
      // Save session - use callback version for compatibility
      // CRITICAL: Must wait for session to be saved before sending response
      // This prevents the "login twice" issue where session isn't ready on redirect
      try {
        await new Promise<void>((resolve, reject) => {
          req.session.save((err) => {
            if (err) {
              console.error("[API /admin/auth/signin] Session save error:", err);
              reject(err);
            } else {
              console.log("[API /admin/auth/signin] Session saved successfully, adminId:", admin.id);
              resolve();
            }
          });
        });
        
        // Verify session was actually saved
        if (!req.session.adminId) {
          console.error("[API /admin/auth/signin] WARNING: Session adminId not set after save!");
        } else {
          console.log("[API /admin/auth/signin] Session verified, adminId:", req.session.adminId);
        }
      } catch (sessionError: any) {
        console.error("[API /admin/auth/signin] Session save exception:", sessionError);
        // Don't fail login if session save has issues - might still work
        // But log it so we can debug
      }

      // Log activity (don't let this break login)
      try {
        await logActivity(admin.id, "signin", "admin", admin.id, "Admin signed in", null, getClientIp(req));
      } catch (activityError: any) {
        console.error("[API /admin/auth/signin] Activity log error (non-fatal):", activityError);
        // Continue with login even if activity logging fails
      }

      // Debug: Log admin object from database
      console.log("[API /admin/auth/signin] Admin from database:", {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        roleType: typeof admin.role,
        hasRole: 'role' in admin,
        allKeys: Object.keys(admin),
      });

      // Return admin without password - ensure role is included
      const { password: _, ...adminWithoutPassword } = admin;
      const adminResponse = {
        ...adminWithoutPassword,
        role: admin.role || "normal_admin", // Fallback if role is missing
      };
      
      // Single login attempt grants immediate dashboard access
      const loginAttempts = 1;
      const canAccessDashboard = true;
      
      console.log("[API /admin/auth/signin] Login successful, sending response with role:", adminResponse.role, "Can access dashboard:", canAccessDashboard);
      res.json({ 
        admin: adminResponse,
        loginAttempts: loginAttempts,
        canAccessDashboard: canAccessDashboard
      });
    } catch (error: any) {
      console.error("[API /admin/auth/signin] Unexpected error:", error);
      console.error("[API /admin/auth/signin] Error stack:", error.stack);
      res.status(500).json({ 
        message: "Failed to sign in",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }
  });

  app.post("/api/admin/auth/logout", async (req, res) => {
    const adminId = getCurrentAdminId(req);
    if (adminId) {
      await logActivity(adminId, "logout", "admin", adminId, "Admin signed out", null, getClientIp(req));
    }
    
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/admin/auth/me", async (req, res) => {
    // Single login attempt grants immediate dashboard access
    const loginAttempts = req.session.adminLoginAttempts || 1;
    const canAccessDashboard = true; // Always true after successful login
    try {
      const adminId = getCurrentAdminId(req);
      if (!adminId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const admin = await storage.getAdminUser(adminId);
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }

      // Debug logging to see what we're getting from database
      console.log("[API /admin/auth/me] Admin from database:", {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        roleType: typeof admin.role,
        roleValue: admin.role,
        fullName: admin.fullName,
        enabled: admin.enabled,
        allKeys: Object.keys(admin),
        fullObject: JSON.stringify(admin, null, 2)
      });

      const { password: _, ...adminWithoutPassword } = admin;
      
      // Ensure role is included in response
      const adminResponse = {
        ...adminWithoutPassword,
        role: admin.role || "normal_admin", // Fallback if role is missing
      };
      
      console.log("[API /admin/auth/me] Sending admin response:", {
        id: adminResponse.id,
        role: adminResponse.role,
        roleType: typeof adminResponse.role,
        loginAttempts: loginAttempts,
        canAccessDashboard: canAccessDashboard,
      });
      
      // Return admin object with login attempts info
      res.json({
        ...adminResponse,
        loginAttempts: loginAttempts,
        canAccessDashboard: canAccessDashboard
      });
    } catch (error) {
      console.error("[API /admin/auth/me] Error:", error);
      res.status(500).json({ message: "Failed to fetch admin" });
    }
  });

  // Admin User Management
  app.get("/api/admin/users", async (req, res) => {
    try {
      if (!(await requireAdmin(req, res))) return;

      const adminId = getCurrentAdminId(req)!;
      const admin = await storage.getAdminUser(adminId);
      
      let users: User[];
      // Normalize role for comparison
      const adminRole = String(admin!.role || "").trim().toLowerCase().replace(/[-\s_]+/g, "_");
      if (adminRole === "super_admin" || adminRole === "superadmin") {
        // Super admin sees all users
        users = await storage.getAllUsers();
      } else if (adminRole === "middle_admin" || adminRole === "middleadmin") {
        // Middle admin sees only users from assigned countries
        const assignments = await storage.getAdminCountryAssignments(adminId);
        const assignedCountries = assignments.map(a => a.country);
        
        if (assignedCountries.length === 0) {
          // No countries assigned, return empty array
          users = [];
        } else {
          // Get all users and filter by assigned countries
          const allUsers = await storage.getAllUsers();
          users = allUsers.filter(user => user.country && assignedCountries.includes(user.country));
        }
      } else {
        // Normal admin sees all users (can be modified based on requirements)
        users = await storage.getAllUsers();
      }

      // Remove passwords from response
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      
      console.log(`[GET /api/admin/users] Returning ${usersWithoutPasswords.length} users for admin ${admin!.username} (${adminRole})`);
      
      res.json(usersWithoutPasswords);
    } catch (error: any) {
      console.error("[GET /api/admin/users] Failed to fetch users:", error);
      console.error("[GET /api/admin/users] Error stack:", error.stack);
      res.status(500).json({ 
        message: "Failed to fetch users",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }
  });

  app.get("/api/admin/users/:id", async (req, res) => {
    try {
      if (!(await requireAdmin(req, res))) return;
      if (!(await blockNormalAdmin(req, res))) return;

      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get comprehensive client details (user + accounts + documents + logs)
  // Admin - Create MT5 accounts for a specific user
  app.post("/api/admin/mt5/accounts/create/:userId", async (req, res) => {
    try {
      if (!(await requireAdmin(req, res))) return;
      if (!(await blockNormalAdmin(req, res))) return;
      
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (process.env.MT5_ENABLED !== "true") {
        return res.status(400).json({ message: "MT5 integration is disabled" });
      }
      
      const results: any = {
        live: null,
        demo: null,
        errors: [],
      };
      
      // Create Live MT5 account if it doesn't exist
      if (!user.mt5LiveLogin) {
        try {
          console.log(`[Admin MT5] Creating Live MT5 account for user ${user.email}`);
          const liveMt5Result = await mt5Service.createAccount({
            name: user.fullName || user.username,
            email: user.email,
            group: process.env.MT5_GROUP_LIVE || "real",
            leverage: 100,
            country: user.country || "",
            currency: "USD",
          });
          
          await storage.updateUser(userId, {
            mt5LiveLogin: liveMt5Result.login,
            mt5LivePassword: liveMt5Result.password,
          });
          
          results.live = {
            login: liveMt5Result.login,
            password: liveMt5Result.password,
            server: "BinofoxLimited-Live",
          };
        } catch (mt5Error: any) {
          console.error(`[Admin MT5] Failed to create Live account:`, mt5Error);
          results.errors.push({ type: "live", error: mt5Error.message });
        }
      } else {
        results.live = {
          login: user.mt5LiveLogin,
          password: user.mt5LivePassword || "",
          server: "BinofoxLimited-Live",
        };
      }
      
      // Create Demo MT5 account if it doesn't exist
      if (!user.mt5DemoLogin) {
        try {
          console.log(`[Admin MT5] Creating Demo MT5 account for user ${user.email}`);
          const demoMt5Result = await mt5ServiceDemo.createAccount({
            name: user.fullName || user.username,
            email: user.email,
            group: process.env.MT5_GROUP_DEMO || "demo",
            leverage: 100,
            country: user.country || "",
            currency: "USD",
          });
          
          await storage.updateUser(userId, {
            mt5DemoLogin: demoMt5Result.login,
            mt5DemoPassword: demoMt5Result.password,
          });
          
          results.demo = {
            login: demoMt5Result.login,
            password: demoMt5Result.password,
            server: "BinofoxLimited-Demo",
          };
        } catch (mt5Error: any) {
          console.error(`[Admin MT5] Failed to create Demo account:`, mt5Error);
          results.errors.push({ type: "demo", error: mt5Error.message });
        }
      } else {
        results.demo = {
          login: user.mt5DemoLogin,
          password: user.mt5DemoPassword || "",
          server: "BinofoxLimited-Demo",
        };
      }
      
      res.json(results);
    } catch (error: any) {
      console.error("[Admin MT5 Create] Error:", error);
      res.status(500).json({ message: "Failed to create MT5 accounts", error: error.message });
    }
  });

  // Get all MT5 accounts with user information for admin
  app.get("/api/admin/mt5/accounts", async (req, res) => {
    try {
      if (!(await requireAdmin(req, res))) return;
      if (!(await blockNormalAdmin(req, res))) return;

      const allAccounts = await storage.getAllTradingAccounts();
      const allUsers = await storage.getAllUsers();

      // Map accounts with user information
      const accountsWithUsers = allAccounts.map((account) => {
        const user = allUsers.find((u) => u.id === account.userId);
        return {
          id: account.id,
          userId: account.userId,
          accountId: account.accountId,
          password: account.password,
          type: account.type,
          group: account.group,
          leverage: account.leverage,
          server: account.server,
          currency: account.currency || "USD",
          balance: account.balance || "0",
          equity: account.equity || "0",
          margin: account.margin || "0",
          freeMargin: account.freeMargin || "0",
          marginLevel: account.marginLevel || "0",
          createdAt: account.createdAt?.toISOString() || new Date().toISOString(),
          user: user
            ? {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                phone: user.phone,
                country: user.country,
              }
            : {
                id: account.userId,
                username: "Unknown",
                email: "Unknown",
                fullName: null,
                phone: null,
                country: null,
              },
        };
      });

      res.json(accountsWithUsers);
    } catch (error: any) {
      console.error("[GET /api/admin/mt5/accounts] Error:", error);
      res.status(500).json({ message: "Failed to fetch MT5 accounts" });
    }
  });

  // MT5 Connection Test and Diagnostics (Super Admin Only)
  app.get("/api/admin/mt5/test-connection", async (req, res) => {
    try {
      if (!(await requireAdmin(req, res))) return;
      if (!(await blockNormalAdmin(req, res))) return;
      
      // Only super admins can access MT5 diagnostics
      const adminSession = await storage.getAdminSessionByToken(req.cookies?.adminToken);
      if (!adminSession || adminSession.role !== "super_admin") {
        return res.status(403).json({ message: "Super admin access required" });
      }

      console.log("[MT5 Test] Testing MT5 connections...");
      
      // Test both live and demo connections in parallel
      const [liveResult, demoResult] = await Promise.all([
        validateMT5Connection('live'),
        validateMT5Connection('demo'),
      ]);
      
      // Current configuration
      const currentConfig = {
        enabled: process.env.MT5_ENABLED === "true",
        liveGroup: process.env.MT5_GROUP_LIVE || "real",
        demoGroup: process.env.MT5_GROUP_DEMO || "demo",
      };
      
      const response = {
        mt5Enabled: currentConfig.enabled,
        currentConfig,
        live: {
          ...liveResult,
          configuredGroup: currentConfig.liveGroup,
          groupExists: liveResult.groups.includes(currentConfig.liveGroup),
        },
        demo: {
          ...demoResult,
          configuredGroup: currentConfig.demoGroup,
          groupExists: demoResult.groups.includes(currentConfig.demoGroup),
        },
        recommendations: [] as string[],
      };
      
      // Add recommendations based on results
      if (!liveResult.connected) {
        response.recommendations.push(
          `Live MT5 connection failed: ${liveResult.errorDescription || liveResult.error}. ` +
          `Please verify MT5_SERVER_IP, MT5_SERVER_PORT, MT5_SERVER_WEB_LOGIN, and MT5_SERVER_WEB_PASSWORD in your configuration.`
        );
      } else if (!response.live.groupExists && liveResult.suggestedGroups.live) {
        response.recommendations.push(
          `Live group "${currentConfig.liveGroup}" not found. Suggested: "${liveResult.suggestedGroups.live}". ` +
          `Update MT5_GROUP_LIVE in ecosystem.config.cjs`
        );
      }
      
      if (!demoResult.connected) {
        response.recommendations.push(
          `Demo MT5 connection failed: ${demoResult.errorDescription || demoResult.error}. ` +
          `Please verify MT5_SERVER_IP_DEMO, MT5_SERVER_PORT_DEMO, MT5_SERVER_WEB_LOGIN_DEMO, and MT5_SERVER_WEB_PASSWORD_DEMO.`
        );
      } else if (!response.demo.groupExists && demoResult.suggestedGroups.demo) {
        response.recommendations.push(
          `Demo group "${currentConfig.demoGroup}" not found. Suggested: "${demoResult.suggestedGroups.demo}". ` +
          `Update MT5_GROUP_DEMO in ecosystem.config.cjs`
        );
      }
      
      console.log("[MT5 Test] Results:", {
        liveConnected: liveResult.connected,
        demoConnected: demoResult.connected,
        recommendations: response.recommendations.length,
      });
      
      res.json(response);
    } catch (error: any) {
      console.error("[MT5 Test Connection] Error:", error);
      res.status(500).json({ 
        message: "Failed to test MT5 connection", 
        error: error.message 
      });
    }
  });

  // MT5 Status endpoint (returns simple status for frontend)
  app.get("/api/mt5/status", async (req, res) => {
    try {
      const enabled = process.env.MT5_ENABLED === "true";
      
      if (!enabled) {
        return res.json({
          enabled: false,
          status: "disabled",
          message: "MT5 integration is currently disabled. Contact support for assistance.",
        });
      }
      
      // Quick connection test
      const liveResult = await validateMT5Connection('live');
      
      if (!liveResult.connected) {
        return res.json({
          enabled: true,
          status: "error",
          message: "MT5 server is temporarily unavailable. Please try again later or contact support.",
          errorCode: liveResult.errorCode,
        });
      }
      
      res.json({
        enabled: true,
        status: "connected",
        message: "MT5 trading accounts are available.",
      });
    } catch (error: any) {
      res.json({
        enabled: process.env.MT5_ENABLED === "true",
        status: "error",
        message: "Unable to verify MT5 status. Please contact support.",
      });
    }
  });

  app.get("/api/admin/users/:id/details", async (req, res) => {
    try {
      if (!(await requireAdmin(req, res))) return;
      if (!(await blockNormalAdmin(req, res))) return;

      const userId = req.params.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Fetch related data in parallel
      const [accounts, documents, allLogs, deposits, withdrawals, allFundTransfers, tradingHistory] = await Promise.all([
        storage.getTradingAccounts(userId),
        storage.getDocuments(userId),
        storage.getAllActivityLogs(),
        storage.getDeposits(userId),
        storage.getWithdrawals(userId),
        storage.getFundTransfers(),
        storage.getTradingHistory(userId), // Get all trading history for this user
      ]);

      // Filter logs for this user
      const userLogs = allLogs.filter(log => log.userId === userId);
      
      // Filter fund transfers for this user and separate internal/external
      const userAccounts = await storage.getTradingAccounts(userId);
      const accountIds = new Set(userAccounts.map(acc => acc.id));
      
      const userFundTransfers = allFundTransfers.filter(transfer => transfer.userId === userId);
      const internalTransfers = userFundTransfers.filter(transfer => 
        accountIds.has(transfer.fromAccountId) && accountIds.has(transfer.toAccountId)
      );
      const externalTransfers = userFundTransfers.filter(transfer => 
        !(accountIds.has(transfer.fromAccountId) && accountIds.has(transfer.toAccountId))
      );

      const { password, ...userWithoutPassword } = user;
      res.json({
        user: userWithoutPassword,
        accounts,
        documents,
        logs: userLogs,
        deposits,
        withdrawals,
        internalTransfers,
        externalTransfers,
        tradingHistory, // Include trading history
        rewards: [], // Placeholder for rewards - to be implemented
      });
    } catch (error) {
      console.error("Failed to fetch user details:", error);
      res.status(500).json({ message: "Failed to fetch user details" });
    }
  });

  app.patch("/api/admin/users/:id", async (req, res) => {
    try {
      // Debug: Log session info
      console.log("[PATCH /api/admin/users/:id] Session check:", {
        hasSession: !!req.session,
        adminId: req.session?.adminId,
        userId: req.session?.userId,
        sessionId: req.sessionID,
      });

      if (!(await requireAdmin(req, res))) {
        console.log("[PATCH /api/admin/users/:id] Admin authentication failed");
        return;
      }

      const adminId = getCurrentAdminId(req)!;
      const user = await storage.getUser(req.params.id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Don't allow password or id updates through this endpoint
      const { password, id, ...allowedUpdates } = req.body;

      const updated = await storage.updateUser(req.params.id, allowedUpdates);

      if (!updated) {
        return res.status(404).json({ message: "User not found" });
      }

      // Log activity
      await logActivity(
        adminId,
        "update_user",
        "user",
        req.params.id,
        `Updated user details: ${user.email}`
      );

      const { password: _, ...userWithoutPassword } = updated;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Failed to update user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Admin - Change user password
  app.patch("/api/admin/users/:id/password", async (req, res) => {
    try {
      if (!(await requireAdmin(req, res))) return;
      if (!(await blockNormalAdmin(req, res))) return;

      const adminId = getCurrentAdminId(req)!;
      const { password } = req.body;

      if (!password || password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
      }

      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10);
      await storage.updateUser(req.params.id, { password: hashedPassword });

      // Log activity
      await logActivity(
        adminId,
        "CHANGE_USER_PASSWORD",
        "user",
        req.params.id,
        `Changed password for user ${user.email}`,
        req.params.id,
        getClientIp(req)
      );

      res.json({ success: true, message: "Password changed successfully" });
    } catch (error) {
      console.error("Failed to change user password:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  // Admin - Set MT5 credentials for user (manual account creation)
  app.patch("/api/admin/users/:id/mt5-credentials", async (req, res) => {
    try {
      if (!(await requireAdmin(req, res))) return;
      if (!(await blockNormalAdmin(req, res))) return;

      const adminId = getCurrentAdminId(req)!;
      const { mt5LiveLogin, mt5LivePassword, mt5DemoLogin, mt5DemoPassword } = req.body;

      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const updates: any = {};
      
      if (mt5LiveLogin !== undefined) {
        updates.mt5LiveLogin = mt5LiveLogin || null;
      }
      if (mt5LivePassword !== undefined) {
        updates.mt5LivePassword = mt5LivePassword || null;
      }
      if (mt5DemoLogin !== undefined) {
        updates.mt5DemoLogin = mt5DemoLogin || null;
      }
      if (mt5DemoPassword !== undefined) {
        updates.mt5DemoPassword = mt5DemoPassword || null;
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "No MT5 credentials provided" });
      }

      const updated = await storage.updateUser(req.params.id, updates);

      if (!updated) {
        return res.status(404).json({ message: "User not found" });
      }

      // Log activity
      await logActivity(
        adminId,
        "SET_MT5_CREDENTIALS",
        "user",
        req.params.id,
        `Set MT5 credentials for user ${user.email}. Live: ${mt5LiveLogin || "N/A"}, Demo: ${mt5DemoLogin || "N/A"}`,
        req.params.id,
        getClientIp(req)
      );

      console.log(`[Admin] MT5 credentials set for user ${user.email} by admin ${adminId}`);

      const { password: _, ...userWithoutPassword } = updated;
      res.json({
        message: "MT5 credentials updated successfully",
        user: userWithoutPassword,
      });
    } catch (error) {
      console.error("Failed to set MT5 credentials:", error);
      res.status(500).json({ message: "Failed to set MT5 credentials" });
    }
  });

  // Update next of kin information
  app.patch("/api/admin/users/:id/next-of-kin", async (req, res) => {
    try {
      if (!(await requireAdmin(req, res))) return;
      if (!(await blockNormalAdmin(req, res))) return;

      const adminId = getCurrentAdminId(req)!;
      const user = await storage.getUser(req.params.id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Handle file upload if present (using multipart/form-data)
      // For now, we'll accept the file URL in the request body
      // In production, you'd want to use multer or similar for file uploads
      const { nextOfKinName, nextOfKinFile } = req.body;

      const updates: any = {};
      if (nextOfKinName !== undefined) {
        updates.nextOfKinName = nextOfKinName;
      }
      if (nextOfKinFile !== undefined) {
        updates.nextOfKinFile = nextOfKinFile;
      }

      const updated = await storage.updateUser(req.params.id, updates);

      if (!updated) {
        return res.status(404).json({ message: "User not found" });
      }

      // Log activity
      await logActivity(
        adminId,
        "update_next_of_kin",
        "user",
        req.params.id,
        `Updated next of kin information for user ${user.email}`
      );

      const { password: _, ...userWithoutPassword } = updated;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Failed to update next of kin:", error);
      res.status(500).json({ message: "Failed to update next of kin" });
    }
  });

  app.patch("/api/admin/users/:id/next-of-kin/approve", async (req, res) => {
    try {
      if (!(await requireAdmin(req, res))) return;
      if (!(await blockNormalAdmin(req, res))) return;

      const adminId = getCurrentAdminId(req)!;
      const user = await storage.getUser(req.params.id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!user.nextOfKinFile) {
        return res.status(400).json({ message: "No next of kin file to approve" });
      }

      await logActivity(
        adminId,
        "approve_next_of_kin",
        "user",
        req.params.id,
        `Approved next of kin file for user ${user.email}`
      );

      const { password: _, ...userWithoutPassword } = user;
      res.json({
        message: "Next of kin file approved successfully",
        user: userWithoutPassword,
      });
    } catch (error) {
      console.error("Failed to approve next of kin:", error);
      res.status(500).json({ message: "Failed to approve next of kin" });
    }
  });

  app.patch("/api/admin/users/:id/next-of-kin/reject", async (req, res) => {
    try {
      if (!(await requireAdmin(req, res))) return;
      if (!(await blockNormalAdmin(req, res))) return;

      const adminId = getCurrentAdminId(req)!;
      const user = await storage.getUser(req.params.id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { reason } = req.body;

      if (!user.nextOfKinFile) {
        return res.status(400).json({ message: "No next of kin file to reject" });
      }

      // Clear the next of kin file on rejection
      const updated = await storage.updateUser(req.params.id, {
        nextOfKinFile: null,
      });

      await logActivity(
        adminId,
        "reject_next_of_kin",
        "user",
        req.params.id,
        `Rejected next of kin file for user ${user.email}. Reason: ${reason || "Not specified"}`
      );

      if (!updated) {
        return res.status(404).json({ message: "User not found" });
      }
      const userWithoutPassword = { ...updated };
      delete (userWithoutPassword as any).password;
      res.json({
        message: "Next of kin file rejected successfully",
        user: userWithoutPassword,
      });
    } catch (error) {
      console.error("Failed to reject next of kin:", error);
      res.status(500).json({ message: "Failed to reject next of kin" });
    }
  });

  // Transfer account to next of kin
  app.post("/api/admin/users/:id/transfer-account", async (req, res) => {
    try {
      if (!(await requireAdmin(req, res))) return;
      if (!(await blockNormalAdmin(req, res))) return;

      const adminId = getCurrentAdminId(req)!;
      const userId = req.params.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!user.nextOfKinName) {
        return res.status(400).json({ message: "Next of kin name must be set before transferring account" });
      }

      const { accountId, nextOfKinName } = req.body;

      if (!accountId) {
        return res.status(400).json({ message: "Account ID is required" });
      }

      if (nextOfKinName !== user.nextOfKinName) {
        return res.status(400).json({ message: "Next of kin name does not match the registered next of kin" });
      }

      // Get the account
      const account = await storage.getTradingAccount(accountId);
      if (!account) {
        return res.status(404).json({ message: "Trading account not found" });
      }

      if (account.userId !== userId) {
        return res.status(403).json({ message: "Account does not belong to this user" });
      }

      // Find or create next of kin user
      // For now, we'll search by email pattern or create a placeholder
      // In production, you'd want a more robust system
      let nextOfKinUser = await storage.getUserByEmail(nextOfKinName.toLowerCase().replace(/\s+/g, '.') + '@nextofkin.local');
      
      if (!nextOfKinUser) {
        // Create a placeholder user for next of kin
        // In production, you'd want proper user creation with verification
        const nextOfKinUsername = nextOfKinName.toLowerCase().replace(/\s+/g, '_') + '_nok';
        nextOfKinUser = await storage.createUser({
          username: nextOfKinUsername,
          email: nextOfKinName.toLowerCase().replace(/\s+/g, '.') + '@nextofkin.local',
          password: randomUUID(), // Random password - should be reset by admin
          fullName: nextOfKinName,
        });
        // Disable the user after creation since enabled is not in InsertUser schema
        if (nextOfKinUser) {
          await storage.updateUser(nextOfKinUser.id, { enabled: false });
        }
      }

      // Transfer the account ownership
      await storage.updateTradingAccount(accountId, {
        userId: nextOfKinUser.id,
      });

      // Log activity
      await logActivity(
        adminId,
        "transfer_account_to_next_of_kin",
        "trading_account",
        accountId,
        `Transferred account ${account.accountId} from ${user.email} to next of kin: ${nextOfKinName}`
      );

      res.json({
        message: "Account transferred successfully",
        accountId: account.accountId,
        newOwnerId: nextOfKinUser.id,
        newOwnerName: nextOfKinName,
      });
    } catch (error) {
      console.error("Failed to transfer account:", error);
      res.status(500).json({ message: "Failed to transfer account" });
    }
  });

  app.patch("/api/admin/users/:id/toggle", async (req, res) => {
    try {
      if (!(await requireAdmin(req, res))) return;
      if (!(await blockNormalAdmin(req, res))) return;

      const adminId = getCurrentAdminId(req)!;
      const user = await storage.getUser(req.params.id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const newEnabledStatus = !user.enabled;
      const updated = await storage.updateUser(req.params.id, {
        enabled: newEnabledStatus,
      });

      if (!updated) {
        return res.status(404).json({ message: "User not found" });
      }

      // Log activity
      await logActivity(
        adminId,
        newEnabledStatus ? "enable_user" : "disable_user",
        "user",
        req.params.id,
        `User ${newEnabledStatus ? "enabled" : "disabled"}: ${user.email}`
      );

      const { password, ...userWithoutPassword } = updated;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Failed to toggle user:", error);
      res.status(500).json({ message: "Failed to toggle user status" });
    }
  });

  // Admin Document Management
  app.get("/api/admin/documents", async (req, res) => {
    try {
      if (!(await requireAdmin(req, res))) return;

      const adminId = getCurrentAdminId(req)!;
      const admin = await storage.getAdminUser(adminId);
      
      // Database already sorts by uploadedAt DESC, no need to sort again
      // This significantly improves performance for large datasets
      let documents = await storage.getAllDocuments();
      
      // Filter by assigned countries for middle admin
      const assignedCountries = await getAssignedCountriesForAdmin(adminId, admin!.role);
      if (assignedCountries && assignedCountries.length > 0) {
        // Get all users to filter documents by user country
        const allUsers = await storage.getAllUsers();
        const userMap = new Map(allUsers.map(u => [u.id, u]));
        const filteredUserIds = new Set(
          allUsers
            .filter(u => u.country && assignedCountries.includes(u.country))
            .map(u => u.id)
        );
        documents = documents.filter(doc => filteredUserIds.has(doc.userId));
      }
      
      res.json(documents);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  // Admin - Verify or reject document (all admin types can verify)
  // Delete documents by status (Clear All) - SUPER ADMIN ONLY
  // IMPORTANT: Documents are kept for legal/security purposes. Only super admins can delete.
  app.delete("/api/admin/documents/clear/:status", async (req, res) => {
    try {
      // Only super admins can delete documents for legal/security compliance
      if (!(await requireSuperAdmin(req, res))) return;

      const adminId = getCurrentAdminId(req)!;
      const status = req.params.status; // "Verified" or "Rejected"

      if (status !== "Verified" && status !== "Rejected") {
        return res.status(400).json({ message: "Invalid status. Only 'Verified' or 'Rejected' can be cleared." });
      }

      // Additional protection: Warn about deleting verified documents (legal records)
      if (status === "Verified") {
        const verifiedDocs = await storage.getAllDocuments();
        const verifiedCount = verifiedDocs.filter(d => d.status === "Verified").length;
        if (verifiedCount > 0) {
          console.warn(`[SECURITY] Super admin ${adminId} attempting to delete ${verifiedCount} verified documents. These are legal records.`);
        }
      }

      const deletedCount = await storage.deleteDocumentsByStatus(status);

      // If verified documents were deleted, we need to notify affected users
      // and update their verification status
      if (status === "Verified" && deletedCount > 0) {
        // Get all users who had verified documents
        const allDocuments = await storage.getAllDocuments();
        const affectedUserIds = new Set<string>();
        
        // Find users who had verified documents (before deletion)
        // We need to check which users now have fewer verified documents
        const usersWithDocs = await storage.getAllUsers();
        
        for (const user of usersWithDocs) {
          const userDocs = await storage.getDocuments(user.id);
          const verifiedDocs = userDocs.filter(doc => doc.status === "Verified");
          const requiredTypes = ["ID Proof"];
          const verifiedRequired = verifiedDocs.filter(doc => requiredTypes.includes(doc.type));
          
          // If user had verified status before but now doesn't meet requirements
          if (verifiedRequired.length < requiredTypes.length && userDocs.length > 0) {
            affectedUserIds.add(user.id);
            
            // Send notification to user
            await storage.createNotification({
              userId: user.id,
              title: "Document Verification Status Changed",
              message: "Some of your verified documents have been removed. Please upload new documents to maintain verification status.",
              type: "warning",
            });
          }
        }
        
        console.log(`[Clear Documents] Notified ${affectedUserIds.size} users about verification status change`);
      }

      // Log activity
      await logActivity(
        adminId,
        "CLEAR_DOCUMENTS",
        "document",
        null,
        `Cleared ${deletedCount} ${status.toLowerCase()} documents (SUPER ADMIN ACTION)`,
        null,
        getClientIp(req)
      );

      res.json({ 
        success: true, 
        deletedCount,
        message: `Successfully cleared ${deletedCount} ${status.toLowerCase()} documents` 
      });
    } catch (error) {
      console.error("Failed to clear documents:", error);
      res.status(500).json({ message: "Failed to clear documents" });
    }
  });

  // Delete single document - SUPER ADMIN ONLY
  // IMPORTANT: Documents are kept for legal/security purposes. Only super admins can delete.
  app.delete("/api/admin/documents/:id", async (req, res) => {
    try {
      // Only super admins can delete documents for legal/security compliance
      if (!(await requireSuperAdmin(req, res))) return;

      const adminId = getCurrentAdminId(req)!;
      const documentId = req.params.id;

      const document = await storage.getDocument(documentId);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      // Additional protection: Warn about deleting verified documents (legal records)
      if (document.status === "Verified") {
        console.warn(`[SECURITY] Super admin ${adminId} attempting to delete verified document ${documentId} (${document.type}) for user ${document.userId}. This is a legal record.`);
      }

      // Check verification status before deletion
      const userDocuments = await storage.getDocuments(document.userId);
      const requiredTypes = ["ID Proof"];
      const verifiedDocsBefore = userDocuments.filter(
        doc => doc.status === "Verified" && requiredTypes.includes(doc.type)
      );
      const wasVerified = verifiedDocsBefore.length >= requiredTypes.length;

      const deleted = await storage.deleteDocument(documentId);

      if (deleted) {
        // Check verification status after deletion
        const updatedUserDocuments = await storage.getDocuments(document.userId);
        const updatedVerifiedDocs = updatedUserDocuments.filter(
          doc => doc.status === "Verified" && requiredTypes.includes(doc.type)
        );
        const isNowVerified = updatedVerifiedDocs.length >= requiredTypes.length;

        // Log activity
        await logActivity(
          adminId,
          "DELETE_DOCUMENT",
          "document",
          documentId,
          `Deleted document: ${document.type} for user ${document.userId} (SUPER ADMIN ACTION)`,
          document.userId,
          getClientIp(req)
        );

        // Send notification if verification status changed
        if (wasVerified && !isNowVerified) {
          const user = await storage.getUser(document.userId);
          if (user) {
            await storage.createNotification({
              userId: document.userId,
              title: "Document Removed",
              message: "One of your verified documents was removed. Please upload new documents to maintain verification status.",
              type: "warning",
            });
          }
        }

        res.json({ success: true, message: "Document deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete document" });
      }
    } catch (error) {
      console.error("Failed to delete document:", error);
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  app.patch("/api/admin/documents/:id/verify", async (req, res) => {
    try {
      const canProceed = await requireAdmin(req, res);
      if (!canProceed) return;

      const adminId = getCurrentAdminId(req);
      const { status, rejectionReason } = req.body;

      if (!["Verified", "Rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      // Check verification status before update
      const userDocuments = await storage.getDocuments(document.userId);
      const requiredTypes = ["ID Proof"];
      const verifiedDocsBefore = userDocuments.filter(
        doc => doc.status === "Verified" && requiredTypes.includes(doc.type)
      );
      const wasVerified = verifiedDocsBefore.length >= requiredTypes.length;

      const updated = await storage.updateDocument(req.params.id, {
        status,
        verifiedAt: new Date(),
        rejectionReason: status === "Rejected" ? rejectionReason : null,
      });

      // Check verification status after update
      const updatedUserDocuments = await storage.getDocuments(document.userId);
      const updatedVerifiedDocs = updatedUserDocuments.filter(
        doc => doc.status === "Verified" && requiredTypes.includes(doc.type)
      );
      const isNowVerified = updatedVerifiedDocs.length >= requiredTypes.length;

      // Log activity
      await logActivity(
        adminId!,
        status === "Verified" ? "VERIFY_DOCUMENT" : "REJECT_DOCUMENT",
        "document",
        req.params.id,
        `Document ${document.type} ${status.toLowerCase()} for user ${document.userId}`
      );

      // Send notification if verification status changed
      if (status === "Verified" && !wasVerified && isNowVerified) {
        const user = await storage.getUser(document.userId);
        if (user) {
          await storage.createNotification({
            userId: document.userId,
            title: "🎉 Verification Complete!",
            message: "Your documents have been verified. You can now access all trading features.",
            type: "success",
          });

          // Create MT5 accounts (Live and Demo) after document verification
          if (process.env.MT5_ENABLED === "true") {
            console.log(`[MT5] User ${user.email} verified - creating MT5 accounts...`);
            
            // Create Live MT5 account if it doesn't exist
            if (!user.mt5LiveLogin) {
              try {
                console.log(`[MT5] Creating Live MT5 account for verified user ${user.email}`);
                const liveMt5Result = await mt5Service.createAccount({
                  name: user.fullName || user.username,
                  email: user.email,
                  group: process.env.MT5_GROUP_LIVE || "real", // Default group for verified users
                  leverage: 100, // Default leverage 1:100
                  country: user.country || "",
                  currency: "USD",
                });
                
                await storage.updateUser(document.userId, {
                  mt5LiveLogin: liveMt5Result.login,
                  mt5LivePassword: liveMt5Result.password,
                });
                
                console.log(`[MT5] Live account created for ${user.email}:`, {
                  login: liveMt5Result.login,
                  password: liveMt5Result.password.substring(0, 2) + "***",
                });
              } catch (mt5Error: any) {
                console.error(`[MT5] Failed to create Live account for ${user.email}:`, {
                  error: mt5Error.message,
                  fullError: mt5Error,
                });
                // Don't fail verification if MT5 fails - credentials can be created later
              }
            } else {
              console.log(`[MT5] User ${user.email} already has Live MT5 account:`, user.mt5LiveLogin);
            }

            // Create Demo MT5 account if it doesn't exist
            if (!user.mt5DemoLogin) {
              try {
                console.log(`[MT5] Creating Demo MT5 account for verified user ${user.email}`);
                const demoMt5Result = await mt5ServiceDemo.createAccount({
                  name: user.fullName || user.username,
                  email: user.email,
                  group: process.env.MT5_GROUP_LIVE || "real", // Default group for verified users
                  leverage: 100, // Default leverage 1:100
                  country: user.country || "",
                  currency: "USD",
                });
                
                await storage.updateUser(document.userId, {
                  mt5DemoLogin: demoMt5Result.login,
                  mt5DemoPassword: demoMt5Result.password,
                });
                
                console.log(`[MT5] Demo account created for ${user.email}:`, {
                  login: demoMt5Result.login,
                  password: demoMt5Result.password.substring(0, 2) + "***",
                });
              } catch (mt5Error: any) {
                console.error(`[MT5] Failed to create Demo account for ${user.email}:`, {
                  error: mt5Error.message,
                  fullError: mt5Error,
                });
                // Don't fail verification if MT5 fails - credentials can be created later
              }
            } else {
              console.log(`[MT5] User ${user.email} already has Demo MT5 account:`, user.mt5DemoLogin);
            }
          } else {
            console.log(`[MT5] MT5 is disabled - skipping account creation for ${user.email}`);
          }
        }
      } else if (status === "Rejected" && wasVerified && !isNowVerified) {
        const user = await storage.getUser(document.userId);
        if (user) {
          await storage.createNotification({
            userId: document.userId,
            title: "Verification Status Changed",
            message: "One of your verified documents was rejected. Please upload new documents to maintain verification status.",
            type: "warning",
          });
        }
      }

      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update document" });
    }
  });

  // Admin Deposit Management
  app.get("/api/admin/deposits", async (req, res) => {
    try {
      if (!(await requireAdmin(req, res))) return;

      const adminId = getCurrentAdminId(req)!;
      const admin = await storage.getAdminUser(adminId);
      
      // Normalize role for comparison
      const adminRole = String(admin!.role || "").trim().toLowerCase().replace(/[-\s_]+/g, "_");
      
      // Normal admins should NOT access financial data
      if (!(await blockNormalAdmin(req, res))) return;
      
      let deposits = await storage.getAllDeposits();
      
      // Filter deposits by assigned countries for middle admin
      const assignedCountries = await getAssignedCountriesForAdmin(adminId, admin!.role);
      if (assignedCountries && assignedCountries.length > 0) {
        // Get all users to filter deposits by user country
        const allUsers = await storage.getAllUsers();
        const filteredUserIds = new Set(
          allUsers
            .filter(u => u.country && assignedCountries.includes(u.country))
            .map(u => u.id)
        );
        deposits = deposits.filter(deposit => filteredUserIds.has(deposit.userId));
      }

      res.json(deposits);
    } catch (error) {
      console.error("Failed to fetch deposits:", error);
      res.status(500).json({ message: "Failed to fetch deposits" });
    }
  });

  app.patch("/api/admin/deposits/:id/approve", async (req, res) => {
    try {
      // Only super admin and middle admin can approve deposits
      if (!(await requireMiddleAdminOrSuper(req, res))) return;

      const adminId = getCurrentAdminId(req)!;
      const { amount } = req.body;

      const deposit = await storage.getDeposit(req.params.id);
      if (!deposit) {
        return res.status(404).json({ message: "Deposit not found" });
      }

      const depositAmount = amount ? parseFloat(amount) : parseFloat(deposit.amount);
      
      // Update deposit status
      const updated = await storage.updateDepositStatus(deposit.id, "Completed");

      // Add amount to trading account
      if (deposit.accountId) {
        const account = await storage.getTradingAccount(deposit.accountId);
        if (account) {
          const newBalance = (parseFloat(account.balance || "0") + depositAmount).toString();
          await storage.updateTradingAccount(deposit.accountId, { balance: newBalance });

          // Sync with MT5 if enabled
          if (process.env.MT5_ENABLED === "true" && account.type === "Live") {
            try {
              await mt5Service.updateBalance(
                account.accountId,
                depositAmount,
                `Deposit approved: ${deposit.id}`
              );
            } catch (mt5Error) {
              console.error("Failed to sync deposit with MT5:", mt5Error);
            }
          }
        }
      }

      // Credit commission to IB wallet if user was referred and referral is accepted
      const user = await storage.getUser(deposit.userId);
      if (user && user.referredBy && user.referralStatus === "Accepted") {
        try {
          const ibWallets = await storage.getIBCBWallets(user.referredBy);
          let ibWallet = ibWallets.find(w => w.walletType === "IB");
          
          if (!ibWallet) {
            // Create IB wallet if it doesn't exist
            ibWallet = await storage.createIBCBWallet({
              userId: user.referredBy,
              walletType: "IB",
              balance: "0",
              currency: "USD",
              commissionRate: "5.0",
              totalCommission: "0",
              enabled: true,
            });
          }

          // Calculate commission (default 5% or use wallet rate)
          const commissionRate = parseFloat(ibWallet.commissionRate || "5.0");
          const commission = depositAmount * (commissionRate / 100);
          
          // Update IB wallet balance and total commission
          const newBalance = (parseFloat(ibWallet.balance || "0") + commission).toString();
          const newTotalCommission = (parseFloat(ibWallet.totalCommission || "0") + commission).toString();
          
          await storage.updateIBCBWallet(ibWallet.id, {
            balance: newBalance,
            totalCommission: newTotalCommission,
            updatedAt: new Date(),
          });

          // Create notification for IB
          await storage.createNotification({
            userId: user.referredBy,
            title: "Commission Earned",
            message: `You earned $${commission.toFixed(2)} commission from ${user.fullName || user.email}'s deposit of $${depositAmount.toFixed(2)}.`,
            type: "success",
          });
          
          // Send IB commission email
          const ibUser = await storage.getUser(user.referredBy);
          if (ibUser?.email) {
            sendIBCommissionEmail(
              ibUser.email,
              ibUser.fullName || ibUser.username,
              commission.toFixed(2),
              user.fullName || user.email,
              "Deposit",
              depositAmount.toFixed(2)
            ).catch(err => console.error("Failed to send IB commission email:", err));
          }
        } catch (error) {
          console.error("Failed to credit IB commission:", error);
          // Don't fail the deposit approval if commission crediting fails
        }
      }

      // Log activity
      await logActivity(
        adminId,
        "approve_deposit",
        "deposit",
        deposit.id,
        `Approved deposit of $${depositAmount.toFixed(2)} for user ${deposit.userId}`
      );

      res.json(updated);
    } catch (error) {
      console.error("Failed to approve deposit:", error);
      res.status(500).json({ message: "Failed to approve deposit" });
    }
  });

  app.patch("/api/admin/deposits/:id/reject", async (req, res) => {
    try {
      // Only super admin and middle admin can reject deposits
      if (!(await requireMiddleAdminOrSuper(req, res))) return;

      const adminId = getCurrentAdminId(req)!;
      const deposit = await storage.getDeposit(req.params.id);
      
      if (!deposit) {
        return res.status(404).json({ message: "Deposit not found" });
      }

      const updated = await storage.updateDepositStatus(deposit.id, "Rejected");

      // Log activity
      await logActivity(
        adminId,
        "reject_deposit",
        "deposit",
        deposit.id,
        `Rejected deposit of $${deposit.amount} for user ${deposit.userId}`
      );

      res.json(updated);
    } catch (error) {
      console.error("Failed to reject deposit:", error);
      res.status(500).json({ message: "Failed to reject deposit" });
    }
  });

  // Admin - Get all withdrawals (RESTRICTED: Normal admins cannot access financial data)
  app.get("/api/admin/withdrawals", async (req, res) => {
    try {
      if (!(await requireAdmin(req, res))) return;

      const adminId = getCurrentAdminId(req)!;
      const admin = await storage.getAdminUser(adminId);
      
      // Normal admins should NOT access financial data
      if (!(await blockNormalAdmin(req, res))) return;
      
      // Filter withdrawals by assigned countries for middle admin
      let withdrawals = await storage.getAllWithdrawals();
      
      const assignedCountries = await getAssignedCountriesForAdmin(adminId, admin!.role);
      if (assignedCountries && assignedCountries.length > 0) {
        // Get all users to filter withdrawals by user country
        const allUsers = await storage.getAllUsers();
        const filteredUserIds = new Set(
          allUsers
            .filter(u => u.country && assignedCountries.includes(u.country))
            .map(u => u.id)
        );
        withdrawals = withdrawals.filter(withdrawal => filteredUserIds.has(withdrawal.userId));
      }

      res.json(withdrawals);
    } catch (error) {
      console.error("Failed to fetch withdrawals:", error);
      res.status(500).json({ message: "Failed to fetch withdrawals" });
    }
  });

  // Admin - Approve withdrawal
  app.patch("/api/admin/withdrawals/:id/approve", async (req, res) => {
    try {
      // Only super admin and middle admin can approve withdrawals
      if (!(await requireMiddleAdminOrSuper(req, res))) return;

      const adminId = getCurrentAdminId(req)!;
      const withdrawal = await storage.getWithdrawal(req.params.id);
      
      if (!withdrawal) {
        return res.status(404).json({ message: "Withdrawal not found" });
      }

      if (withdrawal.status !== "Pending") {
        return res.status(400).json({ message: `Withdrawal is already ${withdrawal.status}` });
      }

      // Get trading account
      const account = await storage.getTradingAccount(withdrawal.accountId);
      if (!account) {
        return res.status(404).json({ message: "Trading account not found" });
      }

      const withdrawalAmount = parseFloat(withdrawal.amount);
      const currentBalance = parseFloat(account.balance || "0");

      // Check if account has sufficient balance
      if (currentBalance < withdrawalAmount) {
        return res.status(400).json({ message: "Insufficient balance in trading account" });
      }

      // Deduct amount from trading account
      const newBalance = (currentBalance - withdrawalAmount).toString();
      await storage.updateTradingAccount(withdrawal.accountId, { balance: newBalance });

      // Sync with MT5 if enabled
      if (process.env.MT5_ENABLED === "true" && account.type === "Live") {
        try {
          await mt5Service.updateBalance(
            account.accountId,
            -withdrawalAmount,
            `Withdrawal approved: ${withdrawal.id}`
          );
        } catch (mt5Error) {
          console.error("Failed to sync withdrawal with MT5:", mt5Error);
        }
      }

      // Update withdrawal status to "Approved" (admin will manually send money)
      const updated = await storage.updateWithdrawal(withdrawal.id, {
        status: "Approved",
        processedAt: new Date(),
      });

      // Create notification for user
      await storage.createNotification({
        userId: withdrawal.userId,
        title: "Withdrawal Approved",
        message: `Your withdrawal request of $${withdrawalAmount.toFixed(2)} has been approved. Payment will be processed by admin shortly.`,
        type: "success",
      });

      // Send withdrawal approved email
      const user = await storage.getUser(withdrawal.userId);
      if (user?.email) {
        sendWithdrawalApprovedEmail(
          user.email,
          user.fullName || user.username,
          withdrawalAmount.toFixed(2),
          withdrawal.method
        ).catch(err => console.error("Failed to send withdrawal approved email:", err));
      }

      // Log activity
      await logActivity(
        adminId,
        "approve_withdrawal",
        "withdrawal",
        withdrawal.id,
        `Approved withdrawal of $${withdrawalAmount.toFixed(2)} for user ${withdrawal.userId}. Balance deducted. Admin must manually send payment.`
      );

      res.json(updated);
    } catch (error) {
      console.error("Failed to approve withdrawal:", error);
      res.status(500).json({ message: "Failed to approve withdrawal" });
    }
  });

  // Admin - Reject withdrawal
  app.patch("/api/admin/withdrawals/:id/reject", async (req, res) => {
    try {
      // Only super admin and middle admin can reject withdrawals
      if (!(await requireMiddleAdminOrSuper(req, res))) return;

      const adminId = getCurrentAdminId(req)!;
      const { reason } = req.body;
      
      if (!reason) {
        return res.status(400).json({ message: "Rejection reason is required" });
      }

      const withdrawal = await storage.getWithdrawal(req.params.id);
      
      if (!withdrawal) {
        return res.status(404).json({ message: "Withdrawal not found" });
      }

      if (withdrawal.status !== "Pending") {
        return res.status(400).json({ message: `Withdrawal is already ${withdrawal.status}` });
      }

      // Update withdrawal status
      const updated = await storage.updateWithdrawal(withdrawal.id, {
        status: "Rejected",
        rejectionReason: reason,
        processedAt: new Date(),
      });

      // Create notification for user
      await storage.createNotification({
        userId: withdrawal.userId,
        title: "Withdrawal Rejected",
        message: `Your withdrawal request of $${withdrawal.amount} was rejected: ${reason}`,
        type: "error",
      });

      // Send withdrawal rejected email
      const user = await storage.getUser(withdrawal.userId);
      if (user?.email) {
        sendWithdrawalRejectedEmail(
          user.email,
          user.fullName || user.username,
          withdrawal.amount,
          reason
        ).catch(err => console.error("Failed to send withdrawal rejected email:", err));
      }

      // Log activity
      await logActivity(
        adminId,
        "reject_withdrawal",
        "withdrawal",
        withdrawal.id,
        `Rejected withdrawal of $${withdrawal.amount} for user ${withdrawal.userId}: ${reason}`
      );

      res.json(updated);
    } catch (error) {
      console.error("Failed to reject withdrawal:", error);
      res.status(500).json({ message: "Failed to reject withdrawal" });
    }
  });

  // Admin - Mark withdrawal as completed (after manually sending payment)
  app.patch("/api/admin/withdrawals/:id/complete", async (req, res) => {
    try {
      // Only super admin and middle admin can mark as completed
      if (!(await requireMiddleAdminOrSuper(req, res))) return;

      const adminId = getCurrentAdminId(req)!;
      const withdrawal = await storage.getWithdrawal(req.params.id);
      
      if (!withdrawal) {
        return res.status(404).json({ message: "Withdrawal not found" });
      }

      if (withdrawal.status !== "Approved") {
        return res.status(400).json({ message: `Withdrawal must be Approved before marking as Completed. Current status: ${withdrawal.status}` });
      }

      // Update withdrawal status to Completed
      const updated = await storage.updateWithdrawal(withdrawal.id, {
        status: "Completed",
        processedAt: new Date(),
      });

      // Create notification for user
      await storage.createNotification({
        userId: withdrawal.userId,
        title: "Withdrawal Completed",
        message: `Your withdrawal of $${withdrawal.amount} has been processed and payment has been sent.`,
        type: "success",
      });

      // Log activity
      await logActivity(
        adminId,
        "complete_withdrawal",
        "withdrawal",
        withdrawal.id,
        `Marked withdrawal of $${withdrawal.amount} as completed for user ${withdrawal.userId}. Payment sent by admin.`
      );

      res.json(updated);
    } catch (error) {
      console.error("Failed to complete withdrawal:", error);
      res.status(500).json({ message: "Failed to complete withdrawal" });
    }
  });

  // Admin - Add funds to user account (super admin feature)
  app.post("/api/admin/users/:userId/add-funds", async (req, res) => {
    try {
      const canProceed = await requireSuperAdmin(req, res);
      if (!canProceed) return;

      const adminId = getCurrentAdminId(req);
      const { tradingAccountId, amount, reason } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      const account = await storage.getTradingAccount(tradingAccountId);
      if (!account) {
        return res.status(404).json({ message: "Trading account not found" });
      }

      if (account.userId !== req.params.userId) {
        return res.status(400).json({ message: "Account does not belong to user" });
      }

      // Add funds to account
      const newBalance = (parseFloat(account.balance || "0") + parseFloat(amount)).toString();
      await storage.updateTradingAccount(tradingAccountId, { balance: newBalance });

      // Create deposit record
      await storage.createDeposit({
        userId: req.params.userId,
        accountId: tradingAccountId,
        merchant: "Admin Credit",
        amount: amount.toString(),
        status: "Approved",
        transactionId: `ADMIN-${Date.now()}`,
      });

      // Log activity
      await logActivity(
        adminId!,
        "ADD_FUNDS",
        "user",
        req.params.userId,
        `Added $${amount} to account ${account.accountId}. Reason: ${reason || "N/A"}`
      );

      res.json({ message: "Funds added successfully", newBalance });
    } catch (error) {
      res.status(500).json({ message: "Failed to add funds" });
    }
  });

  // Admin - Remove funds from user account (super admin feature)
  app.post("/api/admin/users/:userId/remove-funds", async (req, res) => {
    try {
      const canProceed = await requireSuperAdmin(req, res);
      if (!canProceed) return;

      const adminId = getCurrentAdminId(req);
      const { tradingAccountId, amount, reason } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      const account = await storage.getTradingAccount(tradingAccountId);
      if (!account) {
        return res.status(404).json({ message: "Trading account not found" });
      }

      if (account.userId !== req.params.userId) {
        return res.status(400).json({ message: "Account does not belong to user" });
      }

      const currentBalance = parseFloat(account.balance || "0");
      if (currentBalance < parseFloat(amount)) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      // Remove funds from account
      const newBalance = (currentBalance - parseFloat(amount)).toString();
      await storage.updateTradingAccount(tradingAccountId, { balance: newBalance });

      // Log activity
      await logActivity(
        adminId!,
        "REMOVE_FUNDS",
        "user",
        req.params.userId,
        `Removed $${amount} from account ${account.accountId}. Reason: ${reason || "N/A"}`
      );

      res.json({ message: "Funds removed successfully", newBalance });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove funds" });
    }
  });

  // Admin - Impersonate user (super admin only)
  app.post("/api/admin/users/:userId/impersonate", async (req, res) => {
    try {
      // Allow super admin and middle admin to impersonate
      const canProceed = await requireMiddleAdminOrSuper(req, res);
      if (!canProceed) return;

      const adminId = getCurrentAdminId(req);
      const user = await storage.getUser(req.params.userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Store current admin ID and switch to user session
      req.session.originalAdminId = adminId;
      req.session.userId = user.id;
      req.session.adminId = undefined;

      // Log activity
      await logActivity(
        adminId!,
        "IMPERSONATE_USER",
        "user",
        req.params.userId,
        `Admin impersonating user ${user.email}`
      );

      res.json({ 
        message: "Impersonation started",
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to impersonate user" });
    }
  });

  // Admin - Stop impersonating user
  app.post("/api/admin/stop-impersonation", async (req, res) => {
    try {
      const originalAdminId = req.session.originalAdminId;
      
      if (!originalAdminId) {
        return res.status(400).json({ message: "Not currently impersonating" });
      }

      // Restore admin session
      req.session.adminId = originalAdminId;
      req.session.userId = undefined;
      req.session.originalAdminId = undefined;

      res.json({ message: "Impersonation ended" });
    } catch (error) {
      res.status(500).json({ message: "Failed to stop impersonation" });
    }
  });

  app.patch("/api/admin/documents/:id/approve", async (req, res) => {
    try {
      if (!(await requireAdmin(req, res))) return;

      const adminId = getCurrentAdminId(req)!;
      const document = await storage.getDocument(req.params.id);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      const updated = await storage.updateDocument(req.params.id, {
        status: "Verified",
        approvedBy: adminId,
        verifiedAt: new Date(),
      });

      if (!updated) {
        return res.status(404).json({ message: "Document not found" });
      }

      // Check if user is now fully verified
      const userDocuments = await storage.getDocuments(document.userId);
      const requiredTypes = ["ID Proof"];
      const verifiedDocs = userDocuments.filter(
        doc => doc.status === "Verified" && requiredTypes.includes(doc.type)
      );
      const isNowVerified = verifiedDocs.length >= requiredTypes.length;

      // Create notification for user
      await storage.createNotification({
        userId: document.userId,
        title: isNowVerified ? "🎉 Verification Complete!" : "Document Approved",
        message: isNowVerified 
          ? "Your identity has been verified. You can now access all trading features!"
          : `Your ${document.type} has been verified.`,
        type: "success",
      });

      // Send document verified email
      const user = await storage.getUser(document.userId);
      if (user?.email) {
        sendDocumentVerifiedEmail(
          user.email,
          user.fullName || user.username,
          document.type,
          isNowVerified
        ).catch(err => console.error("Failed to send document verified email:", err));
      }

      // Log activity
      await logActivity(
        adminId,
        "approve_document",
        "document",
        req.params.id,
        `Approved ${document.type} for user ${document.userId}${isNowVerified ? " - User is now fully verified" : ""}`
      );

      res.json({
        ...updated,
        isUserVerified: isNowVerified, // Include verification status in response
      });
    } catch (error) {
      console.error("Failed to approve document:", error);
      res.status(500).json({ message: "Failed to approve document" });
    }
  });

  app.patch("/api/admin/documents/:id/reject", async (req, res) => {
    try {
      if (!(await requireAdmin(req, res))) return;

      const adminId = getCurrentAdminId(req)!;
      const { reason } = req.body;
      
      if (!reason) {
        return res.status(400).json({ message: "Rejection reason is required" });
      }

      const document = await storage.getDocument(req.params.id);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      const updated = await storage.updateDocument(req.params.id, {
        status: "Rejected",
        rejectionReason: reason,
      });

      if (!updated) {
        return res.status(404).json({ message: "Document not found" });
      }

      // Create notification for user
      await storage.createNotification({
        userId: document.userId,
        title: "Document Rejected",
        message: `Your ${document.type} was rejected: ${reason}`,
        type: "error",
      });

      // Send document rejected email
      const user = await storage.getUser(document.userId);
      if (user?.email) {
        sendDocumentRejectedEmail(
          user.email,
          user.fullName || user.username,
          document.type,
          reason
        ).catch(err => console.error("Failed to send document rejected email:", err));
      }

      // Log activity
      await logActivity(
        adminId,
        "reject_document",
        "document",
        req.params.id,
        `Rejected ${document.type} for user ${document.userId}: ${reason}`
      );

      res.json(updated);
    } catch (error) {
      console.error("Failed to reject document:", error);
      res.status(500).json({ message: "Failed to reject document" });
    }
  });

  // Admin Management (Super Admin only)
  app.post("/api/admin/admins", async (req, res) => {
    try {
      if (!(await requireSuperAdmin(req, res))) return;

      const adminId = getCurrentAdminId(req)!;
      const { username, password, email, fullName, role, countries } = req.body;
      
      if (!username || !password || !email || !fullName || !role) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Validate role
      const validRoles = ["super_admin", "middle_admin", "normal_admin"];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role. Must be super_admin, middle_admin, or normal_admin" });
      }

      // Validate countries for middle_admin
      if (role === "middle_admin") {
        if (!countries || !Array.isArray(countries) || countries.length === 0) {
          return res.status(400).json({ message: "At least one country is required for middle admin" });
        }
      }

      // Check if admin already exists
      const existingAdmin = await storage.getAdminUserByUsername(username);
      if (existingAdmin) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getAdminUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const validatedData = insertAdminUserSchema.parse({
        username,
        password: hashedPassword,
        email,
        fullName,
        role,
        enabled: true,
        createdBy: adminId,
      });
      
      const newAdmin = await storage.createAdminUser(validatedData);

      // Create country assignments for middle_admin
      const createdCountries: any[] = [];
      if (role === "middle_admin" && countries && Array.isArray(countries)) {
        for (const country of countries) {
          try {
            const assignment = await storage.createAdminCountryAssignment({
              adminId: newAdmin.id,
              country: country,
            });
            createdCountries.push(assignment);
          } catch (error) {
            console.error(`Failed to assign country ${country}:`, error);
            // Continue with other countries
          }
        }
      }

      // Log activity
      const activityDetails = role === "middle_admin" && createdCountries.length > 0
        ? `Created ${role} admin: ${username} with countries: ${createdCountries.map(c => c.country).join(", ")}`
        : `Created ${role} admin: ${username}`;
      
      await logActivity(
        adminId,
        "create_admin",
        "admin",
        newAdmin.id,
        activityDetails
      );

      const { password: _, ...adminWithoutPassword } = newAdmin;
      res.status(201).json({
        admin: adminWithoutPassword,
        countries: createdCountries,
        credentials: {
          username: username,
          password: password, // Return password only on creation
        }
      });
    } catch (error) {
      console.error("Failed to create admin:", error);
      res.status(400).json({ message: "Failed to create admin" });
    }
  });

  // Delete admin (only super admin can delete other admins)
  app.delete("/api/admin/admins/:id", async (req, res) => {
    try {
      if (!(await requireSuperAdmin(req, res))) return;

      const adminId = getCurrentAdminId(req)!;
      const targetAdminId = req.params.id;

      // Prevent self-deletion
      if (adminId === targetAdminId) {
        return res.status(400).json({ message: "You cannot delete your own account" });
      }

      const targetAdmin = await storage.getAdminUser(targetAdminId);
      if (!targetAdmin) {
        return res.status(404).json({ message: "Admin not found" });
      }

      // Prevent deleting super admins (only allow deleting normal and middle admins)
      const targetRole = String(targetAdmin.role || "").trim().toLowerCase().replace(/[-\s_]+/g, "_");
      if (targetRole === "super_admin" || targetRole === "superadmin") {
        return res.status(403).json({ message: "Cannot delete super admin accounts" });
      }

      const deleted = await storage.deleteAdminUser(targetAdminId);

      if (deleted) {
        // Log activity
        await logActivity(
          adminId,
          "DELETE_ADMIN",
          "admin",
          targetAdminId,
          `Deleted admin: ${targetAdmin.username} (${targetAdmin.role})`
        );

        res.json({ 
          success: true, 
          message: `Admin ${targetAdmin.username} has been deleted successfully` 
        });
      } else {
        res.status(500).json({ message: "Failed to delete admin" });
      }
    } catch (error) {
      console.error("Failed to delete admin:", error);
      res.status(500).json({ message: "Failed to delete admin" });
    }
  });

  app.get("/api/admin/admins", async (req, res) => {
    try {
      if (!(await requireSuperAdmin(req, res))) return;

      const admins = await storage.getAllAdminUsers();
      const adminsWithoutPasswords = admins.map(({ password, ...admin }) => admin);
      res.json(adminsWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch admins" });
    }
  });

  // Get all country assignments (for super admin to see all)
  app.get("/api/admin/all-country-assignments", async (req, res) => {
    try {
      if (!(await requireSuperAdmin(req, res))) return;

      const allAdmins = await storage.getAllAdminUsers();
      const middleAdmins = allAdmins.filter(a => a.role === "middle_admin");
      
      const allAssignments: Array<{ adminId: string; country: string }> = [];
      for (const admin of middleAdmins) {
        const assignments = await storage.getAdminCountryAssignments(admin.id);
        assignments.forEach(assignment => {
          allAssignments.push({
            adminId: admin.id,
            country: assignment.country,
          });
        });
      }
      
      res.json(allAssignments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch country assignments" });
    }
  });

  app.patch("/api/admin/admins/:id", async (req, res) => {
    try {
      if (!(await requireSuperAdmin(req, res))) return;

      const adminId = getCurrentAdminId(req)!;
      const { password, id, ...allowedUpdates } = req.body;
      
      // Hash password if provided
      if (password) {
        allowedUpdates.password = await bcrypt.hash(password, 10);
      }

      const updated = await storage.updateAdminUser(req.params.id, allowedUpdates);
      if (!updated) {
        return res.status(404).json({ message: "Admin not found" });
      }

      // Log activity
      await logActivity(
        adminId,
        "update_admin",
        "admin",
        req.params.id,
        `Updated admin: ${updated.username}`
      );

      const { password: _, ...adminWithoutPassword } = updated;
      res.json(adminWithoutPassword);
    } catch (error) {
      console.error("Failed to update admin:", error);
      res.status(500).json({ message: "Failed to update admin" });
    }
  });

  app.post("/api/admin/admins/:id/countries", async (req, res) => {
    try {
      if (!(await requireSuperAdmin(req, res))) return;

      const adminId = getCurrentAdminId(req)!;
      const { country } = req.body;
      
      if (!country) {
        return res.status(400).json({ message: "Country is required" });
      }

      const targetAdmin = await storage.getAdminUser(req.params.id);
      if (!targetAdmin) {
        return res.status(404).json({ message: "Admin not found" });
      }

      if (targetAdmin.role !== "middle_admin") {
        return res.status(400).json({ message: "Can only assign countries to middle admins" });
      }

      const validatedData = insertAdminCountryAssignmentSchema.parse({
        adminId: req.params.id,
        country,
      });

      const assignment = await storage.createAdminCountryAssignment(validatedData);

      // Log activity
      await logActivity(
        adminId,
        "assign_country",
        "admin",
        req.params.id,
        `Assigned country ${country} to ${targetAdmin.username}`
      );

      res.status(201).json(assignment);
    } catch (error) {
      console.error("Failed to assign country:", error);
      res.status(400).json({ message: "Failed to assign country" });
    }
  });

  app.delete("/api/admin/admins/:id/countries/:country", async (req, res) => {
    try {
      if (!(await requireSuperAdmin(req, res))) return;

      const adminId = getCurrentAdminId(req)!;
      
      await storage.deleteAdminCountryAssignment(req.params.id, req.params.country);

      // Log activity
      await logActivity(
        adminId,
        "remove_country",
        "admin",
        req.params.id,
        `Removed country ${req.params.country} from admin`
      );

      res.json({ success: true });
    } catch (error) {
      console.error("Failed to remove country:", error);
      res.status(500).json({ message: "Failed to remove country assignment" });
    }
  });

  // Admin Trading Accounts
  app.get("/api/admin/trading-accounts", async (req, res) => {
    try {
      if (!(await requireAdmin(req, res))) return;
      if (!(await blockNormalAdmin(req, res))) return;

      const adminId = getCurrentAdminId(req)!;
      const admin = await storage.getAdminUser(adminId);
      
      // Filter trading accounts by assigned countries for middle admin
      let accounts = await storage.getAllTradingAccounts();
      
      const assignedCountries = await getAssignedCountriesForAdmin(adminId, admin!.role);
      if (assignedCountries && assignedCountries.length > 0) {
        // Get all users to filter accounts by user country
        const allUsers = await storage.getAllUsers();
        const userMap = new Map(allUsers.map(u => [u.id, u]));
        const filteredUserIds = new Set(
          allUsers
            .filter(u => u.country && assignedCountries.includes(u.country))
            .map(u => u.id)
        );
        accounts = accounts.filter(account => filteredUserIds.has(account.userId));
      }

      res.json(accounts);
    } catch (error) {
      console.error("Failed to fetch trading accounts:", error);
      res.status(500).json({ message: "Failed to fetch trading accounts" });
    }
  });

  // Delete trading account (admin only)
  app.delete("/api/admin/trading-accounts/:id", async (req, res) => {
    try {
      if (!(await requireAdmin(req, res))) return;
      if (!(await blockNormalAdmin(req, res))) return;

      const adminId = getCurrentAdminId(req)!;
      const account = await storage.getTradingAccount(req.params.id);

      if (!account) {
        return res.status(404).json({ message: "Trading account not found" });
      }

      // Delete the account
      await storage.deleteTradingAccount(req.params.id);

      // Log activity
      await logActivity(
        adminId,
        "delete_trading_account",
        "trading_account",
        req.params.id,
        `Deleted trading account ${account.accountId}`
      );

      res.json({ message: "Trading account deleted successfully" });
    } catch (error) {
      console.error("Failed to delete trading account:", error);
      res.status(500).json({ message: "Failed to delete trading account" });
    }
  });

  app.patch("/api/admin/trading-accounts/:id/toggle", async (req, res) => {
    try {
      if (!(await requireAdmin(req, res))) return;
      if (!(await blockNormalAdmin(req, res))) return;

      const adminId = getCurrentAdminId(req)!;
      const account = await storage.getTradingAccount(req.params.id);
      
      if (!account) {
        return res.status(404).json({ message: "Trading account not found" });
      }

      const newEnabledStatus = !account.enabled;
      const updated = await storage.updateTradingAccount(req.params.id, {
        enabled: newEnabledStatus,
      });

      if (!updated) {
        return res.status(404).json({ message: "Trading account not found" });
      }

      // Log activity
      await logActivity(
        adminId,
        newEnabledStatus ? "enable_trading_account" : "disable_trading_account",
        "trading_account",
        req.params.id,
        `Trading account ${account.accountId} ${newEnabledStatus ? "enabled" : "disabled"}`
      );

      res.json(updated);
    } catch (error) {
      console.error("Failed to toggle trading account:", error);
      res.status(500).json({ message: "Failed to toggle trading account" });
    }
  });

  // Activity Logs
  app.get("/api/admin/activity-logs", async (req, res) => {
    try {
      if (!(await requireAdmin(req, res))) return;
      if (!(await blockNormalAdmin(req, res))) return;

      const adminId = getCurrentAdminId(req)!;
      const admin = await storage.getAdminUser(adminId);
      
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }

      let logs;
      // Normalize role for comparison
      const adminRole = String(admin.role || "").trim().toLowerCase().replace(/[-\s_]+/g, "_");
      if (adminRole === "super_admin" || adminRole === "superadmin") {
        logs = await storage.getAllActivityLogs();
      } else {
        logs = await storage.getActivityLogs(adminId);
      }

      // Ensure logs are sorted by createdAt descending (newest first)
      logs = logs.sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });

      res.json(logs);
    } catch (error) {
      console.error("Failed to fetch activity logs:", error);
      res.status(500).json({ message: "Failed to fetch activity logs" });
    }
  });

  // Admin Statistics
  // Admin - Account Types Stats
  app.get("/api/admin/accounts/stats", async (req, res) => {
    try {
      if (!(await requireAdmin(req, res))) return;
      if (!(await blockNormalAdmin(req, res))) return;

      const adminId = getCurrentAdminId(req)!;
      const admin = await storage.getAdminUser(adminId);
      
      let accounts;

      // Normalize role for comparison
      const adminRole = String(admin!.role || "").trim().toLowerCase().replace(/[-\s_]+/g, "_");
      
      // Get assigned countries for middle admin (null for super admin)
      const assignedCountries = await getAssignedCountriesForAdmin(adminId, admin!.role);
      
      // Get all trading accounts
      let allAccounts = await storage.getAllTradingAccounts();
      
      // Filter accounts by assigned countries for middle admin
      if (assignedCountries && assignedCountries.length > 0) {
        // Get all users to filter accounts by user country
        const allUsers = await storage.getAllUsers();
        const userMap = new Map(allUsers.map(u => [u.id, u]));
        const filteredUserIds = new Set(
          allUsers
            .filter(u => u.country && assignedCountries.includes(u.country))
            .map(u => u.id)
        );
        accounts = allAccounts.filter(account => filteredUserIds.has(account.userId));
      } else {
        accounts = allAccounts;
      }

      // Count by account type/group combinations - only enabled accounts (active usage)
      // Filter to only enabled accounts first (real-time based on actual user usage)
      // Handle both boolean (PostgreSQL) and integer (SQLite) enabled values
      const activeAccounts = accounts.filter(a => {
        const enabled = a.enabled;
        if (enabled === true) return true;
        if (typeof enabled === 'number' && enabled === 1) return true;
        const enabledStr = String(enabled);
        if (typeof enabled === 'string' || enabled === null || enabled === undefined) {
          return enabledStr === "1" || enabledStr.toLowerCase() === "true";
        }
        return false;
      });
      
      // Live Accounts: accounts with type "Live" (active trading accounts)
      const liveAccounts = activeAccounts.filter(a => 
        a.type?.toLowerCase() === "live" || 
        a.type === "Live"
      ).length;
      
      // IB Accounts: accounts with group "IB" or type "IB" (Introducing Broker accounts)
      const ibAccounts = activeAccounts.filter(a => 
        a.group?.toLowerCase() === "ib" || 
        a.type?.toLowerCase() === "ib" ||
        a.group === "IB" || 
        a.type === "IB"
      ).length;
      
      // Champion Accounts: accounts with group "Champion" or type "Champion" (Premium tier)
      const championAccounts = activeAccounts.filter(a => 
        a.group?.toLowerCase() === "champion" || 
        a.type?.toLowerCase() === "champion" ||
        a.group === "Champion" || 
        a.type === "Champion"
      ).length;
      
      // NDB Accounts: No Deposit Bonus accounts (type "Bonus" or group "NDB")
      const ndbAccounts = activeAccounts.filter(a => 
        a.type?.toLowerCase() === "bonus" || 
        a.group?.toLowerCase() === "ndb" || 
        a.type?.toLowerCase() === "ndb" ||
        a.type === "Bonus" || 
        a.group === "NDB" || 
        a.type === "NDB"
      ).length;
      
      // Social Trading Accounts: accounts with group "Social" or type "Social" (Copy trading)
      const socialTradingAccounts = activeAccounts.filter(a => 
        a.group?.toLowerCase() === "social" || 
        a.type?.toLowerCase() === "social" ||
        a.group === "Social" || 
        a.type === "Social" ||
        a.group?.toLowerCase().includes("social") ||
        a.type?.toLowerCase().includes("social")
      ).length;
      
      // Bonus Shifting Accounts: accounts with group "Bonus" but type is not "Bonus" (bonus transfers)
      const bonusShiftingAccounts = activeAccounts.filter(a => 
        (a.group?.toLowerCase() === "bonus" || a.group === "Bonus") && 
        a.type?.toLowerCase() !== "bonus" && 
        a.type !== "Bonus"
      ).length;

      res.json({
        liveAccounts,
        ibAccounts,
        championAccounts,
        ndbAccounts,
        socialTradingAccounts,
        bonusShiftingAccounts,
      });
    } catch (error) {
      console.error("Failed to fetch account stats:", error);
      res.status(500).json({ message: "Failed to fetch account statistics" });
    }
  });

  app.get("/api/admin/stats", async (req, res) => {
    try {
      if (!(await requireAdmin(req, res))) return;

      const adminId = getCurrentAdminId(req)!;
      const admin = await storage.getAdminUser(adminId);
      
      if (!admin) {
        console.error("[Admin Stats] Admin not found:", adminId);
        return res.status(404).json({ message: "Admin not found" });
      }
      
      let users: User[] = [];
      let documents: DbDocument[] = [];
      let accounts: TradingAccount[] = [];
      let deposits: Deposit[] = [];
      let withdrawals: Withdrawal[] = [];
      let pendingDocumentsCount = 0;
      let verifiedDocumentsCount = 0;
      let rejectedDocumentsCount = 0;

      // Normalize role for comparison
      const adminRole = String(admin!.role || "").trim().toLowerCase().replace(/[-\s_]+/g, "_");
      const isNormalAdmin = adminRole === "normal_admin" || adminRole === "normaladmin";
      
      console.log(`[Admin Stats] Fetching stats for admin: ${admin.username}, role: ${adminRole}`);
      
      if (adminRole === "super_admin" || adminRole === "superadmin" || adminRole === "middle_admin" || adminRole === "middleadmin") {
        // Get assigned countries for middle admin (null for super admin)
        const assignedCountries = await getAssignedCountriesForAdmin(adminId, admin!.role);
        
        try {
          let allUsers = await storage.getAllUsers();
          // Filter users by assigned countries for middle admin
          if (assignedCountries && assignedCountries.length > 0) {
            users = allUsers.filter(user => user.country && assignedCountries.includes(user.country));
          } else {
            users = allUsers;
          }
          console.log(`[Admin Stats] Fetched ${users.length} users${assignedCountries ? ` (filtered by ${assignedCountries.length} countries)` : ''}`);
        } catch (error) {
          console.error("[Admin Stats] Error fetching users:", error);
          users = [];
        }
        
        try {
          // Optimize: Use getPendingDocuments() which has WHERE clause in DB query
          let pendingDocs = await storage.getPendingDocuments();
          // Filter pending documents by assigned countries for middle admin
          if (assignedCountries && assignedCountries.length > 0) {
            const userMap = new Map(users.map(u => [u.id, u]));
            pendingDocs = pendingDocs.filter(doc => {
              const user = userMap.get(doc.userId);
              return user && user.country && assignedCountries.includes(user.country);
            });
          }
          pendingDocumentsCount = pendingDocs.length;
          console.log(`[Admin Stats] Fetched ${pendingDocumentsCount} pending documents`);
        } catch (error) {
          console.error("[Admin Stats] Error fetching pending documents:", error);
        }
        
        try {
          // Still need all documents for verified/rejected counts
          let allDocuments = await storage.getAllDocuments();
          // Filter documents by assigned countries for middle admin
          if (assignedCountries && assignedCountries.length > 0) {
            const userMap = new Map(users.map(u => [u.id, u]));
            documents = allDocuments.filter(doc => {
              const user = userMap.get(doc.userId);
              return user && user.country && assignedCountries.includes(user.country);
            });
          } else {
            documents = allDocuments;
          }
          verifiedDocumentsCount = documents.filter(d => d.status === "Verified").length;
          rejectedDocumentsCount = documents.filter(d => d.status === "Rejected").length;
          console.log(`[Admin Stats] Fetched ${documents.length} total documents (${verifiedDocumentsCount} verified, ${rejectedDocumentsCount} rejected)`);
        } catch (error) {
          console.error("[Admin Stats] Error fetching documents:", error);
          documents = [];
        }
        
        try {
          let allAccounts = await storage.getAllTradingAccounts();
          // Filter accounts by assigned countries for middle admin
          if (assignedCountries && assignedCountries.length > 0) {
            const userMap = new Map(users.map(u => [u.id, u]));
            accounts = allAccounts.filter(account => {
              const user = userMap.get(account.userId);
              return user && user.country && assignedCountries.includes(user.country);
            });
          } else {
            accounts = allAccounts;
          }
          console.log(`[Admin Stats] Fetched ${accounts.length} trading accounts`);
        } catch (error) {
          console.error("[Admin Stats] Error fetching trading accounts:", error);
          accounts = [];
        }
        
        try {
          let allDeposits = await storage.getAllDeposits();
          // Filter deposits by assigned countries for middle admin
          if (assignedCountries && assignedCountries.length > 0) {
            const userMap = new Map(users.map(u => [u.id, u]));
            deposits = allDeposits.filter(deposit => {
              const user = userMap.get(deposit.userId);
              return user && user.country && assignedCountries.includes(user.country);
            });
          } else {
            deposits = allDeposits;
          }
          console.log(`[Admin Stats] Fetched ${deposits.length} deposits`);
        } catch (error) {
          console.error("[Admin Stats] Error fetching deposits:", error);
          deposits = [];
        }
        
        try {
          let allWithdrawals = await storage.getAllWithdrawals();
          // Filter withdrawals by assigned countries for middle admin
          if (assignedCountries && assignedCountries.length > 0) {
            const userMap = new Map(users.map(u => [u.id, u]));
            withdrawals = allWithdrawals.filter(withdrawal => {
              const user = userMap.get(withdrawal.userId);
              return user && user.country && assignedCountries.includes(user.country);
            });
          } else {
            withdrawals = allWithdrawals;
          }
          console.log(`[Admin Stats] Fetched ${withdrawals.length} withdrawals`);
        } catch (error) {
          console.error("[Admin Stats] Error fetching withdrawals:", error);
          withdrawals = [];
        }
      } else {
        // Normal admin - only get documents and support data, NO financial data
        try {
          users = await storage.getAllUsers();
          console.log(`[Admin Stats] Fetched ${users.length} users (normal admin)`);
        } catch (error) {
          console.error("[Admin Stats] Error fetching users:", error);
          users = [];
        }
        
        try {
          // Optimize: Use getPendingDocuments() which has WHERE clause in DB query
          const pendingDocs = await storage.getPendingDocuments();
          pendingDocumentsCount = pendingDocs.length;
          console.log(`[Admin Stats] Fetched ${pendingDocumentsCount} pending documents`);
        } catch (error) {
          console.error("[Admin Stats] Error fetching pending documents:", error);
        }
        
        try {
          documents = await storage.getAllDocuments();
          verifiedDocumentsCount = documents.filter(d => d.status === "Verified").length;
          rejectedDocumentsCount = documents.filter(d => d.status === "Rejected").length;
          console.log(`[Admin Stats] Fetched ${documents.length} total documents`);
        } catch (error) {
          console.error("[Admin Stats] Error fetching documents:", error);
          documents = [];
        }
        
        try {
          accounts = await storage.getAllTradingAccounts();
          console.log(`[Admin Stats] Fetched ${accounts.length} trading accounts`);
        } catch (error) {
          console.error("[Admin Stats] Error fetching trading accounts:", error);
          accounts = [];
        }
        
        // Normal admins should NOT see financial data (deposits/withdrawals)
        if (isNormalAdmin) {
          deposits = [];
          withdrawals = [];
        } else {
          try {
            deposits = await storage.getAllDeposits();
            withdrawals = await storage.getAllWithdrawals();
            console.log(`[Admin Stats] Fetched ${deposits.length} deposits, ${withdrawals.length} withdrawals`);
          } catch (error) {
            console.error("[Admin Stats] Error fetching financial data:", error);
            deposits = [];
            withdrawals = [];
          }
        }
      }

      // Calculate country breakdown (users)
      const countryBreakdown: Record<string, number> = {};
      users.forEach(user => {
        if (user.country) {
          countryBreakdown[user.country] = (countryBreakdown[user.country] || 0) + 1;
        }
      });
      const countryList = Object.entries(countryBreakdown)
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count);

      // Calculate country breakdown for trading accounts
      const countryAccountsBreakdown: Record<string, number> = {};
      const userMap = new Map(users.map(u => [u.id, u]));
      accounts.forEach(account => {
        const user = userMap.get(account.userId);
        if (user && user.country) {
          countryAccountsBreakdown[user.country] = (countryAccountsBreakdown[user.country] || 0) + 1;
        }
      });
      const countryAccountsList = Object.entries(countryAccountsBreakdown)
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count);

      // Build stats object - exclude financial data for normal admins
      const stats: any = {
        totalUsers: users.length,
        enabledUsers: users.filter(u => u.enabled).length,
        verifiedUsers: users.filter(u => u.verified).length,
        pendingDocuments: pendingDocumentsCount,
        verifiedDocuments: verifiedDocumentsCount,
        rejectedDocuments: rejectedDocumentsCount,
        totalTradingAccounts: accounts.length,
        liveAccounts: accounts.filter(a => a.type === "Live").length,
        demoAccounts: accounts.filter(a => a.type === "Demo").length,
        countryBreakdown: countryList,
        countryAccountsBreakdown: countryAccountsList,
      };

      // Only include financial data for non-normal admins (super admin and middle admin)
      if (!isNormalAdmin) {
        stats.pendingDeposits = deposits.filter(d => d.status === "Pending").length;
        stats.completedDeposits = deposits.filter(d => d.status === "Completed").length;
        stats.totalDepositAmount = deposits
          .filter(d => d.status === "Completed")
          .reduce((sum, d) => sum + parseFloat(d.amount), 0)
          .toFixed(2);
        stats.pendingWithdrawals = withdrawals.filter(w => w.status === "Pending" || w.status === "Approved").length;
        stats.completedWithdrawals = withdrawals.filter(w => w.status === "Completed").length;
        stats.totalWithdrawalAmount = withdrawals
          .filter(w => w.status === "Completed")
          .reduce((sum, w) => sum + parseFloat(w.amount), 0)
          .toFixed(2);
      } else {
        // Normal admins get 0 for financial metrics (they shouldn't see this data)
        stats.pendingDeposits = 0;
        stats.completedDeposits = 0;
        stats.totalDepositAmount = "0.00";
        stats.pendingWithdrawals = 0;
        stats.completedWithdrawals = 0;
        stats.totalWithdrawalAmount = "0.00";
      }

      console.log(`[Admin Stats] Returning stats:`, {
        totalUsers: stats.totalUsers,
        totalDeposits: deposits.length,
        totalWithdrawals: withdrawals.length,
        totalAccounts: stats.totalTradingAccounts,
      });
      
      res.json(stats);
    } catch (error: any) {
      console.error("[Admin Stats] Failed to fetch admin stats:", error);
      console.error("[Admin Stats] Error stack:", error.stack);
      res.status(500).json({ 
        message: "Failed to fetch statistics",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }
  });

  // Diagnostic endpoint to check database status (Super Admin only)
  app.get("/api/admin/diagnostic", async (req, res) => {
    try {
      if (!(await requireSuperAdmin(req, res))) return;

      const db = await getDb();
      const { users, deposits, withdrawals, tradingAccounts, documents, adminUsers } = await import("@shared/schema");
      
      const counts = {
        users: (await db.select().from(users)).length,
        deposits: (await db.select().from(deposits)).length,
        withdrawals: (await db.select().from(withdrawals)).length,
        tradingAccounts: (await db.select().from(tradingAccounts)).length,
        documents: (await db.select().from(documents)).length,
        adminUsers: (await db.select().from(adminUsers)).length,
      };

      res.json({
        message: "Database diagnostic",
        counts,
        databaseUrl: process.env.DATABASE_URL ? `${process.env.DATABASE_URL.substring(0, 30)}...` : "Not set",
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("[Diagnostic] Error:", error);
      res.status(500).json({ 
        message: "Diagnostic failed",
        error: error.message 
      });
    }
  });

  // ========== SUPPORT TICKETS ==========

  // User - Get own support tickets
  app.get("/api/support-tickets", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const tickets = await storage.getSupportTickets(userId);
      // Also fetch replies for each ticket
      const ticketsWithReplies = await Promise.all(
        tickets.map(async (ticket) => {
          const replies = await storage.getSupportTicketReplies(ticket.id);
          return { ...ticket, replies };
        })
      );

      res.json(ticketsWithReplies);
    } catch (error) {
      console.error("Failed to fetch support tickets:", error);
      res.status(500).json({ message: "Failed to fetch support tickets" });
    }
  });

  // User - Create support ticket
  app.post("/api/support-tickets", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { subject, message, category, priority } = req.body;

      if (!subject || !message) {
        return res.status(400).json({ message: "Subject and message are required" });
      }

      const ticket = await storage.createSupportTicket({
        userId,
        subject,
        message,
        category: category || "Other",
        priority: priority || "Medium",
        status: "Open",
      });

      // Send ticket created email
      const user = await storage.getUser(userId);
      if (user?.email) {
        sendSupportTicketCreatedEmail(
          user.email,
          user.fullName || user.username,
          ticket.id,
          subject,
          category || "Other"
        ).catch(err => console.error("Failed to send ticket created email:", err));
      }

      res.status(201).json(ticket);
    } catch (error: any) {
      console.error("Failed to create support ticket:", error);
      const errorMessage = error?.message || "Failed to create support ticket";
      res.status(500).json({ message: errorMessage });
    }
  });

  // User - Reply to support ticket
  app.post("/api/support-tickets/:id/reply", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { message } = req.body;
      if (!message || !message.trim()) {
        return res.status(400).json({ message: "Message is required" });
      }

      const ticket = await storage.getSupportTicket(req.params.id);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      if (ticket.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const reply = await storage.createSupportTicketReply({
        ticketId: req.params.id,
        userId,
        message: message.trim(),
      });

      // Update ticket status if it was closed
      if (ticket.status === "Closed") {
        await storage.updateSupportTicketStatus(req.params.id, "Open");
      }

      res.status(201).json(reply);
    } catch (error) {
      console.error("Failed to add reply:", error);
      res.status(500).json({ message: "Failed to add reply" });
    }
  });

  // Admin - Get all support tickets
  app.get("/api/admin/support-tickets", async (req, res) => {
    try {
      if (!(await requireAdmin(req, res))) return;

      const tickets = await storage.getSupportTickets();
      // Fetch replies for each ticket
      const ticketsWithReplies = await Promise.all(
        tickets.map(async (ticket) => {
          const replies = await storage.getSupportTicketReplies(ticket.id);
          return { ...ticket, replies };
        })
      );

      res.json(ticketsWithReplies);
    } catch (error) {
      console.error("Failed to fetch support tickets:", error);
      res.status(500).json({ message: "Failed to fetch support tickets" });
    }
  });

  // Admin - Reply to support ticket
  app.post("/api/admin/support-tickets/:id/reply", async (req, res) => {
    try {
      const canProceed = await requireAdmin(req, res);
      if (!canProceed) return;

      const adminId = getCurrentAdminId(req)!;
      const { message } = req.body;

      if (!message || !message.trim()) {
        return res.status(400).json({ message: "Message is required" });
      }

      const ticket = await storage.getSupportTicket(req.params.id);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      const reply = await storage.createSupportTicketReply({
        ticketId: req.params.id,
        adminId,
        message: message.trim(),
      });

      // Update ticket status to "In Progress" if it was "Open"
      if (ticket.status === "Open") {
        await storage.updateSupportTicketStatus(req.params.id, "In Progress");
      }

      // Notify user
      if (ticket.userId) {
        await storage.createNotification({
          userId: ticket.userId,
          title: "New Reply to Your Ticket",
          message: `Admin replied to: ${ticket.subject}`,
          type: "info",
        });
        
        // Send ticket reply email
        const user = await storage.getUser(ticket.userId);
        if (user?.email) {
          sendSupportTicketReplyEmail(
            user.email,
            user.fullName || user.username,
            ticket.id,
            ticket.subject,
            message.trim(),
            true // isFromAdmin
          ).catch(err => console.error("Failed to send ticket reply email:", err));
        }
      }

      // Log activity
      await logActivity(
        adminId,
        "reply_support_ticket",
        "support_ticket",
        req.params.id,
        `Replied to ticket: ${ticket.subject}`
      );

      res.status(201).json(reply);
    } catch (error) {
      console.error("Failed to add admin reply:", error);
      res.status(500).json({ message: "Failed to add reply" });
    }
  });

  // Admin - Update ticket status
  app.patch("/api/admin/support-tickets/:id/status", async (req, res) => {
    try {
      const canProceed = await requireAdmin(req, res);
      if (!canProceed) return;

      const adminId = getCurrentAdminId(req)!;
      const { status } = req.body;

      if (!status || !["Open", "In Progress", "Resolved", "Closed"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const ticket = await storage.getSupportTicket(req.params.id);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      const updated = await storage.updateSupportTicketStatus(req.params.id, status);

      // Notify user if status changed
      if (ticket.userId && ticket.status !== status) {
        await storage.createNotification({
          userId: ticket.userId,
          title: "Ticket Status Updated",
          message: `Your ticket "${ticket.subject}" status changed to ${status}`,
          type: "info",
        });
        
        // Send ticket resolved email if status is Resolved or Closed
        if (status === "Resolved" || status === "Closed") {
          const user = await storage.getUser(ticket.userId);
          if (user?.email) {
            sendSupportTicketResolvedEmail(
              user.email,
              user.fullName || user.username,
              ticket.id,
              ticket.subject
            ).catch(err => console.error("Failed to send ticket resolved email:", err));
          }
        }
      }

      // Log activity
      await logActivity(
        adminId,
        "update_ticket_status",
        "support_ticket",
        req.params.id,
        `Updated ticket status to ${status}`
      );

      res.json(updated);
    } catch (error) {
      console.error("Failed to update ticket status:", error);
      res.status(500).json({ message: "Failed to update ticket status" });
    }
  });

  // Admin - Get TopUp records
  app.get("/api/admin/topups", async (req, res) => {
    try {
      const canProceed = await requireAdmin(req, res);
      if (!canProceed) return;

      // Get all deposits with TopUp merchant (Admin TopUp)
      const allDeposits = await storage.getAllDeposits();
      const topUpDeposits = allDeposits.filter(d => d.merchant === "TopUp" || d.merchant === "Admin TopUp");
      
      res.json(topUpDeposits);
    } catch (error) {
      console.error("Failed to fetch TopUps:", error);
      res.status(500).json({ message: "Failed to fetch TopUps" });
    }
  });

  // Admin - Create TopUp for Client (Directly add money to account)
  app.post("/api/admin/topups", async (req, res) => {
    try {
      const canProceed = await requireAdmin(req, res);
      if (!canProceed) return;

      const adminId = getCurrentAdminId(req)!;
      const { userId, accountId, amount } = req.body;

      if (!userId || !amount) {
        return res.status(400).json({ message: "User ID and amount are required" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      // If accountId is provided, add money directly to that account
      let targetAccount: any;
      if (accountId) {
        targetAccount = await storage.getTradingAccount(accountId);
        if (!targetAccount || targetAccount.userId !== userId) {
          return res.status(404).json({ message: "Trading account not found" });
        }
      } else {
        // If no account specified, get the first active account
        const userAccounts = await storage.getTradingAccountsByUserId(userId);
        targetAccount = userAccounts.find(acc => acc.enabled && acc.type === "Live") || 
                       userAccounts.find(acc => acc.enabled) || 
                       userAccounts[0];
        
        // Account is required - cannot create deposit without an account
        if (!targetAccount) {
          return res.status(400).json({ 
            message: "User has no trading accounts. Please create a trading account first before adding funds." 
          });
        }
      }

      // Create deposit record with TopUp merchant - accountId is required (NOT NULL constraint)
      const deposit = await storage.createDeposit({
        userId,
        accountId: targetAccount.id, // Always use the target account ID - never null
        merchant: "Admin TopUp",
        amount: amountNum.toString(),
        status: "Completed", // Direct topup is immediately completed
        transactionId: `TOPUP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      });

      // Update account balance
      const currentBalance = parseFloat(targetAccount.balance || "0");
      const newBalance = (currentBalance + amountNum).toFixed(2);
      await storage.updateTradingAccount(targetAccount.id, { balance: newBalance });

      // Create notification for user
      await storage.createNotification({
        userId,
        title: "Account Topped Up",
        message: `Your account has been topped up with $${amountNum.toFixed(2)} (Account: ${targetAccount.accountId})`,
        type: "success",
      });

      // Log activity
      await logActivity(
        adminId,
        "create_topup",
        "topup",
        deposit.id,
        `Topped up $${amountNum.toFixed(2)} for user ${user.fullName || user.username} (${userId}) - Account: ${targetAccount.accountId}`
      );

      res.json({
        message: `Successfully topped up $${amountNum.toFixed(2)} to account ${targetAccount.accountId}`,
        deposit: {
          id: deposit.id,
          amount: amountNum.toString(),
          userId,
          accountId: targetAccount.id,
          createdAt: deposit.createdAt,
        },
      });
    } catch (error: any) {
      console.error("Failed to create TopUp:", error);
      const errorMessage = error?.message || "Failed to create TopUp";
      res.status(500).json({ 
        message: errorMessage,
        detail: error?.detail || undefined,
        code: error?.code || undefined
      });
    }
  });

  // Admin - Delete TopUp record
  app.delete("/api/admin/topups/:id", async (req, res) => {
    try {
      const canProceed = await requireAdmin(req, res);
      if (!canProceed) return;

      const adminId = getCurrentAdminId(req)!;
      const { id } = req.params;

      const deposit = await storage.getDeposit(id);
      if (!deposit || (deposit.merchant !== "TopUp" && deposit.merchant !== "Admin TopUp")) {
        return res.status(404).json({ message: "TopUp record not found" });
      }

      // Only allow deletion if status is Pending
      if (deposit.status === "Completed") {
        return res.status(400).json({ message: "Cannot delete completed TopUp" });
      }

      await storage.deleteDeposit(id);

      // Log activity
      await logActivity(
        adminId,
        "delete_topup",
        "topup",
        id,
        `Deleted TopUp record ${id}`
      );

      res.json({ message: "TopUp deleted successfully" });
    } catch (error: any) {
      console.error("Failed to delete TopUp:", error);
      const errorMessage = error?.message || "Failed to delete TopUp";
      res.status(500).json({ message: errorMessage });
    }
  });

  // Admin - Get IB CB Wallets
  app.get("/api/admin/ib-cb-wallets", async (req, res) => {
    try {
      const canProceed = await requireAdmin(req, res);
      if (!canProceed) return;

      const wallets = await storage.getIBCBWallets();
      res.json(wallets);
    } catch (error) {
      console.error("Failed to fetch IB CB Wallets:", error);
      res.status(500).json({ message: "Failed to fetch IB CB Wallets" });
    }
  });

  // Admin - Get IB CB Wallet by Account ID
  app.get("/api/admin/ib-cb-wallets/account/:accountId", async (req, res) => {
    try {
      const canProceed = await requireAdmin(req, res);
      if (!canProceed) return;

      const { accountId } = req.params;
      
      // Get trading account
      const account = await storage.getTradingAccount(accountId);
      if (!account) {
        return res.status(404).json({ message: "Trading account not found" });
      }

      // Get IB CB wallets for the user
      const wallets = await storage.getIBCBWallets(account.userId);
      const ibWallet = wallets.find(w => w.walletType === "IB" || w.walletType === "CB");
      
      if (!ibWallet) {
        return res.status(404).json({ message: "IB CB Wallet not found for this account" });
      }

      // Get user details
      const user = await storage.getUser(account.userId);
      
      res.json({
        wallet: ibWallet,
        account: {
          id: account.id,
          accountId: account.accountId,
          type: account.type,
          balance: account.balance,
        },
        user: user ? {
          id: user.id,
          fullName: user.fullName,
          username: user.username,
          email: user.email,
        } : null,
      });
    } catch (error) {
      console.error("Failed to fetch IB CB Wallet:", error);
      res.status(500).json({ message: "Failed to fetch IB CB Wallet" });
    }
  });

  // Admin - Get all fund transfers
  app.get("/api/admin/fund-transfers", async (req, res) => {
    try {
      console.log("[GET /api/admin/fund-transfers] Request received");
      
      if (!(await requireAdmin(req, res))) {
        console.log("[GET /api/admin/fund-transfers] Admin auth failed");
        return;
      }

      const adminId = getCurrentAdminId(req)!;
      const admin = await storage.getAdminUser(adminId);
      console.log(`[GET /api/admin/fund-transfers] Admin authenticated: ${admin!.username} (ID: ${adminId})`);
      
      // Normalize role for comparison
      const adminRole = String(admin!.role || "").trim().toLowerCase().replace(/[-\s_]+/g, "_");
      const isNormalAdmin = adminRole === "normal_admin" || adminRole === "normaladmin";
      
      console.log(`[GET /api/admin/fund-transfers] Fetching transfers for role: ${adminRole}`);
      
      let transfers;
      try {
        transfers = await storage.getFundTransfers();
        console.log(`[GET /api/admin/fund-transfers] Storage returned ${transfers.length} transfers`);
      } catch (storageError: any) {
        console.error("[GET /api/admin/fund-transfers] Storage error:", storageError);
        console.error("[GET /api/admin/fund-transfers] Storage error stack:", storageError.stack);
        throw storageError;
      }

      console.log(`[GET /api/admin/fund-transfers] Returning ${transfers.length} transfers for admin ${admin!.username} (${adminRole})`);
      
      // Get all accounts to determine internal vs external and add type to each transfer
      console.log("[GET /api/admin/fund-transfers] Fetching all trading accounts...");
      const allAccounts = await storage.getAllTradingAccounts();
      console.log(`[GET /api/admin/fund-transfers] Found ${allAccounts.length} trading accounts`);
      
      const accountToUserMap = new Map<string, string>();
      allAccounts.forEach(acc => {
        accountToUserMap.set(acc.id, acc.userId);
      });

      // Add transfer type to each transfer
      const transfersWithType = transfers.map(transfer => {
        const fromUserId = accountToUserMap.get(transfer.fromAccountId);
        const toUserId = accountToUserMap.get(transfer.toAccountId);
        const isInternal = fromUserId && toUserId && fromUserId === toUserId;
        if (!fromUserId || !toUserId) {
          console.warn(`[GET /api/admin/fund-transfers] Transfer ${transfer.id} has missing account mapping:`, {
            fromAccountId: transfer.fromAccountId,
            toAccountId: transfer.toAccountId,
            fromUserId,
            toUserId,
          });
        }
        return {
          ...transfer,
          type: isInternal ? 'Internal' : 'External',
        };
      });
      
      console.log(`[GET /api/admin/fund-transfers] Processed ${transfersWithType.length} transfers with types`);
      
      if (transfers.length > 0) {
        console.log(`[GET /api/admin/fund-transfers] Sample transfer:`, {
          id: transfers[0].id,
          userId: transfers[0].userId,
          fromAccountId: transfers[0].fromAccountId,
          toAccountId: transfers[0].toAccountId,
          amount: transfers[0].amount,
          status: transfers[0].status,
          type: transfersWithType[0].type,
        });
      } else {
        console.log("[GET /api/admin/fund-transfers] No transfers found in database");
      }
      
      res.json(transfersWithType);
    } catch (error: any) {
      console.error("[GET /api/admin/fund-transfers] Failed to fetch transfers:", error);
      console.error("[GET /api/admin/fund-transfers] Error message:", error.message);
      console.error("[GET /api/admin/fund-transfers] Error stack:", error.stack);
      res.status(500).json({ 
        message: "Failed to fetch fund transfers",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }
  });

  // Admin - Get internal transfers only
  app.get("/api/admin/fund-transfers/internal", async (req, res) => {
    try {
      if (!(await requireAdmin(req, res))) return;

      const adminId = getCurrentAdminId(req)!;
      const admin = await storage.getAdminUser(adminId);
      
      console.log(`[GET /api/admin/fund-transfers/internal] Request from admin ${admin!.username}`);
      
      // Get all transfers
      const transfers = await storage.getFundTransfers();
      
      // Get all accounts to determine internal vs external
      const allAccounts = await storage.getAllTradingAccounts();
      const accountToUserMap = new Map<string, string>();
      allAccounts.forEach(acc => {
        accountToUserMap.set(acc.id, acc.userId);
      });

      // Filter only internal transfers (both accounts belong to same user)
      const internalTransfers = transfers.filter(transfer => {
        const fromUserId = accountToUserMap.get(transfer.fromAccountId);
        const toUserId = accountToUserMap.get(transfer.toAccountId);
        return fromUserId && toUserId && fromUserId === toUserId;
      }).map(transfer => ({
        ...transfer,
        type: 'Internal',
      }));

      console.log(`[GET /api/admin/fund-transfers/internal] Returning ${internalTransfers.length} internal transfers`);
      
      res.json(internalTransfers);
    } catch (error: any) {
      console.error("[GET /api/admin/fund-transfers/internal] Failed to fetch transfers:", error);
      console.error("[GET /api/admin/fund-transfers/internal] Error stack:", error.stack);
      res.status(500).json({ 
        message: "Failed to fetch internal transfers",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }
  });

  // Admin - Get external transfers only
  app.get("/api/admin/fund-transfers/external", async (req, res) => {
    try {
      if (!(await requireAdmin(req, res))) return;

      const adminId = getCurrentAdminId(req)!;
      const admin = await storage.getAdminUser(adminId);
      
      console.log(`[GET /api/admin/fund-transfers/external] Request from admin ${admin!.username}`);
      
      // Get all transfers
      const transfers = await storage.getFundTransfers();
      
      // Get all accounts to determine internal vs external
      const allAccounts = await storage.getAllTradingAccounts();
      const accountToUserMap = new Map<string, string>();
      allAccounts.forEach(acc => {
        accountToUserMap.set(acc.id, acc.userId);
      });

      // Filter only external transfers (accounts belong to different users)
      const externalTransfers = transfers.filter(transfer => {
        const fromUserId = accountToUserMap.get(transfer.fromAccountId);
        const toUserId = accountToUserMap.get(transfer.toAccountId);
        return fromUserId && toUserId && fromUserId !== toUserId;
      }).map(transfer => ({
        ...transfer,
        type: 'External',
      }));

      console.log(`[GET /api/admin/fund-transfers/external] Returning ${externalTransfers.length} external transfers`);
      
      res.json(externalTransfers);
    } catch (error: any) {
      console.error("[GET /api/admin/fund-transfers/external] Failed to fetch transfers:", error);
      console.error("[GET /api/admin/fund-transfers/external] Error stack:", error.stack);
      res.status(500).json({ 
        message: "Failed to fetch external transfers",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }
  });

  // Admin - Approve external transfer
  app.patch("/api/admin/fund-transfers/external/:id/approve", async (req, res) => {
    try {
      if (!(await requireAdmin(req, res))) return;

      const { id } = req.params;
      const db = await getDb();
      
      // Get the transfer
      const transfer = await db.select().from(fundTransfers).where(eq(fundTransfers.id, id)).limit(1);
      
      if (!transfer || transfer.length === 0) {
        return res.status(404).json({ message: "Transfer not found" });
      }

      const transferData = transfer[0];

      if (transferData.status !== "Pending") {
        return res.status(400).json({ message: `Transfer is already ${transferData.status}` });
      }

      // Get destination account
      const toAccount = await storage.getTradingAccount(transferData.toAccountId);
      if (!toAccount) {
        return res.status(404).json({ message: "Destination account not found" });
      }

      // Update transfer status to Completed
      await db.update(fundTransfers)
        .set({ status: "Completed" })
        .where(eq(fundTransfers.id, id));

      // Add amount to destination account (fee was already deducted from source)
      const currentBalance = parseFloat(toAccount.balance || "0");
      const transferAmount = parseFloat(transferData.amount || "0");
      const newBalance = (currentBalance + transferAmount).toString();
      await storage.updateTradingAccount(transferData.toAccountId, { balance: newBalance });

      // Create notification for recipient
      await storage.createNotification({
        userId: toAccount.userId,
        title: "External Transfer Received",
        message: `You received $${transferAmount.toFixed(2)} from an external transfer.`,
        type: "success",
      });

      // Create notification for sender
      await storage.createNotification({
        userId: transferData.userId,
        title: "External Transfer Approved",
        message: `Your transfer of $${transferAmount.toFixed(2)} has been approved and completed.`,
        type: "success",
      });

      res.json({ 
        message: "Transfer approved successfully",
        transfer: { ...transferData, status: "Completed" }
      });
    } catch (error: any) {
      console.error("[Approve External Transfer] Error:", error);
      res.status(500).json({ message: "Failed to approve transfer" });
    }
  });

  // Admin - Reject external transfer
  app.patch("/api/admin/fund-transfers/external/:id/reject", async (req, res) => {
    try {
      if (!(await requireAdmin(req, res))) return;

      const { id } = req.params;
      const { reason } = req.body;
      const db = await getDb();
      
      // Get the transfer
      const transfer = await db.select().from(fundTransfers).where(eq(fundTransfers.id, id)).limit(1);
      
      if (!transfer || transfer.length === 0) {
        return res.status(404).json({ message: "Transfer not found" });
      }

      const transferData = transfer[0];

      if (transferData.status !== "Pending") {
        return res.status(400).json({ message: `Transfer is already ${transferData.status}` });
      }

      // Get source account to refund
      const fromAccount = await storage.getTradingAccount(transferData.fromAccountId);
      if (!fromAccount) {
        return res.status(404).json({ message: "Source account not found" });
      }

      // Calculate refund amount (transfer amount + fee)
      const transferAmount = parseFloat(transferData.amount || "0");
      const fee = transferAmount * 0.025;
      const refundAmount = transferAmount + fee;

      // Update transfer status to Rejected
      await db.update(fundTransfers)
        .set({ 
          status: "Rejected",
          notes: `${transferData.notes || ""} [REJECTED: ${reason || "No reason provided"}]`
        })
        .where(eq(fundTransfers.id, id));

      // Refund amount + fee to source account
      const currentBalance = parseFloat(fromAccount.balance || "0");
      const newBalance = (currentBalance + refundAmount).toString();
      await storage.updateTradingAccount(transferData.fromAccountId, { balance: newBalance });

      // Create notification for sender
      await storage.createNotification({
        userId: transferData.userId,
        title: "External Transfer Rejected",
        message: `Your transfer of $${transferAmount.toFixed(2)} was rejected. $${refundAmount.toFixed(2)} has been refunded to your account.${reason ? ` Reason: ${reason}` : ""}`,
        type: "warning",
      });

      res.json({ 
        message: "Transfer rejected successfully",
        transfer: { ...transferData, status: "Rejected" }
      });
    } catch (error: any) {
      console.error("[Reject External Transfer] Error:", error);
      res.status(500).json({ message: "Failed to reject transfer" });
    }
  });

  // Admin - Get fund transfer stats
  app.get("/api/admin/fund-transfers/stats", async (req, res) => {
    try {
      if (!(await requireAdmin(req, res))) return;

      const adminId = getCurrentAdminId(req)!;
      const admin = await storage.getAdminUser(adminId);
      
      // Normalize role for comparison
      const adminRole = String(admin!.role || "").trim().toLowerCase().replace(/[-\s_]+/g, "_");
      const isNormalAdmin = adminRole === "normal_admin" || adminRole === "normaladmin";
      
      // Get assigned countries for middle admin (null for super admin)
      const assignedCountries = await getAssignedCountriesForAdmin(adminId, admin!.role);
      
      let allTransfers = await storage.getFundTransfers();
      
      // Filter transfers by assigned countries for middle admin
      let transfers = allTransfers;
      if (assignedCountries && assignedCountries.length > 0) {
        // Get all users to filter transfers by user country
        const allUsers = await storage.getAllUsers();
        const userMap = new Map(allUsers.map(u => [u.id, u]));
        const filteredUserIds = new Set(
          allUsers
            .filter(u => u.country && assignedCountries.includes(u.country))
            .map(u => u.id)
        );
        
        // Get all accounts to filter transfers
        const allAccounts = await storage.getAllTradingAccounts();
        const accountToUserMap = new Map<string, string>();
        allAccounts.forEach(acc => {
          accountToUserMap.set(acc.id, acc.userId);
        });
        
        // Filter transfers where both accounts belong to users in assigned countries
        transfers = allTransfers.filter(transfer => {
          const fromUserId = accountToUserMap.get(transfer.fromAccountId);
          const toUserId = accountToUserMap.get(transfer.toAccountId);
          return fromUserId && filteredUserIds.has(fromUserId) && 
                 toUserId && filteredUserIds.has(toUserId);
        });
      }

      console.log(`[GET /api/admin/fund-transfers/stats] Found ${transfers.length} total transfers${assignedCountries ? ` (filtered by ${assignedCountries.length} countries)` : ''}`);

      // Get all accounts to determine internal vs external
      const allAccounts = await storage.getAllTradingAccounts();
      
      // Create a map of accountId -> userId for quick lookup
      const accountToUserMap = new Map<string, string>();
      allAccounts.forEach(acc => {
        accountToUserMap.set(acc.id, acc.userId);
      });

      // Separate internal and external transfers
      // Internal: Both accounts belong to the SAME user
      // External: Accounts belong to DIFFERENT users
      const internalTransfers = transfers.filter(transfer => {
        const fromUserId = accountToUserMap.get(transfer.fromAccountId);
        const toUserId = accountToUserMap.get(transfer.toAccountId);
        return fromUserId && toUserId && fromUserId === toUserId;
      });
      
      const externalTransfers = transfers.filter(transfer => {
        const fromUserId = accountToUserMap.get(transfer.fromAccountId);
        const toUserId = accountToUserMap.get(transfer.toAccountId);
        return fromUserId && toUserId && fromUserId !== toUserId;
      });

      const stats = {
        internalTransfers: internalTransfers.length,
        externalTransfers: externalTransfers.length,
        totalTransfers: transfers.length,
      };

      console.log(`[GET /api/admin/fund-transfers/stats] Stats for admin ${admin!.username}:`, stats);
      console.log(`[GET /api/admin/fund-transfers/stats] Internal: ${internalTransfers.length}, External: ${externalTransfers.length}, Total: ${transfers.length}`);
      
      res.json(stats);
    } catch (error: any) {
      console.error("[GET /api/admin/fund-transfers/stats] Failed to fetch stats:", error);
      console.error("[GET /api/admin/fund-transfers/stats] Error stack:", error.stack);
      res.status(500).json({ 
        message: "Failed to fetch fund transfer stats",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }
  });

  // Admin - Send Welcome Email to Specific User
  app.post("/api/admin/send-welcome-email", async (req, res) => {
    try {
      if (!(await requireAdmin(req, res))) return;
      const adminId = getCurrentAdminId(req)!;

      const { email, userName, referralId } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const finalUserName = userName || user.fullName || user.username;
      const finalReferralId = referralId || user.referralId || `REF${user.id.slice(0, 8).toUpperCase()}`;

      await sendWelcomeEmail(email, finalUserName, finalReferralId);

      await logActivity(
        adminId,
        "send_welcome_email",
        "user",
        user.id,
        `Sent welcome email to ${email}`
      );

      res.json({ message: "Welcome email sent successfully", email });
    } catch (error: any) {
      console.error("[Send Welcome Email] Error:", error);
      res.status(500).json({ message: "Failed to send welcome email", error: error.message });
    }
  });

  // Admin - Send Welcome Emails to All Users
  app.post("/api/admin/send-welcome-emails", async (req, res) => {
    try {
      if (!(await requireAdmin(req, res))) return;

      const adminId = getCurrentAdminId(req)!;
      console.log(`[Send Welcome Emails] Admin ${adminId} initiated welcome email campaign`);

      // Get all users
      const allUsers = await storage.getAllUsers();
      
      console.log(`[Send Welcome Emails] Found ${allUsers.length} users to send emails to`);

      if (allUsers.length === 0) {
        return res.json({
          message: "No users found",
          sent: 0,
          failed: 0,
          total: 0,
        });
      }

      let successCount = 0;
      let errorCount = 0;
      const errors: Array<{ email: string; error: string }> = [];

      // Send emails to all users
      for (let i = 0; i < allUsers.length; i++) {
        const user = allUsers[i];
        const userName = user.fullName || user.username || 'Trader';
        const referralId = user.referralId || 'N/A';

        try {
          await sendWelcomeEmail(user.email, userName, referralId);
          console.log(`[Send Welcome Emails] ✅ Sent to ${user.email}`);
          successCount++;

          // Small delay to avoid rate limiting
          if (i < allUsers.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (error: any) {
          console.error(`[Send Welcome Emails] ❌ Failed to send to ${user.email}:`, error.message);
          errorCount++;
          errors.push({
            email: user.email,
            error: error.message || "Unknown error"
          });
        }
      }

      // Log activity
      await logActivity(
        adminId,
        "send_welcome_emails",
        "campaign",
        null,
        `Sent welcome emails to ${successCount} users`,
        null,
        getClientIp(req)
      );

      res.json({
        message: `Welcome emails sent to ${successCount} users`,
        sent: successCount,
        failed: errorCount,
        total: allUsers.length,
        errors: errors.length > 0 ? errors : undefined,
      });
    } catch (error: any) {
      console.error("[Send Welcome Emails] Fatal error:", error);
      res.status(500).json({ message: "Failed to send welcome emails", error: error.message });
    }
  });

  // DB status diagnostic endpoint
  app.get("/api/db-status", async (req, res) => {
    const dbUrl = process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL;
    const masked = dbUrl ? dbUrl.replace(/:[^:@]+@/, ':****@').substring(0, 60) + '...' : 'NOT SET';
    try {
      const db = await getDb();
      const result = await db.execute('SELECT NOW() as t, version() as v');
      res.json({ status: 'connected', url: masked, time: result.rows[0].t, pg: result.rows[0].v?.split(' ').slice(0,2).join(' ') });
    } catch (err: any) {
      res.status(503).json({ status: 'error', url: masked, error: err.message });
    }
  });

  // Health Check Endpoint for AWS App Runner
  app.get("/api/health", async (req, res) => {
    try {
      // Check database connection
      const db = await getDb();
      
      // Simple database query to verify connection
      await db.execute('SELECT 1 as health_check');
      
      // Check if we're in App Runner environment
      const isAppRunner = process.env.AWS_EXECUTION_ENV === 'AWS_App_Runner';
      
      const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        platform: isAppRunner ? 'AWS App Runner' : 'Other',
        database: {
          status: 'connected',
          type: 'PostgreSQL',
          ssl_enabled: true
        },
        version: {
          app: '1.0.0',
          node: process.version
        }
      };

      res.status(200).json(healthStatus);
    } catch (error) {
      console.error('Health check failed:', error);
      
      const errorStatus = {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        database: {
          status: 'disconnected',
          type: 'PostgreSQL'
        }
      };

      res.status(503).json(errorStatus);
    }
  });

}
