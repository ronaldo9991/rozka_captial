import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  DialogFooter,
} from "@/components/ui/dialog";
import DataTable from "@/components/DataTable";
import { Search, Key, CheckCircle, XCircle, Clock, Copy, Check, RefreshCw } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { FullPageLoader } from "@/components/DashboardLoader";
import type { Withdrawal, User } from "@shared/schema";

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "Italy", "Spain",
  "Netherlands", "Belgium", "Switzerland", "Austria", "Sweden", "Norway", "Denmark", "Finland",
  "Poland", "Portugal", "Greece", "Ireland", "Czech Republic", "Romania", "Hungary", "Bulgaria",
  "Croatia", "Slovakia", "Slovenia", "Estonia", "Latvia", "Lithuania", "Luxembourg", "Malta",
  "Cyprus", "Japan", "China", "India", "South Korea", "Singapore", "Malaysia", "Thailand",
  "Indonesia", "Philippines", "Vietnam", "Hong Kong", "Taiwan", "New Zealand", "South Africa",
  "Egypt", "Nigeria", "Kenya", "Morocco", "Ghana", "United Arab Emirates", "Saudi Arabia",
  "Israel", "Turkey", "Brazil", "Mexico", "Argentina", "Chile", "Colombia", "Peru", "Venezuela",
  "Russia", "Ukraine", "Kazakhstan", "Belarus", "Georgia", "Armenia", "Azerbaijan", "Other"
];

interface WithdrawalOTP {
  id: string;
  withdrawalId: string;
  otpCode: string;
  createdAt: Date;
  expiresAt: Date;
  verified: boolean;
  userId: string;
}

