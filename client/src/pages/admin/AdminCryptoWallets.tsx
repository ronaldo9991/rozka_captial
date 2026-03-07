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
import { Search, Plus, Edit, Bitcoin, Loader2, QrCode, Wallet, CheckCircle2, XCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { FullPageLoader } from "@/components/DashboardLoader";
import { Switch } from "@/components/ui/switch";

interface CryptoWallet {
  id: string;
  cryptoType: string;
  network: string;
  walletAddress: string;
  qrCodeUrl: string | null;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date | null;
}

const CRYPTO_TYPES = [
  { value: "BTC", label: "Bitcoin (BTC)", network: "BTC" },
  { value: "USDT-BEP20", label: "USDT (BEP20)", network: "BEP20" },
  { value: "USDT-TRC20", label: "USDT (TRC20)", network: "TRC20" },
];

export default function AdminCryptoWallets() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<CryptoWallet | null>(null);
  const [walletForm, setWalletForm] = useState({
    cryptoType: "",
    network: "",
    walletAddress: "",
    qrCodeUrl: "",
    enabled: true,
  });
  const [qrCodeFile, setQrCodeFile] = useState<File | null>(null);
  const [qrCodePreview, setQrCodePreview] = useState<string | null>(null);

  // Fetch all crypto wallets
  const { data: wallets = [], isLoading, refetch } = useQuery<CryptoWallet[]>({
    queryKey: ["/api/admin/crypto-wallets"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/crypto-wallets");
      return await response.json();
    },
  });

  // Update wallet mutation
  const updateMutation = useMutation({
    mutationFn: async (data: {
      cryptoType: string;
      network: string;
      walletAddress: string;
      qrCodeUrl?: string | null;
      enabled: boolean;
    }) => {
      return apiRequest("POST", "/api/admin/crypto-wallets", data);
    },
    onSuccess: async () => {
      await refetch();
      toast({
        title: "Success",
        description: "Crypto wallet updated successfully",
      });
      setEditDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update crypto wallet",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setWalletForm({
      cryptoType: "",
      network: "",
      walletAddress: "",
      qrCodeUrl: "",
      enabled: true,
    });
    setQrCodeFile(null);
    setQrCodePreview(null);
    setSelectedWallet(null);
  };

  const handleEdit = (wallet: CryptoWallet) => {
    setSelectedWallet(wallet);
    setWalletForm({
      cryptoType: wallet.cryptoType,
      network: wallet.network,
      walletAddress: wallet.walletAddress,
      qrCodeUrl: wallet.qrCodeUrl || "",
      enabled: wallet.enabled,
    });
    setQrCodePreview(wallet.qrCodeUrl || null);
    setEditDialogOpen(true);
  };

  const handleQrCodeFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File",
        description: "Please upload JPG, PNG, or WEBP images only",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "File size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setQrCodeFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setQrCodePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!walletForm.cryptoType || !walletForm.network || !walletForm.walletAddress) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Convert QR code file to base64 if uploaded
    let qrCodeUrl = walletForm.qrCodeUrl;
    if (qrCodeFile) {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(qrCodeFile);
      });
      qrCodeUrl = base64;
    }

    updateMutation.mutate({
      cryptoType: walletForm.cryptoType,
      network: walletForm.network,
      walletAddress: walletForm.walletAddress,
      qrCodeUrl: qrCodeUrl || null,
      enabled: walletForm.enabled,
    });
  };

  const handleCryptoTypeChange = (value: string) => {
    const crypto = CRYPTO_TYPES.find((c) => c.value === value);
    setWalletForm({
      ...walletForm,
      cryptoType: value,
      network: crypto?.network || "",
    });
  };

  const filteredWallets = wallets.filter((wallet) =>
    wallet.cryptoType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wallet.walletAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wallet.network.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <FullPageLoader />;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Crypto Wallets</h1>
          <p className="text-muted-foreground mt-1">
            Manage cryptocurrency wallet addresses and QR codes
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setEditDialogOpen(true);
          }}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Wallet
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search by crypto type, network, or wallet address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Wallets Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Crypto Type</TableHead>
              <TableHead>Network</TableHead>
              <TableHead>Wallet Address</TableHead>
              <TableHead>QR Code</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWallets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No crypto wallets found
                </TableCell>
              </TableRow>
            ) : (
              filteredWallets.map((wallet) => (
                <TableRow key={wallet.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Bitcoin className="w-4 h-4 text-primary" />
                      <span className="font-medium">{wallet.cryptoType}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{wallet.network}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 max-w-xs">
                      <Wallet className="w-4 h-4 text-muted-foreground" />
                      <span className="font-mono text-xs truncate">
                        {wallet.walletAddress}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {wallet.qrCodeUrl ? (
                      <div className="flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-muted-foreground">Custom</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Auto-generated</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {wallet.enabled ? (
                      <Badge className="bg-green-500/20 text-green-500 border-green-500/50">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Enabled
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="w-3 h-3 mr-1" />
                        Disabled
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(wallet)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Edit/Add Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedWallet ? "Edit Crypto Wallet" : "Add Crypto Wallet"}
            </DialogTitle>
            <DialogDescription>
              {selectedWallet
                ? "Update the wallet address, QR code, and settings"
                : "Create a new cryptocurrency wallet configuration"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Crypto Type */}
            <div className="space-y-2">
              <Label htmlFor="cryptoType">Crypto Type *</Label>
              <Select
                value={walletForm.cryptoType}
                onValueChange={handleCryptoTypeChange}
                disabled={!!selectedWallet}
              >
                <SelectTrigger id="cryptoType">
                  <SelectValue placeholder="Select crypto type" />
                </SelectTrigger>
                <SelectContent>
                  {CRYPTO_TYPES.map((crypto) => (
                    <SelectItem key={crypto.value} value={crypto.value}>
                      {crypto.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Network */}
            <div className="space-y-2">
              <Label htmlFor="network">Network *</Label>
              <Input
                id="network"
                value={walletForm.network}
                onChange={(e) =>
                  setWalletForm({ ...walletForm, network: e.target.value })
                }
                placeholder="BTC, BEP20, TRC20, etc."
                disabled={!!selectedWallet}
              />
            </div>

            {/* Wallet Address */}
            <div className="space-y-2">
              <Label htmlFor="walletAddress">Wallet Address *</Label>
              <Input
                id="walletAddress"
                value={walletForm.walletAddress}
                onChange={(e) =>
                  setWalletForm({ ...walletForm, walletAddress: e.target.value })
                }
                placeholder="Enter wallet address"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                The wallet address where users will send cryptocurrency deposits
              </p>
            </div>

            {/* QR Code Upload */}
            <div className="space-y-2">
              <Label htmlFor="qrCode">QR Code Image (Optional)</Label>
              <div className="space-y-3">
                <Input
                  id="qrCode"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleQrCodeFileSelect}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">
                  Upload a custom QR code image. If not provided, a QR code will be auto-generated from the wallet address.
                </p>
                {qrCodePreview && (
                  <div className="mt-2 p-4 border rounded-lg bg-black/40">
                    <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                    <img
                      src={qrCodePreview}
                      alt="QR Code Preview"
                      className="w-48 h-48 object-contain mx-auto border rounded"
                    />
                  </div>
                )}
                {walletForm.qrCodeUrl && !qrCodeFile && (
                  <div className="mt-2 p-4 border rounded-lg bg-black/40">
                    <p className="text-xs text-muted-foreground mb-2">Current QR Code:</p>
                    <img
                      src={walletForm.qrCodeUrl}
                      alt="Current QR Code"
                      className="w-48 h-48 object-contain mx-auto border rounded"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Enabled Toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="enabled">Enabled</Label>
                <p className="text-xs text-muted-foreground">
                  Enable or disable this wallet for deposits
                </p>
              </div>
              <Switch
                id="enabled"
                checked={walletForm.enabled}
                onCheckedChange={(checked) =>
                  setWalletForm({ ...walletForm, enabled: checked })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={updateMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
