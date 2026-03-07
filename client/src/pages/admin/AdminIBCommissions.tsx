import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Edit, DollarSign, Users, TrendingUp, Copy, CheckCircle2, Loader2, Settings, Send, Eye } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { FullPageLoader } from "@/components/DashboardLoader";
import { Textarea } from "@/components/ui/textarea";

interface IBAccount {
  userId: string;
  email: string;
  fullName: string;
  referralId: string | null;
  referralLink: string | null;
  wallet: {
    id: string;
    balance: string;
    currency: string;
    commissionRate: string;
    totalCommission: string;
    enabled: boolean;
  };
  stats: {
    totalReferrals: number;
    acceptedReferrals: number;
    activeReferrals: number;
    totalDeposits: string;
    totalCommissionEarned: string;
    pendingCommission: string;
    totalTradingVolume: string;
    totalTrades: number;
  };
  createdAt: Date;
  updatedAt: Date | null;
}

export default function AdminIBCommissions() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [commissionDialogOpen, setCommissionDialogOpen] = useState(false);
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedIB, setSelectedIB] = useState<IBAccount | null>(null);
  const [commissionRate, setCommissionRate] = useState("");
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutNotes, setPayoutNotes] = useState("");
  const [referralDeposits, setReferralDeposits] = useState<any[]>([]);
  const [selectedDeposits, setSelectedDeposits] = useState<string[]>([]);
  const [showTradeBasedCommission, setShowTradeBasedCommission] = useState(false);
  const [referralsDialogOpen, setReferralsDialogOpen] = useState(false);
  const [referralDetails, setReferralDetails] = useState<any[]>([]);

  // Fetch all IB accounts
  const { data: ibAccounts = [], isLoading, refetch } = useQuery<IBAccount[]>({
    queryKey: ["/api/admin/ib-accounts"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/ib-accounts");
      return await response.json();
    },
  });

  // Update commission rate mutation
  const updateCommissionMutation = useMutation({
    mutationFn: async ({ userId, rate }: { userId: string; rate: string }) => {
      return apiRequest("PATCH", `/api/admin/referrals/${userId}/commission-rate`, {
        commissionRate: rate,
      });
    },
    onSuccess: async () => {
      await refetch();
      toast({
        title: "Success",
        description: "Commission rate updated successfully",
      });
      setCommissionDialogOpen(false);
      setSelectedIB(null);
      setCommissionRate("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update commission rate",
        variant: "destructive",
      });
    },
  });

  // Custom payout mutation
  const customPayoutMutation = useMutation({
    mutationFn: async ({ userId, amount, notes }: { userId: string; amount: string; notes: string }) => {
      return apiRequest("POST", `/api/admin/ib-accounts/${userId}/custom-payout`, {
        amount,
        notes,
      });
    },
    onSuccess: async () => {
      await refetch();
      toast({
        title: "Success",
        description: "Custom payout processed successfully",
      });
      setPayoutDialogOpen(false);
      setSelectedIB(null);
      setPayoutAmount("");
      setPayoutNotes("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process payout",
        variant: "destructive",
      });
    },
  });

  const handleUpdateCommission = (ib: IBAccount) => {
    setSelectedIB(ib);
    setCommissionRate(ib.wallet.commissionRate);
    setCommissionDialogOpen(true);
  };

  const handleCustomPayout = async (ib: IBAccount) => {
    setSelectedIB(ib);
    setPayoutAmount("");
    setPayoutNotes("");
    setSelectedDeposits([]);
    setShowTradeBasedCommission(false);
    setPayoutDialogOpen(true);
    
    // Fetch referral deposits
    try {
      const response = await apiRequest("GET", `/api/admin/ib-accounts/${ib.userId}/referral-deposits`);
      const deposits = await response.json();
      setReferralDeposits(deposits);
    } catch (error) {
      console.error("Failed to fetch referral deposits:", error);
      setReferralDeposits([]);
    }
  };

  const handleViewDetails = (ib: IBAccount) => {
    setSelectedIB(ib);
    setViewDialogOpen(true);
  };

  const handleViewReferrals = async (ib: IBAccount) => {
    setSelectedIB(ib);
    setReferralsDialogOpen(true);
    
    // Fetch detailed referral information
    try {
      const response = await apiRequest("GET", `/api/admin/ib-accounts/${ib.userId}/referrals`);
      const referrals = await response.json();
      setReferralDetails(referrals);
    } catch (error) {
      console.error("Failed to fetch referral details:", error);
      toast({
        title: "Error",
        description: "Failed to load referral details",
        variant: "destructive",
      });
      setReferralDetails([]);
    }
  };

  const copyReferralLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
  };

  const filteredAccounts = ibAccounts.filter((ib) =>
    ib.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ib.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ib.referralId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <FullPageLoader />;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">IB Commission Management</h1>
          <p className="text-muted-foreground mt-1">
            Monitor referrals, set custom commission rates, and manage IB payouts
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-primary/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total IB Accounts</p>
              <p className="text-2xl font-bold text-primary">{ibAccounts.length}</p>
            </div>
            <Users className="w-8 h-8 text-primary/50" />
          </div>
        </Card>
        <Card className="p-4 border-primary/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Referrals</p>
              <p className="text-2xl font-bold text-primary">
                {ibAccounts.reduce((sum, ib) => sum + ib.stats.totalReferrals, 0)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-primary/50" />
          </div>
        </Card>
        <Card className="p-4 border-primary/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Deposits</p>
              <p className="text-2xl font-bold text-primary">
                ${ibAccounts.reduce((sum, ib) => sum + parseFloat(ib.stats.totalDeposits || "0"), 0).toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-primary/50" />
          </div>
        </Card>
        <Card className="p-4 border-primary/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Commissions</p>
              <p className="text-2xl font-bold text-primary">
                ${ibAccounts.reduce((sum, ib) => sum + parseFloat(ib.stats.totalCommissionEarned || "0"), 0).toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-primary/50" />
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search by email, name, or referral ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* IB Accounts Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>IB Account</TableHead>
              <TableHead>Referral Link</TableHead>
              <TableHead>Referrals</TableHead>
              <TableHead>Total Deposits</TableHead>
              <TableHead>Trading Volume</TableHead>
              <TableHead>Commission Rate</TableHead>
              <TableHead>Wallet Balance</TableHead>
              <TableHead>Total Commission</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAccounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No IB accounts found
                </TableCell>
              </TableRow>
            ) : (
              filteredAccounts.map((ib) => (
                <TableRow key={ib.userId}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{ib.fullName}</p>
                      <p className="text-xs text-muted-foreground">{ib.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {ib.referralLink ? (
                      <div className="flex items-center gap-2 max-w-xs">
                        <a
                          href={ib.referralLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-primary hover:underline truncate"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(ib.referralLink!, '_blank');
                          }}
                        >
                          {ib.referralLink}
                        </a>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyReferralLink(ib.referralLink!);
                          }}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">No referral ID</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{ib.stats.totalReferrals}</span>
                        <span className="text-xs text-muted-foreground">Total</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {ib.stats.acceptedReferrals} Accepted
                        </Badge>
                        <Badge variant="outline" className="text-xs bg-green-500/20 text-green-500">
                          {ib.stats.activeReferrals} Active
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">${ib.stats.totalDeposits}</span>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <span className="font-medium text-sm">${ib.stats.totalTradingVolume || "0.00"}</span>
                      <p className="text-xs text-muted-foreground">{ib.stats.totalTrades || 0} trades</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {ib.wallet.commissionRate}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-green-500">
                      ${parseFloat(ib.wallet.balance || "0").toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      ${parseFloat(ib.wallet.totalCommission || "0").toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewReferrals(ib)}
                        title="View Referrals"
                      >
                        <Users className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(ib)}
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpdateCommission(ib)}
                        title="Update Commission Rate"
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCustomPayout(ib)}
                        title="Custom Payout"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>IB Account Details</DialogTitle>
            <DialogDescription>
              Comprehensive view of IB account performance and statistics
            </DialogDescription>
          </DialogHeader>

          {selectedIB && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Full Name</Label>
                  <p className="font-medium">{selectedIB.fullName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedIB.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Referral ID</Label>
                  <p className="font-mono text-sm">{selectedIB.referralId || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Commission Rate</Label>
                  <p className="font-medium">{selectedIB.wallet.commissionRate}%</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Referral Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Total Referrals</Label>
                    <p className="text-2xl font-bold text-primary">{selectedIB.stats.totalReferrals}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Accepted Referrals</Label>
                    <p className="text-2xl font-bold text-green-500">{selectedIB.stats.acceptedReferrals}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Active Referrals</Label>
                    <p className="text-2xl font-bold text-blue-500">{selectedIB.stats.activeReferrals}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Total Deposits</Label>
                    <p className="text-2xl font-bold">${selectedIB.stats.totalDeposits}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Commission & Wallet</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Total Commission Earned</Label>
                    <p className="text-2xl font-bold text-green-500">${selectedIB.stats.totalCommissionEarned}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Wallet Balance</Label>
                    <p className="text-2xl font-bold text-primary">
                      ${parseFloat(selectedIB.wallet.balance || "0").toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Total Commission (All Time)</Label>
                    <p className="text-xl font-semibold">
                      ${parseFloat(selectedIB.wallet.totalCommission || "0").toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <Badge variant={selectedIB.wallet.enabled ? "default" : "destructive"}>
                      {selectedIB.wallet.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                </div>
              </div>

              {selectedIB.referralLink && (
                <div className="border-t pt-4">
                  <Label className="text-muted-foreground">Referral Link</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      value={selectedIB.referralLink}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyReferralLink(selectedIB.referralLink!)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Commission Rate Dialog */}
      <Dialog open={commissionDialogOpen} onOpenChange={setCommissionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Commission Rate</DialogTitle>
            <DialogDescription>
              Set a custom commission rate for this IB account. This will affect future commission calculations.
            </DialogDescription>
          </DialogHeader>

          {selectedIB && (
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                <Input
                  id="commissionRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                  placeholder="5.0"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Current rate: {selectedIB.wallet.commissionRate}%
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong>Note:</strong> Changing the commission rate will only affect future deposits from referrals.
                  Past commissions are not recalculated.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCommissionDialogOpen(false);
                setSelectedIB(null);
                setCommissionRate("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!selectedIB || !commissionRate) return;
                updateCommissionMutation.mutate({
                  userId: selectedIB.userId,
                  rate: commissionRate,
                });
              }}
              disabled={updateCommissionMutation.isPending || !commissionRate}
              className="bg-primary hover:bg-primary/90"
            >
              {updateCommissionMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Rate"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Custom Payout Dialog */}
      <Dialog open={payoutDialogOpen} onOpenChange={setPayoutDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Custom Commission Payout</DialogTitle>
            <DialogDescription>
              Add a custom commission amount to this IB wallet based on trades/deposits or manual adjustment.
            </DialogDescription>
          </DialogHeader>

          {selectedIB && (
            <div className="space-y-4 py-4">
              {/* Toggle between manual and trade-based */}
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant={!showTradeBasedCommission ? "default" : "outline"}
                  onClick={() => {
                    setShowTradeBasedCommission(false);
                    setSelectedDeposits([]);
                    setPayoutAmount("");
                  }}
                >
                  Manual Amount
                </Button>
                <Button
                  type="button"
                  variant={showTradeBasedCommission ? "default" : "outline"}
                  onClick={() => {
                    setShowTradeBasedCommission(true);
                    setPayoutAmount("");
                  }}
                >
                  Based on Trades
                </Button>
              </div>

              {showTradeBasedCommission ? (
                <div className="space-y-4">
                  <div>
                    <Label>Select Referral Deposits</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Select deposits to calculate commission from. Commission will be calculated based on selected deposits and current commission rate.
                    </p>
                    <div className="border rounded-lg max-h-64 overflow-y-auto">
                      {referralDeposits.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">
                          No completed deposits from referrals found.
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-12">
                                <input
                                  type="checkbox"
                                  checked={selectedDeposits.length === referralDeposits.length && referralDeposits.length > 0}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedDeposits(referralDeposits.map((d: any) => d.id));
                                    } else {
                                      setSelectedDeposits([]);
                                    }
                                  }}
                                />
                              </TableHead>
                              <TableHead>Referral</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Commission</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {referralDeposits.map((deposit: any) => {
                              const isSelected = selectedDeposits.includes(deposit.id);
                              const depositAmount = parseFloat(deposit.amount || "0");
                              const commissionRate = parseFloat(selectedIB.wallet.commissionRate || "5.0");
                              const commission = depositAmount * (commissionRate / 100);
                              
                              return (
                                <TableRow key={deposit.id}>
                                  <TableCell>
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedDeposits([...selectedDeposits, deposit.id]);
                                        } else {
                                          setSelectedDeposits(selectedDeposits.filter(id => id !== deposit.id));
                                        }
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <div>
                                      <p className="font-medium text-sm">{deposit.referralName}</p>
                                      <p className="text-xs text-muted-foreground">{deposit.referralEmail}</p>
                                    </div>
                                  </TableCell>
                                  <TableCell className="font-medium">${depositAmount.toFixed(2)}</TableCell>
                                  <TableCell className="text-sm text-muted-foreground">
                                    {new Date(deposit.depositDate || deposit.createdAt).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell className="font-medium text-green-500">
                                    ${commission.toFixed(2)}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                    {selectedDeposits.length > 0 && (
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <p className="text-sm font-medium">
                          Selected: {selectedDeposits.length} deposit(s)
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Total Commission: $
                          {selectedDeposits.reduce((sum, depositId) => {
                            const deposit = referralDeposits.find((d: any) => d.id === depositId);
                            if (!deposit) return sum;
                            const depositAmount = parseFloat(deposit.amount || "0");
                            const commissionRate = parseFloat(selectedIB.wallet.commissionRate || "5.0");
                            return sum + (depositAmount * (commissionRate / 100));
                          }, 0).toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <Label htmlFor="payoutAmount">Payout Amount ($)</Label>
                  <Input
                    id="payoutAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    placeholder="0.00"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Current balance: ${parseFloat(selectedIB.wallet.balance || "0").toFixed(2)}
                  </p>
                </div>
              )}
              
              <div>
                <Label htmlFor="payoutNotes">Notes (Optional)</Label>
                <Textarea
                  id="payoutNotes"
                  value={payoutNotes}
                  onChange={(e) => setPayoutNotes(e.target.value)}
                  placeholder="Add any notes about this payout..."
                  rows={3}
                />
              </div>
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-xs text-yellow-600">
                  <strong>Custom Commission:</strong> This amount will be added to the IB wallet balance and total commission.
                  {showTradeBasedCommission && " Commission is calculated based on selected deposits and current commission rate."}
                  {!showTradeBasedCommission && " This is useful for bonuses, adjustments, or manual payouts."}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setPayoutDialogOpen(false);
                setSelectedIB(null);
                setPayoutAmount("");
                setPayoutNotes("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!selectedIB) return;
                
                let finalAmount = payoutAmount;
                
                if (showTradeBasedCommission) {
                  // Calculate commission from selected deposits
                  const totalCommission = selectedDeposits.reduce((sum, depositId) => {
                    const deposit = referralDeposits.find((d: any) => d.id === depositId);
                    if (!deposit) return sum;
                    const depositAmount = parseFloat(deposit.amount || "0");
                    const commissionRate = parseFloat(selectedIB.wallet.commissionRate || "5.0");
                    return sum + (depositAmount * (commissionRate / 100));
                  }, 0);
                  
                  if (selectedDeposits.length === 0) {
                    toast({
                      title: "Error",
                      description: "Please select at least one deposit",
                      variant: "destructive",
                    });
                    return;
                  }
                  
                  finalAmount = totalCommission.toFixed(2);
                } else {
                  if (!payoutAmount || parseFloat(payoutAmount) <= 0) {
                    toast({
                      title: "Error",
                      description: "Please enter a valid amount",
                      variant: "destructive",
                    });
                    return;
                  }
                }
                
                customPayoutMutation.mutate({
                  userId: selectedIB.userId,
                  amount: finalAmount,
                  notes: payoutNotes,
                });
              }}
              disabled={customPayoutMutation.isPending || (showTradeBasedCommission ? selectedDeposits.length === 0 : !payoutAmount)}
              className="bg-primary hover:bg-primary/90"
            >
              {customPayoutMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Process Payout"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Referrals Dialog - Show who referred whom */}
      <Dialog open={referralsDialogOpen} onOpenChange={setReferralsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Referral Details - {selectedIB?.fullName}</DialogTitle>
            <DialogDescription>
              View all users who signed up using this IB's referral link, their deposits, and trading activity.
            </DialogDescription>
          </DialogHeader>

          {selectedIB && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-3 gap-4 p-4 bg-primary/10 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Total Referrals</p>
                  <p className="text-2xl font-bold text-primary">{selectedIB.stats.totalReferrals}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Accepted</p>
                  <p className="text-2xl font-bold text-green-500">{selectedIB.stats.acceptedReferrals}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-blue-500">{selectedIB.stats.activeReferrals}</p>
                </div>
              </div>

              {referralDetails.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No referrals found</p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Referred User</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Signup Date</TableHead>
                        <TableHead>Total Deposits</TableHead>
                        <TableHead>Trading Volume</TableHead>
                        <TableHead>Trades</TableHead>
                        <TableHead>Profit/Loss</TableHead>
                        <TableHead>Accounts</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {referralDetails.map((referral) => (
                        <TableRow key={referral.userId}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{referral.fullName}</p>
                              <p className="text-xs text-muted-foreground">{referral.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                referral.referralStatus === "Accepted" ? "default" :
                                referral.referralStatus === "Pending" ? "secondary" :
                                "destructive"
                              }
                            >
                              {referral.referralStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(referral.signupDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">${referral.totalDeposits}</span>
                            {referral.lastDepositDate && (
                              <p className="text-xs text-muted-foreground">
                                Last: {new Date(referral.lastDepositDate).toLocaleDateString()}
                              </p>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">${referral.totalVolume}</span>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{referral.totalTrades}</span>
                          </TableCell>
                          <TableCell>
                            <span className={`font-medium ${
                              parseFloat(referral.totalProfit) >= 0 ? "text-green-500" : "text-red-500"
                            }`}>
                              ${referral.totalProfit}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{referral.accountCount}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setReferralsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

