import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import DataTable from "@/components/DataTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Check, X, Eye, Loader2, Download, Archive, Clock, Search, Edit } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Withdrawal, User, TradingAccount } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateWithdrawalsPDF } from "@/lib/pdf-export";

export default function AdminWithdrawals() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [viewMode, setViewMode] = useState<"pending" | "archive">("pending");
  const [editForm, setEditForm] = useState({
    amount: "",
    method: "",
    bankName: "",
    accountNumber: "",
    status: "",
  });

  const { data: withdrawals = [], isLoading, refetch: refetchWithdrawals, isFetching: isRefreshingWithdrawals } = useQuery<Withdrawal[]>({
    queryKey: ["/api/admin/withdrawals"],
    refetchInterval: 15000, // Real-time updates every 15 seconds
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: accounts = [] } = useQuery<TradingAccount[]>({
    queryKey: ["/api/admin/trading-accounts"],
  });

  const approveWithdrawalMutation = useMutation({
    mutationFn: async (withdrawalId: string) => {
      return await apiRequest("PATCH", `/api/admin/withdrawals/${withdrawalId}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setActionDialogOpen(false);
      setSelectedWithdrawal(null);
      toast({
        title: "Withdrawal Approved",
        description: "Withdrawal approved. Balance deducted. Please manually send payment and mark as completed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve withdrawal",
        variant: "destructive",
      });
    },
  });

  const rejectWithdrawalMutation = useMutation({
    mutationFn: async ({ withdrawalId, reason }: { withdrawalId: string; reason: string }) => {
      return await apiRequest("PATCH", `/api/admin/withdrawals/${withdrawalId}/reject`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setActionDialogOpen(false);
      setSelectedWithdrawal(null);
      setRejectionReason("");
      toast({
        title: "Withdrawal Rejected",
        description: "Withdrawal has been rejected",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject withdrawal",
        variant: "destructive",
      });
    },
  });

  const completeWithdrawalMutation = useMutation({
    mutationFn: async (withdrawalId: string) => {
      return await apiRequest("PATCH", `/api/admin/withdrawals/${withdrawalId}/complete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setActionDialogOpen(false);
      setSelectedWithdrawal(null);
      toast({
        title: "Withdrawal Completed",
        description: "Withdrawal marked as completed. Payment sent.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to complete withdrawal",
        variant: "destructive",
      });
    },
  });

  const updateWithdrawalMutation = useMutation({
    mutationFn: async ({ withdrawalId, updates }: { withdrawalId: string; updates: any }) => {
      return await apiRequest("PATCH", `/api/admin/withdrawals/${withdrawalId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawals"] });
      setEditDialogOpen(false);
      setSelectedWithdrawal(null);
      toast({
        title: "Success",
        description: "Withdrawal updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update withdrawal",
        variant: "destructive",
      });
    },
  });

  const downloadFullListMutation = useMutation({
    mutationFn: async () => {
      // Ensure users and accounts are loaded before export
      if (users.length === 0 || accounts.length === 0) {
        // Refetch users and accounts to ensure we have all data
        await queryClient.refetchQueries({ queryKey: ["/api/admin/users"] });
        await queryClient.refetchQueries({ queryKey: ["/api/admin/trading-accounts"] });
        // Wait a bit for data to be available
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Use all withdrawals from the query instead of API endpoint
      const allWithdrawals = withdrawals;
      
      if (allWithdrawals.length === 0) {
        throw new Error("No withdrawals available to export");
      }

      // Prepare data with complete user and account information
      const exportData = allWithdrawals.map((withdrawal) => {
        const user = users.find((u) => u.id === withdrawal.userId);
        const account = accounts.find((a) => a.id === withdrawal.accountId);
        
        return {
          id: withdrawal.id,
          userId: withdrawal.userId,
          accountId: withdrawal.accountId,
          amount: withdrawal.amount,
          method: withdrawal.method,
          status: withdrawal.status,
          bankName: withdrawal.bankName,
          accountNumber: withdrawal.accountNumber,
          createdAt: withdrawal.createdAt,
          userName: getUserName(withdrawal.userId),
          userFullName: user?.fullName || user?.username || "Unknown",
          userEmail: user?.email || "N/A",
          userUsername: user?.username || "N/A",
          accountNumberDisplay: getAccountId(withdrawal.accountId),
          accountType: account?.type || "N/A",
          rejectionReason: (withdrawal as any).rejectionReason || null,
        };
      });

      // Generate PDF
      generateWithdrawalsPDF(exportData, "Complete Withdrawals Report");
    },
    onSuccess: () => {
      toast({
        title: "Download Started",
        description: "Withdrawals PDF is being downloaded",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to generate PDF",
        variant: "destructive",
      });
    },
  });

  const handleReject = () => {
    if (!selectedWithdrawal || !rejectionReason) {
      toast({
        title: "Missing Reason",
        description: "Please provide a rejection reason",
        variant: "destructive",
      });
      return;
    }
    rejectWithdrawalMutation.mutate({
      withdrawalId: selectedWithdrawal.id,
      reason: rejectionReason,
    });
  };

  const openEditDialog = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setEditForm({
      amount: withdrawal.amount,
      method: withdrawal.method,
      bankName: withdrawal.bankName || "",
      accountNumber: withdrawal.accountNumber || "",
      status: withdrawal.status,
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedWithdrawal) return;
    updateWithdrawalMutation.mutate({
      withdrawalId: selectedWithdrawal.id,
      updates: editForm,
    });
  };

  // Helper functions - MUST be defined before filter functions
  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user?.fullName || user?.username || "Unknown";
  };

  const getAccountId = (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId);
    return account?.accountId || accountId;
  };

  // Filter withdrawals based on search term
  const filterWithdrawals = (withdrawalList: Withdrawal[]) => {
    if (!searchTerm) return withdrawalList;
    const search = searchTerm.toLowerCase().trim();
    if (!search) return withdrawalList;
    
    return withdrawalList.filter((withdrawal) => {
      const userName = (getUserName(withdrawal.userId) || "").toLowerCase();
      const accountId = (getAccountId(withdrawal.accountId) || "").toLowerCase();
      const method = (withdrawal.method || "").toLowerCase();
      const status = (withdrawal.status || "").toLowerCase();
      const amount = (withdrawal.amount || 0).toString();
      const withdrawalId = (withdrawal.id || "").toLowerCase();
      
      return (
        userName.includes(search) ||
        accountId.includes(search) ||
        method.includes(search) ||
        status.includes(search) ||
        amount.includes(search) ||
        withdrawalId.includes(search)
      );
    });
  };

  const pendingWithdrawals = filterWithdrawals(withdrawals.filter((w) => w.status === "Pending" || w.status === "Approved"));
  const archivedWithdrawals = filterWithdrawals(withdrawals.filter((w) => w.status === "Completed" || w.status === "Rejected"));
  const allWithdrawals = filterWithdrawals(withdrawals); // All withdrawals for archive view

  const columns = [
    {
      key: "id",
      label: "ID",
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-xs">{value.slice(0, 8)}...</span>
      ),
      exportValue: (row: Withdrawal) => row.id,
    },
    {
      key: "userId",
      label: "Client",
      sortable: true,
      sortValue: (row: Withdrawal) => getUserName(row.userId).toLowerCase(),
      exportValue: (row: Withdrawal) => getUserName(row.userId),
      render: (value: string) => (
        <span className="font-semibold">{getUserName(value)}</span>
      ),
    },
    {
      key: "accountId",
      label: "Account",
      sortable: true,
      sortValue: (row: Withdrawal) => getAccountId(row.accountId).toLowerCase(),
      exportValue: (row: Withdrawal) => getAccountId(row.accountId),
      render: (value: string) => (
        <span className="font-mono text-sm">{getAccountId(value)}</span>
      ),
    },
    {
      key: "method",
      label: "Method",
      sortable: true,
      exportValue: (row: Withdrawal) => row.method || "",
      render: (value: string) => (
        <Badge variant="outline">{value}</Badge>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      sortValue: (row: Withdrawal) => parseFloat(row.amount || "0"),
      exportValue: (row: Withdrawal) => `$${parseFloat(row.amount || "0").toFixed(2)}`,
      render: (value: string) => (
        <span className="font-semibold text-red-600">
          ${parseFloat(value || "0").toFixed(2)}
        </span>
      ),
    },
    {
      key: "bankName",
      label: "Bank Details",
      sortable: true,
      exportValue: (row: Withdrawal) => {
        if (row.bankName && row.accountNumber) {
          return `${row.bankName} - ${row.accountNumber}`;
        }
        return row.bankName || row.accountNumber || "N/A";
      },
      render: (_: string | null, row: Withdrawal) => (
        <div className="text-sm">
          {row.bankName && <div>{row.bankName}</div>}
          {row.accountNumber && <div className="text-muted-foreground">****{row.accountNumber.slice(-4)}</div>}
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Request Date",
      sortable: true,
      exportValue: (row: Withdrawal) => new Date(row.createdAt).toLocaleDateString(),
      render: (value: Date) => (
        <span className="text-sm">{new Date(value).toLocaleDateString()}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      exportValue: (row: Withdrawal) => row.status,
      render: (value: string) => {
        const variants: Record<string, "default" | "secondary" | "destructive"> = {
          Pending: "secondary",
          Approved: "default",
          Processing: "default",
          Completed: "default",
          Rejected: "destructive",
        };
        return <Badge variant={variants[value] || "secondary"}>{value}</Badge>;
      },
    },
    {
      key: "actions",
      label: "Action",
      sortable: false,
      exportValue: () => "", // Exclude from exports
      render: (_: any, row: Withdrawal) => {
        // Show Process button for pending withdrawals
        if (row.status === "Pending") {
          return (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedWithdrawal(row);
                  setActionDialogOpen(true);
                }}
              >
                <Eye className="w-3 h-3 mr-1" />
                Process
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => openEditDialog(row)}
              >
                <Edit className="w-3 h-3" />
              </Button>
            </div>
          );
        }
        // Show Mark as Completed button for approved withdrawals
        if (row.status === "Approved") {
          return (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="default"
                onClick={() => {
                  if (confirm(`Mark withdrawal of $${row.amount} as completed? This confirms payment has been sent.`)) {
                    completeWithdrawalMutation.mutate(row.id);
                  }
                }}
                disabled={completeWithdrawalMutation.isPending}
              >
                {completeWithdrawalMutation.isPending ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <Check className="w-3 h-3 mr-1" />
                )}
                Mark Paid
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSelectedWithdrawal(row);
                  setActionDialogOpen(true);
                }}
              >
                <Eye className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => openEditDialog(row)}
              >
                <Edit className="w-3 h-3" />
              </Button>
            </div>
          );
        }
        // For completed/rejected withdrawals, show view details and edit
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setSelectedWithdrawal(row);
                setActionDialogOpen(true);
              }}
            >
              <Eye className="w-3 h-3 mr-1" />
              View
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => openEditDialog(row)}
            >
              <Edit className="w-3 h-3" />
            </Button>
          </div>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Withdrawals</h1>
          <p className="text-muted-foreground">
            {viewMode === "pending" 
              ? "Manage pending withdrawal requests" 
              : "Complete history of all withdrawals"}
          </p>
        </div>
      </div>

      {/* Search */}
      <Card className="p-4 border-card-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by client, account, method, amount, status, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Tabs for Pending and Archive */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "pending" | "archive")}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pending ({pendingWithdrawals.length})
          </TabsTrigger>
          <TabsTrigger value="archive" className="flex items-center gap-2">
            <Archive className="w-4 h-4" />
            Archive ({archivedWithdrawals.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <Card className="border-card-border">
            {pendingWithdrawals.length > 0 ? (
              <DataTable 
                columns={columns} 
                data={pendingWithdrawals} 
                exportFileName="pending-withdrawals"
                onRefresh={() => refetchWithdrawals()}
                isRefreshing={isRefreshingWithdrawals}
              />
            ) : (
              <div className="p-12 text-center">
                <p className="text-muted-foreground">No Pending Withdrawals Found</p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="archive" className="mt-6">
          <Card className="border-card-border">
            {allWithdrawals.length > 0 ? (
              <DataTable
                columns={columns}
                data={allWithdrawals}
                exportFileName="archived-withdrawals"
                onRefresh={() => refetchWithdrawals()}
                isRefreshing={isRefreshingWithdrawals}
              />
            ) : (
              <div className="p-12 text-center">
                <p className="text-muted-foreground">No Archived Withdrawals Found</p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Download Full List */}
      <div className="flex justify-center">
        <Button
          size="lg"
          variant="outline"
          className="bg-green-600 hover:bg-green-700 text-white border-0"
          onClick={() => downloadFullListMutation.mutate()}
          disabled={downloadFullListMutation.isPending}
        >
          <Download className="w-4 h-4 mr-2" />
          {downloadFullListMutation.isPending ? "Downloading..." : "Download Full List of Withdrawals"}
        </Button>
      </div>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedWithdrawal?.status === "Pending" ? "Process Withdrawal" : "Withdrawal Details"}
            </DialogTitle>
            <DialogDescription>
              {selectedWithdrawal?.status === "Pending" 
                ? "Approve or reject this withdrawal request"
                : "View withdrawal information"}
            </DialogDescription>
          </DialogHeader>
          {selectedWithdrawal && (
            <div className="space-y-4">
              <div>
                <Label>Client</Label>
                <p className="font-semibold">{getUserName(selectedWithdrawal.userId)}</p>
              </div>
              <div>
                <Label>Account</Label>
                <p className="font-mono">{getAccountId(selectedWithdrawal.accountId)}</p>
              </div>
              <div>
                <Label>Amount</Label>
                <p className="font-semibold text-lg">${parseFloat(selectedWithdrawal.amount).toFixed(2)}</p>
              </div>
              <div>
                <Label>Status</Label>
                <Badge variant={
                  selectedWithdrawal.status === "Completed" ? "default" :
                  selectedWithdrawal.status === "Rejected" ? "destructive" : "secondary"
                }>
                  {selectedWithdrawal.status}
                </Badge>
              </div>
              <div>
                <Label>Method</Label>
                <p>{selectedWithdrawal.method}</p>
              </div>
              {selectedWithdrawal.bankName && (
                <div>
                  <Label>Bank Details</Label>
                  <div className="text-sm">
                    <p>{selectedWithdrawal.bankName}</p>
                    <p>{selectedWithdrawal.accountHolderName}</p>
                    <p>Account: {selectedWithdrawal.accountNumber}</p>
                    {selectedWithdrawal.swiftCode && <p>SWIFT: {selectedWithdrawal.swiftCode}</p>}
                  </div>
                </div>
              )}
              <div>
                <Label>Request Date</Label>
                <p>{new Date(selectedWithdrawal.createdAt).toLocaleString()}</p>
              </div>
              {selectedWithdrawal.status === "Pending" ? (
                <>
                  <div>
                    <Label>Rejection Reason (if rejecting)</Label>
                    <Textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Enter rejection reason..."
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setActionDialogOpen(false);
                        setSelectedWithdrawal(null);
                        setRejectionReason("");
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleReject}
                      disabled={rejectWithdrawalMutation.isPending || !rejectionReason}
                      className="flex-1"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => approveWithdrawalMutation.mutate(selectedWithdrawal.id)}
                      disabled={approveWithdrawalMutation.isPending}
                      className="flex-1"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Note: Approving will deduct balance. You must manually send payment and then mark as completed.
                  </p>
                </>
              ) : selectedWithdrawal.status === "Approved" ? (
                <>
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                    <p className="text-sm text-yellow-400 font-semibold mb-2">⚠️ Payment Required</p>
                    <p className="text-xs text-muted-foreground">
                      This withdrawal has been approved and balance deducted. Please manually send the payment 
                      (${parseFloat(selectedWithdrawal.amount).toFixed(2)}) to the bank details above, then mark as completed.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setActionDialogOpen(false);
                        setSelectedWithdrawal(null);
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        if (confirm(`Confirm that you have sent payment of $${selectedWithdrawal.amount}? This will mark the withdrawal as completed.`)) {
                          completeWithdrawalMutation.mutate(selectedWithdrawal.id);
                        }
                      }}
                      disabled={completeWithdrawalMutation.isPending}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {completeWithdrawalMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4 mr-1" />
                      )}
                      Mark as Completed
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setActionDialogOpen(false);
                      setSelectedWithdrawal(null);
                    }}
                    className="flex-1"
                  >
                    Close
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Withdrawal Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Withdrawal</DialogTitle>
            <DialogDescription>
              Update withdrawal information
            </DialogDescription>
          </DialogHeader>
          {selectedWithdrawal && (
            <div className="space-y-4">
              <div>
                <Label>Amount ($)</Label>
                <Input
                  type="number"
                  value={editForm.amount}
                  onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                />
              </div>
              <div>
                <Label>Method</Label>
                <Input
                  value={editForm.method}
                  onChange={(e) => setEditForm({ ...editForm, method: e.target.value })}
                />
              </div>
              <div>
                <Label>Bank Name</Label>
                <Input
                  value={editForm.bankName}
                  onChange={(e) => setEditForm({ ...editForm, bankName: e.target.value })}
                  placeholder="Bank Name"
                />
              </div>
              <div>
                <Label>Account Number</Label>
                <Input
                  value={editForm.accountNumber}
                  onChange={(e) => setEditForm({ ...editForm, accountNumber: e.target.value })}
                  placeholder="Account Number"
                />
              </div>
              <div>
                <Label>Status</Label>
                <Input
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditDialogOpen(false);
                    setSelectedWithdrawal(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={updateWithdrawalMutation.isPending}
                  className="flex-1"
                >
                  {updateWithdrawalMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

