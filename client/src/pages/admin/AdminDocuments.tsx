import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { FileText, CheckCircle, XCircle, Eye, Loader2, Trash2, AlertTriangle } from "lucide-react";
import type { Document, User } from "@shared/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AdminDocumentsProps {
  admin: { role: string };
}

export default function AdminDocuments({ admin }: AdminDocumentsProps) {
  const { toast } = useToast();
  
  // Check if admin is super admin (only super admins can delete documents for legal/security compliance)
  const isSuperAdmin = useMemo(() => {
    if (!admin?.role) return false;
    const role = String(admin.role).trim().toLowerCase().replace(/[-\s_]+/g, "_");
    return role === "super_admin" || role === "superadmin";
  }, [admin?.role]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [viewDocDialogOpen, setViewDocDialogOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [clearStatus, setClearStatus] = useState<"Verified" | "Rejected" | null>(null);

  const { data: documents = [], isLoading: loadingDocs, error: documentsError } = useQuery<Document[]>({
    queryKey: ["/api/admin/documents"],
    refetchInterval: 30000, // Refetch every 30 seconds (reduced frequency for better performance)
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Always refetch on mount
    retry: 2, // Retry 2 times on failure
    retryDelay: 1000, // Wait 1 second between retries
    staleTime: 15000, // Consider data fresh for 15 seconds (reduces unnecessary refetches)
    gcTime: 60000, // Keep in cache for 60 seconds
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    staleTime: 60000, // Cache users for 60 seconds (they don't change as often)
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ id, status, rejectionReason }: { id: string; status: string; rejectionReason?: string }) => {
      return await apiRequest("PATCH", `/api/admin/documents/${id}/verify`, {
        status,
        rejectionReason,
      });
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
      setDialogOpen(false);
      setSelectedDoc(null);
      setRejectionReason("");
      toast({
        title: "Success",
        description: "Document status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update document",
        variant: "destructive",
      });
    },
  });

  const clearDocumentsMutation = useMutation({
    mutationFn: async (status: "Verified" | "Rejected") => {
      return await apiRequest("DELETE", `/api/admin/documents/clear/${status}`);
    },
    onSuccess: (data: any) => {
      // Invalidate all document-related queries
      queryClient.invalidateQueries({ queryKey: ["/api/admin/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      
      // If verified documents were cleared, also invalidate verification status for all users
      // This ensures users' dashboards will refresh and show correct verification status
      if (status === "Verified") {
        // Invalidate verification status queries (this affects user dashboards)
        queryClient.invalidateQueries({ queryKey: ["/api/documents/verification-status"] });
        // Also invalidate user documents queries
        queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      }
      
      setClearDialogOpen(false);
      setClearStatus(null);
      toast({
        title: "Success",
        description: data.message || `Successfully cleared ${data.deletedCount || 0} ${data.status?.toLowerCase() || status.toLowerCase()} documents. ${status === "Verified" ? "Affected users will need to re-upload documents." : ""}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to clear documents",
        variant: "destructive",
      });
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId: string) => {
      return await apiRequest("DELETE", `/api/admin/documents/${documentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setViewDocDialogOpen(false);
      setViewingDoc(null);
      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete document",
        variant: "destructive",
      });
    },
  });

  const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);

  const handleDeleteDocument = (doc: Document) => {
    setDocumentToDelete(doc);
    setDeleteConfirmDialogOpen(true);
  };

  const confirmDeleteDocument = () => {
    if (documentToDelete) {
      deleteDocumentMutation.mutate(documentToDelete.id);
      setDeleteConfirmDialogOpen(false);
      setDocumentToDelete(null);
    }
  };

  const handleClearAll = (status: "Verified" | "Rejected") => {
    setClearStatus(status);
    setClearDialogOpen(true);
  };

  const confirmClear = () => {
    if (clearStatus) {
      clearDocumentsMutation.mutate(clearStatus);
    }
  };

  const handleVerify = (doc: Document) => {
    verifyMutation.mutate({ id: doc.id, status: "Verified" });
  };

  const handleReject = () => {
    if (!selectedDoc) return;
    if (!rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a rejection reason",
        variant: "destructive",
      });
      return;
    }
    verifyMutation.mutate({
      id: selectedDoc.id,
      status: "Rejected",
      rejectionReason,
    });
  };

  const openRejectDialog = (doc: Document) => {
    setSelectedDoc(doc);
    setDialogOpen(true);
  };

  const openViewDialog = (doc: Document) => {
    setViewingDoc(doc);
    setViewDocDialogOpen(true);
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.fullName || user?.email || "Unknown";
  };

  const pendingDocs = documents.filter(d => d.status === "Pending");
  const verifiedDocs = documents.filter(d => d.status === "Verified");
  const rejectedDocs = documents.filter(d => d.status === "Rejected");

  if (loadingDocs) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading documents...</p>
      </div>
    );
  }

  if (documentsError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-6 border-red-500/30 bg-gradient-to-br from-black/80 to-red-500/5">
          <div className="flex flex-col items-center gap-4">
            <AlertTriangle className="w-12 h-12 text-red-400" />
            <div className="text-center">
              <p className="text-red-400 font-semibold mb-2">Error loading documents</p>
              <p className="text-muted-foreground text-sm mb-4">
                {documentsError instanceof Error ? documentsError.message : "Please try refreshing the page"}
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  queryClient.invalidateQueries({ queryKey: ["/api/admin/documents"] });
                }}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                <Loader2 className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 blur-3xl" />
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
          Document Verification
        </h1>
        <p className="text-muted-foreground">Review and verify user identity documents</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="relative p-6 border-yellow-500/30 bg-gradient-to-br from-black/60 to-yellow-500/5 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="text-sm text-muted-foreground mb-1 uppercase tracking-wider">Pending Review</div>
            <div className="text-3xl font-bold text-yellow-400">{pendingDocs.length}</div>
          </div>
        </Card>
        <Card className="relative p-6 border-green-500/30 bg-gradient-to-br from-black/60 to-green-500/5 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="text-sm text-muted-foreground mb-1 uppercase tracking-wider">Verified</div>
            <div className="text-3xl font-bold text-green-400">{verifiedDocs.length}</div>
          </div>
        </Card>
        <Card className="relative p-6 border-red-500/30 bg-gradient-to-br from-black/60 to-red-500/5 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="text-sm text-muted-foreground mb-1 uppercase tracking-wider">Rejected</div>
            <div className="text-3xl font-bold text-red-400">{rejectedDocs.length}</div>
          </div>
        </Card>
      </div>

      {/* Pending Documents */}
      <div>
        <h2 className="text-2xl font-bold text-primary uppercase tracking-wider mb-4">
          Pending Documents ({pendingDocs.length})
        </h2>
        {pendingDocs.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingDocs.map((doc) => (
              <Card key={doc.id} className="relative p-6 border-primary/30 bg-gradient-to-br from-black/80 to-primary/5 backdrop-blur-xl overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-start justify-between">
                    <FileText className="w-8 h-8 text-primary" />
                    <Badge variant="secondary">Pending</Badge>
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">{doc.type}</h3>
                    <p className="text-sm text-muted-foreground">{getUserName(doc.userId)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Uploaded: {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-primary/30"
                      onClick={() => openViewDialog(doc)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleVerify(doc)}
                      disabled={verifyMutation.isPending}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1"
                      onClick={() => openRejectDialog(doc)}
                      disabled={verifyMutation.isPending}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="relative p-12 text-center border-primary/30 bg-black/80 backdrop-blur-xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
            <p className="text-muted-foreground">No pending documents</p>
          </Card>
        )}
      </div>

      {/* Verified Documents */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-green-400 uppercase tracking-wider">
            Verified Documents ({verifiedDocs.length})
          </h2>
          {/* Only super admins can delete documents (legal/security compliance) */}
          {isSuperAdmin && verifiedDocs.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleClearAll("Verified")}
              disabled={clearDocumentsMutation.isPending}
              className="border-green-500/30 text-green-400 hover:bg-green-500/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
        {verifiedDocs.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {verifiedDocs.map((doc) => (
              <Card key={doc.id} className="p-4 border-green-500/30 bg-gradient-to-br from-black/60 to-green-500/5">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{doc.type}</p>
                      <p className="text-xs text-muted-foreground truncate">{getUserName(doc.userId)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-primary/30"
                      onClick={() => openViewDialog(doc)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    {isSuperAdmin && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteDocument(doc)}
                        disabled={deleteDocumentMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Rejected Documents */}
      {rejectedDocs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-red-400 uppercase tracking-wider">
              Rejected Documents ({rejectedDocs.length})
            </h2>
            {/* Only super admins can delete documents (legal/security compliance) */}
            {isSuperAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleClearAll("Rejected")}
                disabled={clearDocumentsMutation.isPending}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rejectedDocs.map((doc) => (
              <Card key={doc.id} className="p-4 border-red-500/30 bg-gradient-to-br from-black/60 to-red-500/5">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <XCircle className="w-5 h-5 text-red-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{doc.type}</p>
                      <p className="text-xs text-muted-foreground truncate">{getUserName(doc.userId)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'N/A'}
                      </p>
                      {doc.rejectionReason && (
                        <p className="text-xs text-red-400 mt-1 truncate" title={doc.rejectionReason}>
                          Reason: {doc.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-primary/30"
                      onClick={() => openViewDialog(doc)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    {isSuperAdmin && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteDocument(doc)}
                        disabled={deleteDocumentMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Document Viewer Dialog */}
      <Dialog open={viewDocDialogOpen} onOpenChange={setViewDocDialogOpen}>
        <DialogContent className="bg-black border-primary/30 max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-primary">
              {viewingDoc?.type} - {viewingDoc?.fileName}
            </DialogTitle>
            <DialogDescription>
              Uploaded by {getUserName(viewingDoc?.userId || "")} on {viewingDoc?.uploadedAt ? new Date(viewingDoc.uploadedAt).toLocaleString() : 'N/A'}
            </DialogDescription>
          </DialogHeader>
          <div className="relative w-full h-[70vh] bg-black/40 rounded-lg overflow-auto flex items-center justify-center">
            {viewingDoc?.fileUrl && (
              <>
                {viewingDoc.fileUrl.includes('application/pdf') || viewingDoc.fileName.toLowerCase().endsWith('.pdf') ? (
                  <embed
                    src={viewingDoc.fileUrl}
                    type="application/pdf"
                    className="w-full h-full"
                  />
                ) : (
                  <img
                    src={viewingDoc.fileUrl}
                    alt={viewingDoc.fileName}
                    className="max-w-full max-h-full object-contain"
                  />
                )}
              </>
            )}
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setViewDocDialogOpen(false)}>
              Close
            </Button>
            {/* Show action buttons only for pending documents */}
            {viewingDoc?.status === "Pending" && (
              <>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    if (viewingDoc) {
                      handleVerify(viewingDoc);
                      setViewDocDialogOpen(false);
                    }
                  }}
                  disabled={verifyMutation.isPending}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (viewingDoc) {
                      openRejectDialog(viewingDoc);
                      setViewDocDialogOpen(false);
                    }
                  }}
                  disabled={verifyMutation.isPending}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </>
            )}
            {/* Show delete button for verified/rejected documents (super admin only) */}
            {isSuperAdmin && viewingDoc && (viewingDoc.status === "Verified" || viewingDoc.status === "Rejected") && (
              <Button
                variant="destructive"
                onClick={() => {
                  if (viewingDoc) {
                    handleDeleteDocument(viewingDoc);
                  }
                }}
                disabled={deleteDocumentMutation.isPending}
              >
                {deleteDocumentMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-black border-primary/30">
          <DialogHeader>
            <DialogTitle className="text-primary">Reject Document</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this document.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="border-primary/30 bg-black/40"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={verifyMutation.isPending || !rejectionReason.trim()}
            >
              {verifyMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Rejecting...</>
              ) : (
                <>Reject Document</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Single Document Confirmation Dialog */}
      <AlertDialog open={deleteConfirmDialogOpen} onOpenChange={setDeleteConfirmDialogOpen}>
        <AlertDialogContent className="bg-black border-primary/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-primary flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              Delete Document?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              <span className="block mb-2 text-red-400 font-semibold">
                ⚠️ WARNING: This document will be permanently deleted.
              </span>
              {documentToDelete && (
                <>
                  <p className="mb-2">
                    <strong>Type:</strong> {documentToDelete.type}
                  </p>
                  <p className="mb-2">
                    <strong>User:</strong> {getUserName(documentToDelete.userId)}
                  </p>
                  <p className="mb-2">
                    <strong>Status:</strong> {documentToDelete.status}
                  </p>
                  {documentToDelete.status === "Verified" && (
                    <span className="block mt-2 text-yellow-400">
                      This is a verified document - a legal record that may be required for compliance.
                    </span>
                  )}
                  {documentToDelete.status === "Rejected" && (
                    <span className="block mt-2 text-yellow-400">
                      This rejected document record is kept for security purposes.
                    </span>
                  )}
                </>
              )}
              <span className="block mt-4 text-red-400 font-semibold">
                This action cannot be undone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteDocumentMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteDocument}
              disabled={deleteDocumentMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteDocumentMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Document
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear All Confirmation Dialog */}
      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent className="bg-black border-primary/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-primary flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              Clear All {clearStatus} Documents?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              <span className="block mb-2 text-red-400 font-semibold">
                ⚠️ WARNING: Documents are legal records kept for security and compliance purposes.
              </span>
              This will permanently delete all {clearStatus?.toLowerCase()} documents. This action cannot be undone.
              {clearStatus === "Verified" && verifiedDocs.length > 0 && (
                <span className="block mt-2 text-yellow-400">
                  You are about to delete {verifiedDocs.length} verified document{verifiedDocs.length !== 1 ? "s" : ""}. These are legal records that may be required for compliance.
                </span>
              )}
              {clearStatus === "Rejected" && rejectedDocs.length > 0 && (
                <span className="block mt-2 text-yellow-400">
                  You are about to delete {rejectedDocs.length} rejected document{rejectedDocs.length !== 1 ? "s" : ""}. These records are kept for security purposes.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={clearDocumentsMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmClear}
              disabled={clearDocumentsMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {clearDocumentsMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Clearing...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

