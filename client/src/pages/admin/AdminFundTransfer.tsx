import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/DataTable";
import { Loader2, ArrowLeftRight } from "lucide-react";
import type { FundTransfer, User, TradingAccount } from "@shared/schema";

interface FundTransferStats {
  internalTransfers: number;
  externalTransfers: number;
}

export default function AdminFundTransfer() {
  const { data: stats, isLoading: loadingStats, error: statsError } = useQuery<FundTransferStats>({
    queryKey: ["/api/admin/fund-transfers/stats"],
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0,
    retry: 1,
    onSuccess: (data) => {
      console.log("[AdminFundTransfer] Stats loaded:", data);
    },
    onError: (error) => {
      console.error("[AdminFundTransfer] Error loading stats:", error);
    },
  });

  const { data: transfers = [], isLoading, refetch: refetchTransfers, isFetching: isRefreshingTransfers, error: transfersError } = useQuery<FundTransfer[]>({
    queryKey: ["/api/admin/fund-transfers"],
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0,
    retry: 1,
    onSuccess: (data) => {
      console.log("[AdminFundTransfer] Transfers loaded:", data.length, data);
    },
    onError: (error) => {
      console.error("[AdminFundTransfer] Error loading transfers:", error);
    },
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const { data: accounts = [] } = useQuery<TradingAccount[]>({
    queryKey: ["/api/admin/trading-accounts"],
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user?.fullName || user?.username || "Unknown";
  };

  const getAccountId = (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId);
    return account?.accountId || accountId;
  };

  const columns = [
    {
      key: "id",
      label: "Transfer ID",
      render: (value: string) => (
        <span className="font-mono text-xs">{value.slice(0, 8)}...</span>
      ),
    },
    {
      key: "type",
      label: "Type",
      sortable: true,
      render: (value: string) => {
        const isInternal = value === "Internal";
        return (
          <Badge variant={isInternal ? "default" : "secondary"} className={isInternal ? "bg-blue-500" : "bg-purple-500"}>
            {value || "Unknown"}
          </Badge>
        );
      },
    },
    {
      key: "userId",
      label: "Client",
      sortable: true,
      sortValue: (row: any) => getUserName(row.userId).toLowerCase(),
      render: (value: string) => (
        <span className="font-semibold">{getUserName(value)}</span>
      ),
    },
    {
      key: "fromAccountId",
      label: "From Account",
      sortable: true,
      sortValue: (row: any) => getAccountId(row.fromAccountId).toLowerCase(),
      render: (value: string) => (
        <span className="font-mono text-sm">{getAccountId(value)}</span>
      ),
    },
    {
      key: "toAccountId",
      label: "To Account",
      sortable: true,
      sortValue: (row: any) => getAccountId(row.toAccountId).toLowerCase(),
      render: (value: string) => (
        <span className="font-mono text-sm">{getAccountId(value)}</span>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      sortValue: (row: any) => parseFloat(row.amount || "0"),
      render: (value: string) => (
        <span className="font-semibold text-primary">
          ${parseFloat(value || "0").toFixed(2)}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
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
      key: "createdAt",
      label: "Date",
      render: (value: Date) => (
        <span className="text-sm">{new Date(value).toLocaleDateString()}</span>
      ),
    },
    {
      key: "notes",
      label: "Notes",
      render: (value: string | null) => (
        <span className="text-sm text-muted-foreground">{value || "N/A"}</span>
      ),
    },
  ];

  if (loadingStats || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading fund transfers...</p>
      </div>
    );
  }

  // Show errors
  if (transfersError || statsError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-destructive font-semibold">Failed to load fund transfers</p>
        <p className="text-muted-foreground text-sm">
          {transfersError instanceof Error ? transfersError.message : statsError instanceof Error ? statsError.message : "Unknown error"}
        </p>
        <Button onClick={() => { refetchTransfers(); }}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <ArrowLeftRight className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-1">Funds Transfer</h1>
          <p className="text-muted-foreground">Manage internal and external fund transfers</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 border-card-border hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-600 mb-1">
                Internal Transfer
              </h3>
              <p className="text-sm text-muted-foreground">Between user accounts</p>
            </div>
            <Badge className="bg-teal-500 text-white text-2xl px-6 py-3 font-bold hover:bg-teal-500">
              {stats?.internalTransfers?.toLocaleString() || "0"}
            </Badge>
          </div>
        </Card>

        <Card className="p-6 border-card-border hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-600 mb-1">
                External Transfer
              </h3>
              <p className="text-sm text-muted-foreground">To external accounts</p>
            </div>
            <Badge className="bg-teal-500 text-white text-2xl px-6 py-3 font-bold hover:bg-teal-500">
              {stats?.externalTransfers?.toLocaleString() || "0"}
            </Badge>
          </div>
        </Card>
      </div>

      {/* Transfers Table */}
      <Card className="border-card-border">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Recent Fund Transfers</h2>
        </div>
        {transfers.length > 0 ? (
          <DataTable 
            columns={columns} 
            data={transfers} 
            exportFileName="fund-transfers"
            onRefresh={() => refetchTransfers()}
            isRefreshing={isRefreshingTransfers}
          />
        ) : (
          <div className="p-12 text-center">
            <p className="text-muted-foreground mb-2">No fund transfers found</p>
            <p className="text-xs text-muted-foreground">
              {transfersError ? `Error: ${transfersError instanceof Error ? transfersError.message : "Unknown error"}` : "Create transfers from the user dashboard to see them here"}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

