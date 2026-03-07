import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DataTable from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";
import { FullPageLoader, InlineLoader } from "@/components/DashboardLoader";
import type { Withdrawal, TradingAccount } from "@shared/schema";

export default function Withdraw() {
  const [accountId, setAccountId] = useState("");
  const [method, setMethod] = useState("");
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [swiftCode, setSwiftCode] = useState("");
  const { toast } = useToast();

  // Fetch trading accounts
  const { data: accounts = [], isLoading: loadingAccounts } = useQuery<TradingAccount[]>({
    queryKey: ["/api/trading-accounts"],
    refetchInterval: false,
    refetchOnWindowFocus: true,
    staleTime: 60000,
  });

  // Fetch withdrawal history - optimized
  const { data: withdrawals = [], isLoading: loadingWithdrawals } = useQuery<Withdrawal[]>({
    queryKey: ["/api/withdrawals"],
    refetchInterval: false,
    refetchOnWindowFocus: true,
    staleTime: 30000,
  });

  // Create withdrawal mutation
  const withdrawMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/withdrawals", data);
    },
    onSuccess: () => {
      toast({
        title: "Withdrawal Requested",
        description: "Your withdrawal request has been submitted successfully.",
      });
      // Reset form
      setAccountId("");
      setMethod("");
      setAmount("");
      setBankName("");
      setAccountNumber("");
      setAccountHolderName("");
      setSwiftCode("");
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["/api/withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trading-accounts"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit withdrawal request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accountId || !method || !amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (method === "Bank Transfer" && (!bankName || !accountNumber || !accountHolderName)) {
      toast({
        title: "Missing Bank Details",
        description: "Please fill in all bank details for bank transfer.",
        variant: "destructive",
      });
      return;
    }

    const selectedAccount = accounts.find((acc) => acc.id === accountId);
    if (!selectedAccount) {
      toast({
        title: "Invalid Account",
        description: "Please select a valid trading account.",
        variant: "destructive",
      });
      return;
    }

    const withdrawalData = {
      accountId,
      method,
      amount,
      ...(method === "Bank Transfer" && {
        bankName,
        accountNumber,
        accountHolderName,
        swiftCode: swiftCode || null,
      }),
    };

    withdrawMutation.mutate(withdrawalData);
  };

  const columns = [
    { 
      key: "id", 
      label: "ID",
      render: (value: string) => <span className="text-xs font-mono">{value.slice(0, 8)}</span>
    },
    { key: "method", label: "Method" },
    { 
      key: "amount", 
      label: "Amount",
      render: (value: string) => (
        <span className="font-semibold">${parseFloat(value).toFixed(2)}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => {
        const variant = 
          value === "Completed" ? "default" : 
          value === "Processing" ? "secondary" : 
          value === "Rejected" ? "destructive" : 
          "secondary";
        return <Badge variant={variant}>{value}</Badge>;
      },
    },
    { 
      key: "createdAt", 
      label: "Requested On",
      render: (value: Date) => new Date(value).toLocaleString(),
    },
    { 
      key: "processedAt", 
      label: "Processed On",
      render: (value: Date | null) => value ? new Date(value).toLocaleString() : "-",
    },
    {
      key: "rejectionReason",
      label: "Reason",
      render: (value: string | null) => value || "-",
    },
  ];

  if (loadingAccounts || loadingWithdrawals) {
    return <FullPageLoader text="Loading withdrawal options..." />;
  }

  const liveAccounts = accounts.filter((acc) => acc.type === "Live");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Withdraw Funds</h1>
        <p className="text-muted-foreground">
          Request a withdrawal from your trading account.
        </p>
      </div>

      {liveAccounts.length === 0 && (
        <Card className="p-6 border-card-border border-l-4 border-l-yellow-500">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1">No Live Accounts</h3>
              <p className="text-sm text-muted-foreground">
                You need a live trading account to make withdrawals. Please create one first.
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6 border-card-border">
        <h2 className="text-xl font-semibold mb-4">Withdrawal Request</h2>
        <form onSubmit={handleWithdraw} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="account">Select Trading Account *</Label>
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger id="account" data-testid="select-account">
                  <SelectValue placeholder="Choose account" />
                </SelectTrigger>
                <SelectContent>
                  {liveAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.accountId} - Balance: ${parseFloat(account.balance || "0").toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="method">Withdrawal Method *</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger id="method" data-testid="select-method">
                  <SelectValue placeholder="Choose method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="PayPal">PayPal</SelectItem>
                  <SelectItem value="Crypto">Cryptocurrency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="amount">Withdrawal Amount (USD) *</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="100.00"
              data-testid="input-amount"
              min="10"
              step="0.01"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Minimum withdrawal: $10.00
            </p>
          </div>

          {method === "Bank Transfer" && (
            <>
              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-4">Bank Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bankName">Bank Name *</Label>
                    <Input
                      id="bankName"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="Enter bank name"
                      data-testid="input-bank-name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="accountNumber">Account Number *</Label>
                    <Input
                      id="accountNumber"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="Enter account number"
                      data-testid="input-account-number"
                    />
                  </div>

                  <div>
                    <Label htmlFor="accountHolderName">Account Holder Name *</Label>
                    <Input
                      id="accountHolderName"
                      value={accountHolderName}
                      onChange={(e) => setAccountHolderName(e.target.value)}
                      placeholder="Enter account holder name"
                      data-testid="input-holder-name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="swiftCode">SWIFT/BIC Code</Label>
                    <Input
                      id="swiftCode"
                      value={swiftCode}
                      onChange={(e) => setSwiftCode(e.target.value)}
                      placeholder="Optional"
                      data-testid="input-swift-code"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <Button 
            type="submit" 
            disabled={withdrawMutation.isPending || liveAccounts.length === 0}
            data-testid="button-submit"
          >
            {withdrawMutation.isPending ? (
              <>
                <InlineLoader className="mr-2" />
                Processing...
              </>
            ) : (
              "Submit Withdrawal Request"
            )}
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            Withdrawal requests are typically processed within 1-3 business days.
          </p>
        </form>
      </Card>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Withdrawal History</h2>
        <DataTable 
          columns={columns} 
          data={withdrawals}
        />
      </div>
    </div>
  );
}
