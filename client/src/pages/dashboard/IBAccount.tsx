import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, DollarSign, Share2, Copy, CheckCircle2, Clock, XCircle } from "lucide-react";
import { FullPageLoader } from "@/components/DashboardLoader";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { IbCbWallet, User } from "@shared/schema";
import DataTable from "@/components/DataTable";

interface IBStats {
  totalReferrals: number;
  acceptedReferrals: number;
  activeReferrals: number;
  totalCommission: string;
  pendingCommission: string;
  wallet: IbCbWallet | null;
  referrals: Array<{
    id: string;
    email: string;
    fullName: string;
    joinedAt: Date;
    totalDeposits: string;
    commissionEarned: string;
    status: "Active" | "Inactive";
    referralStatus?: "Pending" | "Accepted" | "Rejected";
  }>;
}

export default function IBAccount() {
  const { toast } = useToast();

  const { data: stats, isLoading } = useQuery<IBStats>({
    queryKey: ["/api/ib/stats"],
    refetchInterval: false,
    refetchOnWindowFocus: true,
    staleTime: 60000,
  });

  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/check"],
    retry: false,
    queryFn: async () => {
      const res = await fetch("/api/auth/check", {
        credentials: "include",
      });
      if (res.status === 401) {
        return null; // Return null instead of throwing
      }
      if (!res.ok) {
        throw new Error(`Failed to check auth: ${res.statusText}`);
      }
      return await res.json();
    },
  });

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}/signup?ref=${user?.referralId || ""}`;
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Referral Link Copied!",
      description: "Your referral link has been copied to clipboard.",
    });
  };

  // Build columns dynamically - include referral link column only if user has referralId
  const baseColumns = [
    {
      key: "fullName",
      label: "Referral",
      render: (_: any, row: IBStats["referrals"][0]) => (
        <div>
          <div className="font-semibold">{row.fullName || row.email}</div>
          <div className="text-xs text-muted-foreground">{row.email}</div>
        </div>
      ),
    },
  ];

  // Add referral link column if user has referralId (optional column)
  const referralLinkColumn = user?.referralId ? {
    key: "referralLink",
    label: "Referral Link",
    render: (_: any, row: IBStats["referrals"][0]) => {
      const referralLink = `${window.location.origin}/signup?ref=${user.referralId}`;
      return (
        <div className="flex items-center gap-2">
          <a
            href={referralLink}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-primary hover:underline truncate max-w-xs"
            onClick={(e) => {
              e.stopPropagation();
              window.open(referralLink, '_blank');
            }}
          >
            {referralLink}
          </a>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(referralLink);
              toast({
                title: "Copied!",
                description: "Referral link copied to clipboard",
              });
            }}
            className="h-6 w-6 p-0"
          >
            <Copy className="w-3 h-3" />
          </Button>
        </div>
      );
    },
  } : null;

  const columns = [
    ...baseColumns,
    ...(referralLinkColumn ? [referralLinkColumn] : []),
    {
      key: "joinedAt",
      label: "Joined",
      render: (_: any, row: IBStats["referrals"][0]) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.joinedAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "totalDeposits",
      label: "Total Deposits",
      render: (_: any, row: IBStats["referrals"][0]) => (
        <span className="font-semibold text-primary">${parseFloat(row.totalDeposits).toFixed(2)}</span>
      ),
    },
    {
      key: "commissionEarned",
      label: "Commission",
      render: (_: any, row: IBStats["referrals"][0]) => (
        <span className="font-semibold text-green-400">${parseFloat(row.commissionEarned).toFixed(2)}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (_: any, row: IBStats["referrals"][0]) => (
        <div className="flex flex-col gap-1">
          <span className={`text-xs px-2 py-1 rounded-full ${
            row.status === "Active" 
              ? "bg-green-500/20 text-green-400" 
              : "bg-gray-500/20 text-gray-400"
          }`}>
            {row.status}
          </span>
          {row.referralStatus && (
            <span className={`text-xs px-2 py-1 rounded-full ${
              row.referralStatus === "Accepted"
                ? "bg-blue-500/20 text-blue-400"
                : row.referralStatus === "Pending"
                ? "bg-yellow-500/20 text-yellow-400"
                : "bg-red-500/20 text-red-400"
            }`}>
              {row.referralStatus}
            </span>
          )}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <FullPageLoader text="Loading IB account..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
          IB Account
        </h1>
        <p className="text-muted-foreground">
          Introducing Broker Dashboard - Track your referrals and commissions
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 border-primary/30 bg-gradient-to-br from-black/80 to-primary/10 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-primary" />
              <span className="text-xs uppercase tracking-wider text-primary/70">Total Referrals</span>
            </div>
            <div className="text-3xl font-bold text-primary mb-1">
              {stats?.totalReferrals || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeReferrals || 0} active
            </p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 border-primary/30 bg-gradient-to-br from-black/80 to-primary/10 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-green-400" />
              <span className="text-xs uppercase tracking-wider text-green-400/70">Total Commission</span>
            </div>
            <div className="text-3xl font-bold text-green-400 mb-1">
              ${parseFloat(stats?.totalCommission || "0").toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              ${parseFloat(stats?.pendingCommission || "0").toFixed(2)} pending
            </p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 border-primary/30 bg-gradient-to-br from-black/80 to-primary/10 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-blue-400" />
              <span className="text-xs uppercase tracking-wider text-blue-400/70">Commission Rate</span>
            </div>
            <div className="text-3xl font-bold text-blue-400 mb-1">
              {stats?.wallet ? `${parseFloat(stats.wallet.commissionRate || "0").toFixed(1)}%` : "0%"}
            </div>
            <p className="text-xs text-muted-foreground">
              Per referral deposit
            </p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 border-primary/30 bg-gradient-to-br from-black/80 to-primary/10 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-yellow-400" />
              <span className="text-xs uppercase tracking-wider text-yellow-400/70">Wallet Balance</span>
            </div>
            <div className="text-3xl font-bold text-yellow-400 mb-1">
              ${parseFloat(stats?.wallet?.balance || "0").toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Available for withdrawal
            </p>
          </Card>
        </motion.div>
      </div>

      {/* Referral Status (if user was referred) */}
      {user?.referredBy && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Card className="p-6 border-primary/30 bg-gradient-to-br from-black/80 to-primary/10 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-primary" />
                <div>
                  <h3 className="text-lg font-bold text-foreground">Your Referral Status</h3>
                  <p className="text-xs text-muted-foreground">Status of your IB referral approval</p>
                </div>
              </div>
              {user.referralStatus === "Pending" && (
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Pending Approval
                </Badge>
              )}
              {user.referralStatus === "Accepted" && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Accepted
                </Badge>
              )}
              {user.referralStatus === "Rejected" && (
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  Rejected
                </Badge>
              )}
            </div>
            <div className="p-4 rounded-lg bg-black/40 border border-primary/20">
              <p className="text-sm text-muted-foreground">
                {user.referralStatus === "Pending" && (
                  "Your referral is pending admin approval. Once approved, your referrer's IB account will be activated."
                )}
                {user.referralStatus === "Accepted" && (
                  "Your referral has been accepted! Your referrer's IB account is now active and earning commissions."
                )}
                {user.referralStatus === "Rejected" && (
                  "Your referral has been rejected by admin. Please contact support if you believe this is an error."
                )}
              </p>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Referral Link */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-6 border-primary/30 bg-gradient-to-br from-black/80 to-primary/10 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-4">
            <Share2 className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-lg font-bold text-foreground">Your Referral Link</h3>
              <p className="text-xs text-muted-foreground">Share this link to earn commissions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 p-3 rounded-lg bg-black/40 border border-primary/20 font-mono text-sm break-all">
              {user?.referralId ? `${window.location.origin}/signup?ref=${user.referralId}` : "Loading..."}
            </div>
            <Button
              onClick={copyReferralLink}
              className="bg-primary hover:bg-primary/90 text-black font-bold"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
          </div>
          <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                You earn a commission on every deposit made by users who sign up using your referral link. 
                Commissions are calculated based on your commission rate and credited to your IB wallet.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Referrals Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="p-6 border-primary/30 bg-gradient-to-br from-black/80 to-primary/10 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-lg font-bold text-foreground">Your Referrals</h3>
              <p className="text-xs text-muted-foreground">Users who signed up using your referral link</p>
            </div>
          </div>

          {stats?.referrals && stats.referrals.length > 0 ? (
            <DataTable data={stats.referrals} columns={columns} />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No referrals yet. Share your referral link to start earning commissions!</p>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}

