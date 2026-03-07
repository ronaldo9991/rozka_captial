/**
 * MT5 Integration Routes
 * Handles all MetaTrader 5 related operations
 */

import type { Express } from "express";
import { mt5Service } from "./mt5-service";
import { storage } from "./storage";

// Extend express-session types
declare module "express-session" {
  interface SessionData {
    userId?: string;
    adminId?: string;
  }
}

export function registerMT5Routes(app: Express): void {
  // Middleware to get authenticated user
  const getCurrentUserId = (req: any): string | undefined => {
    return req.session?.userId;
  };

  // Sync MT5 account data
  app.post("/api/mt5/sync-account/:accountId", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { accountId } = req.params;
      const account = await storage.getTradingAccount(accountId);
      
      if (!account || account.userId !== userId) {
        return res.status(404).json({ message: "Account not found" });
      }

      // Sync data from MT5
      const mt5Data = await mt5Service.syncAccount(account.accountId);
      
      // Update local database
      const updated = await storage.updateTradingAccount(accountId, {
        balance: mt5Data.balance.toString(),
        equity: mt5Data.equity.toString(),
        margin: mt5Data.margin.toString(),
        freeMargin: mt5Data.freeMargin.toString(),
        marginLevel: mt5Data.marginLevel.toString(),
      });

      res.json(updated);
    } catch (error: any) {
      console.error("MT5 sync account error:", error);
      res.status(500).json({ message: "Failed to sync account data" });
    }
  });

  // Sync MT5 trading history
  app.post("/api/mt5/sync-history/:accountId", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { accountId } = req.params;
      const { from, to } = req.body;

      const account = await storage.getTradingAccount(accountId);
      
      if (!account || account.userId !== userId) {
        return res.status(404).json({ message: "Account not found" });
      }

      // Get deals from MT5
      const deals = await mt5Service.syncTradingHistory(
        account.accountId,
        from || Date.now() - 30 * 24 * 60 * 60 * 1000, // Last 30 days
        to || Date.now()
      );

      // Import deals into trading history
      const imported = [];
      for (const deal of deals) {
        // Only import closed deals
        if (deal.action === 1) { // Entry = Out (closed position)
          const history = await storage.createTradingHistory({
            userId,
            accountId,
            ticketId: deal.deal,
            symbol: deal.symbol,
            type: deal.action === 0 ? "Buy" : "Sell",
            volume: deal.volume.toString(),
            openPrice: "0", // Would need to get from position history
            closePrice: deal.price.toString(),
            profit: deal.profit.toString(),
            commission: deal.commission.toString(),
            swap: deal.storage.toString(),
            status: "Closed",
            openTime: new Date(deal.time * 1000),
            closeTime: new Date(deal.time * 1000),
          });
          imported.push(history);
        }
      }

      res.json({ 
        success: true, 
        imported: imported.length,
        deals: imported 
      });
    } catch (error: any) {
      console.error("MT5 sync history error:", error);
      res.status(500).json({ message: "Failed to sync trading history" });
    }
  });

  // Get open positions from MT5
  app.get("/api/mt5/positions/:accountId", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { accountId } = req.params;
      const account = await storage.getTradingAccount(accountId);
      
      if (!account || account.userId !== userId) {
        return res.status(404).json({ message: "Account not found" });
      }

      // Get open positions from MT5
      const positions = await mt5Service.getPositions(account.accountId);

      // Transform to our format
      const openPositions = positions.map(pos => ({
        ticketId: pos.position,
        symbol: pos.symbol,
        type: pos.action === 0 ? "Buy" : "Sell",
        volume: pos.volume,
        openPrice: pos.priceOpen,
        currentPrice: pos.priceCurrent,
        stopLoss: pos.priceSL,
        takeProfit: pos.priceTP,
        profit: pos.profit,
        openTime: new Date(pos.timeCreate * 1000),
        status: "Open",
      }));

      res.json(openPositions);
    } catch (error: any) {
      console.error("MT5 get positions error:", error);
      res.status(500).json({ message: "Failed to get open positions" });
    }
  });

  // Calculate profit for a period
  app.post("/api/mt5/calculate-profit/:accountId", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { accountId } = req.params;
      const { from, to } = req.body;

      const account = await storage.getTradingAccount(accountId);
      
      if (!account || account.userId !== userId) {
        return res.status(404).json({ message: "Account not found" });
      }

      const profit = await mt5Service.calculateProfit(
        account.accountId,
        from || Date.now() - 30 * 24 * 60 * 60 * 1000,
        to || Date.now()
      );

      res.json({ profit });
    } catch (error: any) {
      console.error("MT5 calculate profit error:", error);
      res.status(500).json({ message: "Failed to calculate profit" });
    }
  });

  // Change MT5 account password
  app.post("/api/mt5/change-password/:accountId", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { accountId } = req.params;
      const { newPassword } = req.body;

      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      const account = await storage.getTradingAccount(accountId);
      
      if (!account || account.userId !== userId) {
        return res.status(404).json({ message: "Account not found" });
      }

      // Change password in MT5
      await mt5Service.changePassword(account.accountId, newPassword);

      // Update in database
      await storage.updateTradingAccount(accountId, { password: newPassword });

      res.json({ success: true, message: "Password changed successfully" });
    } catch (error: any) {
      console.error("MT5 change password error:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  // MT5 Health Check
  app.get("/api/mt5/health", async (req, res) => {
    try {
      const isAlive = await mt5Service.ping();
      res.json({ 
        status: isAlive ? "connected" : "disconnected",
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({ 
        status: "error",
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Sync all accounts (background job endpoint - should be protected)
  app.post("/api/mt5/sync-all", async (req, res) => {
    try {
      // This should be called by a cron job or admin only
      const adminId = req.session?.adminId;
      if (!adminId) {
        return res.status(401).json({ message: "Admin access required" });
      }

      // Get all active trading accounts
      const users = await storage.getAllUsers();
      let synced = 0;
      let errors = 0;

      for (const user of users) {
        try {
          const accounts = await storage.getTradingAccountsByUserId(user.id);
          for (const account of accounts) {
            if (account.enabled && account.type === "Live") {
              const mt5Data = await mt5Service.syncAccount(account.accountId);
              await storage.updateTradingAccount(account.id, {
                balance: mt5Data.balance.toString(),
                equity: mt5Data.equity.toString(),
                margin: mt5Data.margin.toString(),
                freeMargin: mt5Data.freeMargin.toString(),
                marginLevel: mt5Data.marginLevel.toString(),
              });
              synced++;
            }
          }
        } catch (error) {
          console.error(`Failed to sync accounts for user ${user.id}:`, error);
          errors++;
        }
      }

      res.json({ 
        success: true, 
        synced, 
        errors,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("MT5 sync all error:", error);
      res.status(500).json({ message: "Failed to sync accounts" });
    }
  });
}

