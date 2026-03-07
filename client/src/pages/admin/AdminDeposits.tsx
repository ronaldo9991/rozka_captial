import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/DataTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Check, X, Eye, Loader2, DollarSign, Archive, Clock, Search, Edit } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Deposit, User, TradingAccount } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateDepositsPDF } from "@/lib/pdf-export";

export default function AdminDeposits() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [viewMode, setViewMode] = useState<"pending" | "archive">("pending");
  const [editForm, setEditForm] = useState({
    amount: "",
    merchant: "",
    status: "",
  });

  const { data: deposits = [], isLoading: loadingDeposits, refetch: refetchDeposits, isFetching: isRefreshingDeposits } = useQuery<Deposit[]>({
    queryKey: ["/api/admin/deposits"],
    refetchInterval: 15000, // Real-time updates every 15 seconds for pending deposits
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: accounts = [] } = useQuery<TradingAccount[]>({
    queryKey: ["/api/admin/trading-accounts"],
  });

  const approveDepositMutation = useMutation({
    mutationFn: async ({ depositId, amount }: { depositId: string; amount?: string }) => {
      return await apiRequest("PATCH", `/api/admin/deposits/${depositId}/approve`, { amount });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/deposits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setActionDialogOpen(false);
      setSelectedDeposit(null);
      setDepositAmount("");
      toast({
        title: "Deposit Approved",
        description: "Deposit has been approved and credited to account",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve deposit",
        variant: "destructive",
      });
    },
  });

  const rejectDepositMutation = useMutation({
    mutationFn: async (depositId: string) => {
      return await apiRequest("PATCH", `/api/admin/deposits/${depositId}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/deposits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Deposit Rejected",
        description: "Deposit has been rejected",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject deposit",
        variant: "destructive",
      });
    },
  });

  const updateDepositMutation = useMutation({
    mutationFn: async ({ depositId, updates }: { depositId: string; updates: any }) => {
      return await apiRequest("PATCH", `/api/admin/deposits/${depositId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/deposits"] });
      setEditDialogOpen(false);
      setSelectedDeposit(null);
      toast({
        title: "Success",
        description: "Deposit updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update deposit",
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
      
      // Use all deposits from the query instead of API endpoint
      const allDeposits = deposits;
      
      if (allDeposits.length === 0) {
        throw new Error("No deposits available to export");
      }

      // Prepare data with complete user and account information
      const exportData = allDeposits.map((deposit) => {
        const user = users.find((u) => u.id === deposit.userId);
        const account = accounts.find((a) => a.id === deposit.accountId);
        
        return {
          id: deposit.id,
          userId: deposit.userId,
          accountId: deposit.accountId,
          amount: deposit.amount,
          merchant: deposit.merchant,
          status: deposit.status,
          depositDate: deposit.depositDate,
          createdAt: deposit.createdAt,
          userName: getUserName(deposit.userId),
          userFullName: user?.fullName || user?.username || "Unknown",
          userEmail: user?.email || "N/A",
          userUsername: user?.username || "N/A",
          accountNumber: getAccountId(deposit.accountId),
          accountType: account?.type || "N/A",
          transactionId: (deposit as any).transactionId || (deposit as any).transactionID || "N/A",
        };
      });

      // Generate PDF
      generateDepositsPDF(exportData, "Complete Deposits Report");
    },
    onSuccess: () => {
      toast({
        title: "Download Started",
        description: "Deposits PDF is being downloaded",
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

  const handleApprove = () => {
    if (!selectedDeposit) return;
    approveDepositMutation.mutate({
      depositId: selectedDeposit.id,
      amount: depositAmount || undefined,
    });
  };

  const openEditDialog = (deposit: Deposit) => {
    setSelectedDeposit(deposit);
    setEditForm({
      amount: deposit.amount,
      merchant: deposit.merchant,
      status: deposit.status,
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedDeposit) return;
    updateDepositMutation.mutate({
      depositId: selectedDeposit.id,
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

  // Filter deposits based on search term
  const filterDeposits = (depositList: Deposit[]) => {
    if (!searchTerm) return depositList;
    const search = searchTerm.toLowerCase().trim();
    if (!search) return depositList;
    
    return depositList.filter((deposit) => {
      const userName = (getUserName(deposit.userId) || "").toLowerCase();
      const accountId = (getAccountId(deposit.accountId) || "").toLowerCase();
      const merchant = (deposit.merchant || "").toLowerCase();
      const status = (deposit.status || "").toLowerCase();
      const amount = (deposit.amount || 0).toString();
      const depositId = (deposit.id || "").toLowerCase();
      
      return (
        userName.includes(search) ||
        accountId.includes(search) ||
        merchant.includes(search) ||
        status.includes(search) ||
        amount.includes(search) ||
        depositId.includes(search)
      );
    });
  };

  const pendingDeposits = filterDeposits(deposits.filter((d) => d.status === "Pending"));
  const archivedDeposits = filterDeposits(deposits.filter((d) => d.status !== "Pending"));
  const allDeposits = filterDeposits(deposits); // All deposits for archive view

  const columns = [
    {
      key: "id",
      label: "ID",
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-xs">{value.slice(0, 8)}...</span>
      ),
      exportValue: (row: Deposit) => row.id,
    },
    {
      key: "userId",
      label: "Clients",
      sortable: true,
      sortValue: (row: Deposit) => getUserName(row.userId).toLowerCase(),
      exportValue: (row: Deposit) => getUserName(row.userId),
      render: (value: string) => (
        <span className="font-semibold">{getUserName(value)}</span>
      ),
    },
    {
      key: "accountId",
      label: "Account",
      sortable: true,
      sortValue: (row: Deposit) => getAccountId(row.accountId).toLowerCase(),
      exportValue: (row: Deposit) => getAccountId(row.accountId),
      render: (value: string) => (
        <span className="font-mono text-sm">{getAccountId(value)}</span>
      ),
    },
    {
      key: "depositDate",
      label: "Deposit Date",
      sortable: true,
      sortValue: (row: Deposit) => {
        const date = row.depositDate || row.createdAt;
        return new Date(date).getTime();
      },
      exportValue: (row: Deposit) => {
        const date = row.depositDate || row.createdAt;
        return new Date(date).toLocaleDateString();
      },
      render: (value: Date | null, row: Deposit) => {
        const date = value || row.createdAt;
        return <span className="text-sm">{new Date(date).toLocaleDateString()}</span>;
      },
    },
    {
      key: "merchant",
      label: "Merchant",
      sortable: true,
      exportValue: (row: Deposit) => row.merchant || "",
      render: (value: string) => (
        <Badge variant="outline">{value}</Badge>
      ),
    },
    {
      key: "verificationFile",
      label: "Verification File",
      sortable: false,
      exportValue: (row: Deposit) => row.verificationFile ? "Yes" : "No",
      render: (value: string | null, row: Deposit) => {
        if (!value) return <span className="text-muted-foreground text-sm">N/A</span>;
        // For bank wire, verificationFile contains JSON bank details
        if (row.merchant === "bank_wire") {
          return (
            <Badge variant="outline" className="text-xs">
              Bank Details
            </Badge>
          );
        }
        // For other deposits, it's a file URL
        return (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline flex items-center gap-1"
          >
            <Eye className="w-4 h-4" />
            View
          </a>
        );
      },
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      sortValue: (row: Deposit) => parseFloat(row.amount || "0"),
      exportValue: (row: Deposit) => `$${parseFloat(row.amount || "0").toFixed(2)}`,
      render: (value: string) => (
        <span className="font-semibold text-green-600">
          ${parseFloat(value || "0").toFixed(2)}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      exportValue: (row: Deposit) => row.status,
      render: (value: string) => {
        const variants: Record<string, "default" | "secondary" | "destructive"> = {
          Pending: "secondary",
          Completed: "default",
          Failed: "destructive",
        };
        return <Badge variant={variants[value] || "secondary"}>{value}</Badge>;
      },
    },
    {
      key: "actions",
      label: "Action",
      sortable: false,
      exportValue: () => "", // Exclude from exports
      render: (_: any, row: Deposit) => {
        // Only show Process button for pending deposits
        if (row.status === "Pending") {
          return (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedDeposit(row);
                  setDepositAmount(row.amount);
                  setActionDialogOpen(true);
                }}
              >
                <DollarSign className="w-3 h-3 mr-1" />
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
        // For archived deposits, show view details and edit
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setSelectedDeposit(row);
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

  if (loadingDeposits) {
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
          <h1 className="text-3xl font-bold mb-2">Deposits</h1>
          <p className="text-muted-foreground">
            {viewMode === "pending" 
              ? "Following is the list of pending Deposit:" 
              : "Complete history of all deposits"}
          </p>
        </div>
        {viewMode === "pending" && (
          <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-black font-semibold">
                Deposit Amount in Trading Account
              </Button>
            </DialogTrigger>
          </Dialog>
        )}
      </div>

      {/* Search */}
      <Card className="p-4 border-card-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by client, account, merchant, amount, status, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Action Dialog - Works for both pending and archive */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedDeposit?.status === "Pending" ? "Process Deposit" : "Deposit Details"}
              </DialogTitle>
              <DialogDescription>
                {selectedDeposit?.status === "Pending" 
                  ? "Approve or reject this deposit request"
                  : "View deposit information"}
              </DialogDescription>
            </DialogHeader>
            {selectedDeposit && (
              <div className="space-y-4">
                <div>
                  <Label>Client</Label>
                  <p className="font-semibold">{getUserName(selectedDeposit.userId)}</p>
                </div>
                <div>
                  <Label>Account</Label>
                  <p className="font-mono">{getAccountId(selectedDeposit.accountId)}</p>
                </div>
                <div>
                  <Label>Amount</Label>
                  {selectedDeposit.status === "Pending" ? (
                    <Input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="Enter amount"
                    />
                  ) : (
                    <p className="font-semibold text-lg">${parseFloat(selectedDeposit.amount).toFixed(2)}</p>
                  )}
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge variant={
                    selectedDeposit.status === "Completed" ? "default" :
                    selectedDeposit.status === "Failed" ? "destructive" : "secondary"
                  }>
                    {selectedDeposit.status}
                  </Badge>
                </div>
                <div>
                  <Label>Merchant</Label>
                  <p>{selectedDeposit.merchant}</p>
                </div>
                {selectedDeposit.merchant === "bank_wire" && selectedDeposit.verificationFile && (
                  <div className="space-y-3 p-4 border border-primary/30 rounded-lg bg-black/40">
                    <Label className="text-primary font-semibold">Bank Account Details</Label>
                    {(() => {
                      try {
                        const bankDetails = JSON.parse(selectedDeposit.verificationFile);
                        return (
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <Label className="text-muted-foreground text-xs">Bank Name</Label>
                              <p className="font-semibold">{bankDetails.bankName || "N/A"}</p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground text-xs">Account Holder</Label>
                              <p className="font-semibold">{bankDetails.accountHolderName || "N/A"}</p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground text-xs">Account Number</Label>
                              <p className="font-mono">{bankDetails.accountNumber || "N/A"}</p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground text-xs">Routing/Sort Code</Label>
                              <p className="font-mono">{bankDetails.routingNumber || "N/A"}</p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground text-xs">SWIFT/BIC Code</Label>
                              <p className="font-mono">{bankDetails.swiftCode || "N/A"}</p>
                            </div>
                            <div className="col-span-2">
                              <Label className="text-muted-foreground text-xs">Bank Address</Label>
                              <p>{bankDetails.bankAddress || "N/A"}</p>
                            </div>
                          </div>
                        );
                      } catch (e) {
                        return <p className="text-muted-foreground text-sm">Bank details not available</p>;
                      }
                    })()}
                  </div>
                )}
                <div>
                  <Label>Deposit Date</Label>
                  <p>{new Date(selectedDeposit.depositDate || selectedDeposit.createdAt).toLocaleString()}</p>
                </div>
                {selectedDeposit.status === "Pending" ? (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setActionDialogOpen(false);
                        setSelectedDeposit(null);
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => rejectDepositMutation.mutate(selectedDeposit.id)}
                      disabled={rejectDepositMutation.isPending}
                      className="flex-1"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      onClick={handleApprove}
                      disabled={approveDepositMutation.isPending}
                      className="flex-1"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setActionDialogOpen(false);
                        setSelectedDeposit(null);
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

      {/* Tabs for Pending and Archive */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "pending" | "archive")}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pending ({pendingDeposits.length})
          </TabsTrigger>
          <TabsTrigger value="archive" className="flex items-center gap-2">
            <Archive className="w-4 h-4" />
            Archive ({archivedDeposits.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <Card className="border-card-border">
            {pendingDeposits.length > 0 ? (
              <DataTable 
                columns={columns} 
                data={pendingDeposits} 
                exportFileName="pending-deposits"
                onRefresh={() => refetchDeposits()}
                isRefreshing={isRefreshingDeposits}
              />
            ) : (
              <div className="p-12 text-center">
                <p className="text-muted-foreground">No Pending Deposits Found</p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="archive" className="mt-6">
          <Card className="border-card-border">
            {allDeposits.length > 0 ? (
              <DataTable 
                columns={columns} 
                data={allDeposits.sort((a, b) => {
                  // Sort by date, newest first
                  const dateA = new Date(a.depositDate || a.createdAt).getTime();
                  const dateB = new Date(b.depositDate || b.createdAt).getTime();
                  return dateB - dateA;
                })} 
                exportFileName="all-deposits"
                onRefresh={() => refetchDeposits()}
                isRefreshing={isRefreshingDeposits}
              />
            ) : (
              <div className="p-12 text-center">
                <p className="text-muted-foreground">No Deposit History Found</p>
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
          {downloadFullListMutation.isPending ? "Downloading..." : "Download Full List of Deposits"}
        </Button>
      </div>

      {/* Edit Deposit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Deposit</DialogTitle>
            <DialogDescription>
              Update deposit information
            </DialogDescription>
          </DialogHeader>
          {selectedDeposit && (
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
                <Label>Merchant</Label>
                <Input
                  value={editForm.merchant}
                  onChange={(e) => setEditForm({ ...editForm, merchant: e.target.value })}
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
                    setSelectedDeposit(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={updateDepositMutation.isPending}
                  className="flex-1"
                >
                  {updateDepositMutation.isPending ? (
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

