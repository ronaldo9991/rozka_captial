import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Eye, Edit, Copy, Check, Mail, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/DataTable";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { TradingAccount, User, Deposit } from "@shared/schema";

interface AccountTypePageProps {
  title: string;
  description: string;
  accountType: "Live" | "IB" | "Champion" | "NDB" | "Social" | "Bonus";
  showReferralLink?: boolean;
  showIBDetails?: boolean;
}

interface ClientWithAccounts {
  user: User;
  accounts: TradingAccount[];
  totalDeposits: number;
  accountCount: number;
  totalBalance: number;
}

export default function AccountTypePage({
  title,
  description,
  accountType,
  showReferralLink = false,
  showIBDetails = false,
}: AccountTypePageProps) {
  const [location, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch all accounts
  const { data: accounts = [], isLoading: accountsLoading, error: accountsError, refetch: refetchAccounts, isFetching: isRefreshingAccounts } = useQuery<TradingAccount[]>({
    queryKey: ["/api/admin/trading-accounts"],
    refetchOnWindowFocus: true,
    staleTime: 30000,
  });

  // Fetch all users
  const { data: users = [], isLoading: usersLoading, error: usersError, refetch: refetchUsers, isFetching: isRefreshingUsers } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    refetchOnWindowFocus: true,
    staleTime: 30000,
  });

  // Fetch all deposits
  const { data: deposits = [], isLoading: depositsLoading, error: depositsError, refetch: refetchDeposits, isFetching: isRefreshingDeposits } = useQuery<Deposit[]>({
    queryKey: ["/api/admin/deposits"],
    refetchOnWindowFocus: true,
    staleTime: 30000,
  });

  // Combined refresh function
  const handleRefresh = async () => {
    await Promise.all([refetchAccounts(), refetchUsers(), refetchDeposits()]);
  };

  // Log errors and data
  useEffect(() => {
    if (accountsError) console.error("[AccountTypePage] Accounts error:", accountsError);
    if (usersError) console.error("[AccountTypePage] Users error:", usersError);
    if (depositsError) console.error("[AccountTypePage] Deposits error:", depositsError);
    
    // Debug: Log data counts
    console.log("[AccountTypePage] Data loaded:", {
      accounts: accounts.length,
      users: users.length,
      deposits: deposits.length,
      accountsLoading,
      usersLoading,
      depositsLoading,
    });
  }, [accountsError, usersError, depositsError, accounts.length, users.length, deposits.length, accountsLoading, usersLoading, depositsLoading]);

  // Delete account mutation
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

  // Filter accounts by type - matching server-side stats logic exactly
  const filteredAccounts = useMemo(() => {
    return accounts.filter((account) => {
      const type = account.type?.toLowerCase() || "";
      const group = account.group?.toLowerCase() || "";
      const typeExact = account.type || "";
      const groupExact = account.group || "";

      if (accountType === "Live") {
        return type === "live" || typeExact === "Live";
      } else if (accountType === "IB") {
        return group === "ib" || type === "ib" || groupExact === "IB" || typeExact === "IB";
      } else if (accountType === "Champion") {
        return group === "champion" || type === "champion" || groupExact === "Champion" || typeExact === "Champion";
      } else if (accountType === "NDB") {
        return type === "bonus" || group === "ndb" || type === "ndb" || 
               typeExact === "Bonus" || groupExact === "NDB" || typeExact === "NDB";
      } else if (accountType === "Social") {
        return group === "social" || type === "social" || 
               groupExact === "Social" || typeExact === "Social" ||
               group.includes("social") || type.includes("social");
      } else if (accountType === "Bonus") {
        return (group === "bonus" || groupExact === "Bonus") && 
               type !== "bonus" && typeExact !== "Bonus";
      }
      return false;
    });
  }, [accounts, accountType]);

  // Group accounts by client and calculate stats
  const clientsWithAccounts = useMemo(() => {
    const clientMap = new Map<string, ClientWithAccounts>();

    console.log(`[AccountTypePage] Grouping ${filteredAccounts.length} accounts with ${users.length} users`);

    filteredAccounts.forEach((account) => {
      // Normalize IDs for comparison (handle both string and number IDs)
      const accountUserId = String(account.userId || '').trim();
      const user = users.find((u) => {
        const userId = String(u.id || '').trim();
        return userId === accountUserId;
      });
      if (!user) {
        console.warn(`[AccountTypePage] No user found for account ${account.id}, userId: ${account.userId} (normalized: ${accountUserId})`);
        console.warn(`[AccountTypePage] Available user IDs: ${users.slice(0, 5).map(u => String(u.id)).join(', ')}...`);
        return;
      }

      if (!clientMap.has(user.id)) {
        clientMap.set(user.id, {
          user,
          accounts: [],
          totalDeposits: 0,
          accountCount: 0,
          totalBalance: 0,
        });
      }

      const clientData = clientMap.get(user.id)!;
      clientData.accounts.push(account);
      clientData.accountCount++;
      
      // Calculate balance
      const balance = parseFloat(account.balance || "0");
      clientData.totalBalance += balance;
    });

    // Calculate total deposits per client
    deposits.forEach((deposit) => {
      if (deposit.status === "Completed" || deposit.status === "Approved") {
        // Normalize deposit userId for comparison
        const depositUserId = String(deposit.userId || '').trim();
        const clientData = clientMap.get(depositUserId);
        if (clientData) {
          const depositAmount = parseFloat(deposit.amount || "0");
          clientData.totalDeposits += depositAmount;
        }
      }
    });

    const result = Array.from(clientMap.values());
    console.log(`[AccountTypePage] Created ${result.length} clients with accounts`);
    return result;
  }, [filteredAccounts, users, deposits]);

  // Apply search filter - comprehensive search across all fields
  const filteredClients = useMemo(() => {
    if (!searchTerm || searchTerm.trim() === "") return clientsWithAccounts;
    
    const search = searchTerm.toLowerCase().trim();
    
    // Debug logging
    console.log(`[AccountTypePage] Searching for: "${search}" in ${clientsWithAccounts.length} clients`);
    
    const filtered = clientsWithAccounts.filter((clientData) => {
      const { user, accounts } = clientData;
      
      // Skip if user is undefined (shouldn't happen, but safety check)
      if (!user) {
        return false;
      }
      
      // Search in user fields
      const userMatches = 
        (user.email?.toLowerCase().includes(search) ?? false) ||
        (user.fullName?.toLowerCase().includes(search) ?? false) ||
        (user.username?.toLowerCase().includes(search) ?? false) ||
        (user.referralId?.toLowerCase().includes(search) ?? false) ||
        (user.country?.toLowerCase().includes(search) ?? false) ||
        (String(user.id || '').toLowerCase().includes(search)) ||
        (user.phone?.toLowerCase().includes(search) ?? false) ||
        (user.city?.toLowerCase().includes(search) ?? false);
      
      // Search in account fields
      const accountMatches = accounts.some(acc => {
        const accountId = (acc.accountId || "").toLowerCase();
        const type = (acc.type || "").toLowerCase();
        const group = (acc.group || "").toLowerCase();
        const balance = (acc.balance || "").toString();
        const status = acc.enabled ? "enabled" : "disabled";
        const enabledText = acc.enabled ? "approved" : "pending";
        const accountIdNum = accountId.replace(/\D/g, ""); // Extract numbers from account ID
        
        return (
          accountId.includes(search) ||
          type.includes(search) ||
          group.includes(search) ||
          balance.includes(search) ||
          status.includes(search) ||
          enabledText.includes(search) ||
          (acc.id || "").toLowerCase().includes(search) ||
          accountIdNum.includes(search.replace(/\D/g, "")) // Match numeric parts
        );
      });
      
      // Search in aggregated data
      const aggregatedMatches = 
        clientData.totalBalance.toString().includes(search) ||
        clientData.totalDeposits.toString().includes(search) ||
        clientData.accountCount.toString().includes(search);
      
      return userMatches || accountMatches || aggregatedMatches;
    });
    
    console.log(`[AccountTypePage] Search results: ${filtered.length} clients found`);
    return filtered;
  }, [clientsWithAccounts, searchTerm]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({
      title: "Copied",
      description: "Copied to clipboard",
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const columns = [
    {
      key: "user.id",
      label: "ID",
      sortable: true,
      render: (_: any, row: ClientWithAccounts) => {
        if (!row.user) return <span className="text-muted-foreground">N/A</span>;
        const userId = String(row.user.id || '');
        return (
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs">{userId.slice(0, 8)}...</span>
            <button
              onClick={() => copyToClipboard(userId, userId)}
              className="p-1 hover:bg-accent rounded"
            >
              {copiedId === userId ? (
                <Check className="w-3 h-3 text-green-600" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>
        );
      },
    },
    {
      key: "user.fullName",
      label: "Client Name",
      sortable: true,
      render: (_: any, row: ClientWithAccounts) => (
        <div>
          <div className="font-semibold">{row.user?.fullName || row.user?.username || 'N/A'}</div>
          {row.user?.email && (
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {row.user.email}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "user.referralId",
      label: "Referral ID",
      sortable: true,
      render: (_: any, row: ClientWithAccounts) => {
        if (!row.user) return <span className="text-muted-foreground text-sm">N/A</span>;
        return (
          <div className="flex items-center gap-2">
            {row.user.referralId ? (
              <>
                <span className="font-mono text-sm">{row.user.referralId}</span>
                <button
                  onClick={() => copyToClipboard(row.user.referralId!, `ref-${row.user.id}`)}
                  className="p-1 hover:bg-accent rounded"
                >
                  {copiedId === `ref-${row.user.id}` ? (
                    <Check className="w-3 h-3 text-green-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </>
            ) : (
              <span className="text-muted-foreground text-sm">N/A</span>
            )}
          </div>
        );
      },
    },
    {
      key: "user.phone",
      label: "Phone",
      sortable: true,
      render: (_: any, row: ClientWithAccounts) => (
        <span className="text-sm">{row.user?.phone || "N/A"}</span>
      ),
    },
    {
      key: "user.country",
      label: "Country",
      sortable: true,
      render: (_: any, row: ClientWithAccounts) => (
        <Badge variant="outline" className={row.user?.country ? "bg-primary/10 text-primary border-primary/30" : ""}>
          {row.user?.country || "N/A"}
        </Badge>
      ),
    },
    {
      key: "accountCount",
      label: "Accounts",
      sortable: true,
      sortValue: (row: ClientWithAccounts) => row.accountCount,
      render: (_: any, row: ClientWithAccounts) => (
        <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30">
          {row.accountCount}
        </Badge>
      ),
    },
    {
      key: "totalBalance",
      label: "Total Balance",
      sortable: true,
      sortValue: (row: ClientWithAccounts) => row.totalBalance,
      render: (_: any, row: ClientWithAccounts) => (
        <span className="font-semibold text-primary">
          ${row.totalBalance.toFixed(2)}
        </span>
      ),
    },
    {
      key: "totalDeposits",
      label: "Total Investment",
      sortable: true,
      sortValue: (row: ClientWithAccounts) => row.totalDeposits,
      render: (_: any, row: ClientWithAccounts) => (
        <span className="font-semibold text-green-600">
          ${row.totalDeposits.toFixed(2)}
        </span>
      ),
    },
    {
      key: "user.createdAt",
      label: "Member Since",
      sortable: true,
      render: (_: any, row: ClientWithAccounts) => {
        if (!row.user) return <span className="text-muted-foreground">N/A</span>;
        return (
          <span className="text-sm">{new Date(row.user.createdAt).toLocaleDateString()}</span>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (_: any, row: ClientWithAccounts) => {
        if (!row.user) return <span className="text-muted-foreground">N/A</span>;
        // View and Edit buttons removed - only available in Clients page
        return (
          <span className="text-muted-foreground text-sm">Go to Clients page to view/edit</span>
        );
      },
    },
  ];

  if (accountsLoading || usersLoading || depositsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">
          Loading {accountsLoading ? "accounts" : ""} {usersLoading ? "users" : ""} {depositsLoading ? "deposits" : ""}...
        </p>
      </div>
    );
  }

  // Show error if critical data failed to load
  if (usersError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-destructive font-semibold">Failed to load users</p>
        <p className="text-muted-foreground text-sm">{usersError.message || "Unknown error"}</p>
        <Button onClick={() => refetchUsers()}>Retry</Button>
      </div>
    );
  }

  if (accountsError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-destructive font-semibold">Failed to load accounts</p>
        <p className="text-muted-foreground text-sm">{accountsError.message || "Unknown error"}</p>
        <Button onClick={() => refetchAccounts()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Showing {filteredClients.length} client{filteredClients.length !== 1 ? "s" : ""} with {filteredAccounts.length} total account{filteredAccounts.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Search and Controls */}
      <Card className="p-4 border-card-border bg-card">
        <div className="flex items-center justify-end gap-4">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, referral ID, country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-10 ${searchTerm ? "pr-10" : ""}`}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-accent rounded-full transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Clients Table */}
      <Card className="border-card-border bg-card">
        <div className="p-6">
          {filteredClients.length > 0 ? (
            <DataTable 
              columns={columns} 
              data={filteredClients}
              exportFileName={title.toLowerCase().replace(/\s+/g, "-")}
              onRefresh={handleRefresh}
              isRefreshing={isRefreshingAccounts || isRefreshingUsers || isRefreshingDeposits}
            />
          ) : (
            <div className="text-center py-8 space-y-2">
              <p className="text-muted-foreground">No clients found</p>
              {users.length === 0 && (
                <div className="text-sm text-destructive space-y-1">
                  <p>⚠️ Users data not loaded ({users.length} users)</p>
                  <p className="text-xs">Check browser console (F12) for API errors</p>
                  <Button size="sm" variant="outline" onClick={() => handleRefresh()} className="mt-2">
                    Refresh Data
                  </Button>
                </div>
              )}
              {accounts.length === 0 && (
                <div className="text-sm text-destructive">
                  <p>⚠️ Accounts data not loaded ({accounts.length} accounts)</p>
                </div>
              )}
              {filteredAccounts.length === 0 && accounts.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  No {accountType} accounts found in {accounts.length} total accounts.
                </p>
              )}
              {clientsWithAccounts.length === 0 && filteredAccounts.length > 0 && users.length > 0 && (
                <div className="text-sm text-destructive space-y-1">
                  <p>⚠️ {filteredAccounts.length} {accountType} accounts found but no matching users.</p>
                  <p className="text-xs">This indicates a data relationship issue. Check console for details.</p>
                </div>
              )}
              {clientsWithAccounts.length === 0 && filteredAccounts.length === 0 && accounts.length > 0 && users.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  No {accountType} type accounts found. Total accounts: {accounts.length}, Users: {users.length}
                </p>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
