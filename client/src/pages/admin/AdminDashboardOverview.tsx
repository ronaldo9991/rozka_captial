import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import StatCard from "@/components/StatCard";
import { Users, FileText, Wallet, TrendingUp, Loader2, Shield, Activity, MessageSquare, AlertCircle, CheckCircle2, Globe } from "lucide-react";
import type { AdminUser } from "@shared/schema";
import { motion } from "framer-motion";
import { useMemo } from "react";

interface AdminDashboardOverviewProps {
  admin: AdminUser;
}

interface DashboardStats {
  totalLiveTradingMembers: number;
  totalUsers: number;
  pendingDocuments: number;
  verifiedDocuments: number;
  totalTradingAccounts: number;
  liveAccounts: number;
  demoAccounts: number;
  totalDeposits: number;
  pendingDeposits: number;
  completedDeposits: number;
  totalWithdrawals: number;
  pendingWithdrawals: number;
  totalDepositAmount: string;
  totalWithdrawalAmount: string;
  openTickets?: number;
  countryBreakdown?: Array<{ country: string; count: number }>;
  countryAccountsBreakdown?: Array<{ country: string; count: number }>;
}

export default function AdminDashboardOverview({ admin }: AdminDashboardOverviewProps) {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/stats"],
    refetchInterval: 30000, // Real-time updates every 30 seconds
  });

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS - Rules of Hooks
  // Check if admin is normal admin (should not see financial data) - use useMemo to prevent infinite loops
  const normalAdmin = useMemo(() => {
    if (!admin?.role) return false;
    const role = String(admin.role).trim().toLowerCase().replace(/[-\s_]+/g, "_");
    return role === "normal_admin" || role === "normaladmin";
  }, [admin?.role]);

  // Memoize role color and label to prevent re-renders
  const roleColor = useMemo(() => {
    const role = admin?.role || "";
    if (role === "super_admin") return "from-yellow-500 via-amber-500 to-yellow-600";
    if (role === "middle_admin") return "from-blue-500 via-cyan-500 to-blue-600";
    return "from-green-500 via-emerald-500 to-green-600";
  }, [admin?.role]);

  const roleLabel = useMemo(() => {
    const role = admin?.role || "";
    if (role === "super_admin") return "SUPER ADMIN";
    if (role === "middle_admin") return "MIDDLE ADMIN";
    return "ADMIN";
  }, [admin?.role]);

  // Conditional return AFTER all hooks
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 blur-3xl" />
        <Card className="relative p-8 border-primary/30 bg-gradient-to-br from-black/80 to-primary/10 backdrop-blur-xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className={`w-16 h-16 bg-gradient-to-br ${roleColor} rounded-full flex items-center justify-center`}
            >
              <Shield className="w-8 h-8 text-white" />
            </motion.div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                  {admin?.role === "super_admin" && "Welcome back Super Admin"}
                  {admin?.role === "middle_admin" && "Welcome back Middle Admin"}
                  {admin?.role === "normal_admin" && "Welcome back Normal Admin"}
                </h1>
                <span className={`text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r ${roleColor} text-white uppercase tracking-wider`}>
                  {roleLabel}
                </span>
              </div>
              <p className="text-muted-foreground flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary animate-pulse" />
                System Overview • Real-time Monitoring • All metrics updating live
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {admin?.fullName || admin?.username || "Admin"} • {admin?.email || ""}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Key Statistics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        <StatCard
          title="Live Trading Members"
          value={stats?.totalLiveTradingMembers?.toString() || stats?.liveAccounts?.toString() || "0"}
          icon={Users}
          index={0}
          description="Active live trading accounts"
        />
        <StatCard
          title="Pending Documents"
          value={stats?.pendingDocuments?.toString() || "0"}
          icon={FileText}
          index={1}
          description="Awaiting verification"
        />
        <StatCard
          title="Verified Documents"
          value={stats?.verifiedDocuments?.toString() || "0"}
          icon={FileText}
          index={2}
          description="Successfully verified"
        />
        <StatCard
          title="Total Trading Accounts"
          value={stats?.totalTradingAccounts?.toString() || "0"}
          icon={Wallet}
          index={3}
          description="All account types"
        />
      </div>

      {/* Alert Cards */}
      <div className={`grid ${normalAdmin ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-4"} gap-6 mt-8`}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="relative p-6 border-blue-500/30 bg-gradient-to-br from-black/60 to-blue-500/5 backdrop-blur-sm overflow-hidden hover:border-blue-500/50 transition-all">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <Users className="w-8 h-8 text-blue-400" />
                <span className="text-xs uppercase tracking-wider text-blue-400 font-semibold">All Users</span>
              </div>
              <div className="text-3xl font-bold text-blue-400 mb-1">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">Registered accounts</p>
            </div>
          </Card>
        </motion.div>

        {/* Hide financial data (deposits/withdrawals) from normal admins */}
        {!normalAdmin && (
          <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="relative p-6 border-yellow-500/30 bg-gradient-to-br from-black/60 to-yellow-500/5 backdrop-blur-sm overflow-hidden hover:border-yellow-500/50 transition-all">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <AlertCircle className="w-8 h-8 text-yellow-400" />
                    <span className="text-xs uppercase tracking-wider text-yellow-400 font-semibold">Pending</span>
                  </div>
                  <div className="text-3xl font-bold text-yellow-400 mb-1">{stats?.pendingDeposits || 0}</div>
                  <p className="text-xs text-muted-foreground">Deposits awaiting</p>
                </div>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Card className="relative p-6 border-red-500/30 bg-gradient-to-br from-black/60 to-red-500/5 backdrop-blur-sm overflow-hidden hover:border-red-500/50 transition-all">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <Wallet className="w-8 h-8 text-red-400" />
                    <span className="text-xs uppercase tracking-wider text-red-400 font-semibold">Pending</span>
                  </div>
                  <div className="text-3xl font-bold text-red-400 mb-1">{stats?.pendingWithdrawals || 0}</div>
                  <p className="text-xs text-muted-foreground">Withdrawals awaiting</p>
                </div>
              </Card>
            </motion.div>
          </>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: normalAdmin ? 0.4 : 0.6 }}>
          <Card className="relative p-6 border-purple-500/30 bg-gradient-to-br from-black/60 to-purple-500/5 backdrop-blur-sm overflow-hidden hover:border-purple-500/50 transition-all">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <MessageSquare className="w-8 h-8 text-purple-400" />
                <span className="text-xs uppercase tracking-wider text-purple-400 font-semibold">Support</span>
              </div>
              <div className="text-3xl font-bold text-purple-400 mb-1">{stats?.openTickets || 0}</div>
              <p className="text-xs text-muted-foreground">Open tickets</p>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Financial Overview - Hidden from normal admins */}
      {!normalAdmin && (
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
            <Card className="relative p-6 border-green-500/30 bg-gradient-to-br from-black/80 to-green-500/10 backdrop-blur-xl overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-green-400 uppercase tracking-wider">Deposits Overview</h3>
                    <p className="text-xs text-muted-foreground">Financial inflows</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded bg-green-500/5">
                    <span className="text-muted-foreground text-sm font-medium">Total Amount:</span>
                    <span className="text-xl font-bold text-green-400">${stats?.totalDepositAmount || "0.00"}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded bg-black/40 border border-green-500/20">
                      <div className="text-xs text-muted-foreground mb-1">Completed</div>
                      <div className="text-lg font-bold text-green-400 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        {stats?.completedDeposits || 0}
                      </div>
                    </div>
                    <div className="p-3 rounded bg-black/40 border border-yellow-500/20">
                      <div className="text-xs text-muted-foreground mb-1">Pending</div>
                      <div className="text-lg font-bold text-yellow-400 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {stats?.pendingDeposits || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}>
            <Card className="relative p-6 border-red-500/30 bg-gradient-to-br from-black/80 to-red-500/10 backdrop-blur-xl overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-red-400 uppercase tracking-wider">Withdrawals Overview</h3>
                    <p className="text-xs text-muted-foreground">Financial outflows</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded bg-red-500/5">
                    <span className="text-muted-foreground text-sm font-medium">Total Amount:</span>
                    <span className="text-xl font-bold text-red-400">${stats?.totalWithdrawalAmount || "0.00"}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded bg-black/40 border border-red-500/20">
                      <div className="text-xs text-muted-foreground mb-1">Total Requests</div>
                      <div className="text-lg font-bold text-red-400 flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        {stats?.totalWithdrawals || 0}
                      </div>
                    </div>
                    <div className="p-3 rounded bg-black/40 border border-yellow-500/20">
                      <div className="text-xs text-muted-foreground mb-1">Pending</div>
                      <div className="text-lg font-bold text-yellow-400 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {stats?.pendingWithdrawals || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Country-wise Trading Accounts */}
      {stats?.countryAccountsBreakdown && stats.countryAccountsBreakdown.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.9 }}
          className="mt-8"
        >
          <Card className="relative p-6 border-primary/30 bg-gradient-to-br from-black/80 to-primary/10 backdrop-blur-xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-primary uppercase tracking-wider">Country-wise Trading Accounts</h3>
                  <p className="text-xs text-muted-foreground">Total accounts distribution by country</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {stats.countryAccountsBreakdown.map((item, index) => (
                  <motion.div
                    key={item.country}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1 + index * 0.05 }}
                    className="p-4 rounded-lg border border-primary/20 bg-black/40 hover:border-primary/40 hover:bg-primary/5 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-foreground truncate flex-1">{item.country}</span>
                      <span className="text-2xl font-bold text-primary ml-2">{item.count}</span>
                    </div>
                    <div className="w-full bg-black/60 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500"
                        style={{ 
                          width: `${(item.count / (stats.totalTradingAccounts || 1)) * 100}%` 
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {((item.count / (stats.totalTradingAccounts || 1)) * 100).toFixed(1)}% of total
                    </p>
                  </motion.div>
                ))}
              </div>
              {stats.countryAccountsBreakdown.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Globe className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No trading accounts found</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

