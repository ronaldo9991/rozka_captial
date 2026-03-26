import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DataTable from "@/components/DataTable";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Filter } from "lucide-react";
import { FullPageLoader } from "@/components/DashboardLoader";
import type { TradingHistory, TradingAccount } from "@shared/schema";

export default function TradingHistoryPage() {
  const [selectedAccount, setSelectedAccount] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch trading accounts
  const { data: accounts = [], isLoading: loadingAccounts } = useQuery<TradingAccount[]>({
    queryKey: ["/api/trading-accounts"],
    refetchInterval: false,
    refetchOnWindowFocus: true,
    staleTime: 60000,
  });

  // Fetch trading history with real-time updates
  const queryUrl = selectedAccount !== "all" 
    ? `/api/trading-history?accountId=${selectedAccount}`
    : "/api/trading-history";
  
  const { data: history = [], isLoading: loadingHistory } = useQuery<TradingHistory[]>({
    queryKey: [queryUrl],
    refetchInterval: false,
    refetchOnWindowFocus: true,
    staleTime: 30000,
  });

  const columns = [
    {
      key: "ticketId",
      label: "Ticket",
      render: (value: string) => (
        <span className="font-mono font-semibold">#{value}</span>
      ),
    },
    {
      key: "symbol",
      label: "Symbol",
      render: (value: string) => (
        <span className="font-semibold text-primary">{value}</span>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (value: string) => (
        <Badge variant={value === "Buy" ? "default" : "secondary"}>
          {value}
        </Badge>
      ),
    },
    {
      key: "volume",
      label: "Volume",
      render: (value: string) => (
        <span className="font-semibold">{parseFloat(value).toFixed(2)}</span>
      ),
    },
    {
      key: "openPrice",
      label: "Open Price",
      render: (value: string) => parseFloat(value).toFixed(5),
    },
    {
      key: "closePrice",
      label: "Close Price",
      render: (value: string | null) => value ? parseFloat(value).toFixed(5) : "-",
    },
    {
      key: "profit",
      label: "Profit/Loss",
      render: (value: string | null) => {
        if (!value) return "-";
        const profit = parseFloat(value);
        const isProfit = profit >= 0;
        return (
          <div className={`flex items-center gap-1 font-semibold ${isProfit ? "text-chart-2" : "text-destructive"}`}>
            {isProfit ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{isProfit ? "+" : ""}${profit.toFixed(2)}</span>
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <Badge variant={value === "Closed" ? "default" : "secondary"}>
          {value}
        </Badge>
      ),
    },
    {
      key: "openTime",
      label: "Open Time",
      render: (value: Date) => new Date(value).toLocaleString(),
    },
    {
      key: "closeTime",
      label: "Close Time",
      render: (value: Date | null) => value ? new Date(value).toLocaleString() : "-",
    },
  ];

  if (loadingAccounts || loadingHistory) {
    return <FullPageLoader text="Loading history..." />;
  }

  // Apply filters
  let filteredHistory = history;
  if (statusFilter !== "all") {
    filteredHistory = filteredHistory.filter((trade) => trade.status === statusFilter);
  }

  // Calculate statistics
  const closedTrades = filteredHistory.filter((t) => t.status === "Closed" && t.profit);
  const totalTrades = closedTrades.length;
  const winningTrades = closedTrades.filter((t) => parseFloat(t.profit!) > 0);
  const losingTrades = closedTrades.filter((t) => parseFloat(t.profit!) < 0);
  const totalProfit = closedTrades.reduce((sum, t) => sum + parseFloat(t.profit!), 0);
  const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Trading History</h1>
        <p className="text-muted-foreground">
          View and analyze your complete trading activity.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 border-card-border">
          <div className="text-sm text-muted-foreground mb-1">Total Trades</div>
          <div className="text-3xl font-bold">{totalTrades}</div>
        </Card>

        <Card className="p-6 border-card-border">
          <div className="text-sm text-muted-foreground mb-1">Win Rate</div>
          <div className="text-3xl font-bold text-chart-2">{winRate.toFixed(1)}%</div>
        </Card>

        <Card className="p-6 border-card-border">
          <div className="text-sm text-muted-foreground mb-1">Winning Trades</div>
          <div className="text-3xl font-bold text-chart-2">{winningTrades.length}</div>
        </Card>

        <Card className="p-6 border-card-border">
          <div className="text-sm text-muted-foreground mb-1">Total P/L</div>
          <div className={`text-3xl font-bold ${totalProfit >= 0 ? "text-chart-2" : "text-destructive"}`}>
            {totalProfit >= 0 ? "+" : ""}${totalProfit.toFixed(2)}
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6 border-card-border">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Filters</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="account-filter">Trading Account</Label>
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger id="account-filter" data-testid="select-account-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.accountId} ({account.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status-filter">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="status-filter" data-testid="select-status-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Trading History Table */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Trade Details</h2>
        {filteredHistory.length > 0 ? (
          <DataTable columns={columns} data={filteredHistory} />
        ) : (
          <Card className="p-12 text-center border-card-border">
            <p className="text-muted-foreground">No trading history found.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
