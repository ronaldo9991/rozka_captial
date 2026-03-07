import { getDb } from "./db";
import { 
  users, tradingAccounts, deposits, withdrawals, tradingHistory, 
  documents, notifications, adminUsers, adminCountryAssignments, 
  activityLogs, supportTickets, supportTicketReplies, fundTransfers,
  ibCbWallets, cryptoWallets, refreshTokens, topupCards,
  type User, type InsertUser,
  type TradingAccount, type InsertTradingAccount,
  type Deposit, type InsertDeposit,
  type Withdrawal, type InsertWithdrawal,
  type TradingHistory, type InsertTradingHistory,
  type Document, type InsertDocument,
  type Notification, type InsertNotification,
  type AdminUser, type InsertAdminUser,
  type AdminCountryAssignment, type InsertAdminCountryAssignment,
  type ActivityLog, type InsertActivityLog,
  type SupportTicket, type InsertSupportTicket,
  type SupportTicketReply, type InsertSupportTicketReply,
  type FundTransfer, type InsertFundTransfer,
  type IbCbWallet, type InsertIbCbWallet,
  type CryptoWallet, type InsertCryptoWallet,
  type RefreshToken, type InsertRefreshToken,
  type TopupCard, type InsertTopupCard
} from "@shared/schema";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
import type { IStorage } from "./storage";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

// Helper to check if database is MySQL
function isMySQL(): boolean {
  const databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL;
  return databaseUrl?.startsWith('mysql://') || databaseUrl?.startsWith('mariadb://') || false;
}

