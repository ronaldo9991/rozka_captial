import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import DataTable from "@/components/DataTable";
import StatCard from "@/components/StatCard";
import { Users, FileText, Wallet, DollarSign, Shield, Loader2, UserPlus, Check, X } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { AdminUser, User, Document } from "@shared/schema";

interface AdminStats {
  totalUsers: number;
  pendingDocuments: number;
  totalTradingAccounts: number;
  totalDeposits: number;
  activeAdmins: number;
}

interface ActivityLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  createdAt: Date;
}

interface SuperAdminDashboardProps {
  admin: AdminUser;
}

export default function SuperAdminDashboard({ admin }: SuperAdminDashboardProps) {
  const { toast } = useToast();
  const [createAdminOpen, setCreateAdminOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const [newAdmin, setNewAdmin] = useState({
    username: "",
    password: "",
    email: "",
    fullName: "",
    role: "normal_admin",
  });

  const { data: stats, isLoading: loadingStats } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    refetchInterval: 10000, // Refetch every 10 seconds for faster real-time updates
    refetchOnWindowFocus: true,
    staleTime: 0, // Always consider stale for real-time updates
  });

  const { data: users = [], isLoading: loadingUsers } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    refetchInterval: 60000, // Refetch every 60 seconds
  });

  const { data: documents = [], isLoading: loadingDocuments, refetch: refetchDocuments } = useQuery<Document[]>({
    queryKey: ["/api/admin/documents"],
    refetchInterval: 5000, // Refetch every 5 seconds for faster real-time updates
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Always refetch on mount
    staleTime: 0, // Always consider stale for real-time updates
  });

  const { data: activityLogs = [], isLoading: loadingLogs } = useQuery<ActivityLog[]>({
    queryKey: ["/api/admin/activity-logs"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const toggleUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest("PATCH", `/api/admin/users/${userId}/toggle`);
    },
    onSuccess: async () => {
      // Immediately refetch to update UI in real-time
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["/api/admin/users"] }),
        queryClient.refetchQueries({ queryKey: ["/api/admin/stats"] }),
      ]);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Success",
        description: "User status updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    },
  });

  const createAdminMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/admin/admins", data);
    },
    onSuccess: async () => {
      // Immediately refetch to update UI in real-time
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["/api/admin/admins"] }),
        queryClient.refetchQueries({ queryKey: ["/api/admin/stats"] }),
      ]);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/admins"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setCreateAdminOpen(false);
      setNewAdmin({
        username: "",
        password: "",
        email: "",
        fullName: "",
        role: "normal_admin",
      });
      toast({
        title: "Admin Created",
        description: "New admin has been created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create admin",
        variant: "destructive",
      });
    },
  });

  const approveDocumentMutation = useMutation({
    mutationFn: async (documentId: string) => {
      return await apiRequest("PATCH", `/api/admin/documents/${documentId}/approve`);
    },
    onSuccess: async () => {
      // Immediately refetch documents and stats to update UI in real-time
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["/api/admin/documents"] }),
        queryClient.refetchQueries({ queryKey: ["/api/admin/stats"] }),
      ]);
      // Also invalidate to ensure all related queries are updated
      queryClient.invalidateQueries({ queryKey: ["/api/admin/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Document Approved",
        description: "Document has been approved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve document",
        variant: "destructive",
      });
    },
  });

  const rejectDocumentMutation = useMutation({
    mutationFn: async ({ documentId, reason }: { documentId: string; reason: string }) => {
      return await apiRequest("PATCH", `/api/admin/documents/${documentId}/reject`, { reason });
    },
    onSuccess: async () => {
      // Immediately refetch documents and stats to update UI in real-time
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["/api/admin/documents"] }),
        queryClient.refetchQueries({ queryKey: ["/api/admin/stats"] }),
      ]);
      // Also invalidate to ensure all related queries are updated
      queryClient.invalidateQueries({ queryKey: ["/api/admin/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setRejectDialogOpen(false);
      setSelectedDocument(null);
      setRejectionReason("");
      toast({
        title: "Document Rejected",
        description: "Document has been rejected",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject document",
        variant: "destructive",
      });
    },
  });

  const handleCreateAdmin = () => {
    if (!newAdmin.username || !newAdmin.password || !newAdmin.email || !newAdmin.fullName) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    createAdminMutation.mutate(newAdmin);
  };

  const handleRejectDocument = () => {
    if (!selectedDocument || !rejectionReason) {
      toast({
        title: "Missing Reason",
        description: "Please provide a rejection reason",
        variant: "destructive",
      });
      return;
    }
    rejectDocumentMutation.mutate({
      documentId: selectedDocument.id,
      reason: rejectionReason,
    });
  };

  const userColumns = [
    {
      key: "username",
      label: "Username",
      render: (value: string) => <span className="font-semibold">{value}</span>,
    },
    { key: "email", label: "Email" },
    { key: "fullName", label: "Full Name" },
    { key: "country", label: "Country" },
    {
      key: "verified",
      label: "Verified",
      render: (value: boolean) => (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? "Verified" : "Unverified"}
        </Badge>
      ),
    },
    {
      key: "enabled",
      label: "Status",
      render: (value: boolean, row: User) => (
        <Button
          variant={value ? "default" : "outline"}
          size="sm"
          onClick={() => toggleUserMutation.mutate(row.id)}
          disabled={toggleUserMutation.isPending}
          data-testid={`button-toggle-user-${row.id}`}
        >
          {value ? "Enabled" : "Disabled"}
        </Button>
      ),
    },
  ];

  const documentColumns = [
    {
      key: "userId",
      label: "User",
      render: (_: string, row: Document) => {
        const user = users.find((u) => u.id === row.userId);
        return <span className="font-semibold">{user?.username || "Unknown"}</span>;
      },
    },
    { key: "type", label: "Document Type" },
    {
      key: "uploadedAt",
      label: "Upload Date",
      render: (value: Date) => new Date(value).toLocaleDateString(),
    },
    {
      key: "fileUrl",
      label: "File",
      render: (value: string) => (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
          data-testid="link-document-preview"
        >
          View
        </a>
      ),
    },
    {
      key: "id",
      label: "Actions",
      render: (_: string, row: Document) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => approveDocumentMutation.mutate(row.id)}
            disabled={approveDocumentMutation.isPending}
            data-testid={`button-approve-${row.id}`}
          >
            <Check className="w-4 h-4 mr-1" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedDocument(row);
              setRejectDialogOpen(true);
            }}
            data-testid={`button-reject-${row.id}`}
          >
            <X className="w-4 h-4 mr-1" />
            Reject
          </Button>
        </div>
      ),
    },
  ];

  const activityColumns = [
    {
      key: "adminName",
      label: "Admin",
      render: (value: string) => <span className="font-semibold">{value}</span>,
    },
    { key: "action", label: "Action" },
    { key: "targetType", label: "Target Type" },
    { key: "details", label: "Details" },
    {
      key: "createdAt",
      label: "Time",
      render: (value: Date) => new Date(value).toLocaleString(),
    },
  ];

  if (loadingStats || loadingUsers || loadingDocuments || loadingLogs) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const pendingDocuments = documents.filter((doc) => doc.status === "Pending");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Super Admin Dashboard</h1>
        <p className="text-muted-foreground">Complete system overview and control</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers.toString() || "0"}
          icon={Users}
          index={0}
        />
        <StatCard
          title="Pending Documents"
          value={stats?.pendingDocuments.toString() || "0"}
          icon={FileText}
          index={1}
        />
        <StatCard
          title="Trading Accounts"
          value={stats?.totalTradingAccounts.toString() || "0"}
          icon={Wallet}
          index={2}
        />
        <StatCard
          title="Total Deposits"
          value={stats?.totalDeposits.toString() || "0"}
          icon={DollarSign}
          index={3}
        />
        <StatCard
          title="Active Admins"
          value={stats?.activeAdmins.toString() || "0"}
          icon={Shield}
          index={4}
        />
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">User Management</h2>
        <Dialog open={createAdminOpen} onOpenChange={setCreateAdminOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-admin">
              <UserPlus className="w-4 h-4 mr-2" />
              Create New Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Admin</DialogTitle>
              <DialogDescription>
                Add a new administrator to the system
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={newAdmin.username}
                  onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                  data-testid="input-new-admin-username"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  data-testid="input-new-admin-password"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  data-testid="input-new-admin-email"
                />
              </div>
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={newAdmin.fullName}
                  onChange={(e) => setNewAdmin({ ...newAdmin, fullName: e.target.value })}
                  data-testid="input-new-admin-fullname"
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={newAdmin.role} onValueChange={(value) => setNewAdmin({ ...newAdmin, role: value })}>
                  <SelectTrigger id="role" data-testid="select-new-admin-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal_admin">Normal Admin</SelectItem>
                    <SelectItem value="middle_admin">Middle Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleCreateAdmin}
                disabled={createAdminMutation.isPending}
                data-testid="button-submit-create-admin"
              >
                {createAdminMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Admin"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable columns={userColumns} data={users} />

      <div>
        <h2 className="text-2xl font-semibold mb-4">Pending Documents</h2>
        {pendingDocuments.length > 0 ? (
          <DataTable columns={documentColumns} data={pendingDocuments} />
        ) : (
          <Card className="p-12 text-center border-card-border">
            <p className="text-muted-foreground">No pending documents</p>
          </Card>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
        {activityLogs.length > 0 ? (
          <DataTable columns={activityColumns} data={activityLogs} />
        ) : (
          <Card className="p-12 text-center border-card-border">
            <p className="text-muted-foreground">No recent activity</p>
          </Card>
        )}
      </div>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="glass-card max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Document</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this document
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejectionReason">Rejection Reason</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter the reason for rejection..."
                rows={4}
                data-testid="textarea-rejection-reason"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setRejectDialogOpen(false);
                  setSelectedDocument(null);
                  setRejectionReason("");
                }}
                className="flex-1"
                data-testid="button-cancel-reject"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRejectDocument}
                className="flex-1"
                disabled={rejectDocumentMutation.isPending}
                data-testid="button-confirm-reject"
              >
                {rejectDocumentMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  "Reject Document"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
