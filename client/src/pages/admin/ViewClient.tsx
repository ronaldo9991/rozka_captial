import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, Key, Wallet, FileText, Activity, Eye, Save, Settings, Check, X, UserCog, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import DataTable from "@/components/DataTable";
import type { User, TradingAccount, Document, ActivityLog, Deposit, Withdrawal, FundTransfer, TradingHistory, AdminUser } from "@shared/schema";

interface ClientDetails {
  user: User;
  accounts: TradingAccount[];
  documents: Document[];
  logs: ActivityLog[];
  deposits: Deposit[];
  withdrawals: Withdrawal[];
  internalTransfers: FundTransfer[];
  externalTransfers: FundTransfer[];
  tradingHistory: TradingHistory[];
  rewards: any[]; // Placeholder for rewards
}

interface ViewClientProps {
  userId: string;
}

export default function ViewClient({ userId }: ViewClientProps) {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Extract userId from URL if not provided as prop (fallback)
  const extractUserIdFromUrl = () => {
    const match = location.match(/\/admin\/clients\/([^/]+)/);
    return match ? match[1] : null;
  };
  
  const actualUserId = userId || extractUserIdFromUrl();
  
  console.log("[ViewClient] Received userId prop:", userId, "location:", location, "Extracted userId:", actualUserId);
  
  // Get current admin to check role for impersonate and delete buttons
  const { data: admin } = useQuery<AdminUser>({
    queryKey: ["/api/admin/auth/me"],
    retry: false,
    refetchOnWindowFocus: false,
  });
  
  const [nextOfKinName, setNextOfKinName] = useState("");
  const [nextOfKinFile, setNextOfKinFile] = useState<File | null>(null);
  const [isUpdatingNextOfKin, setIsUpdatingNextOfKin] = useState(false);
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [transferAccountDialogOpen, setTransferAccountDialogOpen] = useState(false);
  const [selectedAccountForTransfer, setSelectedAccountForTransfer] = useState("");

  const { data, isLoading, error, refetch: refetchClientDetails, isFetching: isRefreshingClientDetails } = useQuery<ClientDetails>({
    queryKey: [`/api/admin/users/${actualUserId}/details`],
    queryFn: async () => {
      if (!actualUserId) {
        console.error("[ViewClient] User ID is missing. userId prop:", userId, "location:", location);
        throw new Error("User ID is required");
      }
      console.log("[ViewClient] Fetching user details for ID:", actualUserId);
      try {
        const response = await apiRequest("GET", `/api/admin/users/${actualUserId}/details`);
        const data = await response.json();
        console.log("[ViewClient] User details fetched successfully:", { 
          hasUser: !!data?.user, 
          accountsCount: data?.accounts?.length || 0,
          documentsCount: data?.documents?.length || 0 
        });
        return data;
      } catch (err: any) {
        console.error("[ViewClient] Error fetching user details:", err);
        throw err;
      }
    },
    enabled: !!actualUserId,
    retry: 1,
    onSuccess: (data) => {
      // Set next of kin data when loaded
      if (data?.user) {
        setNextOfKinName(data.user.nextOfKinName || "");
      }
    },
    onError: (err: any) => {
      console.error("[ViewClient] Query error:", err);
    },
  });

  const updateNextOfKinMutation = useMutation({
    mutationFn: async ({ name, file }: { name: string; file?: File }) => {
      // For now, we'll send JSON. File upload can be added later with proper file handling
      const body: any = { nextOfKinName: name };
      
      // If file is provided, we'd need to handle file upload separately
      // For now, just send the name
      const response = await apiRequest("PATCH", `/api/admin/users/${actualUserId}/next-of-kin`, body);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/users/${actualUserId}/details`] });
      toast({
        title: "Success",
        description: "Next of kin information updated successfully",
      });
      setIsUpdatingNextOfKin(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update next of kin",
        variant: "destructive",
      });
    },
  });

  const handleUpdateNextOfKin = () => {
    updateNextOfKinMutation.mutate({
      name: nextOfKinName,
      file: nextOfKinFile || undefined,
    });
  };

  const changePasswordMutation = useMutation({
    mutationFn: async (password: string) => {
      const response = await apiRequest("PATCH", `/api/admin/users/${actualUserId}/password`, { password });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/users/${actualUserId}/details`] });
      setChangePasswordDialogOpen(false);
      setNewPassword("");
      setConfirmPassword("");
      toast({
        title: "Success",
        description: "Password changed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    },
  });

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }
    changePasswordMutation.mutate(newPassword);
  };

  const toggleUserEnabledMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PATCH", `/api/admin/users/${actualUserId}`, { enabled: !user?.enabled });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/users/${actualUserId}/details`] });
      toast({
        title: "Success",
        description: `User ${user?.enabled ? "disabled" : "enabled"} successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user status",
        variant: "destructive",
      });
    },
  });

  const transferAccountMutation = useMutation({
    mutationFn: async ({ accountId, nextOfKinName }: { accountId: string; nextOfKinName: string }) => {
      // First, we need to find or create the next of kin user
      // For now, we'll create an API endpoint to handle this
      const response = await apiRequest("POST", `/api/admin/users/${actualUserId}/transfer-account`, {
        accountId,
        nextOfKinName,
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/users/${actualUserId}/details`] });
      setTransferAccountDialogOpen(false);
      setSelectedAccountForTransfer("");
      toast({
        title: "Success",
        description: "Account transfer initiated successfully. Next of kin will be notified.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to transfer account",
        variant: "destructive",
      });
    },
  });

  const handleTransferAccount = () => {
    if (!selectedAccountForTransfer || !nextOfKinName.trim()) {
      toast({
        title: "Error",
        description: "Please select an account and ensure next of kin name is set",
        variant: "destructive",
      });
      return;
    }
    transferAccountMutation.mutate({
      accountId: selectedAccountForTransfer,
      nextOfKinName: nextOfKinName.trim(),
    });
  };

  // Impersonate user mutation
  const impersonateMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("POST", `/api/admin/users/${userId}/impersonate`);
      return await response.json();
    },
    onSuccess: () => {
      // Redirect to user dashboard
      window.location.href = "/dashboard";
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to impersonate user",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("DELETE", `/api/admin/users/${userId}`);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      // Redirect back to clients list
      setLocation("/admin/clients");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  // Check admin permissions
  const adminRole = admin?.role ? String(admin.role).trim().toLowerCase().replace(/[-\s_]+/g, "_") : "";
  const canImpersonate = adminRole === "super_admin" || adminRole === "superadmin" || 
                          adminRole === "middle_admin" || adminRole === "middleadmin";
  const canDelete = adminRole === "super_admin" || adminRole === "superadmin";

  // Format date as DD-MMM-YYYY
  const formatDate = (date: Date | string | null | undefined): string => {
    if (!date) return "N/A";
    const d = new Date(date);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = d.getDate().toString().padStart(2, "0");
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Format address properly
  const formatAddress = (): string => {
    const parts = [
      user?.address,
      user?.city,
      user?.zipCode,
      user?.country
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "N/A";
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data || !data?.user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-destructive">Failed to load client details</p>
        <Button onClick={() => setLocation("/admin/clients")} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Clients
        </Button>
      </div>
    );
  }

  const { user, accounts, documents, logs, deposits, withdrawals, internalTransfers, externalTransfers, tradingHistory = [], rewards } = data;

  // Accounts table columns
  const accountColumns = [
    {
      key: "accountId",
      label: "Account ID",
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-sm">{value}</span>
      ),
    },
    {
      key: "type",
      label: "Type",
      sortable: true,
      render: (value: string) => (
        <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30">
          {value}
        </Badge>
      ),
    },
    {
      key: "group",
      label: "Group",
      sortable: true,
      render: (value: string) => (
        <span className="text-sm">{value}</span>
      ),
    },
    {
      key: "balance",
      label: "Balance",
      sortable: true,
      render: (value: string) => (
        <span className="text-sm font-semibold">${parseFloat(value || "0").toFixed(2)}</span>
      ),
    },
    {
      key: "createdAt",
      label: "Requested at",
      sortable: true,
      render: (value: Date) => (
        <span className="text-sm">{new Date(value).toLocaleDateString()}</span>
      ),
    },
    {
      key: "enabled",
      label: "Status",
      sortable: true,
      render: (value: boolean) => (
        <Badge variant={value ? "default" : "destructive"}>
          {value ? "Approved" : "Disabled"}
        </Badge>
      ),
    },
  ];

  // Documents table columns
  const documentColumns = [
    {
      key: "id",
      label: "ID",
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-xs">{value.slice(0, 8)}...</span>
      ),
    },
    {
      key: "type",
      label: "Document Type",
      sortable: true,
      render: (value: string) => (
        <span className="text-sm">{value}</span>
      ),
    },
    {
      key: "fileUrl",
      label: "Attachment",
      sortable: false,
      render: (value: string) => (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline text-sm"
        >
          <Eye className="w-4 h-4 inline mr-1" />
          View
        </a>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => (
        <Badge variant={value === "Approved" ? "default" : value === "Rejected" ? "destructive" : "secondary"}>
          {value}
        </Badge>
      ),
    },
    {
      key: "uploadedAt",
      label: "Uploaded",
      sortable: true,
      render: (value: Date) => (
        <span className="text-sm">{new Date(value).toLocaleDateString()}</span>
      ),
    },
  ];

  // Logs table columns
  const logColumns = [
    {
      key: "id",
      label: "ID",
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-xs">{value}</span>
      ),
    },
    {
      key: "action",
      label: "Action",
      sortable: true,
      render: (value: string) => (
        <span className="text-sm">{value}</span>
      ),
    },
    {
      key: "ipAddress",
      label: "IP",
      sortable: true,
      render: (value: string | null) => (
        <span className="text-sm font-mono">{value || "N/A"}</span>
      ),
    },
    {
      key: "details",
      label: "Location",
      sortable: false,
      render: (value: string | null, row: ActivityLog) => {
        // Logs may have location info in details - parse if available
        // Format: "IP, Location, Browser" or just location string
        if (value) {
          // Try to extract location (usually after IP, before browser)
          const parts = value.split('\t');
          if (parts.length >= 2) {
            return <span className="text-sm">{parts[1] || "N/A"}</span>;
          }
          // If it's a comma-separated location string
          if (value.includes(',') && !value.includes('Mozilla')) {
            return <span className="text-sm">{value}</span>;
          }
        }
        return <span className="text-sm text-muted-foreground">N/A</span>;
      },
    },
    {
      key: "details",
      label: "Browser",
      sortable: false,
      render: (value: string | null, row: ActivityLog) => {
        // Extract browser from details if it contains user agent
        if (value && (value.includes('Mozilla') || value.includes('Safari') || value.includes('Chrome') || value.includes('AppleWebKit'))) {
          // Extract full user agent string
          const browserMatch = value.match(/(Mozilla\/[^)]+)/);
          if (browserMatch) {
            return <span className="text-sm font-mono text-xs">{browserMatch[0]}</span>;
          }
          return <span className="text-sm font-mono text-xs">{value.substring(0, 80)}</span>;
        }
        return <span className="text-sm text-muted-foreground">N/A</span>;
      },
    },
    {
      key: "createdAt",
      label: "Date",
      sortable: true,
      render: (value: Date) => (
        <span className="text-sm">{new Date(value).toLocaleString()}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setLocation("/admin/clients")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Manage Client</h1>
            <p className="text-muted-foreground mt-1">
              {user?.fullName || user?.username || 'N/A'}
              {user?.referralId && (
                <span className="ml-2">Referral ID: {user.referralId}</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {canImpersonate && (
            <Button 
              variant="outline"
              className="bg-purple-500/10 text-purple-600 border-purple-500/30 hover:bg-purple-500/20"
              onClick={() => {
                if (confirm(`Are you sure you want to impersonate ${user?.fullName || user?.username || user?.email}?`)) {
                  impersonateMutation.mutate(actualUserId);
                }
              }}
              disabled={impersonateMutation.isPending}
            >
              <UserCog className="w-4 h-4 mr-2" />
              Impersonate
            </Button>
          )}
          {canDelete && (
            <Button 
              variant="outline"
              className="bg-red-500/10 text-red-600 border-red-500/30 hover:bg-red-500/20"
              onClick={() => {
                if (confirm(`Are you sure you want to DELETE ${user?.fullName || user?.username || user?.email}? This action cannot be undone and will delete all user data including accounts, deposits, withdrawals, and trading history.`)) {
                  deleteUserMutation.mutate(actualUserId);
                }
              }}
              disabled={deleteUserMutation.isPending}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Client
            </Button>
          )}
          <Button 
            variant="outline"
            className="bg-blue-500/10 text-blue-600 border-blue-500/30 hover:bg-blue-500/20"
            onClick={() => setChangePasswordDialogOpen(true)}
          >
            <Key className="w-4 h-4 mr-2" />
            Change Password
          </Button>
          <Button 
            variant={user?.enabled ? "default" : "destructive"}
            className={user?.enabled ? "bg-green-500 hover:bg-green-600" : ""}
            onClick={() => toggleUserEnabledMutation.mutate()}
            disabled={toggleUserEnabledMutation.isPending}
          >
            {user?.enabled ? "Enabled" : "Disabled"}
          </Button>
        </div>
      </div>

      {/* Client Details Card */}
      <Card className="border-card-border bg-card">
        <div className="p-6">
          <div className="grid grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1">Name</label>
                <p className="font-semibold text-base">
                  {user?.fullName || user?.username || 'N/A'}
                  {user?.referralId && (
                    <span className="ml-2 text-sm text-muted-foreground font-normal">
                      (Referral ID: {user.referralId || "N/A"})
                    </span>
                  )}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1">Email</label>
                <p className="font-semibold text-base">{user?.email || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1">Password</label>
                <p className="text-sm font-mono">{user?.password || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1">Date of Birth</label>
                <p className="text-sm">{formatDate(user?.dateOfBirth || user?.createdAt || null)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1">OTP Verification Method</label>
                <p className="text-sm">
                  {user?.phone ? "Phone" : "Email"} {" "}
                  <span 
                    className="text-primary cursor-pointer hover:underline"
                    onClick={() => {
                      toast({
                        title: "Coming Soon",
                        description: "OTP verification method change will be available soon",
                      });
                    }}
                  >
                    (Change)
                  </span>
                </p>
              </div>
            </div>

            {/* Middle Column */}
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1">Address</label>
                <p className="text-sm">{formatAddress()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1">Phone</label>
                <p className="font-semibold text-base">{user?.phone || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1">Join Date</label>
                <p className="text-sm">
                  {user?.createdAt ? formatDate(user.createdAt) : "N/A"}
                </p>
              </div>
            </div>

            {/* Right Column - Status */}
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">Status</label>
                <div className="flex flex-col gap-2">
                  <Badge 
                    variant={user?.verified ? "default" : "destructive"}
                    className={user?.verified ? "bg-green-500 text-white" : "bg-red-500 text-white"}
                  >
                    Account Status {user?.verified ? "Verified" : "Unverified"}
                  </Badge>
                  <Badge variant="default" className="bg-green-500 text-white">
                    Deposit Bonus Enabled
                  </Badge>
                  <Badge variant="default" className="bg-green-500 text-white">
                    Reward Enabled
                  </Badge>
                  <Badge variant="default" className="bg-green-500 text-white">
                    IB Reward Enabled
                  </Badge>
                  <Badge variant="default" className="bg-green-500 text-white">
                    Internal Transfer Enabled
                  </Badge>
                  <Badge variant="default" className="bg-green-500 text-white">
                    External Transfer Enabled
                  </Badge>
                  {!user?.phoneVerified && (
                    <Badge variant="destructive" className="bg-red-500 text-white">
                      Phone Not Verified
                    </Badge>
                  )}
                  {user?.emailVerified ? (
                    <Badge variant="default" className="bg-green-500 text-white">
                      Email Verified
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="bg-red-500 text-white">
                      Email Not Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Next Of Kin Section */}
      <Card className="border-card-border bg-card">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Next Of Kin</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Next of kin Name</Label>
              <Input
                type="text"
                value={nextOfKinName}
                onChange={(e) => setNextOfKinName(e.target.value)}
                placeholder="Enter next of kin name"
                disabled={updateNextOfKinMutation.isPending}
                className="max-w-md"
              />
            </div>
            <div className="space-y-2">
              <Label>Next of kin Verification File</Label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  className="hidden"
                  id="nextOfKinFile"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setNextOfKinFile(file);
                    }
                  }}
                  disabled={updateNextOfKinMutation.isPending}
                />
                <label
                  htmlFor="nextOfKinFile"
                  className="px-4 py-2 border border-border rounded-md bg-background cursor-pointer hover:bg-accent/50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Choose File
                </label>
                <span className="text-sm text-muted-foreground">
                  {nextOfKinFile ? nextOfKinFile.name : user?.nextOfKinFile ? "File uploaded" : "No file chosen"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              {user?.nextOfKinFile && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-green-500/10 text-green-600 border-green-500/30 hover:bg-green-500/20"
                    onClick={() => {
                      window.open(user.nextOfKinFile || "#", "_blank");
                    }}
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                  <span className="text-sm text-muted-foreground">(In Review)</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-green-500/10 text-green-600 border-green-500/30 hover:bg-green-500/20"
                    onClick={async () => {
                      try {
                        const response = await apiRequest("PATCH", `/api/admin/users/${actualUserId}/next-of-kin/approve`, {});
                        await response.json();
                        toast({
                          title: "Success",
                          description: "Next of kin file approved",
                        });
                        refetchClientDetails();
                      } catch (error: any) {
                        toast({
                          title: "Error",
                          description: error.message || "Failed to approve",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-red-500/10 text-red-600 border-red-500/30 hover:bg-red-500/20"
                    onClick={async () => {
                      const reason = prompt("Enter rejection reason:");
                      if (reason) {
                        try {
                          const response = await apiRequest("PATCH", `/api/admin/users/${actualUserId}/next-of-kin/reject`, { reason });
                          await response.json();
                          toast({
                            title: "Success",
                            description: "Next of kin file rejected",
                          });
                          refetchClientDetails();
                        } catch (error: any) {
                          toast({
                            title: "Error",
                            description: error.message || "Failed to reject",
                            variant: "destructive",
                          });
                        }
                      }
                    }}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                </>
              )}
              <Button 
                variant="default"
                className="bg-blue-500 hover:bg-blue-600"
                onClick={handleUpdateNextOfKin}
                disabled={updateNextOfKinMutation.isPending || !nextOfKinName.trim()}
              >
                {updateNextOfKinMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Update
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Accounts Section */}
      <Card className="border-card-border bg-card">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-2">Accounts</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Following is the list of trading accounts in hold by the user.
          </p>
          {accounts.length > 0 ? (
            <DataTable 
              columns={accountColumns} 
              data={accounts} 
              exportFileName="client-accounts"
              onRefresh={() => refetchClientDetails()}
              isRefreshing={isRefreshingClientDetails}
            />
          ) : (
            <p className="text-center text-muted-foreground py-8">No accounts found</p>
          )}
        </div>
      </Card>

      {/* Rewards Achieved Section */}
      <Card className="border-card-border bg-card">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-2">Rewards Achieved</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Following is the list of Rewards Achieved by the user.
          </p>
          {rewards.length > 0 ? (
            <DataTable
              columns={[
                { key: "id", label: "ID", sortable: true },
                { key: "account", label: "Account", sortable: true },
                { key: "achievedAmount", label: "Achieved Amount", sortable: true },
                { key: "rewardAmount", label: "Reward Amount", sortable: true },
                { key: "rewardMonth", label: "Reward Month, Year", sortable: true },
                { key: "receivingDate", label: "Receiving Date & Time", sortable: true },
              ]}
              data={rewards}
              exportFileName="client-rewards"
            />
          ) : (
            <p className="text-center text-muted-foreground py-8">Record Not Found</p>
          )}
        </div>
      </Card>

      {/* Deposits History Section */}
      <Card className="border-card-border bg-card">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-2">Deposits History</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Following is the history of deposit requests submitted by the user.
          </p>
          {deposits.length > 0 ? (
            <DataTable
              columns={[
                { key: "id", label: "ID", sortable: true },
                { key: "accountId", label: "Account", sortable: true },
                { key: "amount", label: "Amount", sortable: true, render: (value: string) => `$${parseFloat(value || "0").toFixed(2)}` },
                { key: "merchant", label: "Merchant", sortable: true },
                { key: "depositDate", label: "Deposit Date", sortable: true, render: (value: Date) => new Date(value).toLocaleDateString() },
                { key: "status", label: "Status", sortable: true, render: (value: string) => (
                  <Badge variant={value === "Completed" ? "default" : value === "Rejected" ? "destructive" : "secondary"}>
                    {value}
                  </Badge>
                ) },
              ]}
              data={deposits}
              exportFileName="client-deposits"
            />
          ) : (
            <p className="text-center text-muted-foreground py-8">No Records Found</p>
          )}
        </div>
      </Card>

      {/* Withdrawals Requests Section */}
      <Card className="border-card-border bg-card">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-2">Withdrawals Requests</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Following is the list of withdrawal requests submitted by the user.
          </p>
          {withdrawals.length > 0 ? (
            <DataTable
              columns={[
                { key: "id", label: "ID", sortable: true },
                { key: "accountId", label: "Account", sortable: true },
                { key: "amount", label: "Amount", sortable: true, render: (value: string) => `$${parseFloat(value || "0").toFixed(2)}` },
                { key: "method", label: "Merchant", sortable: true },
                { key: "createdAt", label: "Date & Time", sortable: true, render: (value: Date) => new Date(value).toLocaleString() },
                { key: "status", label: "Status", sortable: true, render: (value: string) => (
                  <Badge variant={value === "Completed" ? "default" : value === "Rejected" ? "destructive" : "secondary"}>
                    {value}
                  </Badge>
                ) },
              ]}
              data={withdrawals}
              exportFileName="client-withdrawals"
            />
          ) : (
            <p className="text-center text-muted-foreground py-8">No Records Found</p>
          )}
        </div>
      </Card>

      {/* Internal Transactions Section */}
      <Card className="border-card-border bg-card">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-2">Internal Transactions</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Following is the list of transactions carried out by the account user.
          </p>
          {internalTransfers.length > 0 ? (
            <DataTable
              columns={[
                { key: "id", label: "ID", sortable: true },
                { key: "id", label: "Trade ID", sortable: true, render: (_: any, row: FundTransfer) => row.id.slice(0, 8) },
                { key: "amount", label: "Amount", sortable: true, render: (value: string) => `$${parseFloat(value || "0").toFixed(2)}` },
                { key: "fromAccountId", label: "Source", sortable: true },
                { key: "toAccountId", label: "Destination", sortable: true },
                { key: "createdAt", label: "Date & Time", sortable: true, render: (value: Date) => new Date(value).toLocaleString() },
                { key: "status", label: "Status", sortable: true, render: (value: string) => (
                  <Badge variant={value === "Completed" ? "default" : value === "Rejected" ? "destructive" : "secondary"}>
                    {value}
                  </Badge>
                ) },
              ]}
              data={internalTransfers}
              exportFileName="client-internal-transactions"
            />
          ) : (
            <p className="text-center text-muted-foreground py-8">No Records Found</p>
          )}
        </div>
      </Card>

      {/* External Transactions Section */}
      <Card className="border-card-border bg-card">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-2">External Transactions</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Following is the list of transactions carried out by the account user.
          </p>
          {externalTransfers.length > 0 ? (
            <DataTable
              columns={[
                { key: "id", label: "ID", sortable: true },
                { key: "id", label: "Trade ID", sortable: true, render: (_: any, row: FundTransfer) => row.id.slice(0, 8) },
                { key: "amount", label: "Amount", sortable: true, render: (value: string) => `$${parseFloat(value || "0").toFixed(2)}` },
                { key: "fromAccountId", label: "Source", sortable: true },
                { key: "toAccountId", label: "Destination", sortable: true },
                { key: "createdAt", label: "Date & Time", sortable: true, render: (value: Date) => new Date(value).toLocaleString() },
                { key: "status", label: "Status", sortable: true, render: (value: string) => (
                  <Badge variant={value === "Completed" ? "default" : value === "Rejected" ? "destructive" : "secondary"}>
                    {value}
                  </Badge>
                ) },
              ]}
              data={externalTransfers}
              exportFileName="client-external-transactions"
            />
          ) : (
            <p className="text-center text-muted-foreground py-8">No Records Found</p>
          )}
        </div>
      </Card>

      {/* Trading History Section */}
      <Card className="border-card-border bg-card">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-2">Trading History</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Following is the complete trading history for this client.
          </p>
          {tradingHistory.length > 0 ? (
            <DataTable
              columns={[
                { key: "ticketId", label: "Ticket ID", sortable: true, render: (value: string) => <span className="font-mono text-sm">{value}</span> },
                { key: "symbol", label: "Symbol", sortable: true },
                { key: "type", label: "Type", sortable: true, render: (value: string) => (
                  <Badge variant={value === "Buy" ? "default" : "secondary"}>{value}</Badge>
                ) },
                { key: "volume", label: "Volume", sortable: true },
                { key: "openPrice", label: "Open Price", sortable: true, render: (value: string) => `$${parseFloat(value || "0").toFixed(5)}` },
                { key: "closePrice", label: "Close Price", sortable: true, render: (value: string | null) => value ? `$${parseFloat(value).toFixed(5)}` : "N/A" },
                { key: "profit", label: "Profit/Loss", sortable: true, render: (value: string | null) => {
                  const profit = value ? parseFloat(value) : 0;
                  return (
                    <span className={profit >= 0 ? "text-green-600" : "text-red-600"}>
                      ${profit.toFixed(2)}
                    </span>
                  );
                }},
                { key: "status", label: "Status", sortable: true, render: (value: string) => (
                  <Badge variant={value === "Closed" ? "default" : "secondary"}>{value}</Badge>
                ) },
                { key: "openTime", label: "Open Time", sortable: true, render: (value: Date) => new Date(value).toLocaleString() },
                { key: "closeTime", label: "Close Time", sortable: true, render: (value: Date | null) => value ? new Date(value).toLocaleString() : "N/A" },
              ]}
              data={tradingHistory}
              exportFileName="client-trading-history"
            />
          ) : (
            <p className="text-center text-muted-foreground py-8">No Trading History Found</p>
          )}
        </div>
      </Card>

      {/* Documents Section */}
      <Card className="border-card-border bg-card">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold mb-2">User Documents</h2>
              <p className="text-sm text-muted-foreground">
                Following is the list of documents for user verification submitted by the user for approval.
              </p>
            </div>
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Upload Documents
            </Button>
          </div>
          {documents.length > 0 ? (
            <DataTable 
              columns={documentColumns} 
              data={documents} 
              exportFileName="client-documents"
              onRefresh={() => refetchClientDetails()}
              isRefreshing={isRefreshingClientDetails}
            />
          ) : (
            <p className="text-center text-muted-foreground py-8">No documents found</p>
          )}
        </div>
      </Card>

      {/* User Logs Section */}
      <Card className="border-card-border bg-card">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-2">User Logs</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Following is the list of user logs.
          </p>
          {logs.length > 0 ? (
            <DataTable 
              columns={logColumns} 
              data={logs} 
              exportFileName="client-logs"
              onRefresh={() => refetchClientDetails()}
              isRefreshing={isRefreshingClientDetails}
            />
          ) : (
            <p className="text-center text-muted-foreground py-8">No logs found</p>
          )}
        </div>
      </Card>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordDialogOpen} onOpenChange={setChangePasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter a new password for {user?.fullName || user?.username || user?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 8 characters)"
                disabled={changePasswordMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                disabled={changePasswordMutation.isPending}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setChangePasswordDialogOpen(false);
                setNewPassword("");
                setConfirmPassword("");
              }}
              disabled={changePasswordMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={changePasswordMutation.isPending || !newPassword || !confirmPassword}
            >
              {changePasswordMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Changing...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Account to Next of Kin Dialog */}
      <Dialog open={transferAccountDialogOpen} onOpenChange={setTransferAccountDialogOpen}>
        <DialogContent className="bg-black border-primary/30 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-primary">Transfer Account to Next of Kin</DialogTitle>
            <DialogDescription>
              Transfer a trading account from {user?.fullName || user?.username || user?.email} to their next of kin: {nextOfKinName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Next of Kin Name</Label>
              <Input value={nextOfKinName} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Select Account to Transfer *</Label>
              <Select
                value={selectedAccountForTransfer}
                onValueChange={setSelectedAccountForTransfer}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.accountId} - {account.type} - Balance: ${parseFloat(account.balance || "0").toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-md p-3">
              <p className="text-sm text-yellow-600">
                <strong>Warning:</strong> This action will transfer ownership of the selected account to the next of kin. 
                This is a permanent action and cannot be undone. Please ensure all documentation is in order before proceeding.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setTransferAccountDialogOpen(false);
                setSelectedAccountForTransfer("");
              }}
              disabled={transferAccountMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleTransferAccount}
              disabled={transferAccountMutation.isPending || !selectedAccountForTransfer}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {transferAccountMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Transferring...
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 mr-2" />
                  Transfer Account
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

