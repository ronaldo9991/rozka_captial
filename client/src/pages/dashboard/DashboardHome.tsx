import StatCard from "@/components/StatCard";
import ActionCard from "@/components/ActionCard";
import DataTable from "@/components/DataTable";
import { Card } from "@/components/ui/card";
import LiveForexTicker from "@/components/LiveForexTicker";
import AccountTypesCard from "@/components/AccountTypesCard";
import { FullPageLoader, StatsSkeleton, TableSkeleton } from "@/components/DashboardLoader";
import { Wallet, TrendingUp, DollarSign, Activity, Plus, ArrowUpDown, Headphones, Monitor, Eye, EyeOff, Copy, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAccount } from "@/contexts/AccountContext";
import type { TradingAccount } from "@shared/schema";

interface DashboardStats {
  balance: string;
  equity: string;
  margin: string;
  profitLoss: string;
  totalAccounts: number;
  openTrades: number;
  totalDeposits: number;
}

export default function DashboardHome() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [isCreatingMT5, setIsCreatingMT5] = useState(false);

  // Check verification status - refresh periodically to catch document changes
  const { data: verificationStatus, isLoading: loadingVerification, refetch: refetchVerification } = useQuery<{
    isVerified: boolean;
    verifiedCount: number;
    requiredCount: number;
    hasPending: boolean;
  }>({
    queryKey: ["/api/documents/verification-status"],
    refetchInterval: 10000, // Refetch every 10 seconds to catch admin document changes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0, // Always consider stale to get latest status
  });

  // Get selected account from context
  const { selectedAccount } = useAccount();

  // Fetch dashboard stats - no automatic refresh
  const { data: stats, isLoading: loadingStats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats", selectedAccount?.id],
    queryFn: async () => {
      const url = selectedAccount 
        ? `/api/dashboard/stats?accountId=${selectedAccount.id}`
        : "/api/dashboard/stats";
      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
    refetchInterval: false, // No automatic refresh
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    enabled: true, // Always enabled, will use all accounts if none selected
  });

  // Fetch trading accounts - optimized for performance
  const { data: tradingAccounts = [], isLoading: loadingAccounts } = useQuery<TradingAccount[]>({
    queryKey: ["/api/trading-accounts"],
    refetchInterval: false, // Disable auto-refresh
    refetchOnWindowFocus: true,
    staleTime: 60000, // Consider data fresh for 60 seconds
  });

  // Fetch MT5 credentials (one Live and one Demo account per user)
  const { data: mt5Credentials } = useQuery<{
    live?: { login: string; password: string; server: string };
    demo?: { login: string; password: string; server: string };
  }>({
    queryKey: ["/api/user/mt5-credentials"],
    refetchInterval: false,
    refetchOnWindowFocus: true,
    refetchOnMount: true, // Always refetch when component mounts
    staleTime: 0, // Always consider stale to get latest credentials
  });

  const columns = [
    { 
      key: "accountId", 
      label: "Account ID",
      render: (value: string) => (
        <span className="font-mono font-semibold">{value}</span>
      ),
    },
    { 
      key: "group", 
      label: "Group",
      render: (value: string) => (
        <span className="font-semibold text-primary">{value}</span>
      ),
    },
    { 
      key: "balance", 
      label: "Balance",
      render: (value: string) => (
        <span className="font-semibold">${parseFloat(value || "0").toFixed(2)}</span>
      ),
    },
    { 
      key: "leverage", 
      label: "Leverage",
      render: (value: string) => (
        <span className="text-muted-foreground">{value}</span>
      ),
    },
    { 
      key: "createdAt", 
      label: "Created",
      render: (value: Date) => new Date(value).toLocaleDateString(),
    },
  ];

  if (loadingStats || loadingAccounts || loadingVerification) {
    return <FullPageLoader text="Loading dashboard..." />;
  }

  // Verification is now handled by VerificationGuard in DashboardLayout
  // This check is no longer needed here

  const balance = parseFloat(stats?.balance || "0");
  const equity = parseFloat(stats?.equity || "0");
  const margin = parseFloat(stats?.margin || "0");
  const profitLoss = parseFloat(stats?.profitLoss || "0");

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 blur-3xl" />
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-muted-foreground">Welcome back! Here's your real-time trading overview.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Balance" 
          value={`$${balance.toFixed(2)}`}
          icon={Wallet} 
          index={0} 
        />
        <StatCard 
          title="Equity" 
          value={`$${equity.toFixed(2)}`}
          icon={TrendingUp} 
          index={1} 
        />
        <StatCard 
          title="Margin" 
          value={`$${margin.toFixed(2)}`}
          icon={DollarSign} 
          index={2} 
        />
        <StatCard 
          title="P/L" 
          value={`${profitLoss >= 0 ? '+' : ''}$${profitLoss.toFixed(2)}`}
          icon={Activity} 
          index={3}
        />
      </div>

      {/* Live Forex Ticker */}
      <LiveForexTicker />

      {/* Quick Stats Row */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="relative p-6 border-primary/20 bg-gradient-to-br from-black/60 to-primary/5 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="text-sm text-muted-foreground mb-1 uppercase tracking-wider">Total Accounts</div>
            <div className="text-3xl font-bold text-primary">{stats?.totalAccounts || 0}</div>
          </div>
        </Card>
        <Card className="relative p-6 border-primary/20 bg-gradient-to-br from-black/60 to-primary/5 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="text-sm text-muted-foreground mb-1 uppercase tracking-wider">Open Trades</div>
            <div className="text-3xl font-bold text-green-400">{stats?.openTrades || 0}</div>
          </div>
        </Card>
        <Card className="relative p-6 border-primary/20 bg-gradient-to-br from-black/60 to-primary/5 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="text-sm text-muted-foreground mb-1 uppercase tracking-wider">Completed Deposits</div>
            <div className="text-3xl font-bold text-primary">{stats?.totalDeposits || 0}</div>
          </div>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ActionCard
            title="Web Trading Terminal"
            description="Access your trading platform"
            icon={Monitor}
            buttonText="Open Terminal"
            onClick={() => window.open("https://web.rozkacapitals.com/terminal", "_blank")}
          />
          <ActionCard
            title="Open Live Account"
            description="Start trading with real funds"
            icon={Plus}
            buttonText="Open Account"
            onClick={() => setLocation("/dashboard/accounts")}
          />
          <ActionCard
            title="Deposit Funds"
            description="Add money to your account"
            icon={ArrowUpDown}
            buttonText="Deposit Now"
            onClick={() => setLocation("/dashboard/deposit")}
          />
          <ActionCard
            title="View Trading History"
            description="Analyze your trading performance"
            icon={TrendingUp}
            buttonText="View History"
            onClick={() => setLocation("/dashboard/history")}
          />
          <ActionCard
            title="Contact Support"
            description="Get help from our team"
            icon={Headphones}
            buttonText="Get Support"
            onClick={() => setLocation("/dashboard/support")}
          />
        </div>
      </div>

      {/* Account Types */}
      {tradingAccounts.length === 0 && <AccountTypesCard />}

      <div>
        <h2 className="text-2xl font-bold text-primary uppercase tracking-wider mb-4">Your Trading Accounts</h2>
        {tradingAccounts.length > 0 ? (
          <Card className="border-primary/30 bg-black/80 backdrop-blur-xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
            <div className="p-6">
              <DataTable columns={columns} data={tradingAccounts} />
            </div>
          </Card>
        ) : (
          <Card className="relative p-12 text-center border-primary/30 bg-black/80 backdrop-blur-xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
            <div className="relative z-10">
              <p className="text-muted-foreground mb-6 text-lg">You don't have any trading accounts yet.</p>
              <ActionCard
                title="Create Your First Account"
                description="Get started with a demo or live account"
                icon={Plus}
                buttonText="Create Account"
                onClick={() => setLocation("/dashboard/accounts")}
              />
            </div>
          </Card>
        )}
      </div>

      {/* MT5 Login Credentials Section - Always show at bottom */}
      <div className="mt-8">
      {(mt5Credentials?.live || mt5Credentials?.demo) ? (
        <Card className="p-6 border-[#D4AF37]/30 bg-black/80 backdrop-blur-xl">
          <div className="text-center mb-6 space-y-3">
            <div className="flex items-center justify-center">
              <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-primary to-transparent" />
            </div>
            <h2 className="text-3xl font-bold text-primary uppercase tracking-wider">MT5 LOGIN CREDENTIALS</h2>
            <div className="flex flex-col items-center justify-center gap-1">
              <div className="h-[1px] w-40 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
              <div className="h-[1px] w-40 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
            </div>
            <p className="text-muted-foreground text-sm mt-2">
              Use these credentials to connect to MetaTrader 5 platform at https://web.rozkacapitals.com/terminal
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {/* Live MT5 Account */}
            {mt5Credentials?.live && (
              <Card className="p-4 border-[#D4AF37]/30 bg-black/60">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                      Live Account
                    </Badge>
                    <span className="text-sm text-muted-foreground">Server: {mt5Credentials.live.server}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">MT5 Login</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono font-semibold text-lg">{mt5Credentials.live.login}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => {
                            navigator.clipboard.writeText(mt5Credentials.live.login);
                            toast({
                              title: "Copied!",
                              description: "MT5 Login copied to clipboard",
                            });
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-muted-foreground">MT5 Password</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-lg">
                          {showPasswords["mt5-live"] ? mt5Credentials.live.password : "••••••••"}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => setShowPasswords(prev => ({ ...prev, "mt5-live": !prev["mt5-live"] }))}
                        >
                          {showPasswords["mt5-live"] ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => {
                            navigator.clipboard.writeText(mt5Credentials.live.password);
                            toast({
                              title: "Copied!",
                              description: "MT5 Password copied to clipboard",
                            });
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Demo MT5 Account */}
            {mt5Credentials?.demo && (
              <Card className="p-4 border-[#D4AF37]/30 bg-black/60">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                      Demo Account
                    </Badge>
                    <span className="text-sm text-muted-foreground">Server: {mt5Credentials.demo.server}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">MT5 Login</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono font-semibold text-lg">{mt5Credentials.demo.login}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => {
                            navigator.clipboard.writeText(mt5Credentials.demo.login);
                            toast({
                              title: "Copied!",
                              description: "MT5 Login copied to clipboard",
                            });
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-muted-foreground">MT5 Password</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-lg">
                          {showPasswords["mt5-demo"] ? mt5Credentials.demo.password : "••••••••"}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => setShowPasswords(prev => ({ ...prev, "mt5-demo": !prev["mt5-demo"] }))}
                        >
                          {showPasswords["mt5-demo"] ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => {
                            navigator.clipboard.writeText(mt5Credentials.demo.password);
                            toast({
                              title: "Copied!",
                              description: "MT5 Password copied to clipboard",
                            });
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </Card>
      ) : (
        <Card className="p-6 border-[#D4AF37]/30 bg-black/80 backdrop-blur-xl">
          <div className="text-center mb-6 space-y-3">
            <div className="flex items-center justify-center">
              <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-primary to-transparent" />
            </div>
            <h2 className="text-3xl font-bold text-primary uppercase tracking-wider">MT5 LOGIN CREDENTIALS</h2>
            <div className="flex flex-col items-center justify-center gap-1">
              <div className="h-[1px] w-40 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
              <div className="h-[1px] w-40 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
            </div>
            <p className="text-muted-foreground text-sm mt-2 mb-4">
              MT5 credentials will appear here after your account is verified and MT5 account is created
            </p>
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-4 text-left">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-primary font-semibold mb-1">Request Your MT5 Account</p>
                  <p className="text-muted-foreground text-sm">
                    Click the button below to request MT5 trading credentials. Our team will create your account and send the login details to your registered email within 24 hours.
                  </p>
                </div>
              </div>
            </div>
            <Button
              disabled={isCreatingMT5}
              onClick={async () => {
                if (isCreatingMT5) return; // Prevent multiple clicks
                
                setIsCreatingMT5(true);
                let timeoutId: NodeJS.Timeout | null = null;
                try {
                  // Create abort controller for timeout
                  const controller = new AbortController();
                  timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
                  
                  const response = await fetch("/api/user/mt5-accounts/create", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    signal: controller.signal,
                  });
                  
                  if (timeoutId) clearTimeout(timeoutId);
                  
                  // Parse response - handle both JSON and text responses
                  let data: any;
                  const contentType = response.headers.get("content-type");
                  if (contentType && contentType.includes("application/json")) {
                    try {
                      data = await response.json();
                    } catch (parseError) {
                      // If JSON parsing fails, try text
                      const text = await response.text();
                      data = { message: text || "Failed to create MT5 accounts", error: "Invalid JSON response" };
                    }
                  } else {
                    // Not JSON, read as text
                    const text = await response.text();
                    data = { message: text || "Failed to create MT5 accounts", error: "Invalid response format" };
                  }
                  
                  if (response.ok) {
                    // Check if credentials already exist or request submitted
                    if (data.live || data.demo) {
                      toast({
                        title: "MT5 Accounts Ready!",
                        description: "Your MT5 credentials are available. Refreshing...",
                      });
                      queryClient.invalidateQueries({ queryKey: ["/api/user/mt5-credentials"] });
                      setTimeout(() => window.location.reload(), 2000);
                    } else if (data.status === "pending") {
                      toast({
                        title: "Request Submitted!",
                        description: data.message || "Our team will create your MT5 account within 24 hours.",
                        duration: 10000,
                      });
                    } else {
                      toast({
                        title: "Request Received",
                        description: data.message || "Your MT5 account request has been submitted.",
                        duration: 8000,
                      });
                    }
                  } else {
                    // Show detailed error message
                    const errorMsg = data.message || data.error || "Failed to create MT5 accounts";
                    const helpMsg = data.help || "";
                    
                    // Check if this is a server configuration issue
                    const isConfigIssue = data.configIssue || 
                      data.requiresServerConfig || 
                      errorMsg.includes("Invalid account") ||
                      errorMsg.includes("Error code: 1001") ||
                      errorMsg.includes("Error code: 3") ||
                      errorMsg.includes("configuration");
                    
                    if (isConfigIssue) {
                      toast({
                        title: "⚠️ MT5 Server Configuration Required",
                        description: "MT5 accounts are being configured. Contact support@rozkacapitals.com for assistance with MT5 account creation.",
                        variant: "destructive",
                        duration: 20000,
                      });
                      
                      console.error("MT5 Configuration Issue:", {
                        message: errorMsg,
                        errors: data.errors,
                        action: "Contact MT5 server administrator to verify manager credentials and group configuration"
                      });
                    } else {
                      toast({
                        title: "MT5 Account Creation Failed",
                        description: errorMsg + (helpMsg ? ` ${helpMsg}` : ""),
                        variant: "destructive",
                        duration: 15000,
                      });
                    }
                    
                    // Log full error details for debugging
                    if (data.errors) {
                      console.error("MT5 Creation Errors:", data.errors);
                    }
                  }
                } catch (error: any) {
                  if (timeoutId) clearTimeout(timeoutId);
                  console.error("MT5 Creation Error:", error);
                  
                  // Handle timeout specifically
                  if (error.name === 'TimeoutError' || error.name === 'AbortError' || error.message?.includes('aborted')) {
                    toast({
                      title: "Request Timeout",
                      description: "The request took too long. Please contact support@rozkacapitals.com for assistance.",
                      variant: "destructive",
                      duration: 15000,
                    });
                  } else {
                    toast({
                      title: "MT5 Server Temporarily Unavailable",
                      description: "Please contact support@rozkacapitals.com for MT5 account assistance.",
                      variant: "destructive",
                      duration: 15000,
                    });
                  }
                } finally {
                  setIsCreatingMT5(false);
                }
              }}
              className="bg-primary hover:bg-primary/90 text-black font-semibold"
            >
              {isCreatingMT5 ? "Submitting Request..." : "Request MT5 Account"}
            </Button>
          </div>
        </Card>
      )}
      </div>

      <Card className="relative p-6 border-primary/30 bg-gradient-to-br from-black/80 to-primary/10 backdrop-blur-xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
        <div className="relative z-10">
          <h3 className="text-xl font-bold text-primary mb-2 uppercase tracking-wider">Need Assistance?</h3>
          <p className="text-muted-foreground mb-4">
            Our dedicated account managers are here to help you 24/7.
          </p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
              <Headphones className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="text-primary font-bold">support@rozkacapitals.com</div>
              <div className="text-xs text-muted-foreground">Available 24/7</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
