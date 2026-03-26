import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import DataTable from "@/components/DataTable";
import { Search, ArrowRightLeft, Eye, Edit, Clock, CheckCircle, XCircle } from "lucide-react";
import { FullPageLoader } from "@/components/DashboardLoader";
import type { FundTransfer, User, TradingAccount } from "@shared/schema";

export default function AdminInternalTransfer() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Real-time data fetching - refresh every 10 seconds
  const { data: transfers = [], isLoading: transfersLoading } = useQuery<FundTransfer[]>({
    queryKey: ["/api/admin/fund-transfers/internal"],
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

  // Filter internal transfers (endpoint already returns only internal, but filter for safety)
  const internalTransfers = transfers.filter(t => {
    // Check both type fields for compatibility
    const isInternal = t.type === "Internal" || t.transferType === "Internal";
    // If no type field, assume all from endpoint are internal
    return isInternal || (!t.type && !t.transferType);
  });
  
  // Apply filters
  const filteredTransfers = internalTransfers.filter(t => {
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
      label: "To Account",
      sortable: true,
      render: (value: string) => {
        const account = accountMap.get(value);
        return <span className="font-mono">{account?.accountId || value || "N/A"}</span>;
      },
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
          <Button size="sm" variant="outline">
            <Eye className="w-3 h-3 mr-1" />
            View
          </Button>
          <Button size="sm" variant="outline">
            <Edit className="w-3 h-3 mr-1" />
            Edit
          </Button>
        </div>
      ),
    },
  ];

  if (transfersLoading || usersLoading || accountsLoading) {
    return <FullPageLoader text="Loading internal transfers..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Internal Transfer</h1>
          <p className="text-muted-foreground">Manage internal fund transfers between accounts</p>
          <p className="text-sm text-muted-foreground mt-1">
            Showing {filteredTransfers.length} internal transfer{filteredTransfers.length !== 1 ? "s" : ""}
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
          exportFileName="internal-transfers"
          showExportButtons={true}
        />
      </Card>
    </div>
  );
}

