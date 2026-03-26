import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import DataTable from "@/components/DataTable";
import { UserPlus, Loader2, Copy, Key, Shield, Users, Globe, AlertTriangle, Trash2 } from "lucide-react";
import CountryMultiSelect from "@/components/CountryMultiSelect";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { AdminUser } from "@shared/schema";

interface AdminCreationProps {
  admin: AdminUser;
}

export default function AdminCreation({ admin }: AdminCreationProps) {
  // Safety check - if admin is not provided, show error
  if (!admin) {
    console.error("[AdminCreation] Admin prop is missing");
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 max-w-md w-full border-destructive/50">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-destructive">Error</h2>
            <p className="text-muted-foreground">
              Admin information is not available. Please refresh the page.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  console.log("[AdminCreation] Component rendering with admin:", {
    id: admin.id,
    username: admin.username,
    role: admin.role
  });

  const { toast } = useToast();
  const [createAdminOpen, setCreateAdminOpen] = useState(false);
  const [credentialsDialogOpen, setCredentialsDialogOpen] = useState(false);
  
  const [newAdmin, setNewAdmin] = useState({
    username: "",
    password: "",
    email: "",
    fullName: "",
    role: "normal_admin" as "super_admin" | "middle_admin" | "normal_admin",
    countries: [] as string[],
  });
  
  const [createdCredentials, setCreatedCredentials] = useState<{
    username: string;
    password: string;
    email: string;
    fullName: string;
    role: string;
    countries?: string[];
  } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<AdminUser | null>(null);

  // Fetch admins list - handle errors gracefully without blocking the page
  const { data: admins = [], isLoading: loadingAdmins, error: adminsError } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/admins"],
    refetchInterval: 60000,
    retry: false,
    // Use custom queryFn to handle 401/403 gracefully
    queryFn: async () => {
      try {
        const res = await fetch("/api/admin/admins", {
          credentials: "include",
        });
        
        // If unauthorized, return empty array instead of throwing
        if (res.status === 401 || res.status === 403) {
          console.warn("[AdminCreation] Not authorized to fetch admins list");
          return [];
        }
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error("[AdminCreation] Failed to load admins:", res.status, errorText);
          return [];
        }
        
        return await res.json();
      } catch (error) {
        console.error("[AdminCreation] Error loading admins:", error);
        // Return empty array instead of throwing - allows page to still render
        return [];
      }
    },
  });
  
  // Show toast notification if there's an error, but don't block the page
  useEffect(() => {
    if (adminsError) {
      const errorMessage = (adminsError as Error)?.message || "Unknown error";
      const isUnauthorized = errorMessage.includes("401") || errorMessage.includes("Unauthorized") || errorMessage.includes("403");
      
      if (isUnauthorized) {
        toast({
          title: "Permission Warning",
          description: "Unable to load admin list. Some features may be limited.",
          variant: "default",
        });
      }
    }
  }, [adminsError, toast]);
  
  // Fetch country assignments for middle admins
  const { data: allCountryAssignments = [] } = useQuery<Array<{ adminId: string; country: string }>>({
    queryKey: ["/api/admin/all-country-assignments"],
    enabled: admins.length > 0,
  });

  const createAdminMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/admin/admins", data);
    },
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/admins"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setCreateAdminOpen(false);
      
      // Store credentials to show in dialog - handle different response structures
      const credentials = response?.credentials || response;
      const username = credentials?.username || newAdmin.username;
      const password = credentials?.password || newAdmin.password;
      
      setCreatedCredentials({
        username: username,
        password: password,
        email: newAdmin.email,
        fullName: newAdmin.fullName,
        role: newAdmin.role,
        countries: response?.countries?.map((c: any) => (typeof c === 'string' ? c : c.country)) || newAdmin.countries || [],
      });
      
      setCredentialsDialogOpen(true);
      
      // Reset form
      setNewAdmin({
        username: "",
        password: "",
        email: "",
        fullName: "",
        role: "normal_admin",
        countries: [],
      });
      
      toast({
        title: "Admin Created",
        description: "New admin has been created successfully",
      });
    },
    onError: (error: any) => {
      console.error("Admin creation error:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to create admin";
      toast({
        title: "Error",
        description: errorMessage,
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
    
    // Validate countries for middle_admin
    if (newAdmin.role === "middle_admin" && newAdmin.countries.length === 0) {
      toast({
        title: "Missing Countries",
        description: "At least one country is required for middle admin",
        variant: "destructive",
      });
      return;
    }
    
    // Prepare data for API
    const dataToSend: any = {
      username: newAdmin.username,
      password: newAdmin.password,
      email: newAdmin.email,
      fullName: newAdmin.fullName,
      role: newAdmin.role,
    };
    
    // Add countries only for middle_admin
    if (newAdmin.role === "middle_admin") {
      dataToSend.countries = newAdmin.countries;
    }
    
    createAdminMutation.mutate(dataToSend);
  };
  
  const copyCredentials = () => {
    if (!createdCredentials) return;
    const text = `Username: ${createdCredentials.username}\nPassword: ${createdCredentials.password}\nEmail: ${createdCredentials.email}\nFull Name: ${createdCredentials.fullName}\nRole: ${createdCredentials.role}${createdCredentials.countries && createdCredentials.countries.length > 0 ? `\nCountries: ${createdCredentials.countries.join(", ")}` : ""}`;
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Credentials copied to clipboard",
    });
  };

  const deleteAdminMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/admin/admins/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/admins"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setDeleteDialogOpen(false);
      setAdminToDelete(null);
      toast({
        title: "Admin Deleted",
        description: "Admin has been deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.message || error?.message || "Failed to delete admin",
        variant: "destructive",
      });
    },
  });

  const handleDeleteClick = (targetAdmin: AdminUser) => {
    // Prevent deleting super admins
    const role = String(targetAdmin.role || "").trim().toLowerCase().replace(/[-\s_]+/g, "_");
    if (role === "super_admin" || role === "superadmin") {
      toast({
        title: "Cannot Delete",
        description: "Super admin accounts cannot be deleted",
        variant: "destructive",
      });
      return;
    }

    // Prevent self-deletion
    if (targetAdmin.id === admin.id) {
      toast({
        title: "Cannot Delete",
        description: "You cannot delete your own account",
        variant: "destructive",
      });
      return;
    }

    setAdminToDelete(targetAdmin);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (adminToDelete) {
      deleteAdminMutation.mutate(adminToDelete.id);
    }
  };

  // Check if current admin is super admin
  const isSuperAdmin = admin?.role === "super_admin" || String(admin?.role || "").trim().toLowerCase().replace(/[-\s_]+/g, "_") === "super_admin";

  // Show warning if there's an error loading admins, but don't block the page
  // Only show this as a toast notification, not blocking the entire component

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
            Admin Creation
          </h1>
          <p className="text-muted-foreground">
            Create and manage admin accounts for the system
          </p>
        </div>
        <Dialog open={createAdminOpen} onOpenChange={setCreateAdminOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <UserPlus className="w-4 h-4 mr-2" />
              Create New Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card max-w-md" onOpenAutoFocus={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle>Create New Admin</DialogTitle>
              <DialogDescription>
                Add a new administrator to the system. Fill in all required fields.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateAdmin();
              }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={newAdmin.username}
                  onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                  placeholder="Enter username"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  placeholder="Enter password"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  placeholder="admin@example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={newAdmin.fullName}
                  onChange={(e) => setNewAdmin({ ...newAdmin, fullName: e.target.value })}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="role">Role *</Label>
                <Select 
                  value={newAdmin.role} 
                  onValueChange={(value: "super_admin" | "middle_admin" | "normal_admin") => {
                    setNewAdmin({ 
                      ...newAdmin, 
                      role: value,
                      countries: value === "middle_admin" ? newAdmin.countries : []
                    });
                  }}
                >
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_admin">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-red-400" />
                        <span>Super Admin</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="middle_admin">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-blue-400" />
                        <span>Middle Admin</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="normal_admin">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-green-400" />
                        <span>Normal Admin</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {newAdmin.role === "super_admin" && "Full system access and can create other admins"}
                  {newAdmin.role === "middle_admin" && "Manages users from assigned countries"}
                  {newAdmin.role === "normal_admin" && "Standard admin with limited permissions"}
                </p>
              </div>
              
              {newAdmin.role === "middle_admin" && (
                <div>
                  <CountryMultiSelect
                    value={newAdmin.countries}
                    onChange={(countries) => setNewAdmin({ ...newAdmin, countries })}
                    label="Assigned Countries *"
                    required
                    placeholder="Select countries for this middle admin..."
                  />
                </div>
              )}
              
              <Button
                type="submit"
                className="w-full"
                disabled={createAdminMutation.isPending}
              >
                {createAdminMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create Admin
                  </>
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Admin List */}
      <Card className="border-primary/30 bg-gradient-to-br from-black/80 to-primary/5 backdrop-blur-xl">
        <div className="p-6 border-b border-primary/20">
          <h2 className="text-2xl font-semibold">All Admins</h2>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage all admin accounts in the system
          </p>
        </div>
        <div className="p-6">
          {loadingAdmins ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <DataTable 
              columns={[
                {
                  key: "username",
                  label: "Username",
                  render: (value: string) => <span className="font-semibold">{value}</span>,
                },
                { key: "email", label: "Email" },
                { key: "fullName", label: "Full Name" },
                {
                  key: "role",
                  label: "Role",
                  render: (value: string) => {
                    const roleColors: Record<string, string> = {
                      super_admin: "bg-red-500/20 text-red-400 border-red-500/30",
                      middle_admin: "bg-blue-500/20 text-blue-400 border-blue-500/30",
                      normal_admin: "bg-green-500/20 text-green-400 border-green-500/30",
                    };
                    return (
                      <Badge variant="outline" className={roleColors[value] || ""}>
                        {value.replace("_", " ").toUpperCase()}
                      </Badge>
                    );
                  },
                },
                {
                  key: "countries",
                  label: "Countries",
                  render: (_: any, row: AdminUser) => {
                    if (row.role !== "middle_admin") return <span className="text-muted-foreground">-</span>;
                    const adminCountries = allCountryAssignments
                      .filter(a => a.adminId === row.id)
                      .map(a => a.country);
                    if (adminCountries.length === 0) return <span className="text-muted-foreground">No countries assigned</span>;
                    return (
                      <div className="flex flex-wrap gap-1">
                        {adminCountries.slice(0, 3).map(country => (
                          <Badge key={country} variant="secondary" className="text-xs">
                            {country}
                          </Badge>
                        ))}
                        {adminCountries.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{adminCountries.length - 3} more
                          </Badge>
                        )}
                      </div>
                    );
                  },
                },
                {
                  key: "enabled",
                  label: "Status",
                  render: (value: boolean) => (
                    <Badge variant={value ? "default" : "secondary"}>
                      {value ? "Enabled" : "Disabled"}
                    </Badge>
                  ),
                },
                ...(isSuperAdmin ? [{
                  key: "actions",
                  label: "Actions",
                  render: (_: any, row: AdminUser) => {
                    const role = String(row.role || "").trim().toLowerCase().replace(/[-\s_]+/g, "_");
                    const isSuperAdminRow = role === "super_admin" || role === "superadmin";
                    const isSelf = row.id === admin.id;
                    
                    if (isSuperAdminRow || isSelf) {
                      return <span className="text-muted-foreground text-sm">-</span>;
                    }
                    
                    return (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClick(row)}
                        disabled={deleteAdminMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    );
                  },
                }] : []),
              ]} 
              data={admins} 
            />
          )}
        </div>
      </Card>

      {/* Credentials Display Dialog */}
      <Dialog open={credentialsDialogOpen} onOpenChange={setCredentialsDialogOpen}>
        <DialogContent className="glass-card max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              Admin Created Successfully
            </DialogTitle>
            <DialogDescription>
              Save these credentials - the password will not be shown again
            </DialogDescription>
          </DialogHeader>
          {createdCredentials && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Username:</span>
                  <span className="font-mono text-sm font-semibold">{createdCredentials.username}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Password:</span>
                  <span className="font-mono text-sm font-semibold text-primary">{createdCredentials.password}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Email:</span>
                  <span className="text-sm">{createdCredentials.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Full Name:</span>
                  <span className="text-sm">{createdCredentials.fullName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Role:</span>
                  <Badge variant="secondary" className="capitalize">
                    {createdCredentials.role.replace("_", " ")}
                  </Badge>
                </div>
                {createdCredentials.countries && createdCredentials.countries.length > 0 && (
                  <div className="pt-2 border-t border-primary/20">
                    <span className="text-sm font-medium text-muted-foreground block mb-2">Assigned Countries:</span>
                    <div className="flex flex-wrap gap-2">
                      {createdCredentials.countries.map((country) => (
                        <Badge key={country} variant="outline" className="text-xs">
                          {country}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={copyCredentials}
                  className="flex-1"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Credentials
                </Button>
                <Button
                  onClick={() => {
                    setCredentialsDialogOpen(false);
                    setCreatedCredentials(null);
                  }}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
              
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <p className="text-xs text-yellow-400 flex items-start gap-2">
                  <Key className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Important: Save these credentials securely. The password cannot be retrieved later.</span>
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Admin Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-black border-primary/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-primary flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Delete Admin?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently delete the admin account. This action cannot be undone.
              {adminToDelete && (
                <span className="block mt-2 text-yellow-400">
                  You are about to delete: <strong>{adminToDelete.username}</strong> ({adminToDelete.fullName})
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteAdminMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteAdminMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteAdminMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Admin
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

