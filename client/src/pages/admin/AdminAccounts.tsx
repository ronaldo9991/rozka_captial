import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Folder, Search, Eye, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import DataTable from "@/components/DataTable";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { TradingAccount, User } from "@shared/schema";

interface AccountsStats {
  liveAccounts: number;
  ibAccounts: number;
  championAccounts: number;
  ndbAccounts: number;
  socialTradingAccounts: number;
  bonusShiftingAccounts: number;
}

export default function AdminAccounts() {
  const [location, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading } = useQuery<AccountsStats>({
    queryKey: ["/api/admin/accounts/stats"],
    refetchInterval: 10000, // Refresh every 10 seconds for real-time updates
    refetchOnWindowFocus: true, // Refresh when user returns to tab
    refetchOnMount: true, // Always fetch fresh data on mount
  });

  const { data: accounts = [], isLoading: accountsLoading, refetch: refetchAccounts, isFetching: isRefreshingAccounts } = useQuery<TradingAccount[]>({
    queryKey: ["/api/admin/trading-accounts"],
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const { data: users = [], isLoading: usersLoading, refetch: refetchUsers, isFetching: isRefreshingUsers } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Combined refresh function for accounts table
  const handleRefreshAccounts = async () => {
    await Promise.all([refetchAccounts(), refetchUsers()]);
  };

  // Create user map for quick lookup
  const userMap = useMemo(() => {
    const map = new Map<string, User>();
    users.forEach((user) => {
      map.set(user.id, user);
    });
    return map;
  }, [users]);

  const deleteAccountMutation = useMutation({
    mutationFn: async (accountId: string) => {
      return await apiRequest("DELETE", `/api/admin/trading-accounts/${accountId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/trading-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/accounts/stats"] });
      toast({
        title: "Success",
        description: "Trading account deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete trading account.",
        variant: "destructive",
      });
    },
  });

  const filteredAccounts = useMemo(() => {
    if (!searchTerm) return accounts;
    const search = searchTerm.toLowerCase();
    return accounts.filter((account) => {
      const user = userMap.get(account.userId);
      return (
        account.accountId?.toLowerCase().includes(search) ||
        account.type?.toLowerCase().includes(search) ||
        account.group?.toLowerCase().includes(search) ||
        user?.email?.toLowerCase().includes(search) ||
        user?.fullName?.toLowerCase().includes(search) ||
        user?.username?.toLowerCase().includes(search)
      );
    });
  }, [accounts, searchTerm, userMap]);

  const accountColumns = [
    {
      key: "id",
      label: "ID",
      sortable: true,
      render: (value: string, row: TradingAccount, index: number) => {
        // Use numeric ID - extract from accountId or use index
        const numericId = row.accountId ? parseInt(row.accountId.slice(-6)) || index + 1 : index + 1;
        return (
          <span className="font-mono text-sm">{numericId}</span>
        );
      },
    },
    {
      key: "accountId",
      label: "Account ID",
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-sm">{value}</span>
      ),
    },
    {
      key: "client",
      label: "Clients",
      sortable: true,
      sortValue: (row: TradingAccount) => {
        const user = userMap.get(row.userId);
        if (user?.id) {
          return parseInt(user.id.slice(-6)) || user.id;
        }
        return row.userId;
      },
      render: (_: any, row: TradingAccount) => {
        const user = userMap.get(row.userId);
        const clientId = user?.id ? parseInt(user.id.slice(-6)) || row.userId.slice(-6) : row.userId.slice(-6);
        return (
          <div>
            <span className="font-mono text-sm">{clientId}</span>
            <div className="mt-1">
              <span className="text-muted-foreground text-xs">Go to Clients page to view/edit</span>
            </div>
          </div>
        );
      },
    },
    {
      key: "type",
      label: "Type",
      sortable: true,
      render: (value: string) => (
        <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30">
          {value}
        </Badge>
      ),
    },
    {
      key: "group",
      label: "Group",
      sortable: true,
      render: (value: string) => (
        <span className="text-sm">{value}</span>
      ),
    },
    {
      key: "balance",
      label: "Balance",
      sortable: true,
      sortValue: (row: TradingAccount) => row.balance || 0,
      render: (value: string) => (
        <span className="text-sm font-semibold">${parseFloat(value || "0").toFixed(2)}</span>
      ),
    },
    {
      key: "createdAt",
      label: "Requested at",
      sortable: true,
      render: (value: Date) => (
        <span className="text-sm">{new Date(value).toLocaleString()}</span>
      ),
    },
    {
      key: "enabled",
      label: "Status",
      sortable: true,
      render: (value: boolean) => (
        <Badge variant={value ? "default" : "destructive"} className={value ? "bg-green-500/10 text-green-600 border-green-500/30" : ""}>
          {value ? "approved" : "disabled"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Action",
      sortable: false,
      render: (_: any, row: TradingAccount) => (
        <Button
          size="sm"
          variant="destructive"
          onClick={() => {
            if (confirm("Are you sure you want to delete this account?")) {
              deleteAccountMutation.mutate(row.id);
            }
          }}
          disabled={deleteAccountMutation.isPending}
        >
          {deleteAccountMutation.isPending ? (
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          ) : (
            <Trash2 className="w-3 h-3 mr-1" />
          )}
          Delete
        </Button>
      ),
    },
  ];

  if (statsLoading || accountsLoading || usersLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const accountTypes = [
    { 
      title: "Live Accounts", 
      count: stats?.liveAccounts ?? 0 // Real-time count from database
    },
    { 
      title: "IB Accounts", 
      count: stats?.ibAccounts ?? 0
    },
    { 
      title: "Champion Accounts", 
      count: stats?.championAccounts ?? 0
    },
    { 
      title: "NDB Accounts", 
      count: stats?.ndbAccounts ?? 0
    },
    { 
      title: "Social Trading Accounts", 
      count: stats?.socialTradingAccounts ?? 0
    },
    { 
      title: "Bonus Shifting Accounts", 
      count: stats?.bonusShiftingAccounts ?? 0
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <Folder className="w-6 h-6 text-[#FF8C00]" />
        <h1 className="text-3xl font-bold text-[#FF8C00]">Accounts</h1>
      </motion.div>

      {/* Account Types List - Clean Design */}
      <Card className="border-card-border bg-card">
        <div className="p-4 space-y-2">
        {accountTypes.map((account, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between py-3 px-4 rounded-md hover:bg-accent/30 transition-colors"
          >
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {account.title}
              </span>
              <Badge className="bg-[#22c55e] hover:bg-[#16a34a] text-white text-sm px-3 py-1 font-semibold min-w-[70px] text-center">
                  {account.count.toLocaleString()}
                </Badge>
          </motion.div>
        ))}
      </div>
      </Card>

      {/* Accounts Table */}
      <Card className="border-card-border bg-card">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-2">Accounts</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Following is the list of trading accounts in hold by the user.
          </p>

          {/* Search */}
          <div className="mb-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by Account ID, Type, Group..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredAccounts.length > 0 ? (
            <DataTable 
              columns={accountColumns} 
              data={filteredAccounts} 
              exportFileName="accounts"
              onRefresh={handleRefreshAccounts}
              isRefreshing={isRefreshingAccounts || isRefreshingUsers}
            />
          ) : (
            <p className="text-center text-muted-foreground py-8">No accounts found</p>
          )}
        </div>
      </Card>
    </div>
  );
}