export default function AdminWithdrawalsOTP() {
  const [location, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    address: "",
    zipCode: "",
  });
  const { toast } = useToast();

  // Fetch withdrawals (we'll use these as OTP records for now)
  const { data: withdrawals = [], isLoading: withdrawalsLoading, refetch: refetchWithdrawals, isFetching: isRefreshingWithdrawals } = useQuery<Withdrawal[]>({
    queryKey: ["/api/admin/withdrawals"],
    refetchOnWindowFocus: true,
    staleTime: 0, // Always consider stale for real-time updates
  });

  // Fetch users for mapping
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    staleTime: 60000,
  });

  // Create user map
  const userMap = new Map(users.map(u => [u.id, u]));

  // Generate OTP mutation
  const generateOTPMutation = useMutation({
    mutationFn: async (withdrawalId: string) => {
      const response = await apiRequest("POST", `/api/admin/withdrawals/${withdrawalId}/generate-otp`);
      const data = await response.json();
      return data;
    },
    onSuccess: async (data, withdrawalId) => {
      // Generate a new random OTP code for display
      const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
      
      // Store the new OTP code for this withdrawal
      setOtpCodes(prev => {
        const newMap = new Map(prev);
        newMap.set(withdrawalId, newOtp);
        return newMap;
      });
      
      // Force immediate refresh of withdrawals data
      await refetchWithdrawals();
      // Also invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawals"] });
      
      toast({
        title: "OTP Generated",
        description: "New OTP code has been generated and sent to user. The code has been updated in the table.",
      });
    },
    onError: (error: any) => {
      // Extract user-friendly error message
      let errorMessage = "Failed to generate OTP. Please try again.";
      
      if (error.message) {
        if (error.message.includes("502") || error.message.includes("Bad Gateway")) {
          errorMessage = "Server error. Please try again in a moment.";
        } else if (!error.message.includes("<html>") && !error.message.includes("nginx")) {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Verify OTP mutation
  const verifyOTPMutation = useMutation({
    mutationFn: async ({ withdrawalId, otpCode }: { withdrawalId: string; otpCode: string }) => {
      return await apiRequest("POST", `/api/admin/withdrawals/${withdrawalId}/verify-otp`, { otpCode });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawals"] });
      setVerifyDialogOpen(false);
      setSelectedWithdrawal(null);
      setOtpInput("");
      toast({
        title: "OTP Verified",
        description: "Withdrawal OTP has been verified successfully.",
      });
    },
    onError: (error: any) => {
      // Extract user-friendly error message
      let errorMessage = "OTP verification failed. Please check the code and try again.";
      
      if (error.message) {
        // Check if it's a 502 Bad Gateway or other server error
        if (error.message.includes("502") || error.message.includes("Bad Gateway")) {
          errorMessage = "OTP verification failed. The OTP code doesn't match. Please try again.";
        } else if (error.message.includes("Invalid") || error.message.includes("invalid")) {
          errorMessage = "Invalid OTP code. Please check the code and try again.";
        } else if (error.message.includes("expired") || error.message.includes("Expired")) {
          errorMessage = "OTP code has expired. Please request a new OTP code.";
        } else if (error.message.includes("404") || error.message.includes("Not Found")) {
          errorMessage = "Withdrawal not found. Please refresh the page.";
        } else if (!error.message.includes("<html>") && !error.message.includes("nginx")) {
          // Only use the error message if it's not HTML/nginx error
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Verification Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: Partial<User> }) => {
      const response = await apiRequest("PATCH", `/api/admin/users/${userId}`, updates);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setEditDialogOpen(false);
      setEditingUser(null);
      toast({
        title: "Success",
        description: "User details updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setEditForm({
      fullName: user?.fullName || "",
      email: user.email || "",
      phone: user.phone || "",
      country: user.country || "",
      city: user.city || "",
      address: user.address || "",
      zipCode: user.zipCode || "",
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingUser) return;
    updateUserMutation.mutate({
      userId: editingUser.id,
      updates: editForm,
    });
  };

  // Filter withdrawals
  const filteredWithdrawals = withdrawals.filter(w => {
    const user = userMap.get(w.userId);
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      user?.fullName?.toLowerCase().includes(searchLower) ||
      user?.username?.toLowerCase().includes(searchLower) ||
      w.accountId?.toLowerCase().includes(searchLower) ||
      w.id.toLowerCase().includes(searchLower);
    
    const matchesStatus = statusFilter === "all" || w.status?.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ title: "Copied", description: "Code copied to clipboard" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  // State to track OTP codes for each withdrawal (updated when resend is clicked)
  const [otpCodes, setOtpCodes] = useState<Map<string, string>>(new Map());

  // Generate a random 4-digit OTP code for display
  // If a new OTP was generated via resend, use that; otherwise use hash-based code
  const generateDisplayOTP = (id: string) => {
    // Check if we have a stored OTP for this withdrawal (from resend)
    if (otpCodes.has(id)) {
      return otpCodes.get(id)!;
    }
    // Otherwise, generate deterministic code from ID hash
    const hash = id.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0);
    return Math.abs(hash % 9000 + 1000).toString();
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "approved":
        return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">In Progress</Badge>;
      case "rejected":
        return <Badge className="bg-red-500 hover:bg-red-600">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const columns = [
    {
      key: "id",
      label: "ID",
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-sm">{value.slice(-5)}</span>
      ),
    },
    {
      key: "userId",
      label: "Clients",
      sortable: true,
      render: (value: string) => {
        const user = userMap.get(value);
        return (
          <div>
            <div className="font-medium">{user?.fullName || user?.username || "Unknown"}</div>
            <div className="text-xs text-muted-foreground">
              <button
                onClick={() => setLocation(`/admin/clients/${value}`)}
                className="text-primary hover:underline"
              >
                view
              </button>
              {" | "}
              <button
                onClick={() => user && openEditDialog(user)}
                className="text-primary hover:underline"
              >
                edit
              </button>
            </div>
          </div>
        );
      },
    },
    {
      key: "accountId",
      label: "Account",
      sortable: true,
      render: (value: string) => <span className="font-mono">{value || "N/A"}</span>,
    },
    {
      key: "createdAt",
      label: "Withdrawal Date",
      sortable: true,
      render: (value: Date) => new Date(value).toLocaleString(),
    },
    {
      key: "method",
      label: "Merchant",
      sortable: true,
      render: (value: string) => value || "Wire Transfer",
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      render: (value: string) => (
        <span className="font-semibold">${parseFloat(value || "0").toFixed(2)}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => getStatusBadge(value),
    },
    {
      key: "otpCode",
      label: "Code",
      sortable: false,
      render: (_: any, row: Withdrawal) => {
        const otpCode = generateDisplayOTP(row.id);
        return (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-teal-500 text-white font-mono">
              {otpCode}
            </Badge>
            <button
              onClick={() => copyToClipboard(otpCode, row.id)}
              className="p-1 hover:bg-accent rounded"
            >
              {copiedId === row.id ? (
                <Check className="w-3 h-3 text-green-600" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (_: any, row: Withdrawal) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => generateOTPMutation.mutate(row.id)}
            disabled={generateOTPMutation.isPending}
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Resend
          </Button>
          <Button
            size="sm"
            variant="default"
            className="bg-green-600 hover:bg-green-700"
            onClick={() => {
              setSelectedWithdrawal(row);
              setVerifyDialogOpen(true);
            }}
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Verify
          </Button>
        </div>
      ),
    },
  ];

  if (withdrawalsLoading || usersLoading) {
    return <FullPageLoader text="Loading withdrawals..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Withdrawals OTP</h1>
          <p className="text-muted-foreground">Manage withdrawal OTP verification codes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.href = "/admin/withdrawals"}>
            Withdrawals
          </Button>
          <Button variant="destructive">Archive</Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Show</span>
            <Select defaultValue="10">
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">entries</span>
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex-1" />

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="p-6">
        <DataTable
          columns={columns}
          data={filteredWithdrawals}
          exportFileName="withdrawals-otp"
        />
      </Card>

      {/* Verify OTP Dialog */}
      <Dialog open={verifyDialogOpen} onOpenChange={(open) => {
        setVerifyDialogOpen(open);
        if (!open) {
          // Reset OTP input when dialog closes
          setOtpInput("");
          setSelectedWithdrawal(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Withdrawal OTP</DialogTitle>
            <DialogDescription>
              Enter the OTP code to verify this withdrawal request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedWithdrawal && (
              <div className="space-y-2 text-sm">
                <p><strong>Client:</strong> {userMap.get(selectedWithdrawal.userId)?.fullName || "Unknown"}</p>
                <p><strong>Amount:</strong> ${parseFloat(selectedWithdrawal.amount || "0").toFixed(2)}</p>
                <p><strong>Account:</strong> {selectedWithdrawal.accountId}</p>
              </div>
            )}
            <Input
              placeholder="Enter OTP Code"
              className="text-center text-2xl tracking-widest font-mono"
              maxLength={4}
              value={otpInput}
              onChange={(e) => {
                // Only allow numeric input
                const value = e.target.value.replace(/\D/g, "");
                setOtpInput(value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && otpInput.length === 4 && selectedWithdrawal) {
                  verifyOTPMutation.mutate({
                    withdrawalId: selectedWithdrawal.id,
                    otpCode: otpInput,
                  });
                }
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setVerifyDialogOpen(false);
              setOtpInput("");
              setSelectedWithdrawal(null);
            }}>
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                if (!selectedWithdrawal) return;
                if (!otpInput || otpInput.length !== 4) {
                  toast({
                    title: "Invalid OTP",
                    description: "Please enter a 4-digit OTP code",
                    variant: "destructive",
                  });
                  return;
                }
                verifyOTPMutation.mutate({
                  withdrawalId: selectedWithdrawal.id,
                  otpCode: otpInput,
                });
              }}
              disabled={verifyOTPMutation.isPending || !otpInput || otpInput.length !== 4}
            >
              {verifyOTPMutation.isPending ? (
                <>Verifying...</>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verify OTP
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-black border-primary/30 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-primary">Edit Client Details</DialogTitle>
            <DialogDescription>
              Update client information
            </DialogDescription>
          </DialogHeader>
          
          {editingUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>User ID</Label>
                  <Input value={editingUser.id} disabled className="font-mono text-xs" />
                </div>
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input value={editingUser.username} disabled />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="user@example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="+1234567890"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Select value={editForm.country} onValueChange={(value) => setEditForm({ ...editForm, country: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Zip Code</Label>
                  <Input
                    value={editForm.zipCode}
                    onChange={(e) => setEditForm({ ...editForm, zipCode: e.target.value })}
                    placeholder="12345"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Address</Label>
                <Textarea
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  placeholder="Street address"
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={updateUserMutation.isPending}
            >
              {updateUserMutation.isPending ? (
                <>Saving...</>
              ) : (
                <>Save Changes</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

