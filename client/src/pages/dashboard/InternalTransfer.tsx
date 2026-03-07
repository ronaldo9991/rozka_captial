import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowRightLeft, Wallet, History } from "lucide-react";
import { FullPageLoader, InlineLoader } from "@/components/DashboardLoader";
import { motion } from "framer-motion";
import DataTable from "@/components/DataTable";
import type { TradingAccount, FundTransfer } from "@shared/schema";

export default function InternalTransfer() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  // Fetch trading accounts
  const { data: accounts = [], isLoading: accountsLoading } = useQuery<TradingAccount[]>({
    queryKey: ["/api/trading-accounts"],
    refetchInterval: false,
    refetchOnWindowFocus: true,
    staleTime: 60000,
  });

  // Fetch transfer history - optimized
  const { data: transfers = [], isLoading: transfersLoading } = useQuery<FundTransfer[]>({
    queryKey: ["/api/fund-transfers/internal"],
    refetchInterval: false,
    refetchOnWindowFocus: true,
    staleTime: 30000,
  });

  // Transfer mutation
  const transferMutation = useMutation({
    mutationFn: async (data: { fromAccountId: string; toAccountId: string; amount: string; notes?: string }) => {
      return await apiRequest("POST", "/api/fund-transfers/internal", data);
    },
    onSuccess: () => {
      toast({
        title: "Transfer Initiated",
        description: "Your internal transfer request has been submitted successfully.",
      });
      setFromAccountId("");
      setToAccountId("");
      setAmount("");
      setNotes("");
      queryClient.invalidateQueries({ queryKey: ["/api/trading-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/fund-transfers/internal"] });
    },
    onError: (error: any) => {
      toast({
        title: "Transfer Failed",
        description: error.message || "Failed to initiate transfer. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fromAccountId || !toAccountId || !amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (fromAccountId === toAccountId) {
      toast({
        title: "Invalid Transfer",
        description: "Source and destination accounts cannot be the same.",
        variant: "destructive",
      });
      return;
    }

    const fromAccount = accounts.find((acc) => acc.id === fromAccountId);
    if (!fromAccount) {
      toast({
        title: "Invalid Account",
        description: "Please select a valid source account.",
        variant: "destructive",
      });
      return;
    }

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0.",
        variant: "destructive",
      });
      return;
    }

    if (transferAmount > parseFloat(fromAccount.balance || "0")) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance in the source account.",
        variant: "destructive",
      });
      return;
    }

    transferMutation.mutate({
      fromAccountId,
      toAccountId,
      amount,
      notes: notes || undefined,
    });
  };

  const columns = [
    {
      key: "id",
      label: "ID",
      render: (_: any, row: FundTransfer) => (
        <span className="text-xs font-mono text-muted-foreground">{row.id.slice(0, 8)}...</span>
      ),
    },
    {
      key: "fromAccount",
      label: "From Account",
      render: (_: any, row: FundTransfer) => {
        const account = accounts.find((acc) => acc.id === row.fromAccountId);
        return (
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-primary" />
            <span className="text-sm">{account?.accountId || "N/A"}</span>
          </div>
        );
      },
    },
    {
      key: "toAccount",
      label: "To Account",
      render: (_: any, row: FundTransfer) => {
        const account = accounts.find((acc) => acc.id === row.toAccountId);
        return (
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-primary" />
            <span className="text-sm">{account?.accountId || "N/A"}</span>
          </div>
        );
      },
    },
    {
      key: "amount",
      label: "Amount",
      render: (_: any, row: FundTransfer) => (
        <span className="font-semibold text-primary">${parseFloat(row.amount).toFixed(2)}</span>
      ),
    },
    {
      key: "date",
      label: "Date & Time",
      render: (_: any, row: FundTransfer) => (
        <span className="text-sm text-muted-foreground">
          {row.createdAt ? new Date(row.createdAt).toLocaleString() : "N/A"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (_: any, row: FundTransfer) => {
        const statusColors = {
          Pending: "text-yellow-400",
          Completed: "text-green-400",
          Failed: "text-red-400",
        };
        return (
          <span className={`text-sm font-semibold ${statusColors[row.status as keyof typeof statusColors] || "text-muted-foreground"}`}>
            {row.status}
          </span>
        );
      },
    },
  ];

  const availableAccounts = accounts.filter((acc) => acc.id !== toAccountId);
  const destinationAccounts = accounts.filter((acc) => acc.id !== fromAccountId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
          Internal Transfer
        </h1>
        <p className="text-muted-foreground">
          Transfer funds between your own trading accounts instantly
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Transfer Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="p-6 border-primary/30 bg-gradient-to-br from-black/80 to-primary/10 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <ArrowRightLeft className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Transfer Funds</h2>
                <p className="text-xs text-muted-foreground">Move funds between your accounts</p>
              </div>
            </div>

            <form onSubmit={handleTransfer} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fromAccount">Transfer From</Label>
                <Select value={fromAccountId} onValueChange={setFromAccountId} required>
                  <SelectTrigger id="fromAccount" className="bg-black/40 border-primary/20">
                    <SelectValue placeholder="Select source account" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{account.accountId}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            (${parseFloat(account.balance || "0").toFixed(2)})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="toAccount">Transfer To</Label>
                <Select value={toAccountId} onValueChange={setToAccountId} required>
                  <SelectTrigger id="toAccount" className="bg-black/40 border-primary/20">
                    <SelectValue placeholder="Select destination account" />
                  </SelectTrigger>
                  <SelectContent>
                    {destinationAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{account.accountId}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            ({account.type})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="bg-black/40 border-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  type="text"
                  placeholder="Add a note for this transfer"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-black/40 border-primary/20"
                />
              </div>

              <Button
                type="submit"
                className="bg-gradient-to-r from-primary via-primary/95 to-primary hover:from-primary/90 hover:via-primary/85 hover:to-primary/90 text-black font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                disabled={transferMutation.isPending || accountsLoading}
              >
                {transferMutation.isPending ? (
                  <>
                    <InlineLoader className="mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ArrowRightLeft className="w-4 h-4 mr-2" />
                    Transfer Funds
                  </>
                )}
              </Button>
            </form>
          </Card>
        </motion.div>

        {/* Transfer History */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="p-6 border-primary/30 bg-gradient-to-br from-black/80 to-primary/10 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <History className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Transfer History</h2>
                <p className="text-xs text-muted-foreground">Your recent internal transfers</p>
              </div>
            </div>

            {transfersLoading ? (
              <FullPageLoader text="Loading transfers..." size="sm" />
            ) : transfers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No transfer history found</p>
              </div>
            ) : (
              <DataTable data={transfers} columns={columns} />
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