export class DbStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const db = await getDb();
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const db = await getDb();
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    try {
      const db = await getDb();
      const result = await db.select().from(users).where(eq(users.passwordResetToken, token)).limit(1);
      return result[0];
    } catch (error) {
      console.error("[DbStorage.getUserByResetToken] Error:", error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const db = await getDb();
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async getUserByReferralId(referralId: string): Promise<User | undefined> {
    const db = await getDb();
    const result = await db.select().from(users).where(eq(users.referralId, referralId)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const db = await getDb();
    
    if (isMySQL()) {
      // MySQL doesn't support .returning(), so insert then select
      // Generate ID if not provided
      const userWithId = { ...user, id: (user as any).id || randomUUID() };
      await db.insert(users).values(userWithId);
      // Get the inserted user by email (unique)
      const userEmail = (user as any).email;
      if (!userEmail) {
        throw new Error('Email is required to create user');
      }
      const result = await db.select().from(users)
        .where(eq(users.email, userEmail))
        .limit(1);
      if (!result[0]) {
        throw new Error('Failed to create user');
      }
      return result[0];
    } else {
      // PostgreSQL and SQLite support .returning()
      const result = await db.insert(users).values(user).returning();
      return result[0];
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const db = await getDb();
    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }

  async deleteUser(id: string): Promise<boolean> {
    const db = await getDb();
    const { pool } = await import('./db.js');
    
    try {
      // Use raw SQL for more reliable deletion with proper foreign key handling
      // This ensures we delete in the correct order and handle all constraints
      
      if (!pool) {
        throw new Error('PostgreSQL pool not available');
      }

      console.log(`[deleteUser] Starting deletion for user: ${id}`);

      // Use raw SQL queries for more reliable deletion
      // Delete in order: child tables first, then parent tables
      
      // Step 1: Delete fund_transfers (references trading_accounts)
      await pool.query(`
        DELETE FROM fund_transfers 
        WHERE user_id = $1 
           OR from_account_id IN (SELECT id FROM trading_accounts WHERE user_id = $1)
           OR to_account_id IN (SELECT id FROM trading_accounts WHERE user_id = $1)
      `, [id]);
      
      // Step 2: Delete deposits (references trading_accounts)
      await pool.query('DELETE FROM deposits WHERE user_id = $1', [id]);
      
      // Step 3: Delete withdrawals (references trading_accounts)
      await pool.query('DELETE FROM withdrawals WHERE user_id = $1', [id]);
      
      // Step 4: Delete trading history (references trading_accounts)
      await pool.query('DELETE FROM trading_history WHERE user_id = $1', [id]);
      
      // Step 5: Delete trading accounts (now safe - no more references)
      await pool.query('DELETE FROM trading_accounts WHERE user_id = $1', [id]);
      
      // Step 6: Delete support ticket replies (references support_tickets)
      await pool.query(`
        DELETE FROM support_ticket_replies 
        WHERE ticket_id IN (SELECT id FROM support_tickets WHERE user_id = $1)
      `, [id]);
      
      // Step 7: Delete support tickets
      await pool.query('DELETE FROM support_tickets WHERE user_id = $1', [id]);
      
      // Step 8: Delete documents
      await pool.query('DELETE FROM documents WHERE user_id = $1', [id]);
      
      // Step 9: Delete notifications
      await pool.query('DELETE FROM notifications WHERE user_id = $1', [id]);
      
      // Step 10: Delete refresh tokens
      await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [id]);
      
      // Step 11: Delete IB CB wallets
      await pool.query('DELETE FROM ib_cb_wallets WHERE user_id = $1', [id]);
      
      // Note: crypto_wallets table does not have user_id - it's a system-wide table
      // Step 12: Delete admin country assignments (if any - shouldn't exist for regular users)
      await pool.query('DELETE FROM admin_country_assignments WHERE admin_id = $1', [id]);
      
      // Step 13: Delete activity logs (references users via user_id)
      await pool.query('DELETE FROM activity_logs WHERE user_id = $1', [id]);
      
      // Step 14: Unassign topup cards (set assigned_to_user_id to null)
      await pool.query('UPDATE topup_cards SET assigned_to_user_id = NULL WHERE assigned_to_user_id = $1', [id]);
      
      // Step 15: Finally delete the user
      await pool.query('DELETE FROM users WHERE id = $1', [id]);
      
      console.log(`[deleteUser] Successfully deleted user: ${id}`);
      return true;
    } catch (error: any) {
      console.error("Failed to delete user:", error);
      console.error("Error details:", {
        message: error?.message,
        code: error?.code,
        detail: error?.detail,
        constraint: error?.constraint,
        table: error?.table,
        stack: error?.stack
      });
      return false;
    }
  }

  async getAllUsers(): Promise<User[]> {
    const db = await getDb();
    const { pool } = await import('./db.js');
    
    // Use raw SQL query for PostgreSQL to ensure we get all users
    // This is more reliable than Drizzle ORM when schema might have variations
    try {
      if (!pool) {
        throw new Error('PostgreSQL pool not available');
      }
      
      console.log("[DbStorage.getAllUsers] Fetching all users from PostgreSQL...");
      
      const result = await pool.query(`
        SELECT 
          id, username, password, email, full_name, phone, country, city, 
          address, zip_code, referral_id, referred_by, referral_status,
          verified, enabled, created_at,
          COALESCE(password_reset_token, NULL) as password_reset_token,
          COALESCE(password_reset_expires, NULL) as password_reset_expires,
          COALESCE(email_verification_token, NULL) as email_verification_token,
          COALESCE(email_verification_expires, NULL) as email_verification_expires,
          COALESCE(email_verified, false) as email_verified,
          COALESCE(next_of_kin_name, NULL) as next_of_kin_name,
          COALESCE(next_of_kin_file, NULL) as next_of_kin_file
        FROM users
        ORDER BY created_at DESC
      `);
      
      const userCount = result.rows.length;
      console.log(`[DbStorage.getAllUsers] Found ${userCount} users in database`);
      
      return result.rows.map((row: any) => ({
        id: row.id,
        username: row.username || '',
        password: row.password || '',
        email: row.email || '',
        fullName: row.full_name || null,
        phone: row.phone || null,
        country: row.country || null,
        city: row.city || null,
        address: row.address || null,
        zipCode: row.zip_code || null,
        referralId: row.referral_id || null,
        referredBy: row.referred_by || null,
        referralStatus: row.referral_status || 'Pending',
        verified: Boolean(row.verified),
        enabled: Boolean(row.enabled),
        passwordResetToken: row.password_reset_token || null,
        passwordResetExpires: row.password_reset_expires || null,
        emailVerificationToken: row.email_verification_token || null,
        emailVerificationExpires: row.email_verification_expires || null,
        emailVerified: Boolean(row.email_verified),
        nextOfKinName: row.next_of_kin_name || null,
        nextOfKinFile: row.next_of_kin_file || null,
        createdAt: row.created_at || new Date(),
      })) as User[];
    } catch (error: any) {
      console.error("[DbStorage.getAllUsers] PostgreSQL query error:", error.message);
      console.error("[DbStorage.getAllUsers] Error stack:", error.stack);
      
      // Fallback: try Drizzle ORM query
      try {
        console.log("[DbStorage.getAllUsers] Trying Drizzle ORM fallback...");
        const drizzleUsers = await db.select().from(users);
        console.log(`[DbStorage.getAllUsers] Drizzle fallback found ${drizzleUsers.length} users`);
        return drizzleUsers;
      } catch (drizzleError: any) {
        console.error("[DbStorage.getAllUsers] Drizzle fallback also failed:", drizzleError.message);
        throw new Error(`Failed to fetch users: ${error.message}`);
      }
    }
  }

  async getUsersByCountry(country: string): Promise<User[]> {
    const db = await getDb();
    return await db.select().from(users).where(eq(users.country, country));
  }

  // Trading Accounts
  async getTradingAccounts(userId: string): Promise<TradingAccount[]> {
    const db = await getDb();
    return await db.select().from(tradingAccounts).where(eq(tradingAccounts.userId, userId));
  }

  async getTradingAccount(id: string): Promise<TradingAccount | undefined> {
    const db = await getDb();
    const result = await db.select().from(tradingAccounts).where(eq(tradingAccounts.id, id)).limit(1);
    return result[0];
  }

  async createTradingAccount(account: InsertTradingAccount): Promise<TradingAccount> {
    const db = await getDb();
    
    if (isMySQL()) {
      await db.insert(tradingAccounts).values(account);
      const result = await db.select().from(tradingAccounts)
        .where(eq(tradingAccounts.accountId, account.accountId))
        .limit(1);
      if (!result[0]) {
        throw new Error('Failed to create trading account');
      }
      return result[0];
    } else {
      const result = await db.insert(tradingAccounts).values(account).returning();
      return result[0];
    }
  }

  async updateTradingAccount(id: string, updates: Partial<TradingAccount>): Promise<TradingAccount | undefined> {
    const db = await getDb();
    const result = await db.update(tradingAccounts).set(updates).where(eq(tradingAccounts.id, id)).returning();
    return result[0];
  }

  async deleteTradingAccount(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(tradingAccounts).where(eq(tradingAccounts.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getAllTradingAccounts(): Promise<TradingAccount[]> {
    const db = await getDb();
    const databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL;
    const isMySQL = databaseUrl?.startsWith('mysql://') || databaseUrl?.startsWith('mariadb://');
    
    if (isMySQL) {
      // MySQL has different schema - map actual columns to expected format
      try {
        const { pool } = await import('./db.js');
        if (!pool) {
          throw new Error('MySQL pool not available');
        }
        
        const [rows] = await pool.execute(`
          SELECT 
            CAST(id AS CHAR) as id,
            CAST(userID AS CHAR) as user_id,
            CAST(mt5id AS CHAR) as account_id,
            password,
            type,
            u_group as \`group\`,
            CAST(leverage AS CHAR) as leverage,
            COALESCE(equity, '0') as balance,
            COALESCE(equity, '0') as equity,
            '0' as margin,
            '0' as free_margin,
            '0' as margin_level,
            'USD' as currency,
            'Binofox-Live' as server,
            CASE WHEN status = 'approved' THEN 1 ELSE 0 END as enabled,
            created_at
          FROM trading_accounts
          ORDER BY created_at DESC
        `);
        
        const accountRows = Array.isArray(rows) ? rows : [];
        
        return accountRows.map((row: any) => ({
          id: String(row.id),
          userId: String(row.user_id),
          accountId: String(row.account_id),
          password: row.password || '',
          type: row.type || '',
          group: row.group || '',
          leverage: String(row.leverage || '1'),
          balance: String(row.balance || '0'),
          equity: String(row.equity || '0'),
          margin: String(row.margin || '0'),
          freeMargin: String(row.free_margin || '0'),
          marginLevel: String(row.margin_level || '0'),
          currency: row.currency || 'USD',
          server: row.server || 'Binofox-Live',
          enabled: Boolean(row.enabled),
          createdAt: row.created_at || new Date(),
        })) as TradingAccount[];
      } catch (error: any) {
        console.error("[DbStorage.getAllTradingAccounts] MySQL query error:", error.message);
        throw error;
      }
    } else {
      // PostgreSQL/SQLite - use normal query
      return await db.select().from(tradingAccounts);
    }
  }

  // Deposits
  async getDeposits(userId: string): Promise<Deposit[]> {
    const db = await getDb();
    return await db.select().from(deposits).where(eq(deposits.userId, userId)).orderBy(desc(deposits.createdAt));
  }

  async getDeposit(id: string): Promise<Deposit | undefined> {
    const db = await getDb();
    const result = await db.select().from(deposits).where(eq(deposits.id, id)).limit(1);
    return result[0];
  }

  async getDepositByTransactionId(transactionId: string): Promise<Deposit | undefined> {
    const db = await getDb();
    const result = await db.select().from(deposits).where(eq(deposits.transactionId, transactionId)).limit(1);
    return result[0];
  }

  async deleteDeposit(id: string): Promise<boolean> {
    const db = await getDb();
    try {
      await db.delete(deposits).where(eq(deposits.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting deposit:", error);
      return false;
    }
  }

  async createDeposit(deposit: InsertDeposit): Promise<Deposit> {
    const db = await getDb();
    
    if (isMySQL()) {
      // Generate ID if not provided
      const depositWithId = { ...deposit, id: deposit.id || randomUUID() };
      await db.insert(deposits).values(depositWithId);
      const result = await db.select().from(deposits)
        .where(eq(deposits.id, depositWithId.id))
        .limit(1);
      if (!result[0]) {
        throw new Error('Failed to create deposit');
      }
      return result[0];
    } else {
      const result = await db.insert(deposits).values(deposit).returning();
      return result[0];
    }
  }

  async updateDeposit(id: string, updates: Partial<Deposit>): Promise<Deposit | undefined> {
    const db = await getDb();
    const result = await db.update(deposits).set(updates).where(eq(deposits.id, id)).returning();
    return result[0];
  }

  async updateDepositStatus(id: string, status: string): Promise<Deposit | undefined> {
    const db = await getDb();
    const result = await db.update(deposits).set({ status }).where(eq(deposits.id, id)).returning();
    return result[0];
  }

  async getAllDeposits(): Promise<Deposit[]> {
    const db = await getDb();
    const databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL;
    const isMySQL = databaseUrl?.startsWith('mysql://') || databaseUrl?.startsWith('mariadb://');
    
    if (isMySQL) {
      // MySQL has different schema - map actual columns to expected format
      try {
        const { pool } = await import('./db.js');
        if (!pool) {
          throw new Error('MySQL pool not available');
        }
        
        const [rows] = await pool.execute(`
          SELECT 
            CAST(id AS CHAR) as id,
            CAST(userID AS CHAR) as user_id,
            CAST(mt5id AS CHAR) as account_id,
            COALESCE(merchant, '') as merchant,
            COALESCE(amount, '0') as amount,
            'USD' as currency,
            COALESCE(status, 'Pending') as status,
            transactionID as transaction_id,
            attachment as verification_file,
            deposit_date,
            created_at,
            NULL as completed_at
          FROM deposits
          ORDER BY created_at DESC
        `);
        
        const depositRows = Array.isArray(rows) ? rows : [];
        
        return depositRows.map((row: any) => ({
          id: String(row.id),
          userId: String(row.user_id),
          accountId: String(row.account_id),
          merchant: row.merchant || '',
          amount: String(row.amount || '0'),
          currency: row.currency || 'USD',
          status: row.status || 'Pending',
          transactionId: row.transaction_id || null,
          verificationFile: row.verification_file || null,
          depositDate: row.deposit_date ? new Date(row.deposit_date) : new Date(),
          createdAt: row.created_at || new Date(),
          completedAt: row.completed_at || null,
        })) as Deposit[];
      } catch (error: any) {
        console.error("[DbStorage.getAllDeposits] MySQL query error:", error.message);
        throw error;
      }
    } else {
      // PostgreSQL/SQLite - use normal query
      return await db.select().from(deposits).orderBy(desc(deposits.createdAt));
    }
  }

  // Withdrawals
  async getWithdrawals(userId: string): Promise<Withdrawal[]> {
    const db = await getDb();
    return await db.select().from(withdrawals).where(eq(withdrawals.userId, userId)).orderBy(desc(withdrawals.createdAt));
  }

  async getWithdrawal(id: string): Promise<Withdrawal | undefined> {
    const db = await getDb();
    const result = await db.select().from(withdrawals).where(eq(withdrawals.id, id)).limit(1);
    return result[0];
  }

  async createWithdrawal(withdrawal: InsertWithdrawal): Promise<Withdrawal> {
    const db = await getDb();
    
    if (isMySQL()) {
      // Generate ID if not provided
      const withdrawalWithId = { ...withdrawal, id: withdrawal.id || randomUUID() };
      await db.insert(withdrawals).values(withdrawalWithId);
      const result = await db.select().from(withdrawals)
        .where(eq(withdrawals.id, withdrawalWithId.id))
        .limit(1);
      if (!result[0]) {
        throw new Error('Failed to create withdrawal');
      }
      return result[0];
    } else {
      const result = await db.insert(withdrawals).values(withdrawal).returning();
      return result[0];
    }
  }

  async updateWithdrawal(id: string, updates: Partial<Withdrawal>): Promise<Withdrawal | undefined> {
    const db = await getDb();
    const result = await db.update(withdrawals).set(updates).where(eq(withdrawals.id, id)).returning();
    return result[0];
  }

  async getAllWithdrawals(): Promise<Withdrawal[]> {
    const db = await getDb();
    return await db.select().from(withdrawals).orderBy(desc(withdrawals.createdAt));
  }

  // Trading History
  async getTradingHistory(userId: string, accountId?: string): Promise<TradingHistory[]> {
    const db = await getDb();
    if (accountId) {
      return await db.select().from(tradingHistory)
        .where(and(eq(tradingHistory.userId, userId), eq(tradingHistory.accountId, accountId)))
        .orderBy(desc(tradingHistory.openTime));
    }
    return await db.select().from(tradingHistory).where(eq(tradingHistory.userId, userId)).orderBy(desc(tradingHistory.openTime));
  }

  async createTradingHistory(history: InsertTradingHistory): Promise<TradingHistory> {
    const db = await getDb();
    
    if (isMySQL()) {
      // Generate ID if not provided
      const historyWithId = { ...history, id: history.id || randomUUID() };
      await db.insert(tradingHistory).values(historyWithId);
      const result = await db.select().from(tradingHistory)
        .where(eq(tradingHistory.id, historyWithId.id))
        .limit(1);
      if (!result[0]) {
        throw new Error('Failed to create trading history');
      }
      return result[0];
    } else {
      const result = await db.insert(tradingHistory).values(history).returning();
      return result[0];
    }
  }

  async getAllTradingHistory(): Promise<TradingHistory[]> {
    const db = await getDb();
    return await db.select().from(tradingHistory).orderBy(desc(tradingHistory.openTime));
  }

  // Documents
  async getDocuments(userId: string): Promise<Document[]> {
    const db = await getDb();
    return await db.select().from(documents).where(eq(documents.userId, userId)).orderBy(desc(documents.uploadedAt));
  }

  async getDocument(id: string): Promise<Document | undefined> {
    const db = await getDb();
    const result = await db.select().from(documents).where(eq(documents.id, id)).limit(1);
    return result[0];
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const db = await getDb();
    
    if (isMySQL()) {
      // Generate ID if not provided
      const documentWithId = { ...document, id: document.id || randomUUID() };
      await db.insert(documents).values(documentWithId);
      const result = await db.select().from(documents)
        .where(eq(documents.id, documentWithId.id))
        .limit(1);
      if (!result[0]) {
        throw new Error('Failed to create document');
      }
      return result[0];
    } else {
      const result = await db.insert(documents).values(document).returning();
      return result[0];
    }
  }

  async updateDocument(id: string, updates: Partial<Document>): Promise<Document | undefined> {
    const db = await getDb();
    const result = await db.update(documents).set(updates).where(eq(documents.id, id)).returning();
    return result[0];
  }

  async deleteDocument(id: string): Promise<boolean> {
    const db = await getDb();
    try {
      await db.delete(documents).where(eq(documents.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting document:", error);
      return false;
    }
  }

  async deleteDocumentsByStatus(status: string): Promise<number> {
    const db = await getDb();
    try {
      const result = await db.delete(documents).where(eq(documents.status, status)).returning();
      return result.length;
    } catch (error) {
      console.error("Error deleting documents by status:", error);
      return 0;
    }
  }

  async getAllDocuments(): Promise<Document[]> {
    const db = await getDb();
    try {
      // Optimized: Database already sorts by uploadedAt DESC efficiently
      // No need for additional sorting or limits - let database handle it
      const result = await db
        .select()
        .from(documents)
        .orderBy(desc(documents.uploadedAt));
      return result || [];
    } catch (error) {
      console.error("Error fetching all documents:", error);
      return [];
    }
  }

  // Notifications
  async getNotifications(userId: string): Promise<Notification[]> {
    const db = await getDb();
    return await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const db = await getDb();
    
    if (isMySQL()) {
      // Generate ID if not provided
      const notificationWithId = { ...notification, id: notification.id || randomUUID() };
      await db.insert(notifications).values(notificationWithId);
      const result = await db.select().from(notifications)
        .where(eq(notifications.id, notificationWithId.id))
        .limit(1);
      if (!result[0]) {
        throw new Error('Failed to create notification');
      }
      return result[0];
    } else {
      const result = await db.insert(notifications).values(notification).returning();
      return result[0];
    }
  }

  async markNotificationAsRead(id: string): Promise<void> {
    const db = await getDb();
    await db.update(notifications).set({ read: true }).where(eq(notifications.id, id));
  }

  // Admin Users
  async getAdminUser(id: string): Promise<AdminUser | undefined> {
    const db = await getDb();
    const result = await db.select({
      id: adminUsers.id,
      username: adminUsers.username,
      password: adminUsers.password,
      email: adminUsers.email,
      fullName: adminUsers.fullName,
      role: adminUsers.role,
      enabled: adminUsers.enabled,
      createdAt: adminUsers.createdAt,
      createdBy: adminUsers.createdBy,
    }).from(adminUsers).where(eq(adminUsers.id, id)).limit(1);
    
    const admin = result[0];
    if (admin) {
      console.log("[DbStorage.getAdminUser] Admin retrieved:", {
        id: admin.id,
        username: admin.username,
        role: admin.role,
        roleType: typeof admin.role,
        hasRole: 'role' in admin,
        allKeys: Object.keys(admin),
      });
    }
    return admin;
  }

  async getAdminUserByUsername(username: string): Promise<AdminUser | undefined> {
    const db = await getDb();
    // Try exact match first (faster)
    let result = await db.select().from(adminUsers).where(eq(adminUsers.username, username)).limit(1);
    if (result[0]) {
      return result[0];
    }
    // Fallback to case-insensitive match using LOWER() which works for both SQLite and PostgreSQL
    try {
      const lowerUsername = username.toLowerCase();
      result = await db.select().from(adminUsers)
        .where(sql`LOWER(${adminUsers.username}) = ${lowerUsername}`)
        .limit(1);
    } catch (error) {
      console.error("[DbStorage.getAdminUserByUsername] Case-insensitive lookup error:", error);
      // Return undefined if case-insensitive lookup fails
      return undefined;
    }
    return result[0];
  }

  async getAdminByUsername(username: string): Promise<AdminUser | undefined> {
    const db = await getDb();
    const result = await db.select().from(adminUsers).where(eq(adminUsers.username, username)).limit(1);
    return result[0];
  }

  async getAdminUserByEmail(email: string): Promise<AdminUser | undefined> {
    const db = await getDb();
    const result = await db.select({
      id: adminUsers.id,
      username: adminUsers.username,
      password: adminUsers.password,
      email: adminUsers.email,
      fullName: adminUsers.fullName,
      role: adminUsers.role,
      enabled: adminUsers.enabled,
      createdAt: adminUsers.createdAt,
      createdBy: adminUsers.createdBy,
    }).from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
    return result[0];
  }

  async getAdminByEmail(email: string): Promise<AdminUser | undefined> {
    const db = await getDb();
    const result = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
    return result[0];
  }

  async createAdminUser(admin: InsertAdminUser): Promise<AdminUser> {
    const db = await getDb();
    const result = await db.insert(adminUsers).values(admin).returning();
    return result[0];
  }

  async updateAdminUser(id: string, updates: Partial<AdminUser>): Promise<AdminUser | undefined> {
    const db = await getDb();
    const result = await db.update(adminUsers).set(updates).where(eq(adminUsers.id, id)).returning();
    return result[0];
  }

  async deleteAdminUser(id: string): Promise<boolean> {
    const db = await getDb();
    try {
      // First delete country assignments
      await db.delete(adminCountryAssignments).where(eq(adminCountryAssignments.adminId, id));
      // Then delete the admin user
      await db.delete(adminUsers).where(eq(adminUsers.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting admin user:", error);
      return false;
    }
  }

  async getAllAdminUsers(): Promise<AdminUser[]> {
    const db = await getDb();
    return await db.select({
      id: adminUsers.id,
      username: adminUsers.username,
      password: adminUsers.password,
      email: adminUsers.email,
      fullName: adminUsers.fullName,
      role: adminUsers.role,
      enabled: adminUsers.enabled,
      createdAt: adminUsers.createdAt,
      createdBy: adminUsers.createdBy,
    }).from(adminUsers);
  }

  // Admin Country Assignments
  async getAdminCountryAssignments(adminId: string): Promise<AdminCountryAssignment[]> {
    const db = await getDb();
    return await db.select().from(adminCountryAssignments).where(eq(adminCountryAssignments.adminId, adminId));
  }

  async createAdminCountryAssignment(assignment: InsertAdminCountryAssignment): Promise<AdminCountryAssignment> {
    const db = await getDb();
    const result = await db.insert(adminCountryAssignments).values(assignment).returning();
    return result[0];
  }

  async deleteAdminCountryAssignment(adminId: string, country: string): Promise<void> {
    const db = await getDb();
    await db.delete(adminCountryAssignments)
      .where(and(eq(adminCountryAssignments.adminId, adminId), eq(adminCountryAssignments.country, country)));
  }

  // Activity Logs
  async getActivityLogs(adminId?: string): Promise<ActivityLog[]> {
    const db = await getDb();
    if (adminId) {
      return await db.select().from(activityLogs).where(eq(activityLogs.adminId, adminId)).orderBy(desc(activityLogs.createdAt));
    }
    return await db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt));
  }

  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const db = await getDb();
    const result = await db.insert(activityLogs).values(log).returning();
    return result[0];
  }

  // Support Tickets
  async getSupportTickets(userId?: string): Promise<SupportTicket[]> {
    const db = await getDb();
    if (userId) {
      return await db.select().from(supportTickets).where(eq(supportTickets.userId, userId)).orderBy(desc(supportTickets.createdAt));
    }
    return await db.select().from(supportTickets).orderBy(desc(supportTickets.createdAt));
  }

  async getSupportTicket(id: string): Promise<SupportTicket | undefined> {
    const db = await getDb();
    const result = await db.select().from(supportTickets).where(eq(supportTickets.id, id)).limit(1);
    return result[0];
  }

  async createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket> {
    const db = await getDb();
    const result = await db.insert(supportTickets).values(ticket).returning();
    return result[0];
  }

  async updateSupportTicketStatus(id: string, status: string): Promise<SupportTicket | undefined> {
    const db = await getDb();
    const now = new Date();
    const result = await db.update(supportTickets)
      .set({ 
        status, 
        updatedAt: now,
        resolvedAt: status === "Resolved" || status === "Closed" ? now : undefined
      })
      .where(eq(supportTickets.id, id))
      .returning();
    return result[0];
  }

  async getSupportTicketReplies(ticketId: string): Promise<SupportTicketReply[]> {
    const db = await getDb();
    return await db.select().from(supportTicketReplies).where(eq(supportTicketReplies.ticketId, ticketId)).orderBy(supportTicketReplies.createdAt);
  }

  async createSupportTicketReply(reply: InsertSupportTicketReply): Promise<SupportTicketReply> {
    const db = await getDb();
    const result = await db.insert(supportTicketReplies).values(reply).returning();
    // Update ticket's updatedAt
    await db.update(supportTickets)
      .set({ updatedAt: new Date() })
      .where(eq(supportTickets.id, reply.ticketId));
    return result[0];
  }

  // Fund Transfers
  async getFundTransfers(userId?: string): Promise<FundTransfer[]> {
    const db = await getDb();
    
    try {
      console.log(`[DbStorage.getFundTransfers] Fetching transfers${userId ? ` for user ${userId}` : ' (all transfers)'}...`);
      
      if (userId) {
        const transfers = await db.select().from(fundTransfers).where(eq(fundTransfers.userId, userId)).orderBy(desc(fundTransfers.createdAt));
        console.log(`[DbStorage.getFundTransfers] Found ${transfers.length} transfers for user ${userId}`);
        return transfers;
      }
      
      const transfers = await db.select().from(fundTransfers).orderBy(desc(fundTransfers.createdAt));
      console.log(`[DbStorage.getFundTransfers] Found ${transfers.length} total transfers`);
      return transfers;
    } catch (error: any) {
      console.error("[DbStorage.getFundTransfers] PostgreSQL query error:", error.message);
      console.error("[DbStorage.getFundTransfers] Error stack:", error.stack);
      throw new Error(`Failed to fetch fund transfers: ${error.message}`);
    }
  }

  async createFundTransfer(transfer: InsertFundTransfer): Promise<FundTransfer> {
    const db = await getDb();
    
    try {
      console.log(`[DbStorage.createFundTransfer] Creating transfer:`, {
        userId: transfer.userId,
        fromAccountId: transfer.fromAccountId,
        toAccountId: transfer.toAccountId,
        amount: transfer.amount,
        status: transfer.status,
      });
      
      const result = await db.insert(fundTransfers).values(transfer).returning();
      const createdTransfer = result[0];
      
      console.log(`[DbStorage.createFundTransfer] Transfer created successfully: ${createdTransfer.id}`);
      return createdTransfer;
    } catch (error: any) {
      console.error("[DbStorage.createFundTransfer] PostgreSQL insert error:", error.message);
      console.error("[DbStorage.createFundTransfer] Error stack:", error.stack);
      throw new Error(`Failed to create fund transfer: ${error.message}`);
    }
  }

  // IB/CB Wallets
  async getIBCBWallets(userId?: string): Promise<IbCbWallet[]> {
    const db = await getDb();
    if (userId) {
      return await db.select().from(ibCbWallets).where(eq(ibCbWallets.userId, userId)).orderBy(desc(ibCbWallets.createdAt));
    }
    return await db.select().from(ibCbWallets).orderBy(desc(ibCbWallets.createdAt));
  }

  async getIBCBWallet(id: string): Promise<IbCbWallet | undefined> {
    const db = await getDb();
    const result = await db.select().from(ibCbWallets).where(eq(ibCbWallets.id, id)).limit(1);
    return result[0];
  }

  async createIBCBWallet(wallet: InsertIbCbWallet): Promise<IbCbWallet> {
    const db = await getDb();
    const result = await db.insert(ibCbWallets).values(wallet).returning();
    return result[0];
  }

  async updateIBCBWallet(id: string, updates: Partial<IbCbWallet>): Promise<IbCbWallet | undefined> {
    const db = await getDb();
    const result = await db.update(ibCbWallets).set(updates).where(eq(ibCbWallets.id, id)).returning();
    return result[0];
  }

  // Activity Logs - Get all (for super admin)
  async getAllActivityLogs(): Promise<ActivityLog[]> {
    const db = await getDb();
    return await db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt));
  }

  // Trading Accounts by User ID (for MT5)
  async getTradingAccountsByUserId(userId: string): Promise<TradingAccount[]> {
    const db = await getDb();
    return await db.select().from(tradingAccounts).where(eq(tradingAccounts.userId, userId));
  }

  // Additional methods from IStorage interface
  async createTrade(trade: InsertTradingHistory): Promise<TradingHistory> {
    return this.createTradingHistory(trade);
  }

  async updateTrade(id: string, updates: Partial<TradingHistory>): Promise<TradingHistory | undefined> {
    const db = await getDb();
    const result = await db.update(tradingHistory).set(updates).where(eq(tradingHistory.id, id)).returning();
    return result[0];
  }

  async getPendingDocuments(): Promise<Document[]> {
    const db = await getDb();
    return await db.select().from(documents).where(eq(documents.status, "Pending")).orderBy(desc(documents.uploadedAt));
  }

  // Crypto Wallets
  async getCryptoWallet(cryptoType: string): Promise<CryptoWallet | undefined> {
    const db = await getDb();
    const result = await db.select().from(cryptoWallets)
      .where(and(
        eq(cryptoWallets.cryptoType, cryptoType),
        eq(cryptoWallets.enabled, true)
      ))
      .limit(1);
    return result[0];
  }

  async getAllCryptoWallets(): Promise<CryptoWallet[]> {
    try {
      const db = await getDb();
      const result = await db.select().from(cryptoWallets).orderBy(cryptoWallets.cryptoType);
      return result;
    } catch (error: any) {
      console.error("[DbStorage.getAllCryptoWallets] Error:", error);
      console.error("[DbStorage.getAllCryptoWallets] Error details:", {
        message: error.message,
        stack: error.stack,
        code: error.code,
      });
      throw error;
    }
  }

  async createCryptoWallet(wallet: InsertCryptoWallet): Promise<CryptoWallet> {
    const db = await getDb();
    
    if (isMySQL()) {
      // Generate ID if not provided
      const walletWithId = { ...wallet, id: wallet.id || randomUUID() };
      await db.insert(cryptoWallets).values(walletWithId);
      const result = await db.select().from(cryptoWallets)
        .where(eq(cryptoWallets.id, walletWithId.id))
        .limit(1);
      if (!result[0]) {
        throw new Error('Failed to create crypto wallet');
      }
      return result[0];
    } else {
      const result = await db.insert(cryptoWallets).values(wallet).returning();
      return result[0];
    }
  }

  async updateCryptoWallet(id: string, updates: Partial<CryptoWallet>): Promise<CryptoWallet | undefined> {
    const db = await getDb();
    const result = await db.update(cryptoWallets).set(updates).where(eq(cryptoWallets.id, id)).returning();
    return result[0];
  }

  // Refresh Tokens
  async createRefreshToken(token: InsertRefreshToken): Promise<RefreshToken> {
    const db = await getDb();
    
    if (isMySQL()) {
      // Generate ID if not provided
      const tokenWithId = { ...token, id: (token as any).id || randomUUID() };
      await db.insert(refreshTokens).values(tokenWithId);
      // Use tokenHash as it's unique for lookup
      const tokenHash = (tokenWithId as any).tokenHash || token.tokenHash;
      if (!tokenHash) {
        throw new Error('RefreshToken tokenHash is required');
      }
      const result = await db.select().from(refreshTokens)
        .where(eq(refreshTokens.tokenHash, tokenHash))
        .limit(1);
      if (!result[0]) {
        throw new Error('Failed to create refresh token');
      }
      return result[0];
    } else {
      const result = await db.insert(refreshTokens).values(token).returning();
      return result[0];
    }
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
    
    // Return updated token
    const result = await db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.id, id))
      .limit(1);
    return result[0];
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
    // Return count of affected rows (approximate)
    const countResult = await db
      .select()
      .from(refreshTokens)
      .where(and(
        eq(refreshTokens.userId, userId),
        eq(refreshTokens.revoked, true)
      ));
    return countResult.length;
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
    // Return count of deleted rows (approximate)
    return result.rowCount || 0;
  }

  // Topup Cards
  async createTopupCard(card: InsertTopupCard): Promise<TopupCard> {
    const db = await getDb();
    // Encrypt CVV before storing
    const encryptedCvv = await bcrypt.hash(card.cvv, 10);
    const cardWithEncryptedCvv = { ...card, cvv: encryptedCvv };
    
    if (isMySQL()) {
      const cardWithId = { ...cardWithEncryptedCvv, id: randomUUID() };
      await db.insert(topupCards).values(cardWithId);
      const result = await db.select().from(topupCards).where(eq(topupCards.id, cardWithId.id)).limit(1);
      return result[0];
    } else {
      const result = await db.insert(topupCards).values(cardWithEncryptedCvv).returning();
      return result[0];
    }
  }

  async getTopupCard(id: string): Promise<TopupCard | undefined> {
    const db = await getDb();
    const result = await db.select().from(topupCards).where(eq(topupCards.id, id)).limit(1);
    return result[0];
  }

  async getTopupCardByCardNumber(cardNumber: string): Promise<TopupCard | undefined> {
    const db = await getDb();
    const result = await db.select().from(topupCards).where(eq(topupCards.cardNumber, cardNumber)).limit(1);
    return result[0];
  }

  async getAllTopupCards(): Promise<TopupCard[]> {
    const db = await getDb();
    return await db.select().from(topupCards).orderBy(desc(topupCards.createdAt));
  }

  async getTopupCardsByUser(userId: string): Promise<TopupCard[]> {
    const db = await getDb();
    return await db.select().from(topupCards)
      .where(and(
        eq(topupCards.assignedToUserId, userId),
        eq(topupCards.enabled, true)
      ))
      .orderBy(desc(topupCards.createdAt));
  }

  async updateTopupCard(id: string, updates: Partial<TopupCard>): Promise<TopupCard | undefined> {
    const db = await getDb();
    const updateData: any = { ...updates, updatedAt: new Date() };
    
    // If CVV is being updated, encrypt it
    if (updateData.cvv) {
      updateData.cvv = await bcrypt.hash(updateData.cvv, 10);
    }
    
    const result = await db.update(topupCards)
      .set(updateData)
      .where(eq(topupCards.id, id))
      .returning();
    return result[0];
  }

  async loadFundsToCard(cardId: string, amount: string): Promise<TopupCard | undefined> {
    const db = await getDb();
    const card = await this.getTopupCard(cardId);
    if (!card) return undefined;
    
    const currentBalance = parseFloat(card.balance || "0");
    const additionalAmount = parseFloat(amount);
    const newBalance = (currentBalance + additionalAmount).toFixed(2);
    
    return await this.updateTopupCard(cardId, { balance: newBalance });
  }

  async assignCardToUser(cardId: string, userId: string): Promise<TopupCard | undefined> {
    return await this.updateTopupCard(cardId, { assignedToUserId: userId });
  }

  async useCardForDeposit(cardId: string, amount: string): Promise<boolean> {
    const db = await getDb();
    const card = await this.getTopupCard(cardId);
    if (!card || !card.enabled) return false;
    
    const currentBalance = parseFloat(card.balance || "0");
    const depositAmount = parseFloat(amount);
    
    if (currentBalance < depositAmount) {
      return false; // Insufficient balance
    }
    
    const newBalance = (currentBalance - depositAmount).toFixed(2);
    await this.updateTopupCard(cardId, { balance: newBalance });
    return true;
  }
}

