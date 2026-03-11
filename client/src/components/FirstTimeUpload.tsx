import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Shield, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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

export default function FirstTimeUpload() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState("ID Proof");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

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
        title: "✅ Document Uploaded!",
        description: "Your document has been uploaded successfully. Please wait for verification (24-48 hours).",
      });
      setUploadDialogOpen(false);
      setSelectedFile(null);
      // Redirect to documents page after upload
      setTimeout(() => {
        setLocation("/dashboard/documents");
      }, 1500);
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload document. Please try again.",
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
        title: "Invalid File Type",
        description: "Please upload JPG, PNG, or PDF files only",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 20MB)
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

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-[calc(100vh-200px)] flex items-center justify-center p-6"
      >
        <Card className="relative max-w-3xl w-full p-8 md:p-12 border-primary/30 bg-gradient-to-br from-black/80 to-primary/10 backdrop-blur-xl overflow-hidden">
          {/* Gold accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
          
          <div className="relative z-10 space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="flex justify-center"
              >
                <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center">
                  <Upload className="w-12 h-12 text-primary" />
                </div>
              </motion.div>

              <div>
                <h1 className="text-4xl font-bold text-primary mb-3 uppercase tracking-wider">
                  Welcome to Rozka Capitals!
                </h1>
                <p className="text-xl text-muted-foreground">
                  Complete your account verification to get started
                </p>
              </div>
            </div>

            {/* Instructions */}
            <Card className="p-6 bg-black/60 border-primary/20">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary font-bold text-lg">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Upload Your ID Proof</h3>
                    <p className="text-muted-foreground text-sm">
                      Upload a clear photo or scan of your government-issued ID (Passport, Driver's License, or National ID).
                      This is required to verify your identity and comply with regulations.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary font-bold text-lg">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Wait for Verification</h3>
                    <p className="text-muted-foreground text-sm">
                      Our compliance team will review your document within 24-48 hours. You'll receive a notification once verified.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary font-bold text-lg">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Start Trading</h3>
                    <p className="text-muted-foreground text-sm">
                      Once verified, you'll have full access to your dashboard and can start trading immediately.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Requirements */}
            <Card className="p-6 bg-black/60 border-primary/20">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Document Requirements
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span>Accepted formats: JPG, PNG, PDF</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span>Maximum file size: 20MB</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span>Document must be clear and readable</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span>All information must be visible</span>
                </div>
              </div>
            </Card>

            {/* Upload Button */}
            <div className="flex justify-center">
              <Button
                onClick={() => setUploadDialogOpen(true)}
                className="neon-gold text-lg font-bold py-6 px-12 text-lg"
                size="lg"
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload ID Proof Now
              </Button>
            </div>

            {/* Security Note */}
            <div className="text-center text-xs text-muted-foreground space-y-2 pt-4 border-t border-primary/20">
              <div className="flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Your documents are encrypted and stored securely</span>
              </div>
              <p className="text-primary/80">
                We use bank-level encryption to protect your personal information
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload ID Proof</DialogTitle>
            <DialogDescription>
              Please select your document type and upload a clear photo or scan of your ID.
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
              <input
                id="file"
                type="file"
                accept="image/jpeg,image/jpg,image/png,application/pdf"
                onChange={handleFileSelect}
                className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              {selectedFile && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                  <FileText className="w-4 h-4" />
                  <span>{selectedFile.name}</span>
                  <span className="text-xs">
                    ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setUploadDialogOpen(false);
                setSelectedFile(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || !selectedDocType || uploading}
              className="neon-gold"
            >
              {uploading ? (
                <>
                  <Upload className="w-4 h-4 mr-2 animate-pulse" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}




