import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import DataTable from "@/components/DataTable";
import { Search, Plus, Eye, Pencil, Trash2, Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { FullPageLoader } from "@/components/DashboardLoader";
import type { User, TradingAccount, Deposit } from "@shared/schema";

export default function AdminTopUp() {
  const [location, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTopUp, setSelectedTopUp] = useState<Deposit | null>(null);
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [newTopUp, setNewTopUp] = useState({
    userId: "",
    accountId: "",
    amount: "",
  });
  const [editTopUp, setEditTopUp] = useState({
    amount: "",
  });
  const { toast } = useToast();

  // Fetch TopUp records from API
  const { data: topUps = [], isLoading: topUpsLoading, refetch: refetchTopUps, isFetching: isRefreshingTopUps } = useQuery<Deposit[]>({
    queryKey: ["/api/admin/topups"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/topups");
      return await response.json();
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // Fetch all users
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/users");
      return await response.json();
    },
    staleTime: 30000,
    refetchOnWindowFocus: true,
  });

  // Fetch trading accounts for selected client
  const { data: allAccounts = [], isLoading: accountsLoading } = useQuery<TradingAccount[]>({
    queryKey: ["/api/admin/trading-accounts"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/trading-accounts");
      return await response.json();
    },
    staleTime: 30000,
    enabled: !!newTopUp.userId,
  });

  // Filter accounts for selected client
  const clientAccounts = allAccounts.filter(acc => acc.userId === newTopUp.userId);

  // Create user and account maps
  const userMap = new Map(users.map(u => [u.id, u]));
  const accountMap = new Map(allAccounts.map(acc => [acc.id, acc]));

  // Filter topups
  const filteredTopUps = topUps.filter(t => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase().trim();
    if (!searchLower) return true;
    const user = userMap.get(t.userId);
    const account = t.accountId ? accountMap.get(t.accountId) : null;
    return (
      (t.amount?.toString() || "").toLowerCase().includes(searchLower) ||
      (t.transactionId || "").toLowerCase().includes(searchLower) ||
      user?.fullName?.toLowerCase().includes(searchLower) ||
      user?.email?.toLowerCase().includes(searchLower) ||
      account?.accountId?.toLowerCase().includes(searchLower)
    );
  });

  // Create topup mutation
  const createTopUpMutation = useMutation({
    mutationFn: async (data: { userId: string; accountId?: string; amount: string }) => {
      return await apiRequest("POST", "/api/admin/topups", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/topups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/deposits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/trading-accounts"] });
      setCreateDialogOpen(false);
      setNewTopUp({ userId: "", accountId: "", amount: "" });
      setClientSearchTerm("");
      toast({
        title: "TopUp Created",
        description: "Money has been successfully added to the account.",
      });
    },
    onError: async (error: any) => {
      let errorMessage = "Failed to create TopUp";
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

  // Delete topup mutation
  const deleteTopUpMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/admin/topups/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/topups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/deposits"] });
      setDeleteDialogOpen(false);
      setSelectedTopUp(null);
      toast({
        title: "TopUp Deleted",
        description: "TopUp record has been deleted.",
      });
    },
    onError: async (error: any) => {
      let errorMessage = "Failed to delete TopUp";
      try {
        if (error?.response) {
          const errorBody = await error.response.json();
          errorMessage = errorBody.message || errorBody.detail || errorMessage;
        } else if (error?.message) {
          errorMessage = error.message;
        }
      } catch (e) {
        // Fallback if response is not JSON
        if (error?.message) {
          errorMessage = error.message;
        }
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Filter users for client search
  const filteredUsers = users.filter(user => {
    if (!clientSearchTerm) return true;
    const search = clientSearchTerm.toLowerCase();
    return (
      user.fullName?.toLowerCase().includes(search) ||
      user.username?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.id.toLowerCase().includes(search)
    );
  }).slice(0, 100);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return <Badge className="bg-green-500 hover:bg-green-600">Valid</Badge>;
      case "Pending":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>;
      case "Rejected":
      case "Cancelled":
        return <Badge className="bg-red-500 hover:bg-red-600">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const openViewDialog = (topUp: Deposit) => {
    setSelectedTopUp(topUp);
    setViewDialogOpen(true);
  };

  const openEditDialog = (topUp: Deposit) => {
    setSelectedTopUp(topUp);
    setEditTopUp({ amount: topUp.amount || "" });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (topUp: Deposit) => {
    setSelectedTopUp(topUp);
    setDeleteDialogOpen(true);
  };

  const columns = [
    {
      key: "createdAt",
      label: "Date",
      sortable: true,
      sortValue: (row: Deposit) => row.createdAt ? new Date(row.createdAt).getTime() : 0,
      render: (value: Date | null) => value ? new Date(value).toLocaleString() : "-",
    },
    {
      key: "completedAt",
      label: "Used Date",
      sortable: true,
      sortValue: (row: Deposit) => row.completedAt ? new Date(row.completedAt).getTime() : 0,
      render: (value?: Date) => value ? new Date(value).toLocaleString() : "-",
    },
    {
      key: "userId",
      label: "User",
      sortable: true,
      sortValue: (row: Deposit) => userMap.get(row.userId)?.fullName?.toLowerCase() || "",
      render: (value: string) => {
        const user = userMap.get(value);
        return (
          <div>
            <div className="font-medium">{user?.fullName || user?.username || "Unknown"}</div>
            <div className="text-xs text-muted-foreground">
              <button
                onClick={() => setLocation(`/admin/clients/${value}`)}
                className="text-primary hover:underline"
              >
                view
              </button>
              {" | "}
              <button
                onClick={() => setLocation(`/admin/clients/${value}`)}
                className="text-primary hover:underline"
              >
                edit
              </button>
            </div>
          </div>
        );
      },
    },
    {
      key: "accountId",
      label: "Account",
      sortable: true,
      sortValue: (row: Deposit) => {
        const account = row.accountId ? accountMap.get(row.accountId) : null;
        return account?.accountId?.toLowerCase() || "";
      },
      render: (value?: string) => {
        if (!value) return "-";
        const account = accountMap.get(value);
        return account?.accountId || value.slice(-8);
      },
    },
    {
      key: "userId",
      label: "Name",
      sortable: true,
      sortValue: (row: Deposit) => userMap.get(row.userId)?.fullName?.toLowerCase() || "",
      render: (_: any, row: Deposit) => {
        const user = userMap.get(row.userId);
        return user?.fullName || user?.username || "-";
      },
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      sortValue: (row: Deposit) => parseFloat(row.amount || "0"),
      render: (value: string) => (
        <span className="font-semibold text-green-600">${parseFloat(value || "0").toFixed(2)}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => getStatusBadge(value),
    },
    {
      key: "actions",
      label: "Action",
      sortable: false,
      render: (_: any, row: Deposit) => (
        <div className="flex gap-1">
          <Button 
            size="sm" 
            variant="outline" 
            className="h-7 w-7 p-0 bg-green-500 hover:bg-green-600 text-white border-0"
            onClick={() => openViewDialog(row)}
          >
            <Eye className="w-3 h-3" />
          </Button>
          {row.status === "Pending" && (
            <Button 
              size="sm" 
              variant="outline" 
              className="h-7 w-7 p-0 bg-blue-500 hover:bg-blue-600 text-white border-0"
              onClick={() => openEditDialog(row)}
            >
              <Pencil className="w-3 h-3" />
            </Button>
          )}
        </div>
      ),
    },
    {
      key: "delete",
      label: "Delete",
      sortable: false,
      render: (_: any, row: Deposit) => (
        row.status === "Pending" ? (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => openDeleteDialog(row)}
            disabled={deleteTopUpMutation.isPending}
          >
            Delete
          </Button>
        ) : <span className="text-muted-foreground">—</span>
      ),
    },
  ];

  if (topUpsLoading || usersLoading || accountsLoading) {
    return <FullPageLoader text="Loading TopUp data..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">TopUp</h1>
          <p className="text-muted-foreground">Manage client account top-ups</p>
        </div>
        <div className="flex gap-2">
          <span className="text-sm text-muted-foreground">Home</span>
          <span className="text-sm text-muted-foreground">/</span>
          <span className="text-sm font-medium">TopUp</span>
        </div>
      </div>

      {/* Create TopUp Button */}
      <Card className="p-4">
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gray-800 hover:bg-gray-900 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create TopUp
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create TopUp for Client</DialogTitle>
              <DialogDescription>
                Select a client and add money directly to their account.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Client Selection */}
              <div className="space-y-2">
                <Label>Select Client *</Label>
                <div className="space-y-2">
                  <Input
                    placeholder="Search by name, email, username, or ID..."
                    value={clientSearchTerm}
                    onChange={(e) => setClientSearchTerm(e.target.value)}
                    className="mb-2"
                  />
                  <Select 
                    value={newTopUp.userId} 
                    onValueChange={(v) => setNewTopUp({ ...newTopUp, userId: v, accountId: "" })}
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
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-results" disabled>
                          No clients found
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {newTopUp.userId && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Selected: {userMap.get(newTopUp.userId)?.fullName || userMap.get(newTopUp.userId)?.username}
                    </div>
                  )}
                </div>
              </div>

              {/* Account Selection */}
              {newTopUp.userId && (
                <div className="space-y-2">
                  <Label>Select Account *</Label>
                  {clientAccounts.length === 0 ? (
                    <div className="p-4 border border-yellow-500/30 rounded-lg bg-yellow-500/10">
                      <p className="text-sm text-yellow-400">
                        ⚠️ This user has no trading accounts. Please create an account first before adding funds.
                      </p>
                    </div>
                  ) : (
                    <Select 
                      value={newTopUp.accountId} 
                      onValueChange={(v) => setNewTopUp({ ...newTopUp, accountId: v })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        {clientAccounts.map(account => (
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
                  )}
                </div>
              )}

              {/* Amount */}
              <div className="space-y-2">
                <Label>Amount (USD) *</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={newTopUp.amount}
                  onChange={(e) => setNewTopUp({ ...newTopUp, amount: e.target.value })}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setCreateDialogOpen(false);
                setNewTopUp({ userId: "", accountId: "", amount: "" });
                setClientSearchTerm("");
              }}>
                Cancel
              </Button>
              <Button
                onClick={() => createTopUpMutation.mutate({
                  userId: newTopUp.userId,
                  accountId: newTopUp.accountId || undefined,
                  amount: newTopUp.amount,
                })}
                disabled={!newTopUp.userId || !newTopUp.amount || !newTopUp.accountId || clientAccounts.length === 0 || createTopUpMutation.isPending}
                className="bg-primary hover:bg-primary/90"
              >
                {createTopUpMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create TopUp
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
          data={filteredTopUps}
          exportFileName="topup-codes"
          onRefresh={() => { refetchTopUps(); }}
          isRefreshing={isRefreshingTopUps}
        />
      </Card>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>TopUp Details</DialogTitle>
          </DialogHeader>
          {selectedTopUp && (
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-muted-foreground">Transaction ID</Label>
                <p className="font-mono text-sm">{selectedTopUp.transactionId}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">User</Label>
                <p>{userMap.get(selectedTopUp.userId)?.fullName || userMap.get(selectedTopUp.userId)?.username || "Unknown"}</p>
              </div>
              {selectedTopUp.accountId && (
                <div>
                  <Label className="text-muted-foreground">Account</Label>
                  <p>{accountMap.get(selectedTopUp.accountId)?.accountId || selectedTopUp.accountId}</p>
                </div>
              )}
              <div>
                <Label className="text-muted-foreground">Amount</Label>
                <p className="font-semibold text-green-600">${parseFloat(selectedTopUp.amount || "0").toFixed(2)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <div>{getStatusBadge(selectedTopUp.status)}</div>
              </div>
              <div>
                <Label className="text-muted-foreground">Created At</Label>
                <p>{selectedTopUp.createdAt ? new Date(selectedTopUp.createdAt).toLocaleString() : "-"}</p>
              </div>
              {selectedTopUp.completedAt && (
                <div>
                  <Label className="text-muted-foreground">Completed At</Label>
                  <p>{new Date(selectedTopUp.completedAt).toLocaleString()}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete TopUp</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this TopUp record? This action cannot be undone.
              {selectedTopUp && (
                <div className="mt-2 p-2 bg-muted rounded">
                  <p className="text-sm">Amount: ${parseFloat(selectedTopUp.amount || "0").toFixed(2)}</p>
                  <p className="text-sm">User: {userMap.get(selectedTopUp.userId)?.fullName || "Unknown"}</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedTopUp && deleteTopUpMutation.mutate(selectedTopUp.id)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
