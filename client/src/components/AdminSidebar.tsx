import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Home,
  Users,
  FileText,
  Wallet,
  Activity,
  Shield,
  LogOut,
  Download,
  ArrowUpDown,
  CreditCard,
  MessageSquare,
  Archive,
  Settings,
  Globe,
  Bitcoin,
  Folder,
  ChevronDown,
  Key,
  DollarSign,
  BarChart,
  ChevronRight,
} from "lucide-react";
import Logo from "./Logo";
import { useLocation } from "wouter";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import type { AdminUser } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface AdminSidebarProps {
  admin: AdminUser | undefined | null;
}

interface AdminStats {
  pendingDeposits: number;
  pendingWithdrawals: number;
  pendingDocuments: number;
  openTickets: number;
  totalUsers?: number;
}

interface AccountsStats {
  liveAccounts: number;
  ibAccounts: number;
  championAccounts: number;
  ndbAccounts: number;
  socialTradingAccounts: number;
  bonusShiftingAccounts: number;
}

export default function AdminSidebar({ admin }: AdminSidebarProps) {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  // Create a completely safe admin object with defaults using useMemo to prevent re-creation
  // NEVER access admin properties directly - always use safeAdmin
  const safeAdmin: AdminUser = useMemo(() => {
    // If admin is null/undefined, return default object immediately
    if (!admin) {
      return {
        id: "",
        username: "Admin",
        email: "",
        password: "",
        fullName: "",
        role: "normal_admin",
        enabled: true,
        createdAt: new Date(),
        createdBy: null,
      } as AdminUser;
    }
    
    // Safely extract properties using optional chaining
    // Store admin in a local variable to prevent React from accessing it during render
    const adminObj = admin;
    
    try {
      // Extract all properties safely
      const adminId = adminObj?.id ?? "";
      const adminUsername = adminObj?.username ?? "Admin";
      const adminEmail = adminObj?.email ?? "";
      // Use bracket notation to safely access fullName
      const adminFullName = (adminObj && typeof adminObj === 'object' && 'fullName' in adminObj) 
        ? (adminObj as any).fullName ?? null 
        : null;
      const adminRole = adminObj?.role ?? "normal_admin";
      const adminEnabled = adminObj?.enabled ?? true;
      const adminCreatedAt = adminObj?.createdAt ?? new Date();
      
      return {
        id: adminId,
        username: adminUsername,
        email: adminEmail,
        password: (adminObj as any)?.password || "",
        fullName: adminFullName || "",
        role: adminRole,
        enabled: adminEnabled,
        createdAt: adminCreatedAt,
        createdBy: (adminObj as any)?.createdBy || null,
      } as AdminUser;
    } catch (e) {
      console.error("[AdminSidebar] Error creating safe admin:", e);
      return {
        id: "",
        username: "Admin",
        email: "",
        password: "",
        fullName: "",
        role: "normal_admin",
        enabled: true,
        createdAt: new Date(),
        createdBy: null,
      } as AdminUser;
    }
  }, [admin]);

  // Debug: Log admin role to console
  console.log("[AdminSidebar] Admin role:", safeAdmin?.role, "Admin object:", safeAdmin);

  // Fetch stats for badges
  const { data: stats } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    // Handle 401 gracefully
    queryFn: async () => {
      try {
        const res = await fetch("/api/admin/stats", { credentials: "include" });
        if (res.status === 401) {
          return null;
        }
        if (!res.ok) {
          throw new Error("Failed to fetch stats");
        }
        return await res.json();
      } catch (error) {
        console.error("[AdminSidebar] Error fetching stats:", error);
        return null;
      }
    },
  });

  // Fetch account stats for Accounts section - real-time updates
  const { data: accountStats } = useQuery<AccountsStats>({
    queryKey: ["/api/admin/accounts/stats"],
    refetchInterval: false, // Disabled - only refresh on window focus
    refetchOnWindowFocus: true,
    staleTime: 60000, // Cache for 60 seconds
    // Handle 401 gracefully
    queryFn: async () => {
      try {
        const res = await fetch("/api/admin/accounts/stats", { credentials: "include" });
        if (res.status === 401) {
          return null;
        }
        if (!res.ok) {
          throw new Error("Failed to fetch accounts stats");
        }
        return await res.json();
      } catch (error) {
        console.error("[AdminSidebar] Error fetching accounts stats:", error);
        return null;
      }
    },
  });

  // Fetch fund transfer stats for Fund Transfer section - real-time updates
  const { data: transferStats } = useQuery<{ internalTransfers: number; externalTransfers: number }>({
    queryKey: ["/api/admin/fund-transfers/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
    refetchOnWindowFocus: true,
    staleTime: 0, // Always consider data stale for real-time updates
  });
  
  const internalTransfers = transferStats?.internalTransfers ?? 0;
  const externalTransfers = transferStats?.externalTransfers ?? 0;

  // State for Accounts section expansion
  const [accountsOpen, setAccountsOpen] = useState(true);
  // State for Fund Transfer section expansion
  const [fundTransferOpen, setFundTransferOpen] = useState(true);

  // Compute menu items - ensure it's reactive to admin changes using useMemo
  const menuItems = useMemo(() => {
    const baseItems = [
      { title: "Dashboard", icon: Home, url: "/admin/dashboard", badge: null, disabled: false },
      { title: "Clients", icon: Users, url: "/admin/clients", badge: null, disabled: false },
      { title: "MT5 Accounts", icon: Key, url: "/admin/mt5", badge: null, disabled: false },
      { title: "Pending Documents", icon: FileText, url: "/admin/documents", badge: stats?.pendingDocuments, disabled: false },
      { title: "Deposits", icon: Download, url: "/admin/deposits", badge: stats?.pendingDeposits, disabled: false },
      { title: "Withdrawals", icon: ArrowUpDown, url: "/admin/withdrawals", badge: stats?.pendingWithdrawals, disabled: false },
      { title: "Withdrawals OTP", icon: Key, url: "/admin/withdrawals-otp", badge: null, disabled: false },
      { title: "TopUp", icon: DollarSign, url: "/admin/topup", badge: null, disabled: false },
      { title: "IB CB Wallets", icon: CreditCard, url: "/admin/ib-cb-wallets", badge: null, disabled: false },
      { title: "Commissions", icon: Wallet, url: "/admin/commissions", badge: null, disabled: false },
      { title: "Support", icon: MessageSquare, url: "/admin/support", badge: stats?.openTickets, disabled: false },
      { title: "Reports", icon: BarChart, url: "/admin/reports", badge: null, disabled: false },
      { title: "Logs", icon: Activity, url: "/admin/logs", badge: null, disabled: false },
    ];

    // Use safeAdmin which is always defined with defaults
    // Normalize role check - handle various formats
    const adminRoleRaw = String(safeAdmin.role || "").trim();
    const adminRoleLower = adminRoleRaw.toLowerCase();
    const adminRoleNormalized = adminRoleLower.replace(/[-\s_]+/g, "_");
    
    // Check multiple variations: "super_admin", "superadmin", "super-admin", "Super Admin", etc.
    const isSuperAdmin = adminRoleNormalized === "super_admin" || 
                        adminRoleNormalized === "superadmin" ||
                        adminRoleLower === "super admin" ||
                        (adminRoleLower.includes("super") && adminRoleLower.includes("admin") && !adminRoleLower.includes("middle") && !adminRoleLower.includes("normal"));
    
    // Check if normal admin
    const isNormalAdmin = adminRoleNormalized === "normal_admin" || 
                         adminRoleNormalized === "normaladmin" ||
                         adminRoleLower === "normal admin" ||
                         (adminRoleLower.includes("normal") && adminRoleLower.includes("admin"));
    
    // Check if middle admin
    const isMiddleAdmin = adminRoleNormalized === "middle_admin" || 
                         adminRoleNormalized === "middleadmin" ||
                         adminRoleLower === "middle admin" ||
                         (adminRoleLower.includes("middle") && adminRoleLower.includes("admin"));
    
    console.log("[AdminSidebar] Admin role check:", {
      adminRoleNormalized,
      adminRoleLower,
      adminRoleRaw,
      rawRole: safeAdmin.role,
      typeofRole: typeof safeAdmin.role,
      isSuperAdmin,
      isNormalAdmin,
      isMiddleAdmin,
      adminId: safeAdmin.id,
      adminEmail: safeAdmin.email,
      adminUsername: safeAdmin.username,
    });
    
    // For Normal Admin: Only show Dashboard, Pending Documents, and Support Ticket
    if (isNormalAdmin) {
      const normalAdminItems = [
        { title: "Dashboard", icon: Home, url: "/admin/dashboard", badge: null, disabled: false },
        { title: "Pending Documents", icon: FileText, url: "/admin/documents", badge: stats?.pendingDocuments, disabled: false },
        { title: "Support", icon: MessageSquare, url: "/admin/support", badge: stats?.openTickets, disabled: false },
      ];
      console.log("[AdminSidebar] Normal admin - showing only Dashboard, Pending Documents and Support");
      return normalAdminItems;
    }
    
    // For Middle Admin and Super Admin: Show full menu
    // Always add Create Admins menu item
    const items = [...baseItems];
    
    // For super admins: enabled, no badge
    // For non-super admins: disabled, with badge
    const createAdminsItem = { 
      title: "Create Admins", 
      icon: Shield, 
      url: "/admin/create-admins", 
      badge: null,
      disabled: !isSuperAdmin
    };
    
    // Insert Create Admins right after Dashboard for visibility
    items.splice(1, 0, createAdminsItem);
    
    // Add Countries right after Create Admins
    const countriesItem = {
      title: "Countries",
      icon: Globe,
      url: "/admin/countries",
      badge: null,
      disabled: false,
    };
    items.splice(2, 0, countriesItem);
    
    // Add Topup Cards (Super Admin only) after Countries
    if (isSuperAdmin) {
      const topupCardsItem = {
        title: "Topup Cards",
        icon: CreditCard,
        url: "/admin/topup-cards",
        badge: null,
        disabled: false,
      };
      items.splice(3, 0, topupCardsItem);
      
      // Add Crypto Wallets (Super Admin only) after Topup Cards
      const cryptoWalletsItem = {
        title: "Crypto Wallets",
        icon: Bitcoin,
        url: "/admin/crypto-wallets",
        badge: null,
        disabled: false,
      };
      items.splice(4, 0, cryptoWalletsItem);
      
      // Add IB Commissions (Super Admin only) after Crypto Wallets
      const ibCommissionsItem = {
        title: "IB Commissions",
        icon: DollarSign,
        url: "/admin/ib-commissions",
        badge: null,
        disabled: false,
      };
      items.splice(5, 0, ibCommissionsItem);
    }
    
    console.log("[AdminSidebar] Added Create Admins and Countries for role:", adminRoleNormalized);
    
    return items;
  }, [safeAdmin, safeAdmin.role, stats]);

  const handleLogout = async () => {
    try {
      // Clear query cache first to prevent errors during logout
      queryClient.clear();
      
      // Attempt logout API call
      try {
        await apiRequest("POST", "/api/admin/auth/logout");
      } catch (apiError) {
        // Even if API call fails, we still want to log out locally
        console.warn("Logout API call failed, but proceeding with local logout:", apiError);
      }
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      
      // Use window.location for a hard redirect to ensure clean state
      window.location.href = "/signin";
    } catch (error) {
      console.error("Logout error:", error);
      // Even on error, redirect to login to prevent stuck state
      toast({
        title: "Logged out",
        description: "You have been logged out",
      });
      window.location.href = "/signin";
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    // Normalize role for comparison
    const normalizedRole = String(role || "").trim().toLowerCase().replace(/[-\s_]+/g, "_");
    if (normalizedRole === "super_admin" || normalizedRole === "superadmin") return "default";
    if (normalizedRole === "middle_admin" || normalizedRole === "middleadmin") return "secondary";
    return "outline";
  };

  const getRoleLabel = (role: string) => {
    // Normalize role for comparison
    const normalizedRole = String(role || "").trim().toLowerCase().replace(/[-\s_]+/g, "_");
    if (normalizedRole === "super_admin" || normalizedRole === "superadmin") return "Super Admin";
    if (normalizedRole === "middle_admin" || normalizedRole === "middleadmin") return "Middle Admin";
    return "Admin";
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "AD";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Check if normal admin (for conditional rendering of Accounts and Fund Transfer)
  const isNormalAdmin = useMemo(() => {
    if (!safeAdmin.role) return false;
    const adminRoleRaw = String(safeAdmin.role || "").trim();
    const adminRoleLower = adminRoleRaw.toLowerCase();
    const adminRoleNormalized = adminRoleLower.replace(/[-\s_]+/g, "_");
    
    return adminRoleNormalized === "normal_admin" || 
           adminRoleNormalized === "normaladmin" ||
           adminRoleLower === "normal admin" ||
           (adminRoleLower.includes("normal") && adminRoleLower.includes("admin"));
  }, [safeAdmin?.role]);

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-card-border">
        <div className="flex items-center gap-3 mb-3">
          <Logo />
        </div>
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border-2 border-primary">
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                       {(() => {
                         try {
                           if (!safeAdmin) return "AD";
                           const nameValue = (safeAdmin?.fullName ?? safeAdmin?.username ?? "AD");
                           return getInitials(nameValue);
                         } catch (e) {
                           console.error("[AdminSidebar] Error getting initials:", e);
                           return "AD";
                         }
                       })()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate" data-testid="text-admin-name">
                       {(() => {
                         try {
                           if (!safeAdmin) return "Admin";
                           return (safeAdmin?.fullName ?? safeAdmin?.username ?? "Admin");
                         } catch (e) {
                           console.error("[AdminSidebar] Error getting admin name:", e);
                           return "Admin";
                         }
                       })()}
            </div>
                     <Badge variant={getRoleBadgeVariant(safeAdmin?.role ?? "")} className="text-xs" data-testid="badge-admin-role">
                       {getRoleLabel(safeAdmin?.role ?? "")}
            </Badge>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin Portal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Dashboard and Clients first, then Accounts section */}
              {menuItems.filter(item => item.title === "Dashboard" || item.title === "Clients").map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild={!item.disabled}
                    disabled={item.disabled}
                    isActive={location === item.url || location.startsWith(item.url + "/")}
                    data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                    className={item.disabled ? "opacity-50 cursor-not-allowed" : ""}
                  >
                    <a
                      href={item.url}
                      className="flex items-center justify-between w-full"
                      onClick={(e) => {
                        e.preventDefault();
                        setLocation(item.url);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </div>
                      {item.title === "Clients" && stats?.totalUsers !== undefined && (
                        <Badge className="bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs px-2.5 py-0.5 font-semibold min-w-[50px] text-center ml-auto">
                          {(stats.totalUsers ?? 0).toLocaleString()}
                        </Badge>
                      )}
                      {item.title !== "Clients" && item.badge !== null && item.badge !== undefined && item.badge > 0 && (
                        <Badge variant="destructive" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Accounts Section - Expandable - Right after Dashboard - Hidden for Normal Admin */}
              {!isNormalAdmin && (
              <SidebarMenuItem>
                <Collapsible open={accountsOpen} onOpenChange={setAccountsOpen}>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="w-full justify-between hover:bg-accent/50">
                      <div className="flex items-center gap-2">
                        <Folder className="w-4 h-4 text-[#FF8C00]" />
                        <span className="text-[#FF8C00] font-medium">Accounts</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {accountStats && (
                          <Badge className="bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs px-2.5 py-0.5 font-semibold min-w-[50px] text-center">
                            {(
                              (accountStats.liveAccounts ?? 0) +
                              (accountStats.ibAccounts ?? 0) +
                              (accountStats.championAccounts ?? 0) +
                              (accountStats.ndbAccounts ?? 0) +
                              (accountStats.socialTradingAccounts ?? 0) +
                              (accountStats.bonusShiftingAccounts ?? 0)
                            ).toLocaleString()}
                          </Badge>
                        )}
                        {accountsOpen ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                    <div className="ml-6 mt-1 space-y-0.5">
                      <div className={`flex items-center justify-between w-full px-2 py-1.5 rounded-md hover:bg-accent/30 text-sm cursor-pointer transition-colors ${
                        location === "/admin/accounts/live" ? "bg-accent/50" : ""
                      }`}
                        onClick={() => setLocation("/admin/accounts/live")}
                      >
                        <span className="text-gray-700 dark:text-gray-300">Live Accounts</span>
                        <Badge className="bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs px-2.5 py-0.5 font-semibold min-w-[50px] text-center">
                          {(accountStats?.liveAccounts ?? 0).toLocaleString()}
                        </Badge>
                      </div>
                      <div className={`flex items-center justify-between w-full px-2 py-1.5 rounded-md hover:bg-accent/30 text-sm cursor-pointer transition-colors ${
                        location === "/admin/accounts/ib" ? "bg-accent/50" : ""
                      }`}
                        onClick={() => setLocation("/admin/accounts/ib")}
                      >
                        <span className="text-gray-700 dark:text-gray-300">IB Accounts</span>
                        <Badge className="bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs px-2.5 py-0.5 font-semibold min-w-[50px] text-center">
                          {(accountStats?.ibAccounts ?? 0).toLocaleString()}
                        </Badge>
                      </div>
                      <div className={`flex items-center justify-between w-full px-2 py-1.5 rounded-md hover:bg-accent/30 text-sm cursor-pointer transition-colors ${
                        location === "/admin/accounts/champion" ? "bg-accent/50" : ""
                      }`}
                        onClick={() => setLocation("/admin/accounts/champion")}
                      >
                        <span className="text-gray-700 dark:text-gray-300">Champion Accounts</span>
                        <Badge className="bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs px-2.5 py-0.5 font-semibold min-w-[50px] text-center">
                          {(accountStats?.championAccounts ?? 0).toLocaleString()}
                        </Badge>
                      </div>
                      <div className={`flex items-center justify-between w-full px-2 py-1.5 rounded-md hover:bg-accent/30 text-sm cursor-pointer transition-colors ${
                        location === "/admin/accounts/ndb" ? "bg-accent/50" : ""
                      }`}
                        onClick={() => setLocation("/admin/accounts/ndb")}
                      >
                        <span className="text-gray-700 dark:text-gray-300">NDB Accounts</span>
                        <Badge className="bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs px-2.5 py-0.5 font-semibold min-w-[50px] text-center">
                          {(accountStats?.ndbAccounts ?? 0).toLocaleString()}
                        </Badge>
                      </div>
                      <div className={`flex items-center justify-between w-full px-2 py-1.5 rounded-md hover:bg-accent/30 text-sm cursor-pointer transition-colors ${
                        location === "/admin/accounts/social-trading" ? "bg-accent/50" : ""
                      }`}
                        onClick={() => setLocation("/admin/accounts/social-trading")}
                      >
                        <span className="text-gray-700 dark:text-gray-300">Social Trading Accounts</span>
                        <Badge className="bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs px-2.5 py-0.5 font-semibold min-w-[50px] text-center">
                          {(accountStats?.socialTradingAccounts ?? 0).toLocaleString()}
                        </Badge>
                      </div>
                      <div className={`flex items-center justify-between w-full px-2 py-1.5 rounded-md hover:bg-accent/30 text-sm cursor-pointer transition-colors ${
                        location === "/admin/accounts/bonus-shifting" ? "bg-accent/50" : ""
                      }`}
                        onClick={() => setLocation("/admin/accounts/bonus-shifting")}
                      >
                        <span className="text-gray-700 dark:text-gray-300">Bonus Shifting Accounts</span>
                        <Badge className="bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs px-2.5 py-0.5 font-semibold min-w-[50px] text-center">
                          {(accountStats?.bonusShiftingAccounts ?? 0).toLocaleString()}
                        </Badge>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
              )}

              {/* Fund Transfer Section - Expandable - Hidden for Normal Admin */}
              {!isNormalAdmin && (
              <SidebarMenuItem>
                <Collapsible open={fundTransferOpen} onOpenChange={setFundTransferOpen}>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="w-full justify-between hover:bg-accent/50">
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-[#FF8C00]" />
                        <span className="text-[#FF8C00] font-medium">Fund Transfer</span>
                      </div>
                      {fundTransferOpen ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                    <div className="ml-6 mt-1 space-y-0.5">
                      <div className={`flex items-center justify-between w-full px-2 py-1.5 rounded-md hover:bg-accent/30 text-sm cursor-pointer transition-colors ${
                        location === "/admin/fund-transfer/internal" ? "bg-accent/50" : ""
                      }`}
                        onClick={() => setLocation("/admin/fund-transfer/internal")}
                      >
                        <span className="text-gray-700 dark:text-gray-300">Internal Transfer</span>
                        <Badge className="bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs px-2.5 py-0.5 font-semibold min-w-[50px] text-center">
                          {internalTransfers.toLocaleString()}
                        </Badge>
                      </div>
                      <div className={`flex items-center justify-between w-full px-2 py-1.5 rounded-md hover:bg-accent/30 text-sm cursor-pointer transition-colors ${
                        location === "/admin/fund-transfer/external" ? "bg-accent/50" : ""
                      }`}
                        onClick={() => setLocation("/admin/fund-transfer/external")}
                      >
                        <span className="text-gray-700 dark:text-gray-300">External Transfer</span>
                        <Badge className="bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs px-2.5 py-0.5 font-semibold min-w-[50px] text-center">
                          {externalTransfers.toLocaleString()}
                        </Badge>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
              )}

              {/* Other menu items (excluding Dashboard and Clients which are rendered above Accounts) */}
              {menuItems
                .filter((item) => item.title !== "Dashboard" && item.title !== "Clients")
                .map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild={!item.disabled}
                    disabled={item.disabled}
                    isActive={location === item.url || location.startsWith(item.url + "/")}
                    data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                    className={item.disabled ? "opacity-50 cursor-not-allowed" : ""}
                  >
                    {item.disabled ? (
                      <div 
                        className="flex items-center justify-between w-full cursor-not-allowed opacity-50"
                        onClick={(e) => {
                          e.preventDefault();
                          toast({
                            title: "Access Restricted",
                            description: "This feature is only available for Super Administrators.",
                            variant: "destructive",
                          });
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                          <Badge variant="outline" className="ml-1 text-xs">Super Admin Only</Badge>
                        </div>
                        {item.badge !== null && item.badge !== undefined && item.badge > 0 && (
                          <Badge variant="destructive" className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <a 
                        href={item.url} 
                        className="flex items-center justify-between w-full"
                        onClick={(e) => {
                          // Use wouter navigation for proper client-side routing
                          e.preventDefault();
                          console.log("[AdminSidebar] Navigating to:", item.title, "URL:", item.url, "Role:", safeAdmin.role, "Disabled:", item.disabled);
                          setLocation(item.url);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </div>
                        {item.badge !== null && item.badge !== undefined && item.badge > 0 && (
                          <Badge variant="destructive" className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </a>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-card-border">
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={handleLogout}
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
