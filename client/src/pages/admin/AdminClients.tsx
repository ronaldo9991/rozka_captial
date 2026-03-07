import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/DataTable";
import { Search, Mail, UserPlus, Loader2, Copy, Check, Eye, Edit, Save, UserCog, Trash2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { User, AdminUser } from "@shared/schema";

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

export default function AdminClients() {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [fundsDialogOpen, setFundsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [isAddingFunds, setIsAddingFunds] = useState(true);
  const [viewEditDialogOpen, setViewEditDialogOpen] = useState(false);
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
  const [impersonatingUserId, setImpersonatingUserId] = useState<string | null>(null);

  // Get current admin to check role for impersonate button
  const { data: admin } = useQuery<AdminUser>({
    queryKey: ["/api/admin/auth/me"],
    retry: false,
    refetchOnWindowFocus: false,
  });

  const { data: users = [], isLoading, refetch: refetchUsers, isFetching: isRefreshingUsers, error: usersError } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Always refetch on mount
    staleTime: 0, // Always consider stale
    retry: 1, // Retry once on failure
    // Handle 401 gracefully - return empty array instead of throwing
    queryFn: async () => {
      try {
        const res = await fetch("/api/admin/users", { credentials: "include" });
        if (res.status === 401) {
          console.warn("[AdminClients] Unauthorized - session may have expired");
          return [];
        }
        if (!res.ok) {
          throw new Error("Failed to fetch users");
        }
        return await res.json();
      } catch (error) {
        console.error("[AdminClients] Error fetching users:", error);
        return [];
      }
    },
  });

  // Debug logging
  useEffect(() => {
    console.log("[AdminClients] Users data:", {
      count: users.length,
      isLoading,
      isRefreshingUsers,
      error: usersError,
      users: users.slice(0, 3).map(u => ({ id: u.id, username: u.username, email: u.email }))
    });
  }, [users.length, isLoading, isRefreshingUsers, usersError]);

  const sendActivationLinkMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest("POST", `/api/admin/users/${userId}/send-activation-link`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Account activation link sent successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send activation link",
        variant: "destructive",
      });
    },
  });

  const impersonateMutation = useMutation({
    mutationFn: async (userId: string) => {
      setImpersonatingUserId(userId); // Set loading state for this specific user
      return await apiRequest("POST", `/api/admin/users/${userId}/impersonate`);
    },
    onSuccess: () => {
      // Invalidate ALL queries to ensure fresh data is loaded
      queryClient.clear(); // Clear all cached queries
      
      toast({
        title: "Impersonation Started",
        description: "You are now viewing as this user. Loading all data...",
      });
      
      // Force a full page reload to ensure all data is fetched fresh
      // This ensures trading accounts, documents, deposits, etc. are all loaded
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 500);
    },
    onError: () => {
      setImpersonatingUserId(null); // Clear loading state on error
      toast({
        title: "Error",
        description: "Failed to impersonate user",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("DELETE", `/api/admin/users/${userId}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: Partial<User> }) => {
      const response = await apiRequest("PATCH", `/api/admin/users/${userId}`, updates);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setViewEditDialogOpen(false);
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

  const openViewEditDialog = (user: User) => {
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
    setViewEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingUser) return;
    updateUserMutation.mutate({
      userId: editingUser.id,
      updates: editForm,
    });
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({
      title: "Copied",
      description: "Copied to clipboard",
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredUsers = users.filter((user) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      user.email?.toLowerCase().includes(search) ||
      user.fullName?.toLowerCase().includes(search) ||
      user.username?.toLowerCase().includes(search) ||
      user.referralId?.toLowerCase().includes(search) ||
      user.country?.toLowerCase().includes(search)
    );
  });

  const columns = [
    {
      key: "id",
      label: "ID",
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs">{value.slice(0, 8)}...</span>
          <button
            onClick={() => copyToClipboard(value, value)}
            className="p-1 hover:bg-accent rounded"
          >
            {copiedId === value ? (
              <Check className="w-3 h-3 text-green-600" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        </div>
      ),
    },
    {
      key: "fullName",
      label: "Name",
      sortable: true,
      render: (value: string, row: User) => (
        <div>
          <div className="font-semibold">{value || row.username}</div>
          {row.email && (
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {row.email}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "referralId",
      label: "Referral ID",
      sortable: true,
      render: (value: string | null) => (
        <div className="flex items-center gap-2">
          {value ? (
            <>
              <span className="font-mono text-sm">{value}</span>
              <button
                onClick={() => copyToClipboard(value, `ref-${value}`)}
                className="p-1 hover:bg-accent rounded"
              >
                {copiedId === `ref-${value}` ? (
                  <Check className="w-3 h-3 text-green-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </>
          ) : (
            <span className="text-muted-foreground text-sm">N/A</span>
          )}
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-1">
          <Mail className="w-3 h-3 text-muted-foreground" />
          <span className="text-sm">{value}</span>
        </div>
      ),
    },
    {
      key: "phone",
      label: "Phone No",
      sortable: true,
      render: (value: string | null) => (
        <span className="text-sm">{value || "N/A"}</span>
      ),
    },
    {
      key: "country",
      label: "Country",
      sortable: true,
      render: (_: any, row: User) => (
        <Badge variant="outline" className={row.country ? "bg-primary/10 text-primary border-primary/30" : ""}>
          {row.country || "N/A"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Member Since",
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
          {value ? "Active" : "Disabled"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (_: any, row: User) => {
        // Check if admin can impersonate (super admin or middle admin)
        const adminRole = admin?.role ? String(admin.role).trim().toLowerCase().replace(/[-\s_]+/g, "_") : "";
        const canImpersonate = adminRole === "super_admin" || adminRole === "superadmin" || 
                              adminRole === "middle_admin" || adminRole === "middleadmin";
        const canDelete = adminRole === "super_admin" || adminRole === "superadmin";
        
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setLocation(`/admin/clients/${row.id}`)}
            >
              <Eye className="w-3 h-3 mr-1" />
              View
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => openViewEditDialog(row)}
            >
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </Button>
            {canImpersonate && (
              <Button
                size="sm"
                variant="outline"
                className="bg-orange-500/10 text-orange-600 border-orange-500/30 hover:bg-orange-500/20"
                onClick={() => {
                  if (confirm(`Are you sure you want to impersonate ${row.fullName || row.username || row.email}?`)) {
                    impersonateMutation.mutate(row.id);
                  }
                }}
                disabled={impersonatingUserId === row.id}
              >
                {impersonatingUserId === row.id ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <UserCog className="w-3 h-3 mr-1" />
                )}
                Impersonate
              </Button>
            )}
            {canDelete && (
              <Button
                size="sm"
                variant="outline"
                className="bg-red-500/10 text-red-600 border-red-500/30 hover:bg-red-500/20"
                onClick={() => {
                  if (confirm(`Are you sure you want to DELETE ${row.fullName || row.username || row.email}? This action cannot be undone and will delete all user data including accounts, deposits, withdrawals, and trading history.`)) {
                    deleteUserMutation.mutate(row.id);
                  }
                }}
                disabled={deleteUserMutation.isPending}
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Delete
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading clients...</p>
      </div>
    );
  }

  // Show error if users failed to load
  if (usersError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-destructive font-semibold">Failed to load clients</p>
        <p className="text-muted-foreground text-sm">
          {usersError instanceof Error ? usersError.message : "Unknown error"}
        </p>
        <Button onClick={() => refetchUsers()}>Retry</Button>
        <p className="text-xs text-muted-foreground mt-4">
          Check browser console (F12) for details
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Clients</h1>
          <p className="text-muted-foreground">Manage all registered clients</p>
        </div>
      </div>

      {/* Search */}
      <Card className="p-4 border-card-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, referral ID, or country..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Clients Table */}
      <Card className="border-card-border">
        {users.length === 0 && !isLoading && (
          <div className="p-4 border-b border-destructive/20 bg-destructive/5">
            <p className="text-destructive text-sm font-semibold">⚠️ No users loaded</p>
            <p className="text-xs text-muted-foreground mt-1">
              API returned {users.length} users. Check browser console (F12) for errors.
            </p>
            <Button size="sm" variant="outline" onClick={() => refetchUsers()} className="mt-2">
              Refresh Data
            </Button>
          </div>
        )}
        <DataTable 
          columns={columns} 
          data={filteredUsers} 
          exportFileName="clients"
          onRefresh={() => refetchUsers()}
          isRefreshing={isRefreshingUsers}
        />
      </Card>

      {/* View/Edit User Dialog */}
      <Dialog open={viewEditDialogOpen} onOpenChange={setViewEditDialogOpen}>
        <DialogContent className="bg-black border-primary/30 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-primary">View & Edit Client Details</DialogTitle>
            <DialogDescription>
              View and update client information
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
                  <Label>Phone Number *</Label>
                  <Input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="+1 234 567 8900"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Country *</Label>
                  <Select
                    value={editForm.country || ""}
                    onValueChange={(value) => setEditForm({ ...editForm, country: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
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
                  <Label>City *</Label>
                  <Input
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    placeholder="New York"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Zip Code</Label>
                  <Input
                    value={editForm.zipCode}
                    onChange={(e) => setEditForm({ ...editForm, zipCode: e.target.value })}
                    placeholder="10001"
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

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label>Referral ID</Label>
                  <Input value={editingUser.referralId || "N/A"} disabled className="font-mono" />
                </div>
                <div className="space-y-2">
                  <Label>Member Since</Label>
                  <Input 
                    value={editingUser.createdAt ? new Date(editingUser.createdAt).toLocaleDateString() : "N/A"} 
                    disabled 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Input 
                    value={editingUser.enabled ? "Active" : "Disabled"} 
                    disabled 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Verified</Label>
                  <Input 
                    value={editingUser.verified ? "Yes" : "No"} 
                    disabled 
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={updateUserMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {updateUserMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

