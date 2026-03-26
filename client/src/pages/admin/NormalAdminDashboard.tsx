import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DataTable from "@/components/DataTable";
import StatCard from "@/components/StatCard";
import { FileText, CheckCircle, XCircle, Loader2, Check, X } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { AdminUser, User, Document } from "@shared/schema";

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

interface NormalAdminDashboardProps {
  admin: AdminUser;
}

export default function NormalAdminDashboard({ admin }: NormalAdminDashboardProps) {
  const { toast } = useToast();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: documents = [], isLoading: loadingDocuments } = useQuery<Document[]>({
    queryKey: ["/api/admin/documents"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: activityLogs = [], isLoading: loadingLogs } = useQuery<ActivityLog[]>({
    queryKey: ["/api/admin/activity-logs"],
  });

  const approveDocumentMutation = useMutation({
    mutationFn: async (documentId: string) => {
      return await apiRequest("PATCH", `/api/admin/documents/${documentId}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/activity-logs"] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/activity-logs"] });
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

  const pendingDocuments = documents.filter((doc) => doc.status === "Pending");
  const approvedDocuments = documents.filter((doc) => doc.status === "Verified");
  const rejectedDocuments = documents.filter((doc) => doc.status === "Rejected");
  const myActivityLogs = activityLogs.filter((log) => log.adminId === admin.id);

  const pendingDocumentColumns = [
    {
      key: "userId",
      label: "User",
      render: (_: string, row: Document) => {
        const user = users.find((u) => u.id === row.userId);
        return (
          <div>
            <div className="font-semibold" data-testid={`text-user-${row.id}`}>
              {user?.username || "Unknown"}
            </div>
            <div className="text-sm text-muted-foreground">{user?.email}</div>
          </div>
        );
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
          data-testid="link-document-download"
        >
          View / Download
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

  const processedDocumentColumns = [
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
      key: "status",
      label: "Status",
      render: (value: string) => (
        <Badge variant={value === "Verified" ? "default" : "outline"}>
          {value}
        </Badge>
      ),
    },
    {
      key: "rejectionReason",
      label: "Reason",
      render: (value: string) => value || "-",
    },
    {
      key: "verifiedAt",
      label: "Processed",
      render: (value: Date | null) => (value ? new Date(value).toLocaleDateString() : "-"),
    },
  ];

  const activityColumns = [
    { key: "action", label: "Action" },
    { key: "targetType", label: "Target Type" },
    { key: "details", label: "Details" },
    {
      key: "createdAt",
      label: "Time",
      render: (value: Date) => new Date(value).toLocaleString(),
    },
  ];

  if (loadingDocuments || loadingLogs) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Document Verification</h1>
        <p className="text-muted-foreground">Review and verify user submitted documents</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <StatCard
          title="Pending Documents"
          value={pendingDocuments.length.toString()}
          icon={FileText}
          index={0}
        />
        <StatCard
          title="Approved Today"
          value={approvedDocuments.length.toString()}
          icon={CheckCircle}
          index={1}
        />
        <StatCard
          title="Rejected Today"
          value={rejectedDocuments.length.toString()}
          icon={XCircle}
          index={2}
        />
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Pending Documents</h2>
        {pendingDocuments.length > 0 ? (
          <DataTable columns={pendingDocumentColumns} data={pendingDocuments} />
        ) : (
          <Card className="p-12 text-center border-card-border">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No pending documents to review</p>
          </Card>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Recently Processed Documents</h2>
        {approvedDocuments.length > 0 || rejectedDocuments.length > 0 ? (
          <DataTable
            columns={processedDocumentColumns}
            data={[...approvedDocuments, ...rejectedDocuments].slice(0, 10)}
          />
        ) : (
          <Card className="p-12 text-center border-card-border">
            <p className="text-muted-foreground">No processed documents yet</p>
          </Card>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">My Activity</h2>
        {myActivityLogs.length > 0 ? (
          <DataTable columns={activityColumns} data={myActivityLogs} />
        ) : (
          <Card className="p-12 text-center border-card-border">
            <p className="text-muted-foreground">No activity recorded yet</p>
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
