import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import DataTable from "@/components/DataTable";
import { Search, ArrowRight, Eye, Edit, Clock, CheckCircle, XCircle, Check, X } from "lucide-react";
import { FullPageLoader } from "@/components/DashboardLoader";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { FundTransfer, User, TradingAccount } from "@shared/schema";

export default function AdminExternalTransfer() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<FundTransfer | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Real-time data fetching - refresh every 10 seconds
  const { data: transfers = [], isLoading: transfersLoading } = useQuery<FundTransfer[]>({
    queryKey: ["/api/admin/fund-transfers/external"],
    refetchInterval: 10000, // Real-time: refresh every 10 seconds
    refetchOnWindowFocus: true,
    staleTime: 0, // Always consider data stale for real-time updates
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    refetchInterval: 30000, // Refresh users every 30 seconds
    staleTime: 0,
  });

  const { data: accounts = [], isLoading: accountsLoading } = useQuery<TradingAccount[]>({
    queryKey: ["/api/admin/trading-accounts"],
    refetchInterval: 30000, // Refresh accounts every 30 seconds
    staleTime: 0,
  });

  // Create maps for quick lookup
  const userMap = new Map(users.map(u => [u.id, u]));
  const accountMap = new Map(accounts.map(a => [a.id, a]));

  // Filter external transfers (endpoint already returns only external, but filter for safety)
  const externalTransfers = transfers.filter(t => {
    // Check both type fields for compatibility
    const isExternal = t.type === "External" || t.transferType === "External";
    // If no type field, assume all from endpoint are external
    return isExternal || (!t.type && !t.transferType);
  });
  
  // Apply filters
  const filteredTransfers = externalTransfers.filter(t => {
    const user = userMap.get(t.userId);
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch = !searchTerm || 
      user?.fullName?.toLowerCase().includes(searchLower) ||
      user?.username?.toLowerCase().includes(searchLower) ||
      t.fromAccountId?.toLowerCase().includes(searchLower) ||
      t.toAccountId?.toLowerCase().includes(searchLower) ||
      (t.id || "").toLowerCase().includes(searchLower);
    
    const matchesStatus = statusFilter === "all" || t.status?.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const approveMutation = useMutation({
    mutationFn: async (transferId: string) => {
      return await apiRequest("PATCH", `/api/admin/fund-transfers/external/${transferId}/approve`, {});
    },
    onSuccess: () => {
      toast({
        title: "Transfer Approved",
        description: "The external transfer has been approved and completed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/fund-transfers/external"] });
      setApproveDialogOpen(false);
      setSelectedTransfer(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve transfer",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ transferId, reason }: { transferId: string; reason: string }) => {
      return await apiRequest("PATCH", `/api/admin/fund-transfers/external/${transferId}/reject`, { reason });
    },
    onSuccess: () => {
      toast({
        title: "Transfer Rejected",
        description: "The external transfer has been rejected and funds have been refunded.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/fund-transfers/external"] });
      setRejectDialogOpen(false);
      setSelectedTransfer(null);
      setRejectReason("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject transfer",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (transfer: FundTransfer) => {
    setSelectedTransfer(transfer);
    setApproveDialogOpen(true);
  };

  const handleReject = (transfer: FundTransfer) => {
    setSelectedTransfer(transfer);
    setRejectDialogOpen(true);
  };

  const confirmApprove = () => {
    if (selectedTransfer) {
      approveMutation.mutate(selectedTransfer.id);
    }
  };

  const confirmReject = () => {
    if (selectedTransfer) {
      rejectMutation.mutate({ transferId: selectedTransfer.id, reason: rejectReason });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "approved":
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "rejected":
      case "failed":
        return <Badge className="bg-red-500 hover:bg-red-600"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const columns = [
    {
      key: "id",
      label: "Transfer ID",
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-xs">{value.slice(-8)}</span>
      ),
    },
    {
      key: "userId",
      label: "Client",
      sortable: true,
      render: (value: string) => {
        const user = userMap.get(value);
        return (
          <div>
            <div className="font-medium">{user?.fullName || user?.username || "Unknown"}</div>
            <div className="text-xs text-muted-foreground">{user?.email || ""}</div>
          </div>
        );
      },
    },
    {
      key: "fromAccountId",
      label: "From Account",
      sortable: true,
      render: (value: string) => {
        const account = accountMap.get(value);
        return <span className="font-mono">{account?.accountId || value || "N/A"}</span>;
      },
    },
    {
      key: "toAccountId",
      label: "To Account/External",
      sortable: true,
      render: (value: string) => (
        <span className="font-mono">{value || "N/A"}</span>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
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
      key: "createdAt",
      label: "Date",
      sortable: true,
      render: (value: Date) => new Date(value).toLocaleString(),
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (_: any, row: FundTransfer) => (
        <div className="flex gap-2">
          {row.status === "Pending" && (
            <>
              <Button 
                size="sm" 
                variant="default"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleApprove(row)}
                disabled={approveMutation.isPending || rejectMutation.isPending}
              >
                <Check className="w-3 h-3 mr-1" />
                Approve
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => handleReject(row)}
                disabled={approveMutation.isPending || rejectMutation.isPending}
              >
                <X className="w-3 h-3 mr-1" />
                Reject
              </Button>
            </>
          )}
          {row.status !== "Pending" && (
            <Button size="sm" variant="outline" disabled>
            <Eye className="w-3 h-3 mr-1" />
            View
          </Button>
          )}
        </div>
      ),
    },
  ];

  if (transfersLoading || usersLoading || accountsLoading) {
    return <FullPageLoader text="Loading external transfers..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">External Transfer</h1>
          <p className="text-muted-foreground">Manage external fund transfers to other users</p>
          <p className="text-sm text-muted-foreground mt-1">
            Showing {filteredTransfers.length} external transfer{filteredTransfers.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 bg-card">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Show</span>
            <Select defaultValue="10">
              <SelectTrigger className="w-20 h-8 bg-background border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                <SelectItem value="10" className="text-foreground">10</SelectItem>
                <SelectItem value="25" className="text-foreground">25</SelectItem>
                <SelectItem value="50" className="text-foreground">50</SelectItem>
                <SelectItem value="100" className="text-foreground">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">entries</span>
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-background border-border text-foreground">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-background border-border">
              <SelectItem value="all" className="text-foreground">All Status</SelectItem>
              <SelectItem value="pending" className="text-foreground">Pending</SelectItem>
              <SelectItem value="completed" className="text-foreground">Completed</SelectItem>
              <SelectItem value="rejected" className="text-foreground">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex-1" />

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by client, account..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64 bg-background border-border text-foreground"
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="p-6 bg-card">
        <DataTable
          columns={columns}
          data={filteredTransfers}
          exportFileName="external-transfers"
          showExportButtons={true}
        />
      </Card>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve External Transfer</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this transfer? The funds will be credited to the destination account.
            </DialogDescription>
          </DialogHeader>
          {selectedTransfer && (
            <div className="space-y-2">
              <div className="text-sm">
                <strong>Amount:</strong> ${parseFloat(selectedTransfer.amount || "0").toFixed(2)}
              </div>
              <div className="text-sm">
                <strong>From Account:</strong> {accountMap.get(selectedTransfer.fromAccountId)?.accountId || selectedTransfer.fromAccountId}
              </div>
              <div className="text-sm">
                <strong>To Account:</strong> {accountMap.get(selectedTransfer.toAccountId)?.accountId || selectedTransfer.toAccountId}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmApprove}
              disabled={approveMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {approveMutation.isPending ? "Approving..." : "Approve Transfer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject External Transfer</DialogTitle>
            <DialogDescription>
              Rejecting this transfer will refund the amount (including fee) to the source account.
            </DialogDescription>
          </DialogHeader>
          {selectedTransfer && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm">
                  <strong>Amount:</strong> ${parseFloat(selectedTransfer.amount || "0").toFixed(2)}
                </div>
                <div className="text-sm">
                  <strong>From Account:</strong> {accountMap.get(selectedTransfer.fromAccountId)?.accountId || selectedTransfer.fromAccountId}
                </div>
                <div className="text-sm">
                  <strong>To Account:</strong> {accountMap.get(selectedTransfer.toAccountId)?.accountId || selectedTransfer.toAccountId}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rejectReason">Rejection Reason (Optional)</Label>
                <Textarea
                  id="rejectReason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setRejectDialogOpen(false);
              setRejectReason("");
            }}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmReject}
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ? "Rejecting..." : "Reject Transfer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

