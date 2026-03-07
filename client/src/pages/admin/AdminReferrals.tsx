import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, CheckCircle2, XCircle, Clock, DollarSign, Settings, Send } from "lucide-react";
import DataTable from "@/components/DataTable";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
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
import { Input } from "@/components/ui/input";

interface Referral {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  phone: string | null;
  country: string | null;
  city: string | null;
  joinedAt: Date;
  referralStatus: "Pending" | "Accepted" | "Rejected";
  referrerId: string;
  referrerName: string;
  referrerEmail: string;
  referrerReferralId: string;
}

export default function AdminReferrals() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);
  const [commissionDialogOpen, setCommissionDialogOpen] = useState(false);
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false);
  const [selectedReferrerId, setSelectedReferrerId] = useState<string | null>(null);
  const [commissionRate, setCommissionRate] = useState("");
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutNotes, setPayoutNotes] = useState("");

  const { data: referrals = [], isLoading, refetch: refetchReferrals, isFetching: isRefreshingReferrals } = useQuery<Referral[]>({
    queryKey: ["/api/admin/referrals"],
    refetchInterval: 30000,
  });

  const acceptMutation = useMutation({
    mutationFn: async (referralId: string) => {
      return await apiRequest("PATCH", `/api/admin/referrals/${referralId}/accept`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/referrals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ib/stats"] });
      setActionDialogOpen(false);
      setSelectedReferral(null);
      toast({
        title: "Referral Accepted",
        description: "Referral has been accepted and IB wallet enabled for referrer.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to accept referral",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ referralId, reason }: { referralId: string; reason: string }) => {
      return await apiRequest("PATCH", `/api/admin/referrals/${referralId}/reject`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/referrals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setActionDialogOpen(false);
      setSelectedReferral(null);
      setRejectionReason("");
      setIsRejecting(false);
      toast({
        title: "Referral Rejected",
        description: "Referral has been rejected.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject referral",
        variant: "destructive",
      });
      setIsRejecting(false);
    },
  });

  const updateCommissionMutation = useMutation({
    mutationFn: async ({ referrerId, rate }: { referrerId: string; rate: string }) => {
      return await apiRequest("PATCH", `/api/admin/referrals/${referrerId}/commission-rate`, { commissionRate: rate });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/referrals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ib/stats"] });
      setCommissionDialogOpen(false);
      setSelectedReferrerId(null);
      setCommissionRate("");
      toast({
        title: "Commission Rate Updated",
        description: "Commission rate has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to update commission rate",
        variant: "destructive",
      });
    },
  });

  const payoutMutation = useMutation({
    mutationFn: async ({ referrerId, amount, notes }: { referrerId: string; amount: string; notes: string }) => {
      return await apiRequest("POST", `/api/admin/referrals/${referrerId}/payout`, { amount, notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/referrals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ib/stats"] });
      setPayoutDialogOpen(false);
      setSelectedReferrerId(null);
      setPayoutAmount("");
      setPayoutNotes("");
      toast({
        title: "Payout Processed",
        description: "Money has been sent to IB broker successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to process payout",
        variant: "destructive",
      });
    },
  });

  const handleAccept = (referral: Referral) => {
    setSelectedReferral(referral);
    setIsRejecting(false);
    setActionDialogOpen(true);
  };

  const handleReject = (referral: Referral) => {
    setSelectedReferral(referral);
    setIsRejecting(true);
    setRejectionReason("");
    setActionDialogOpen(true);
  };

  const confirmAction = () => {
    if (!selectedReferral) return;

    if (isRejecting) {
      if (!rejectionReason.trim()) {
        toast({
          title: "Error",
          description: "Please provide a rejection reason",
          variant: "destructive",
        });
        return;
      }
      rejectMutation.mutate({
        referralId: selectedReferral.id,
        reason: rejectionReason,
      });
    } else {
      acceptMutation.mutate(selectedReferral.id);
    }
  };

  const columns = [
    {
      key: "fullName",
      label: "Referred User",
      render: (_: any, row: Referral) => (
        <div>
          <div className="font-semibold">{row.fullName}</div>
          <div className="text-xs text-muted-foreground">{row.email}</div>
        </div>
      ),
    },
    {
      key: "referrerName",
      label: "Referred By (IB)",
      render: (_: any, row: Referral) => (
        <div>
          <div className="font-semibold">{row.referrerName}</div>
          <div className="text-xs text-muted-foreground">{row.referrerEmail}</div>
          <div className="text-xs text-primary font-mono mt-1">Ref: {row.referrerReferralId}</div>
        </div>
      ),
    },
    {
      key: "country",
      label: "Location",
      render: (_: any, row: Referral) => (
        <div>
          {row.country && <div className="font-medium">{row.country}</div>}
          {row.city && <div className="text-xs text-muted-foreground">{row.city}</div>}
        </div>
      ),
    },
    {
      key: "joinedAt",
      label: "Joined",
      render: (_: any, row: Referral) => (
        <span className="text-sm">{new Date(row.joinedAt).toLocaleDateString()}</span>
      ),
    },
    {
      key: "referralStatus",
      label: "Status",
      render: (_: any, row: Referral) => {
        const statusConfig = {
          Pending: { label: "Pending", icon: Clock, className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
          Accepted: { label: "Accepted", icon: CheckCircle2, className: "bg-green-500/20 text-green-400 border-green-500/30" },
          Rejected: { label: "Rejected", icon: XCircle, className: "bg-red-500/20 text-red-400 border-red-500/30" },
        };
        const config = statusConfig[row.referralStatus];
        const Icon = config.icon;
        return (
          <Badge className={`${config.className} border flex items-center gap-1`}>
            <Icon className="w-3 h-3" />
            {config.label}
          </Badge>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: Referral) => (
        <div className="flex items-center gap-2 flex-wrap">
          {row.referralStatus === "Pending" && (
            <>
              <Button
                size="sm"
                variant="default"
                onClick={() => handleAccept(row)}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleReject(row)}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Reject
              </Button>
            </>
          )}
          {row.referralStatus === "Accepted" && (
            <>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Accepted
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedReferrerId(row.referrerId);
                  setCommissionDialogOpen(true);
                }}
                className="ml-2"
              >
                <Settings className="w-3 h-3 mr-1" />
                Commission
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedReferrerId(row.referrerId);
                  setPayoutDialogOpen(true);
                }}
                className="ml-1"
              >
                <Send className="w-3 h-3 mr-1" />
                Payout
              </Button>
            </>
          )}
          {row.referralStatus === "Rejected" && (
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
              Rejected
            </Badge>
          )}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const pendingReferrals = referrals.filter(r => r.referralStatus === "Pending");
  const acceptedReferrals = referrals.filter(r => r.referralStatus === "Accepted");
  const rejectedReferrals = referrals.filter(r => r.referralStatus === "Rejected");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Users className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-1">IB Referrals</h1>
          <p className="text-muted-foreground">Manage Introducing Broker referral approvals</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="p-6 border-card-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Referrals</p>
              <p className="text-3xl font-bold">{referrals.length}</p>
            </div>
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-6 border-card-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Pending</p>
              <p className="text-3xl font-bold text-yellow-500">{pendingReferrals.length}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </Card>

        <Card className="p-6 border-card-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Accepted</p>
              <p className="text-3xl font-bold text-green-500">{acceptedReferrals.length}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6 border-card-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Rejected</p>
              <p className="text-3xl font-bold text-red-500">{rejectedReferrals.length}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </Card>
      </div>

      {/* Referrals Table */}
      <Card className="border-card-border">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">All Referrals</h2>
        </div>
        {referrals.length > 0 ? (
          <DataTable 
            columns={columns} 
            data={referrals} 
            exportFileName="referrals"
            onRefresh={() => refetchReferrals()}
            isRefreshing={isRefreshingReferrals}
          />
        ) : (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-2 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No referrals found</p>
          </div>
        )}
      </Card>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isRejecting ? "Reject Referral" : "Accept Referral"}
            </DialogTitle>
            <DialogDescription>
              {isRejecting
                ? "Are you sure you want to reject this referral? Please provide a reason."
                : `Accept referral for ${selectedReferral?.fullName}? This will enable IB wallet for ${selectedReferral?.referrerName}.`}
            </DialogDescription>
          </DialogHeader>

          {isRejecting && (
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          )}

          {!isRejecting && selectedReferral && (
            <div className="space-y-2 p-4 bg-muted rounded-lg">
              <div className="text-sm">
                <span className="font-semibold">Referred User:</span> {selectedReferral.fullName} ({selectedReferral.email})
              </div>
              <div className="text-sm">
                <span className="font-semibold">Referred By:</span> {selectedReferral.referrerName} ({selectedReferral.referrerEmail})
              </div>
              <div className="text-sm">
                <span className="font-semibold">Referral ID:</span> {selectedReferral.referrerReferralId}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setActionDialogOpen(false);
                setSelectedReferral(null);
                setRejectionReason("");
                setIsRejecting(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant={isRejecting ? "destructive" : "default"}
              onClick={confirmAction}
              disabled={acceptMutation.isPending || rejectMutation.isPending}
              className={!isRejecting ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {acceptMutation.isPending || rejectMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {isRejecting ? (
                    <>
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Accept
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Commission Rate Dialog */}
      <Dialog open={commissionDialogOpen} onOpenChange={setCommissionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Commission Rate</DialogTitle>
            <DialogDescription>
              Set the commission rate for this IB broker. The rate is a percentage (0-100) of each deposit made by their referrals.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="commissionRate">Commission Rate (%)</Label>
              <Input
                id="commissionRate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="5.0"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter a value between 0 and 100. Example: 5.0 for 5% commission.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCommissionDialogOpen(false);
                setSelectedReferrerId(null);
                setCommissionRate("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!selectedReferrerId || !commissionRate) {
                  toast({
                    title: "Error",
                    description: "Please enter a commission rate",
                    variant: "destructive",
                  });
                  return;
                }
                updateCommissionMutation.mutate({
                  referrerId: selectedReferrerId,
                  rate: commissionRate,
                });
              }}
              disabled={updateCommissionMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {updateCommissionMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Settings className="w-4 h-4 mr-2" />
                  Update Rate
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payout Dialog */}
      <Dialog open={payoutDialogOpen} onOpenChange={setPayoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Money to IB Broker</DialogTitle>
            <DialogDescription>
              Transfer money from the IB broker's wallet to their broker account. This will deduct the amount from their IB wallet balance.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payoutAmount">Amount (USD)</Label>
              <Input
                id="payoutAmount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payoutNotes">Notes (Optional)</Label>
              <Textarea
                id="payoutNotes"
                placeholder="Add any notes about this payout..."
                value={payoutNotes}
                onChange={(e) => setPayoutNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setPayoutDialogOpen(false);
                setSelectedReferrerId(null);
                setPayoutAmount("");
                setPayoutNotes("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!selectedReferrerId || !payoutAmount || parseFloat(payoutAmount) <= 0) {
                  toast({
                    title: "Error",
                    description: "Please enter a valid amount",
                    variant: "destructive",
                  });
                  return;
                }
                payoutMutation.mutate({
                  referrerId: selectedReferrerId,
                  amount: payoutAmount,
                  notes: payoutNotes,
                });
              }}
              disabled={payoutMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {payoutMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Money
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

