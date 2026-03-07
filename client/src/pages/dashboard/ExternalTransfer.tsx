import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowRight, Wallet, History, AlertCircle } from "lucide-react";
import { FullPageLoader, InlineLoader } from "@/components/DashboardLoader";
import { motion } from "framer-motion";
import DataTable from "@/components/DataTable";
import type { TradingAccount, FundTransfer } from "@shared/schema";

export default function ExternalTransfer() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountNumber, setToAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [otpMethod, setOtpMethod] = useState<"email" | "sms">("email");

  // Fetch trading accounts
  const { data: accounts = [], isLoading: accountsLoading } = useQuery<TradingAccount[]>({
    queryKey: ["/api/trading-accounts"],
    refetchInterval: false,
    refetchOnWindowFocus: true,
    staleTime: 60000,
  });

  // Fetch transfer history - optimized
  const { data: transfers = [], isLoading: transfersLoading } = useQuery<FundTransfer[]>({
    queryKey: ["/api/fund-transfers/external"],
    refetchInterval: false,
    refetchOnWindowFocus: true,
    staleTime: 30000,
  });

  // Transfer mutation
  const transferMutation = useMutation({
    mutationFn: async (data: { fromAccountId: string; toAccountNumber: string; amount: string; otpMethod: string }) => {
      return await apiRequest("POST", "/api/fund-transfers/external", data);
    },
    onSuccess: () => {
      toast({
        title: "Transfer Initiated",
        description: "Your external transfer request has been submitted. Please verify with OTP.",
      });
      setFromAccountId("");
      setToAccountNumber("");
      setAmount("");
      queryClient.invalidateQueries({ queryKey: ["/api/trading-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/fund-transfers/external"] });
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

    if (!fromAccountId || !toAccountNumber || !amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
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

    // Calculate fee (2.5%)
    const fee = transferAmount * 0.025;
    const totalDeduction = transferAmount + fee;
    const accountBalance = parseFloat(fromAccount.balance || "0");

    if (totalDeduction > accountBalance) {
      toast({
        title: "Insufficient Balance",
        description: `You need $${totalDeduction.toFixed(2)} (amount + 2.5% fee) but only have $${accountBalance.toFixed(2)}.`,
        variant: "destructive",
      });
      return;
    }

    transferMutation.mutate({
      fromAccountId,
      toAccountNumber,
      amount,
      otpMethod,
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
        // Extract account number from notes or find account
        const account = accounts.find((acc) => acc.id === row.toAccountId);
        if (account) {
          return <span className="text-sm font-mono">{account.accountId}</span>;
        }
        // Try to extract from notes
        const match = row.notes?.match(/to (\w+)/);
        return <span className="text-sm font-mono">{match ? match[1] : row.toAccountId}</span>;
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

  const selectedAccount = accounts.find((acc) => acc.id === fromAccountId);
  const transferAmount = parseFloat(amount) || 0;
  const fee = transferAmount * 0.025;
  const totalDeduction = transferAmount + fee;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
          External Transfer
        </h1>
        <p className="text-muted-foreground">
          Transfer funds to another user's trading account
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
                <ArrowRight className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">External Funds Transfer</h2>
                <p className="text-xs text-muted-foreground">Send funds to another account</p>
              </div>
            </div>

            {/* Fee Notice */}
            <div className="mb-6 p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-yellow-400 mb-1">External Transfer Fee: 2.5%</h3>
                  <p className="text-xs text-muted-foreground">
                    A 2.5% fee will be charged on all external transfers. This fee will be deducted from your account along with the transfer amount.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleTransfer} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fromAccount">Transfer Funds From</Label>
                <Select value={fromAccountId} onValueChange={setFromAccountId} required>
                  <SelectTrigger id="fromAccount" className="bg-black/40 border-primary/20">
                    <SelectValue placeholder="Select trading account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
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
                <Label htmlFor="toAccount">Enter Trading Account (Send Funds To)</Label>
                <Input
                  id="toAccount"
                  type="text"
                  placeholder="Enter recipient account number"
                  value={toAccountNumber}
                  onChange={(e) => setToAccountNumber(e.target.value)}
                  required
                  className="bg-black/40 border-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Enter Amount to be Transferred</Label>
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
                {amount && transferAmount > 0 && (
                  <div className="text-xs text-muted-foreground space-y-1 pt-1">
                    <div className="flex justify-between">
                      <span>Transfer Amount:</span>
                      <span>${transferAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fee (2.5%):</span>
                      <span className="text-yellow-400">${fee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-foreground pt-1 border-t border-primary/20">
                      <span>Total Deduction:</span>
                      <span className="text-primary">${totalDeduction.toFixed(2)}</span>
                    </div>
                    {selectedAccount && totalDeduction > parseFloat(selectedAccount.balance || "0") && (
                      <p className="text-red-400 text-xs mt-1">Insufficient balance</p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="otpMethod">Select OTP Verification Method</Label>
                <Select value={otpMethod} onValueChange={(value: "email" | "sms") => setOtpMethod(value)} required>
                  <SelectTrigger id="otpMethod" className="bg-black/40 border-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email OTP</SelectItem>
                    <SelectItem value="sms">SMS OTP</SelectItem>
                  </SelectContent>
                </Select>
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
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Proceed to Transfer
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
                <h2 className="text-xl font-bold text-foreground">Your Transfers</h2>
                <p className="text-xs text-muted-foreground">External transfer history</p>
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

