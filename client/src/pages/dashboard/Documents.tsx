import DataTable from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Upload, Eye, AlertCircle, FileText, X } from "lucide-react";
import { FullPageLoader, InlineLoader } from "@/components/DashboardLoader";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Document } from "@shared/schema";

export default function Documents() {
  const { toast } = useToast();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [, setLocation] = useLocation();

  // Fetch documents with real-time updates
  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
    refetchInterval: false,
    refetchOnWindowFocus: true,
    staleTime: 30000,
  });

  // Check verification status to auto-redirect when verified
  const { data: verificationStatus, refetch: refetchVerificationStatus } = useQuery<{
    isVerified: boolean;
    verifiedCount: number;
    requiredCount: number;
    hasPending: boolean;
  }>({
    queryKey: ["/api/documents/verification-status"],
    refetchInterval: 10000, // Refetch every 10 seconds to catch document status changes
    refetchOnWindowFocus: true,
    staleTime: 0, // Always consider stale to get latest status
  });

  // Auto-redirect to dashboard when verified
  useEffect(() => {
    if (verificationStatus?.isVerified) {
      toast({
        title: "🎉 Verification Complete!",
        description: "Your documents have been verified. Redirecting to dashboard...",
      });
      // Small delay to show success message
      setTimeout(() => {
        setLocation("/dashboard");
      }, 2000);
    }
  }, [verificationStatus?.isVerified, setLocation, toast]);

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (data: { type: string; file: File }) => {
      // Convert file to base64 for storage
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(data.file);
      });

      return apiRequest("POST", "/api/documents", {
        type: data.type,
        fileName: data.file.name,
        fileUrl: base64,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents/verification-status"] });
      toast({
        title: "Success",
        description: "Document uploaded successfully. Awaiting verification.",
      });
      setUploadDialogOpen(false);
      setSelectedFile(null);
      setSelectedDocType("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload document",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File",
        description: "Please upload JPG, PNG, or PDF files only",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 20MB - base64 encoding adds ~33% size, so 20MB raw = ~27MB base64)
    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "File size must be less than 20MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedDocType) {
      toast({
        title: "Missing Information",
        description: "Please select document type and file",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      await uploadMutation.mutateAsync({
        type: selectedDocType,
        file: selectedFile,
      });
    } finally {
      setUploading(false);
    }
  };

  const openUploadDialog = (docType?: string) => {
    if (docType) {
      setSelectedDocType(docType);
    }
    setUploadDialogOpen(true);
  };

  const columns = [
    { 
      key: "type", 
      label: "Type",
      render: (value: string) => (
        <span className="font-semibold">{value}</span>
      ),
    },
    { 
      key: "fileName", 
      label: "Document",
      render: (value: string) => (
        <span className="font-mono text-sm">{value}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => {
        const variant = value === "Verified" ? "default" : value === "Pending" ? "secondary" : "destructive";
        return <Badge variant={variant}>{value}</Badge>;
      },
    },
    { 
      key: "uploadedAt", 
      label: "Uploaded On",
      render: (value: Date) => new Date(value).toLocaleDateString(),
    },
    {
      key: "action",
      label: "Action",
      render: () => (
        <Button variant="ghost" size="sm" data-testid="button-view">
          <Eye className="w-4 h-4" />
        </Button>
      ),
    },
    {
      key: "rejectionReason",
      label: "Reason",
      render: (value: string | null) => value || "-",
    },
  ];

  if (isLoading) {
    return <FullPageLoader text="Loading documents..." />;
  }

  const verifiedDocs = documents.filter((doc) => doc.status === "Verified");
  const pendingDocs = documents.filter((doc) => doc.status === "Pending");
  const rejectedDocs = documents.filter((doc) => doc.status === "Rejected");

  const requiredDocuments = [
    { type: "ID Proof", description: "Government-issued ID (Passport, Driver's License, National ID)" },
  ];

  const isDocVerified = (type: string) => verifiedDocs.some((doc) => doc.type === type);
  const isDocPending = (type: string) => pendingDocs.some((doc) => doc.type === type);
  const isDocRejected = (type: string) => rejectedDocs.some((doc) => doc.type === type);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Documents</h1>
          <p className="text-muted-foreground">
            Upload and manage your verification documents.
          </p>
        </div>
        <Button 
          className="gap-2" 
          data-testid="button-upload"
          onClick={() => openUploadDialog()}
        >
          <Upload className="w-4 h-4" />
          Upload Document
        </Button>
      </div>

      {/* Required Documents */}
      <Card className="p-6 border-card-border">
        <h2 className="text-xl font-semibold mb-4">Required Documents</h2>
        <div className="space-y-4">
          {requiredDocuments.map((doc, index) => {
            const verified = isDocVerified(doc.type);
            const pending = isDocPending(doc.type);
            const rejected = isDocRejected(doc.type);

            return (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold">{doc.type}</h3>
                    {verified && <Badge variant="default">Verified</Badge>}
                    {pending && <Badge variant="secondary">Pending</Badge>}
                    {rejected && <Badge variant="destructive">Rejected</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{doc.description}</p>
                </div>
                {!verified && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    data-testid={`button-upload-${doc.type.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => openUploadDialog(doc.type)}
                  >
                    {rejected ? "Re-upload" : pending ? "Uploaded" : "Upload"}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Info Box */}
      <Card className="p-6 border-card-border border-l-4 border-l-primary">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <h3 className="font-semibold mb-1">Document Verification</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-primary">ID Proof is required</strong> to start trading. Documents are usually verified within 24-48 hours. Please ensure your ID document is:
            </p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
              <li>Clear and readable (not blurry)</li>
              <li>In color (not black and white)</li>
              <li>Not expired (valid government-issued ID)</li>
              <li>Shows your full name and photo clearly</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Documents Table */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Document History</h2>
        {documents.length > 0 ? (
          <DataTable columns={columns} data={documents} />
        ) : (
          <Card className="p-12 text-center border-card-border">
            <p className="text-muted-foreground">No documents uploaded yet.</p>
          </Card>
        )}
      </div>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload your verification document. Accepted formats: JPG, PNG, PDF (max 5MB)
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="docType">Document Type</Label>
              <Select value={selectedDocType} onValueChange={setSelectedDocType}>
                <SelectTrigger id="docType">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ID Proof">ID Proof (Required)</SelectItem>
                  <SelectItem value="Address Proof">Address Proof (Optional)</SelectItem>
                  <SelectItem value="Bank Statement">Bank Statement (Optional)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Select File</Label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("file-input")?.click()}
                  className="justify-start"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {selectedFile ? selectedFile.name : "Choose file..."}
                </Button>
                {selectedFile && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <input
                id="file-input"
                type="file"
                accept="image/jpeg,image/jpg,image/png,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground">
                Supported: JPG, PNG, PDF • Max size: 5MB
              </p>
            </div>

            {selectedFile && (
              <Card className="p-3 bg-muted">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setUploadDialogOpen(false);
                setSelectedFile(null);
                setSelectedDocType("");
              }}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile || !selectedDocType || uploading}
            >
              {uploading ? (
                <>
                  <InlineLoader className="mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
