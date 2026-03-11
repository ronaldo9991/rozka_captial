import { 
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
  type StripePayment, type InsertStripePayment,
  type CryptoWallet, type InsertCryptoWallet,
  type RefreshToken, type InsertRefreshToken,
  type TopupCard, type InsertTopupCard
} from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByReferralId(referralId: string): Promise<User | undefined>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  getUsersByCountry(country: string): Promise<User[]>;
  
  // Trading Accounts
  getTradingAccounts(userId: string): Promise<TradingAccount[]>;
  getTradingAccount(id: string): Promise<TradingAccount | undefined>;
  createTradingAccount(account: InsertTradingAccount): Promise<TradingAccount>;
  updateTradingAccount(id: string, updates: Partial<TradingAccount>): Promise<TradingAccount | undefined>;
  deleteTradingAccount(id: string): Promise<boolean>;
  getAllTradingAccounts(): Promise<TradingAccount[]>;
  
  // Deposits
  getDeposits(userId: string): Promise<Deposit[]>;
  getDeposit(id: string): Promise<Deposit | undefined>;
  getDepositByTransactionId(transactionId: string): Promise<Deposit | undefined>;
  deleteDeposit(id: string): Promise<boolean>;
  createDeposit(deposit: InsertDeposit): Promise<Deposit>;
  updateDeposit(id: string, updates: Partial<Deposit>): Promise<Deposit | undefined>;
  updateDepositStatus(id: string, status: string): Promise<Deposit | undefined>;
  getAllDeposits(): Promise<Deposit[]>;
  
  // Stripe Payments
  createStripePayment(payment: InsertStripePayment): Promise<StripePayment>;
  getStripePayment(id: string): Promise<StripePayment | undefined>;
  getStripePaymentByIntentId(paymentIntentId: string): Promise<StripePayment | undefined>;
  updateStripePaymentStatus(id: string, status: string): Promise<StripePayment | undefined>;
  
  // Withdrawals
  getWithdrawals(userId: string): Promise<Withdrawal[]>;
  getWithdrawal(id: string): Promise<Withdrawal | undefined>;
  createWithdrawal(withdrawal: InsertWithdrawal): Promise<Withdrawal>;
  updateWithdrawal(id: string, updates: Partial<Withdrawal>): Promise<Withdrawal | undefined>;
  getAllWithdrawals(): Promise<Withdrawal[]>;
  
  // Trading History
  getTradingHistory(userId: string, accountId?: string): Promise<TradingHistory[]>;
  createTrade(trade: InsertTradingHistory): Promise<TradingHistory>;
  updateTrade(id: string, updates: Partial<TradingHistory>): Promise<TradingHistory | undefined>;
  
  // Documents
  getDocuments(userId: string): Promise<Document[]>;
  getDocument(id: string): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: string, updates: Partial<Document>): Promise<Document | undefined>;
  deleteDocument(id: string): Promise<boolean>;
  deleteDocumentsByStatus(status: string): Promise<number>;
  getAllDocuments(): Promise<Document[]>;
  getPendingDocuments(): Promise<Document[]>;
  
  // Notifications
  getNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<void>;
  
  // Admin Users
  getAdminUser(id: string): Promise<AdminUser | undefined>;
  getAdminUserByUsername(username: string): Promise<AdminUser | undefined>;
  getAdminUserByEmail(email: string): Promise<AdminUser | undefined>;
  createAdminUser(admin: InsertAdminUser): Promise<AdminUser>;
  updateAdminUser(id: string, updates: Partial<AdminUser>): Promise<AdminUser | undefined>;
  deleteAdminUser(id: string): Promise<boolean>;
  getAllAdminUsers(): Promise<AdminUser[]>;
  
  // Admin Country Assignments
  getAdminCountryAssignments(adminId: string): Promise<AdminCountryAssignment[]>;
  createAdminCountryAssignment(assignment: InsertAdminCountryAssignment): Promise<AdminCountryAssignment>;
  deleteAdminCountryAssignment(adminId: string, country: string): Promise<void>;
  
  // Activity Logs
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  getActivityLogs(adminId?: string): Promise<ActivityLog[]>;
  getAllActivityLogs(): Promise<ActivityLog[]>;
  
  // Crypto Wallets
  getCryptoWallet(cryptoType: string): Promise<CryptoWallet | undefined>;
  getAllCryptoWallets(): Promise<CryptoWallet[]>;
  createCryptoWallet(wallet: InsertCryptoWallet): Promise<CryptoWallet>;
  updateCryptoWallet(id: string, updates: Partial<CryptoWallet>): Promise<CryptoWallet | undefined>;
  
  // Topup Cards
  createTopupCard(card: InsertTopupCard): Promise<TopupCard>;
  getTopupCard(id: string): Promise<TopupCard | undefined>;
  getTopupCardByCardNumber(cardNumber: string): Promise<TopupCard | undefined>;
  getAllTopupCards(): Promise<TopupCard[]>;
  getTopupCardsByUser(userId: string): Promise<TopupCard[]>;
  updateTopupCard(id: string, updates: Partial<TopupCard>): Promise<TopupCard | undefined>;
  loadFundsToCard(cardId: string, amount: string): Promise<TopupCard | undefined>;
  assignCardToUser(cardId: string, userId: string): Promise<TopupCard | undefined>;
  useCardForDeposit(cardId: string, amount: string): Promise<boolean>;
  
  // Refresh Tokens (for mobile app)
  createRefreshToken(token: InsertRefreshToken): Promise<RefreshToken>;
  getRefreshTokenByHash(tokenHash: string): Promise<RefreshToken | undefined>;
  updateRefreshToken(id: string, updates: Partial<RefreshToken>): Promise<RefreshToken | undefined>;
  revokeRefreshToken(tokenHash: string): Promise<boolean>;
  revokeAllUserTokens(userId: string): Promise<number>;
  getUserDevices(userId: string): Promise<RefreshToken[]>;
  revokeDevice(userId: string, deviceId: string): Promise<boolean>;
  cleanupExpiredTokens(): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private tradingAccounts: Map<string, TradingAccount>;
  private deposits: Map<string, Deposit>;
  private withdrawals: Map<string, Withdrawal>;
  private tradingHistory: Map<string, TradingHistory>;
  private documents: Map<string, Document>;
  private notifications: Map<string, Notification>;
  private adminUsers: Map<string, AdminUser>;
  private adminCountryAssignments: Map<string, AdminCountryAssignment>;
  private activityLogs: Map<string, ActivityLog>;
  private stripePayments: Map<string, StripePayment>;
  private cryptoWallets: Map<string, CryptoWallet>;

  constructor() {
    this.users = new Map();
    this.tradingAccounts = new Map();
    this.deposits = new Map();
    this.withdrawals = new Map();
    this.tradingHistory = new Map();
    this.documents = new Map();
    this.notifications = new Map();
    this.adminUsers = new Map();
    this.adminCountryAssignments = new Map();
    this.activityLogs = new Map();
    this.stripePayments = new Map();
    this.cryptoWallets = new Map();
    
    // Add some initial mock data for development
    this.seedData();
  }

  private seedData() {
    // Create a demo user
    const userId = randomUUID();
    const demoUser: User = {
      id: userId,
      username: "demo",
      password: "$2a$10$demohashedpassword", // hashed "demo123"
      email: "demo.com",
      fullName: "Demo User",
      phone: "+1234567890",
      country: "United States",
      city: "New York",
      address: "123 Trading Street",
      zipCode: "10001",
      verified: true,
      enabled: true,
      createdAt: new Date(),
    };
    this.users.set(userId, demoUser);

    // Create demo trading accounts
    const account1Id = randomUUID();
    const account1: TradingAccount = {
      id: account1Id,
      userId,
      accountId: "MT5-1001",
      password: "trader@123",
      type: "Live",
      group: "Standard",
      leverage: "1:100",
      balance: "10250.00",
      equity: "10450.00",
      margin: "2100.00",
      freeMargin: "8350.00",
      marginLevel: "497.62",
      currency: "USD",
      server: "Rozka-Live",
      enabled: true,
      createdAt: new Date("2024-01-15"),
    };
    this.tradingAccounts.set(account1Id, account1);

    const account2Id = randomUUID();
    const account2: TradingAccount = {
      id: account2Id,
      userId,
      accountId: "MT5-1002",
      password: "demo@456",
      type: "Demo",
      group: "Standard",
      leverage: "1:500",
      balance: "100000.00",
      equity: "102350.00",
      margin: "5200.00",
      freeMargin: "97150.00",
      marginLevel: "1968.27",
      currency: "USD",
      server: "Rozka-Demo",
      enabled: true,
      createdAt: new Date("2024-02-20"),
    };
    this.tradingAccounts.set(account2Id, account2);

    // Create some deposits
    for (let i = 0; i < 5; i++) {
      const depositId = randomUUID();
      const deposit: Deposit = {
        id: depositId,
        userId,
        accountId: account1Id,
        merchant: ["Stripe", "PayPal", "Bank Transfer"][i % 3],
        amount: (Math.random() * 5000 + 100).toFixed(2),
        currency: "USD",
        status: i === 0 ? "Pending" : "Completed",
        transactionId: `TXN${Date.now() + i}`,
        createdAt: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000),
        completedAt: i === 0 ? null : new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000 + 3600000),
      };
      this.deposits.set(depositId, deposit);
    }

    // Create some trading history
    for (let i = 0; i < 10; i++) {
      const tradeId = randomUUID();
      const symbols = ["EUR/USD", "GBP/USD", "USD/JPY", "XAU/USD", "BTC/USD"];
      const isClosed = i < 7;
      const profit = isClosed ? (Math.random() - 0.4) * 1000 : null;
      
      const trade: TradingHistory = {
        id: tradeId,
        userId,
        accountId: account1Id,
        ticketId: `${100000 + i}`,
        symbol: symbols[i % symbols.length],
        type: i % 2 === 0 ? "Buy" : "Sell",
        volume: (Math.random() * 2 + 0.1).toFixed(2),
        openPrice: (1.0 + Math.random() * 0.1).toFixed(5),
        closePrice: isClosed ? (1.0 + Math.random() * 0.1).toFixed(5) : null,
        stopLoss: (1.0 + Math.random() * 0.05).toFixed(5),
        takeProfit: (1.0 + Math.random() * 0.15).toFixed(5),
        profit: profit !== null ? profit.toFixed(2) : null,
        commission: "2.50",
        swap: (Math.random() * 5 - 2.5).toFixed(2),
        status: isClosed ? "Closed" : "Open",
        openTime: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        closeTime: isClosed ? new Date(Date.now() - i * 24 * 60 * 60 * 1000 + 3600000 * (i + 1)) : null,
      };
      this.tradingHistory.set(tradeId, trade);
    }

    // Create some documents
    const docTypes = ["ID Proof", "Address Proof", "Bank Statement"];
    for (let i = 0; i < 3; i++) {
      const docId = randomUUID();
      const doc: Document = {
        id: docId,
        userId,
        type: docTypes[i],
        fileName: `${docTypes[i].toLowerCase().replace(/ /g, "_")}.pdf`,
        fileUrl: `/uploads/${docId}.pdf`,
        status: i === 0 ? "Verified" : i === 1 ? "Pending" : "Rejected",
        rejectionReason: i === 2 ? "Document unclear, please reupload" : null,
        approvedBy: null,
        uploadedAt: new Date(Date.now() - i * 5 * 24 * 60 * 60 * 1000),
        verifiedAt: i === 0 ? new Date(Date.now() - i * 5 * 24 * 60 * 60 * 1000 + 86400000) : null,
      };
      this.documents.set(docId, doc);
    }

    // Create super admin user
    const superAdminId = randomUUID();
    const hashedPasswordSuper = bcrypt.hashSync("Admin@12345", 10);
    const superAdmin: AdminUser = {
      id: superAdminId,
      username: "superadmin",
      password: hashedPasswordSuper,
      email: "superadmin.com",
      fullName: "Super Administrator",
      role: "super_admin",
      enabled: true,
      createdAt: new Date(),
      createdBy: null,
    };
    this.adminUsers.set(superAdminId, superAdmin);

    // Create middle admin user
    const middleAdminId = randomUUID();
    const hashedPasswordMiddle = bcrypt.hashSync("Middle@12345", 10);
    const middleAdmin: AdminUser = {
      id: middleAdminId,
      username: "middleadmin",
      password: hashedPasswordMiddle,
      email: "middleadmin.com",
      fullName: "Middle Administrator",
      role: "middle_admin",
      enabled: true,
      createdAt: new Date(),
      createdBy: superAdminId,
    };
    this.adminUsers.set(middleAdminId, middleAdmin);

    // Create normal admin user
    const normalAdminId = randomUUID();
    const hashedPasswordNormal = bcrypt.hashSync("Normal@12345", 10);
    const normalAdmin: AdminUser = {
      id: normalAdminId,
      username: "normaladmin",
      password: hashedPasswordNormal,
      email: "normaladmin.com",
      fullName: "Normal Administrator",
      role: "normal_admin",
      enabled: true,
      createdAt: new Date(),
      createdBy: superAdminId,
    };
    this.adminUsers.set(normalAdminId, normalAdmin);
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async getUserByReferralId(referralId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.referralId === referralId,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      fullName: insertUser.fullName || null,
      phone: insertUser.phone || null,
      country: insertUser.country || null,
      city: null,
      address: null,
      zipCode: null,
      verified: false,
      enabled: true,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...updates };
    this.users.set(id, updated);
    return updated;
  }

  // Trading Accounts
  async getTradingAccounts(userId: string): Promise<TradingAccount[]> {
    return Array.from(this.tradingAccounts.values()).filter(
      (account) => account.userId === userId,
    );
  }

  async getTradingAccount(id: string): Promise<TradingAccount | undefined> {
    return this.tradingAccounts.get(id);
  }

  async createTradingAccount(insertAccount: InsertTradingAccount): Promise<TradingAccount> {
    const id = randomUUID();
    const account: TradingAccount = {
      ...insertAccount,
      id,
      balance: insertAccount.balance || "0",
      equity: insertAccount.equity || "0",
      margin: insertAccount.margin || "0",
      freeMargin: insertAccount.freeMargin || "0",
      marginLevel: insertAccount.marginLevel || "0",
      currency: insertAccount.currency || "USD",
      server: insertAccount.server || "Rozka-Live",
      enabled: insertAccount.enabled !== undefined ? insertAccount.enabled : true,
      createdAt: new Date(),
    };
    this.tradingAccounts.set(id, account);
    return account;
  }

  async updateTradingAccount(id: string, updates: Partial<TradingAccount>): Promise<TradingAccount | undefined> {
    const account = this.tradingAccounts.get(id);
    if (!account) return undefined;
    const updated = { ...account, ...updates };
    this.tradingAccounts.set(id, updated);
    return updated;
  }

  async deleteTradingAccount(id: string): Promise<boolean> {
    return this.tradingAccounts.delete(id);
  }

  // Deposits
  async getDeposits(userId: string): Promise<Deposit[]> {
    return Array.from(this.deposits.values())
      .filter((deposit) => deposit.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getDeposit(id: string): Promise<Deposit | undefined> {
    return this.deposits.get(id);
  }

  async createDeposit(insertDeposit: InsertDeposit): Promise<Deposit> {
    const id = randomUUID();
    const deposit: Deposit = {
      ...insertDeposit,
      id,
      currency: insertDeposit.currency || "USD",
      status: insertDeposit.status || "Pending",
      transactionId: insertDeposit.transactionId || null,
      createdAt: new Date(),
      completedAt: null,
    };
    this.deposits.set(id, deposit);
    return deposit;
  }

  async updateDeposit(id: string, updates: Partial<Deposit>): Promise<Deposit | undefined> {
    const deposit = this.deposits.get(id);
    if (!deposit) return undefined;
    const updated = { ...deposit, ...updates };
    this.deposits.set(id, updated);
    return updated;
  }

  // Withdrawals
  async getWithdrawals(userId: string): Promise<Withdrawal[]> {
    return Array.from(this.withdrawals.values())
      .filter((withdrawal) => withdrawal.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getWithdrawal(id: string): Promise<Withdrawal | undefined> {
    return this.withdrawals.get(id);
  }

  async createWithdrawal(insertWithdrawal: InsertWithdrawal): Promise<Withdrawal> {
    const id = randomUUID();
    const withdrawal: Withdrawal = {
      ...insertWithdrawal,
      id,
      currency: insertWithdrawal.currency || "USD",
      status: insertWithdrawal.status || "Pending",
      bankName: insertWithdrawal.bankName || null,
      accountNumber: insertWithdrawal.accountNumber || null,
      accountHolderName: insertWithdrawal.accountHolderName || null,
      swiftCode: insertWithdrawal.swiftCode || null,
      rejectionReason: insertWithdrawal.rejectionReason || null,
      createdAt: new Date(),
      processedAt: null,
    };
    this.withdrawals.set(id, withdrawal);
    return withdrawal;
  }

  async updateWithdrawal(id: string, updates: Partial<Withdrawal>): Promise<Withdrawal | undefined> {
    const withdrawal = this.withdrawals.get(id);
    if (!withdrawal) return undefined;
    const updated = { ...withdrawal, ...updates };
    this.withdrawals.set(id, updated);
    return updated;
  }

  // Trading History
  async getTradingHistory(userId: string, accountId?: string): Promise<TradingHistory[]> {
    return Array.from(this.tradingHistory.values())
      .filter((trade) => {
        if (trade.userId !== userId) return false;
        if (accountId && trade.accountId !== accountId) return false;
        return true;
      })
      .sort((a, b) => b.openTime!.getTime() - a.openTime!.getTime());
  }

  async createTrade(insertTrade: InsertTradingHistory): Promise<TradingHistory> {
    const id = randomUUID();
    const trade: TradingHistory = {
      id,
      userId: insertTrade.userId,
      accountId: insertTrade.accountId,
      ticketId: insertTrade.ticketId,
      symbol: insertTrade.symbol,
      type: insertTrade.type,
      volume: insertTrade.volume,
      openPrice: insertTrade.openPrice,
      closePrice: insertTrade.closePrice || null,
      stopLoss: insertTrade.stopLoss || null,
      takeProfit: insertTrade.takeProfit || null,
      profit: insertTrade.profit || null,
      commission: insertTrade.commission || "0",
      swap: insertTrade.swap || "0",
      status: insertTrade.status,
      openTime: insertTrade.openTime || new Date(),
      closeTime: insertTrade.closeTime || null,
    };
    this.tradingHistory.set(id, trade);
    return trade;
  }

  async updateTrade(id: string, updates: Partial<TradingHistory>): Promise<TradingHistory | undefined> {
    const trade = this.tradingHistory.get(id);
    if (!trade) return undefined;
    const updated = { ...trade, ...updates };
    this.tradingHistory.set(id, updated);
    return updated;
  }

  // Documents
  async getDocuments(userId: string): Promise<Document[]> {
    return Array.from(this.documents.values())
      .filter((doc) => doc.userId === userId)
      .sort((a, b) => b.uploadedAt!.getTime() - a.uploadedAt!.getTime());
  }

  async getDocument(id: string): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = randomUUID();
    const document: Document = {
      ...insertDocument,
      id,
      status: insertDocument.status || "Pending",
      rejectionReason: insertDocument.rejectionReason || null,
      approvedBy: insertDocument.approvedBy || null,
      uploadedAt: new Date(),
      verifiedAt: null,
    };
    this.documents.set(id, document);
    return document;
  }

  async updateDocument(id: string, updates: Partial<Document>): Promise<Document | undefined> {
    const document = this.documents.get(id);
    if (!document) return undefined;
    const updated = { ...document, ...updates };
    this.documents.set(id, updated);
    return updated;
  }

  // Notifications
  async getNotifications(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter((notif) => notif.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const notification: Notification = {
      ...insertNotification,
      id,
      read: false,
      createdAt: new Date(),
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationAsRead(id: string): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.read = true;
      this.notifications.set(id, notification);
    }
  }

  // Additional User methods
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUsersByCountry(country: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.country === country,
    );
  }

  // Additional Trading Account methods
  async getAllTradingAccounts(): Promise<TradingAccount[]> {
    return Array.from(this.tradingAccounts.values());
  }

  // Additional Deposit methods
  async getAllDeposits(): Promise<Deposit[]> {
    return Array.from(this.deposits.values())
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getDepositByTransactionId(transactionId: string): Promise<Deposit | undefined> {
    return Array.from(this.deposits.values()).find(d => d.transactionId === transactionId);
  }

  async deleteDeposit(id: string): Promise<boolean> {
    return this.deposits.delete(id);
  }

  async updateDepositStatus(id: string, status: string): Promise<Deposit | undefined> {
    const deposit = this.deposits.get(id);
    if (!deposit) return undefined;
    
    const updated = { ...deposit, status };
    this.deposits.set(id, updated);
    return updated;
  }

  // Stripe Payments
  async createStripePayment(payment: InsertStripePayment): Promise<StripePayment> {
    const id = randomUUID();
    const newPayment: StripePayment = {
      ...payment,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.stripePayments.set(id, newPayment);
    return newPayment;
  }

  async getStripePayment(id: string): Promise<StripePayment | undefined> {
    return this.stripePayments.get(id);
  }

  async getStripePaymentByIntentId(paymentIntentId: string): Promise<StripePayment | undefined> {
    return Array.from(this.stripePayments.values()).find(p => p.paymentIntentId === paymentIntentId);
  }

  async updateStripePaymentStatus(id: string, status: string): Promise<StripePayment | undefined> {
    const payment = this.stripePayments.get(id);
    if (!payment) return undefined;
    
    const updated = { ...payment, status, updatedAt: new Date() };
    this.stripePayments.set(id, updated);
    return updated;
  }

  // Additional Withdrawal methods
  async getAllWithdrawals(): Promise<Withdrawal[]> {
    return Array.from(this.withdrawals.values())
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  // Additional Document methods
  async getAllDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values())
      .sort((a, b) => b.uploadedAt!.getTime() - a.uploadedAt!.getTime());
  }

  async getPendingDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values())
      .filter((doc) => doc.status === "Pending")
      .sort((a, b) => b.uploadedAt!.getTime() - a.uploadedAt!.getTime());
  }

  // Admin Users
  async getAdminUser(id: string): Promise<AdminUser | undefined> {
    return this.adminUsers.get(id);
  }

  async getAdminUserByUsername(username: string): Promise<AdminUser | undefined> {
    return Array.from(this.adminUsers.values()).find(
      (admin) => admin.username === username,
    );
  }

  async getAdminUserByEmail(email: string): Promise<AdminUser | undefined> {
    return Array.from(this.adminUsers.values()).find(
      (admin) => admin.email === email,
    );
  }

  async createAdminUser(insertAdmin: InsertAdminUser): Promise<AdminUser> {
    const id = randomUUID();
    const admin: AdminUser = {
      ...insertAdmin,
      id,
      enabled: insertAdmin.enabled !== undefined ? insertAdmin.enabled : true,
      createdBy: insertAdmin.createdBy || null,
      createdAt: new Date(),
    };
    this.adminUsers.set(id, admin);
    return admin;
  }

  async updateAdminUser(id: string, updates: Partial<AdminUser>): Promise<AdminUser | undefined> {
    const admin = this.adminUsers.get(id);
    if (!admin) return undefined;
    const updated = { ...admin, ...updates };
    this.adminUsers.set(id, updated);
    return updated;
  }

  async getAllAdminUsers(): Promise<AdminUser[]> {
    return Array.from(this.adminUsers.values());
  }

  // Admin Country Assignments
  async getAdminCountryAssignments(adminId: string): Promise<AdminCountryAssignment[]> {
    return Array.from(this.adminCountryAssignments.values()).filter(
      (assignment) => assignment.adminId === adminId,
    );
  }

  async createAdminCountryAssignment(insertAssignment: InsertAdminCountryAssignment): Promise<AdminCountryAssignment> {
    const id = randomUUID();
    const assignment: AdminCountryAssignment = {
      ...insertAssignment,
      id,
      createdAt: new Date(),
    };
    this.adminCountryAssignments.set(id, assignment);
    return assignment;
  }

  async deleteAdminCountryAssignment(adminId: string, country: string): Promise<void> {
    const assignments = Array.from(this.adminCountryAssignments.entries());
    for (const [id, assignment] of assignments) {
      if (assignment.adminId === adminId && assignment.country === country) {
        this.adminCountryAssignments.delete(id);
        break;
      }
    }
  }

  // Activity Logs
  async createActivityLog(insertLog: InsertActivityLog): Promise<ActivityLog> {
    const id = randomUUID();
    const log: ActivityLog = {
      ...insertLog,
      id,
      userId: insertLog.userId || null,
      adminId: insertLog.adminId || null,
      entityId: insertLog.entityId || null,
      details: insertLog.details || null,
      ipAddress: insertLog.ipAddress || null,
      createdAt: new Date(),
    };
    this.activityLogs.set(id, log);
    return log;
  }

  async getActivityLogs(adminId?: string): Promise<ActivityLog[]> {
    const logs = Array.from(this.activityLogs.values());
    if (adminId) {
      return logs
        .filter((log) => log.adminId === adminId)
        .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
    }
    return logs.sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getAllActivityLogs(): Promise<ActivityLog[]> {
    return Array.from(this.activityLogs.values())
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  // Crypto Wallets
  async getCryptoWallet(cryptoType: string): Promise<CryptoWallet | undefined> {
    return Array.from(this.cryptoWallets?.values() || []).find(
      w => w.cryptoType === cryptoType && w.enabled
    );
  }

  async getAllCryptoWallets(): Promise<CryptoWallet[]> {
    return Array.from(this.cryptoWallets?.values() || []).filter(w => w.enabled);
  }

  async createCryptoWallet(wallet: InsertCryptoWallet): Promise<CryptoWallet> {
    const id = randomUUID();
    const newWallet: CryptoWallet = {
      ...wallet,
      id,
      enabled: wallet.enabled ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    if (!this.cryptoWallets) {
      this.cryptoWallets = new Map();
    }
    this.cryptoWallets.set(id, newWallet);
    return newWallet;
  }

  async updateCryptoWallet(id: string, updates: Partial<CryptoWallet>): Promise<CryptoWallet | undefined> {
    const wallet = this.cryptoWallets?.get(id);
    if (!wallet) return undefined;
    const updated = { ...wallet, ...updates, updatedAt: new Date() };
    this.cryptoWallets!.set(id, updated);
    return updated;
  }
}

import { DbStorage } from "./db-storage";

// Use database storage for production/local development
// Use MemStorage for testing/demo only
export const storage = new DbStorage();

// For demo/testing, use: export const storage = new MemStorage();
