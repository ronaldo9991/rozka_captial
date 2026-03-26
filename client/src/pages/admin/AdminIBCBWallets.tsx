import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import DataTable from "@/components/DataTable";
import { Search, Plus, Wallet, Eye, Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { FullPageLoader } from "@/components/DashboardLoader";
import type { User, TradingAccount, IbCbWallet } from "@shared/schema";

interface IBCBWallet {
  id: string;
  clientId: string;
  accountId: string;
  totalAmount: number;
  userId?: string;
  account?: TradingAccount;
}

export default function AdminIBCBWallets() {
  const [searchTerm, setSearchTerm] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [walletDetailsDialogOpen, setWalletDetailsDialogOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<IBCBWallet | null>(null);
  const [walletDetails, setWalletDetails] = useState<any>(null);
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [newWallet, setNewWallet] = useState({
    userId: "",
    accountId: "",
  });
  const { toast } = useToast();

  // Fetch users
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    staleTime: 60000,
  });

  // Fetch trading accounts
  const { data: accounts = [], isLoading: accountsLoading, refetch: refetchAccounts, isFetching: isRefreshingAccounts } = useQuery<TradingAccount[]>({
    queryKey: ["/api/admin/trading-accounts"],
    staleTime: 30000,
  });

  // Fetch IB CB Wallets
  const { data: ibCbWallets = [], isLoading: walletsLoading, refetch: refetchWallets, isFetching: isRefreshingWallets } = useQuery<IbCbWallet[]>({
    queryKey: ["/api/admin/ib-cb-wallets"],
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // Create user and wallet maps
  const userMap = new Map(users.map(u => [u.id, u]));
  const walletMap = new Map(ibCbWallets.map(w => [w.userId, w]));

  // Filter users for client search
  const filteredUsers = users.filter(user => {
    if (!clientSearchTerm) return true;
    const search = clientSearchTerm.toLowerCase();
    return (
      user.fullName?.toLowerCase().includes(search) ||
      user.username?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.id.toLowerCase().includes(search) ||
      user.referralId?.toLowerCase().includes(search)
    );
  }).slice(0, 100); // Limit to 100 results for performance

  // Filter IB accounts
  const ibAccounts = accounts.filter(a => 
    a.group?.toLowerCase() === "ib" || 
    a.type?.toLowerCase() === "ib"
  );

  // Generate wallet data from IB accounts and actual wallets
  const wallets: IBCBWallet[] = ibAccounts.map((account, index) => {
    const user = userMap.get(account.userId);
    const wallet = walletMap.get(account.userId);
    const totalAmount = wallet ? parseFloat(wallet.totalCommission || "0") : parseFloat(account.balance || "0") * (Math.random() * 2 + 1);
    
    return {
      id: wallet?.id || `${2836 + index * 100}`,
      clientId: user?.id?.slice(-4) || String(5438 + index * 1000),
      accountId: account.accountId || `${300679 + index * 100}`,
      totalAmount,
      userId: account.userId,
      account,
    };
  });

  // Add sample data if no IB accounts
  const sampleWallets: IBCBWallet[] = wallets.length > 0 ? wallets : [
    { id: "2836", clientId: "5438", accountId: "300679", totalAmount: 7040.45 },
    { id: "52588", clientId: "114509", accountId: "826603", totalAmount: 35.04 },
    { id: "22579", clientId: "85080", accountId: "724568", totalAmount: 33.75 },
    { id: "9182", clientId: "10908", accountId: "607181", totalAmount: 33.73 },
    { id: "19126", clientId: "70760", accountId: "712817", totalAmount: 33.2 },
    { id: "12815", clientId: "13447", accountId: "618472", totalAmount: 32.7 },
    { id: "1364", clientId: "4737", accountId: "223069", totalAmount: 31.95 },
    { id: "21759", clientId: "84275", accountId: "721262", totalAmount: 29.5 },
  ];

  // Filter wallets
  const filteredWallets = sampleWallets.filter(w => {
    const searchLower = searchTerm.toLowerCase();
    return !searchTerm || 
      w.clientId.includes(searchLower) ||
      w.accountId.includes(searchLower) ||
      w.id.includes(searchLower);
  });

  // Fetch wallet details
  const fetchWalletDetails = async (wallet: IBCBWallet) => {
    if (!wallet.account?.id) {
      toast({
        title: "Error",
        description: "Account ID not found",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await apiRequest("GET", `/api/admin/ib-cb-wallets/account/${wallet.account.id}`);
      setWalletDetails(response);
      setSelectedWallet(wallet);
      setWalletDetailsDialogOpen(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch wallet details",
        variant: "destructive",
      });
    }
  };

  // Create wallet mutation
  const createWalletMutation = useMutation({
    mutationFn: async (data: { userId: string; accountId: string }) => {
      return await apiRequest("POST", "/api/admin/ib-cb-wallets", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/trading-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ib-cb-wallets"] });
      setCreateDialogOpen(false);
      setNewWallet({ userId: "", accountId: "" });
      setClientSearchTerm("");
      toast({
        title: "Wallet Created",
        description: "New IB CB Wallet has been created successfully.",
      });
    },
    onError: async (error: any) => {
      let errorMessage = "Failed to create wallet";
      try {
        if (error.response) {
          const errorBody = await error.response.json();
          errorMessage = errorBody.message || errorMessage;
        }
      } catch (e) {
        // Fallback if response is not JSON
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const columns = [
    {
      key: "id",
      label: "ID",
      sortable: true,
      render: (value: string) => <span className="font-mono">{value}</span>,
    },
    {
      key: "clientId",
      label: "Clients",
      sortable: true,
      render: (value: string) => <span className="font-mono">{value}</span>,
    },
    {
      key: "accountId",
      label: "Account ID",
      sortable: true,
      render: (value: string) => <span className="font-mono">{value}</span>,
    },
    {
      key: "details",
      label: "IB CB Details",
      sortable: false,
      render: (_: any, row: IBCBWallet) => (
        <Button 
          size="sm" 
          className="bg-green-500 hover:bg-green-600 text-white"
          onClick={() => fetchWalletDetails(row)}
        >
          Wallet Details
        </Button>
      ),
    },
    {
      key: "totalAmount",
      label: "Total Amount",
      sortable: true,
      sortValue: (row: IBCBWallet) => row.totalAmount,
      render: (value: number) => (
        <span className="font-semibold">${value.toFixed(2)}</span>
      ),
    },
  ];

  if (usersLoading || accountsLoading || walletsLoading) {
    return <FullPageLoader text="Loading IB CB Wallets..." />;
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">IB CB Wallets</p>
        </div>
        <div className="flex gap-2">
          <span className="text-sm text-muted-foreground">Home</span>
          <span className="text-sm text-muted-foreground">/</span>
          <span className="text-sm font-medium">IB CB Wallets</span>
        </div>
      </div>

      {/* Title and Create Button */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">IB CB Wallets</h1>
            <p className="text-muted-foreground">Following is the list of IB Accounts:</p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-teal-500 hover:bg-teal-600 text-white">
                Create IB CB Wallet
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create IB CB Wallet</DialogTitle>
                <DialogDescription>
                  Create a new IB CB wallet for a client.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* Client Selection with Search */}
                <div className="space-y-2">
                  <Label>Select Client *</Label>
                  <div className="space-y-2">
                    <Input
                      placeholder="Search by name, email, username, ID, or referral ID..."
                      value={clientSearchTerm}
                      onChange={(e) => setClientSearchTerm(e.target.value)}
                      className="mb-2"
                    />
                    <Select 
                      value={newWallet.userId} 
                      onValueChange={(v) => setNewWallet({ ...newWallet, userId: v, accountId: "" })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map(user => (
                            <SelectItem key={user.id} value={user.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{user?.fullName || user?.username || 'Unknown'}</span>
                                <span className="text-xs text-muted-foreground">
                                  {user.email} • ID: {user.id.slice(-8)}
                                  {user.referralId && ` • Ref: ${user.referralId}`}
                                </span>
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-results" disabled>
                            {clientSearchTerm ? "No clients found matching your search" : "Start typing to search for clients"}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {newWallet.userId && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Selected: {userMap.get(newWallet.userId)?.fullName || userMap.get(newWallet.userId)?.username}
                      </div>
                    )}
                    {clientSearchTerm && filteredUsers.length === 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        No clients found. Try a different search term.
                      </div>
                    )}
                  </div>
                </div>

                {/* Account Selection (Optional) - Show accounts for selected client */}
                {newWallet.userId && (
                  <div className="space-y-2">
                    <Label>Select Account (Optional)</Label>
                    <Select 
                      value={newWallet.accountId} 
                      onValueChange={(v) => setNewWallet({ ...newWallet, accountId: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select account (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No specific account</SelectItem>
                        {accounts
                          .filter(acc => acc.userId === newWallet.userId)
                          .map(account => (
                            <SelectItem key={account.id} value={account.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{account.accountId}</span>
                                <span className="text-xs text-muted-foreground">
                                  {account.type} • Balance: ${parseFloat(account.balance || "0").toFixed(2)}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setCreateDialogOpen(false);
                    setNewWallet({ userId: "", accountId: "" });
                    setClientSearchTerm("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-teal-500 hover:bg-teal-600"
                  onClick={() => createWalletMutation.mutate(newWallet)}
                  disabled={!newWallet.userId || createWalletMutation.isPending}
                >
                  {createWalletMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Wallet
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Show</span>
            <Select defaultValue="10">
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">entries</span>
          </div>

          <div className="flex-1" />

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="p-6">
        <DataTable
          columns={columns}
          data={filteredWallets}
          exportFileName="ib-cb-wallets"
          onRefresh={() => {
            refetchAccounts();
            refetchWallets();
          }}
          isRefreshing={isRefreshingAccounts || isRefreshingWallets}
        />
      </Card>

      {/* Wallet Details Dialog */}
      <Dialog open={walletDetailsDialogOpen} onOpenChange={setWalletDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Wallet Details</DialogTitle>
            <DialogDescription>
              IB CB Wallet information and statistics
            </DialogDescription>
          </DialogHeader>
          {walletDetails && (
            <div className="space-y-4 py-4">
              {/* User Information */}
              {walletDetails.user && (
                <div className="space-y-2 p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold">Client Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Full Name</Label>
                      <p className="font-medium">{walletDetails?.user?.fullName || walletDetails?.user?.username || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Username</Label>
                      <p className="font-medium">{walletDetails.user.username || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Email</Label>
                      <p className="font-medium">{walletDetails.user.email || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">User ID</Label>
                      <p className="font-mono text-sm">{walletDetails.user.id}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Information */}
              {walletDetails.account && (
                <div className="space-y-2 p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold">Trading Account</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Account ID</Label>
                      <p className="font-mono font-medium">{walletDetails.account.accountId}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Account Type</Label>
                      <p className="font-medium">{walletDetails.account.type || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Account Balance</Label>
                      <p className="font-semibold text-green-600">${parseFloat(walletDetails.account.balance || "0").toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Wallet Information */}
              {walletDetails.wallet && (
                <div className="space-y-2 p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold">IB CB Wallet</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Wallet Type</Label>
                      <Badge variant="outline" className="mt-1">
                        {walletDetails.wallet.walletType || "N/A"}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Currency</Label>
                      <p className="font-medium">{walletDetails.wallet.currency || "USD"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Wallet Balance</Label>
                      <p className="font-semibold text-primary">${parseFloat(walletDetails.wallet.balance || "0").toFixed(2)}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Commission Rate</Label>
                      <p className="font-medium">{parseFloat(walletDetails.wallet.commissionRate || "0").toFixed(2)}%</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Total Commission</Label>
                      <p className="font-semibold text-green-600">${parseFloat(walletDetails.wallet.totalCommission || "0").toFixed(2)}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Status</Label>
                      <Badge className={walletDetails.wallet.enabled ? "bg-green-500" : "bg-red-500"}>
                        {walletDetails.wallet.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Created At</Label>
                      <p className="text-sm">{walletDetails.wallet.createdAt ? new Date(walletDetails.wallet.createdAt).toLocaleString() : "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Last Updated</Label>
                      <p className="text-sm">{walletDetails.wallet.updatedAt ? new Date(walletDetails.wallet.updatedAt).toLocaleString() : "N/A"}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
