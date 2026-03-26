import { useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Route, Switch } from "wouter";
import { Loader2, Shield } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdminSidebar from "@/components/AdminSidebar";
import ErrorBoundary from "@/components/ErrorBoundary";
import AdminDashboardOverview from "./AdminDashboardOverview";
import AdminClients from "./AdminClients";
import ViewClient from "./ViewClient";
import AdminCountries from "./AdminCountries";
import LiveAccounts from "./LiveAccounts";
import IBAccounts from "./IBAccounts";
import ChampionAccounts from "./ChampionAccounts";
import NDBAccounts from "./NDBAccounts";
import SocialTradingAccounts from "./SocialTradingAccounts";
import BonusShiftingAccounts from "./BonusShiftingAccounts";
import AdminDeposits from "./AdminDeposits";
import AdminWithdrawals from "./AdminWithdrawals";
import AdminAccounts from "./AdminAccounts";
import AdminFundTransfer from "./AdminFundTransfer";
import AdminInternalTransfer from "./AdminInternalTransfer";
import AdminExternalTransfer from "./AdminExternalTransfer";
import AdminReferrals from "./AdminReferrals";
import AdminCommissions from "./AdminCommissions";
import AdminSupport from "./AdminSupport";
import AdminLogs from "./AdminLogs";
import AdminDocuments from "./AdminDocuments";
import AdminCreation from "./AdminCreation";
import AdminCryptoWallets from "./AdminCryptoWallets";
import AdminIBCommissions from "./AdminIBCommissions";
import AdminWithdrawalsOTP from "./AdminWithdrawalsOTP";
import AdminTopUp from "./AdminTopUp";
import AdminTopupCards from "./AdminTopupCards";
import AdminIBCBWallets from "./AdminIBCBWallets";
import AdminReports from "./AdminReports";
import AdminMT5 from "./AdminMT5";
import SuperAdminDashboard from "./SuperAdminDashboard";
import MiddleAdminDashboard from "./MiddleAdminDashboard";
import NormalAdminDashboard from "./NormalAdminDashboard";
import type { AdminUser } from "@shared/schema";

// Constants moved outside component to prevent recreation on every render
const NORMAL_ADMIN_ALLOWED_ROUTES = ["/admin/documents", "/admin/support", "/admin/dashboard"] as const;

export default function AdminDashboard() {
  const [location, setLocation] = useLocation();
  
  // Use refs to prevent multiple redirects - CRITICAL for preventing infinite loops
  const redirectingRef = useRef(false);
  const lastRedirectRef = useRef<string | null>(null);
  const lastLocationRef = useRef<string>("");
  const processedLocationRef = useRef<string>("");

  interface AdminWithAttempts extends AdminUser {
    loginAttempts?: number;
    canAccessDashboard?: boolean;
  }

  const { data: adminData, isLoading, error } = useQuery<AdminWithAttempts>({
    queryKey: ["/api/admin/auth/me"],
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes to reduce API calls
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    onError: (err) => {
      if (process.env.NODE_ENV === "development") {
        console.error("[AdminDashboard] Auth error:", err);
      }
    },
  });

  // Single login attempt grants immediate access - no need to check canAccessDashboard
  // Admin is authenticated if adminData exists

  const admin = adminData;

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS - Rules of Hooks
  // Memoize admin role calculations to prevent infinite loops
  const isNormalAdmin = useMemo(() => {
    if (!admin?.role) return false;
    const adminRoleRaw = String(admin.role || "").trim();
    const adminRoleLower = adminRoleRaw.toLowerCase();
    const adminRoleNormalized = adminRoleLower.replace(/[-\s_]+/g, "_");
    
    return adminRoleNormalized === "normal_admin" || 
           adminRoleNormalized === "normaladmin" ||
           adminRoleLower === "normal admin" ||
           (adminRoleLower.includes("normal") && adminRoleLower.includes("admin"));
  }, [admin?.role]);
  
  // Create safe admin object with defaults - MUST be before any returns
  const safeAdminForSidebar: AdminUser = useMemo(() => {
    if (!admin) {
      return {
        id: "",
        username: "Admin",
        email: "",
        fullName: null,
        role: "normal_admin",
        enabled: true,
        createdAt: new Date(),
      } as AdminUser;
    }
    
    try {
      return {
        id: admin?.id ?? "",
        username: admin?.username ?? "Admin",
        email: admin?.email ?? "",
        fullName: (admin as any)?.fullName ?? null,
        role: admin?.role ?? "normal_admin",
        enabled: admin?.enabled ?? true,
        createdAt: admin?.createdAt ?? new Date(),
      } as AdminUser;
    } catch (e) {
      console.error("[AdminDashboard] Error creating safe admin:", e);
      return {
        id: "",
        username: "Admin",
        email: "",
        fullName: null,
        role: "normal_admin",
        enabled: true,
        createdAt: new Date(),
      } as AdminUser;
    }
  }, [admin]);

  // Handle redirects in useEffect with ref guards - prevents infinite loops
  // CRITICAL: Track location changes to prevent loops
  useEffect(() => {
    const currentLocation = location;
    
    // Skip if we've already processed this exact location state
    if (processedLocationRef.current === currentLocation && 
        processedLocationRef.current === lastLocationRef.current &&
        !isLoading) {
      return;
    }
    
    lastLocationRef.current = currentLocation;

    // Don't do anything while loading
    if (isLoading) {
      redirectingRef.current = false;
      return;
    }

    // Prevent multiple redirects
    if (redirectingRef.current) {
      return;
    }

    const currentLastRedirect = lastRedirectRef.current;

    // Redirect to login if not authenticated
    if (error || !admin) {
      if (currentLocation !== "/signin" && currentLastRedirect !== "/signin") {
        redirectingRef.current = true;
        lastRedirectRef.current = "/signin";
        processedLocationRef.current = currentLocation;
        window.location.href = "/signin";
        return;
      }
      processedLocationRef.current = currentLocation;
      return;
    }

    // Reset redirect flag if we have admin and were previously redirecting to login
    if (admin && currentLastRedirect === "/signin") {
      redirectingRef.current = false;
      lastRedirectRef.current = null;
    }

    // Redirect from base admin route
    if (currentLocation === "/admin" || currentLocation === "/admin/") {
      const targetRoute = isNormalAdmin ? "/admin/documents" : "/admin/dashboard";
      if (currentLastRedirect !== targetRoute) {
        redirectingRef.current = true;
        lastRedirectRef.current = targetRoute;
        processedLocationRef.current = currentLocation;
        window.location.href = targetRoute;
        return;
      }
    }

    // Redirect normal admin from restricted routes
    if (isNormalAdmin) {
      const isAllowedRoute = NORMAL_ADMIN_ALLOWED_ROUTES.some(route => currentLocation.startsWith(route));
      if (!isAllowedRoute && 
          currentLocation !== "/signin" && 
          currentLocation !== "/admin" && 
          currentLocation !== "/admin/" &&
          currentLocation !== "/admin/documents" &&
          currentLastRedirect !== "/admin/documents") {
        redirectingRef.current = true;
        lastRedirectRef.current = "/admin/documents";
        processedLocationRef.current = currentLocation;
        window.location.href = "/admin/documents";
        return;
      }
    }

    // Mark location as processed if we're on a valid route
    if (admin) {
      if (!isNormalAdmin) {
        redirectingRef.current = false;
        processedLocationRef.current = currentLocation;
      } else {
        const isAllowedRoute = NORMAL_ADMIN_ALLOWED_ROUTES.some(route => currentLocation.startsWith(route));
        if (isAllowedRoute) {
          redirectingRef.current = false;
          processedLocationRef.current = currentLocation;
        }
      }
    }
  }, [isLoading, error, admin?.id, location, isNormalAdmin]); // Only depend on admin.id, not entire admin object
  
  // Render loading/error states - but keep component structure consistent
  // This prevents React error #310 (hooks order changes)
  const renderContent = () => {
    // Show loading state while checking authentication
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
          <Loader2 className="w-12 h-12 animate-spin text-primary" data-testid="loader-admin-auth" />
        </div>
      );
    }

    // Show error state if not authenticated and not redirecting
    if (error || !admin) {
      if (location === "/signin") {
        return (
          <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
            <Card className="max-w-md w-full p-6 border-red-500/30 bg-gradient-to-br from-black/80 to-red-500/5">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-red-400 mb-2">Authentication Error</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    {error instanceof Error ? error.message : "Failed to authenticate. Please try logging in again."}
                  </p>
                  <Button onClick={() => { window.location.href = "/signin"; }} className="w-full">
                    Go to Login
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        );
      }
      // Show loading while redirecting
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      );
    }

    // Main dashboard content
    const style = {
      "--sidebar-width": "20rem",
    };

    return (
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AdminSidebar admin={safeAdminForSidebar} />
          <main className="flex-1 overflow-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-6 bg-gradient-to-br from-background via-accent/5 to-background">
            <div className="max-w-[1280px] mx-auto">
            {/* Show access denied for normal admin on restricted routes */}
            {isNormalAdmin && !NORMAL_ADMIN_ALLOWED_ROUTES.some(route => location.startsWith(route)) && location !== "/admin" && location !== "/admin/" && (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
                  <p className="text-muted-foreground mb-4">
                    Normal Admin can only access Pending Documents and Support Ticket sections.
                  </p>
                  <Button onClick={() => setLocation("/admin/documents")}>
                    Go to Pending Documents
                  </Button>
                </div>
              </div>
            )}
            {(!isNormalAdmin || NORMAL_ADMIN_ALLOWED_ROUTES.some(route => location.startsWith(route)) || location.startsWith("/admin/topup-cards") || location.startsWith("/admin/crypto-wallets") || location.startsWith("/admin/ib-commissions")) && (
            <Switch>
              {/* IB Commissions - Must be early to avoid route conflicts - Exact path match */}
              <Route path="/admin/ib-commissions">
                {() => {
                  // IB Commissions is Super Admin only
                  const safeAdmin = admin || safeAdminForSidebar;
                  
                  if (!safeAdmin) {
                    return (
                      <div className="flex items-center justify-center min-h-[60vh]">
                        <Loader2 className="w-12 h-12 animate-spin text-primary" />
                      </div>
                    );
                  }
                  
                  // Check if super admin - use same logic as sidebar
                  const adminRoleRaw = String(safeAdmin?.role || "").trim();
                  const adminRoleLower = adminRoleRaw.toLowerCase();
                  const adminRole = adminRoleLower.replace(/[-\s_]+/g, "_");
                  const isSuperAdmin = adminRole === "super_admin" || 
                                      adminRole === "superadmin" ||
                                      adminRoleLower === "super admin" ||
                                      (adminRoleLower.includes("super") && adminRoleLower.includes("admin") && !adminRoleLower.includes("middle") && !adminRoleLower.includes("normal"));
                  
                  if (!isSuperAdmin) {
                    return (
                      <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                          <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                          <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
                          <p className="text-muted-foreground mb-4">
                            Only Super Admins can access IB Commission management.
                          </p>
                          <p className="text-sm text-muted-foreground mb-4">
                            Your role: <Badge variant="outline">{safeAdmin.role || "Admin"}</Badge>
                          </p>
                          <Button onClick={() => setLocation("/admin/dashboard")}>
                            Go to Dashboard
                          </Button>
                        </div>
                      </div>
                    );
                  }
                  
                  return <AdminIBCommissions />;
                }}
              </Route>
              {/* Crypto Wallets - Must be early to avoid route conflicts - Exact path match */}
              <Route path="/admin/crypto-wallets">
                {() => {
                  // Crypto Wallets is Super Admin only
                  const safeAdmin = admin || safeAdminForSidebar;
                  
                  if (!safeAdmin) {
                    return (
                      <div className="flex items-center justify-center min-h-[60vh]">
                        <Loader2 className="w-12 h-12 animate-spin text-primary" />
                      </div>
                    );
                  }
                  
                  // Check if super admin - use same logic as sidebar
                  const adminRoleRaw = String(safeAdmin?.role || "").trim();
                  const adminRoleLower = adminRoleRaw.toLowerCase();
                  const adminRole = adminRoleLower.replace(/[-\s_]+/g, "_");
                  const isSuperAdmin = adminRole === "super_admin" || 
                                      adminRole === "superadmin" ||
                                      adminRoleLower === "super admin" ||
                                      (adminRoleLower.includes("super") && adminRoleLower.includes("admin") && !adminRoleLower.includes("middle") && !adminRoleLower.includes("normal"));
                  
                  if (!isSuperAdmin) {
                    return (
                      <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                          <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                          <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
                          <p className="text-muted-foreground mb-4">
                            Only Super Admins can access Crypto Wallets management.
                          </p>
                          <p className="text-sm text-muted-foreground mb-4">
                            Your role: <Badge variant="outline">{safeAdmin.role || "Admin"}</Badge>
                          </p>
                          <Button onClick={() => setLocation("/admin/dashboard")}>
                            Go to Dashboard
                          </Button>
                        </div>
                      </div>
                    );
                  }
                  
                  return <AdminCryptoWallets />;
                }}
              </Route>
              {/* Topup Cards - Must be early to avoid route conflicts - Exact path match */}
              <Route path="/admin/topup-cards">
                {() => {
                  // Topup Cards is Super Admin only
                  const safeAdmin = admin || safeAdminForSidebar;
                  
                  if (!safeAdmin) {
                    return (
                      <div className="flex items-center justify-center min-h-[60vh]">
                        <Loader2 className="w-12 h-12 animate-spin text-primary" />
                      </div>
                    );
                  }
                  
                  // Check if super admin - use same logic as sidebar
                  const adminRoleRaw = String(safeAdmin?.role || "").trim();
                  const adminRoleLower = adminRoleRaw.toLowerCase();
                  const adminRole = adminRoleLower.replace(/[-\s_]+/g, "_");
                  const isSuperAdmin = adminRole === "super_admin" || 
                                      adminRole === "superadmin" ||
                                      adminRoleLower === "super admin" ||
                                      (adminRoleLower.includes("super") && adminRoleLower.includes("admin") && !adminRoleLower.includes("middle") && !adminRoleLower.includes("normal"));
                  
                  console.log("[AdminDashboard] Topup Cards Route - Role check:", {
                    raw: adminRoleRaw,
                    lower: adminRoleLower,
                    normalized: adminRole,
                    isSuperAdmin,
                    adminId: safeAdmin?.id
                  });
                  
                  if (!isSuperAdmin) {
                    return (
                      <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                          <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                          <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
                          <p className="text-muted-foreground mb-4">
                            Only Super Admins can access Topup Cards management.
                          </p>
                          <p className="text-sm text-muted-foreground mb-4">
                            Your role: <Badge variant="outline">{safeAdmin.role || "Admin"}</Badge>
                          </p>
                          <Button onClick={() => setLocation("/admin/dashboard")}>
                            Go to Dashboard
                          </Button>
                        </div>
                      </div>
                    );
                  }
                  
                  console.log("[AdminDashboard] Rendering AdminTopupCards component");
                  return <AdminTopupCards />;
                }}
              </Route>
              <Route path="/admin/dashboard">
                <AdminDashboardOverview admin={admin} />
              </Route>
              {/* Account type pages with explicit paths */}
              <Route path="/admin/accounts/live">{() => <LiveAccounts />}</Route>
              <Route path="/admin/accounts/ib">{() => <IBAccounts />}</Route>
              <Route path="/admin/accounts/champion">{() => <ChampionAccounts />}</Route>
              <Route path="/admin/accounts/ndb">{() => <NDBAccounts />}</Route>
              <Route path="/admin/accounts/social-trading">{() => <SocialTradingAccounts />}</Route>
              <Route path="/admin/accounts/bonus-shifting">{() => <BonusShiftingAccounts />}</Route>
              <Route path="/admin/accounts">{() => <AdminAccounts />}</Route>
              <Route path="/admin/clients/:id">
                {(params: any) => {
                  // Extract userId from params - wouter passes params as object with route param names as keys
                  const userId = params?.id;
                  console.log("[AdminDashboard] ViewClient route - params:", params, "extracted userId:", userId);
                  
                  if (!userId) {
                    console.error("[AdminDashboard] No userId found in route params");
                    return (
                      <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                          <p className="text-destructive mb-4">Invalid client ID</p>
                          <Button onClick={() => setLocation("/admin/clients")} variant="outline">
                            Back to Clients
                          </Button>
                        </div>
                      </div>
                    );
                  }
                  
                  console.log("[AdminDashboard] Rendering ViewClient with userId:", userId);
                  return <ViewClient userId={userId} />;
                }}
              </Route>
              <Route path="/admin/clients">
                <AdminClients />
              </Route>
              <Route path="/admin/mt5">
                <AdminMT5 />
              </Route>
              <Route path="/admin/countries">
                <AdminCountries />
              </Route>
              <Route path="/admin/documents">
                {() => {
                  if (isNormalAdmin) {
                    return <AdminDocuments admin={admin} />;
                  }
                  return <AdminDocuments admin={admin} />;
                }}
              </Route>
              <Route path="/admin/deposits">
                {() => {
                  if (isNormalAdmin) {
                    return (
                      <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                          <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                          <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
                          <p className="text-muted-foreground mb-4">
                            Normal Admin can only access Pending Documents and Support Ticket sections.
                          </p>
                          <Button onClick={() => setLocation("/admin/documents")}>
                            Go to Pending Documents
                          </Button>
                        </div>
                      </div>
                    );
                  }
                  return <AdminDeposits />;
                }}
              </Route>
              <Route path="/admin/withdrawals">
                <AdminWithdrawals />
              </Route>
              <Route path="/admin/withdrawals-otp">
                <AdminWithdrawalsOTP />
              </Route>
              <Route path="/admin/topup">
                <AdminTopUp />
              </Route>
              <Route path="/admin/ib-cb-wallets">
                <AdminIBCBWallets />
              </Route>
              <Route path="/admin/reports">
                <AdminReports />
              </Route>
              <Route path="/admin/reports/deposits">
                <AdminReports />
              </Route>
              <Route path="/admin/reports/withdrawals">
                <AdminReports />
              </Route>
              <Route path="/admin/reports/topup">
                <AdminReports />
              </Route>
              <Route path="/admin/fund-transfer">
                <AdminFundTransfer />
              </Route>
              <Route path="/admin/fund-transfer/internal">
                <AdminInternalTransfer />
              </Route>
              <Route path="/admin/fund-transfer/external">
                <AdminExternalTransfer />
              </Route>
              <Route path="/admin/referrals">
                <AdminReferrals />
              </Route>
              <Route path="/admin/commissions">
                <AdminCommissions />
              </Route>
              <Route path="/admin/crypto-wallets">
                <AdminCryptoWallets />
              </Route>
              <Route path="/admin/support">
                <AdminSupport />
              </Route>
              <Route path="/admin/logs">
                <AdminLogs />
              </Route>
              <Route path="/admin/create-admins">
                {(() => {
                  // Use safeAdminForSidebar to prevent any undefined errors
                  const safeAdmin = admin || safeAdminForSidebar;
                  console.log("[AdminDashboard] Create Admins Route - Admin:", safeAdmin);
                  
                  if (!safeAdmin) {
                    console.log("[AdminDashboard] No admin object, showing loader");
                    return (
                      <div className="flex items-center justify-center min-h-[60vh]">
                        <Loader2 className="w-12 h-12 animate-spin text-primary" />
                      </div>
                    );
                  }

                  // Normalize role check - handle various formats
                  const adminRoleRaw = String(safeAdmin?.role || "").trim();
                  const adminRoleLower = adminRoleRaw.toLowerCase();
                  const adminRole = adminRoleLower.replace(/[-\s_]+/g, "_");
                  const isSuperAdmin = adminRole === "super_admin" || 
                                      adminRole === "superadmin" ||
                                      adminRoleLower === "super admin" ||
                                      (adminRoleLower.includes("super") && adminRoleLower.includes("admin") && !adminRoleLower.includes("middle") && !adminRoleLower.includes("normal"));
                  
                  console.log("[AdminDashboard] Role check:", {
                    raw: adminRoleRaw,
                    lower: adminRoleLower,
                    normalized: adminRole,
                    isSuperAdmin,
                    adminId: safeAdmin?.id
                  });
                  
                  if (isSuperAdmin) {
                    console.log("[AdminDashboard] Rendering AdminCreation component");
                    return <AdminCreation admin={safeAdmin} />;
                  }
                  
                  console.log("[AdminDashboard] Not super admin, showing access denied");
                  return (
                    <div className="flex items-center justify-center min-h-[60vh]">
                      <Card className="p-8 max-w-md w-full border-destructive/50">
                        <div className="text-center space-y-4">
                          <Shield className="w-16 h-16 mx-auto text-destructive/70" />
                          <h2 className="text-2xl font-bold text-destructive">Access Denied</h2>
                          <p className="text-muted-foreground">
                            Only Super Administrators can create admin accounts.
                          </p>
                          <p className="text-sm text-muted-foreground mt-4">
                            Your current role: <Badge variant="outline">{admin.role || "Admin"}</Badge>
                          </p>
                          <Button
                            onClick={() => setLocation("/admin/dashboard")}
                            variant="outline"
                            className="mt-4"
                          >
                            Go to Dashboard
                          </Button>
                        </div>
                      </Card>
                    </div>
                  );
                })()}
              </Route>
              <Route path="/admin">
                <AdminDashboardOverview admin={admin} />
              </Route>
              {/* Default fallback - show dashboard overview instead of 404 */}
              <Route>{() => {
                // If normal admin and not on allowed route, show access denied
                if (isNormalAdmin && !NORMAL_ADMIN_ALLOWED_ROUTES.some(route => location.startsWith(route))) {
                  return (
                    <div className="flex items-center justify-center min-h-[400px]">
                      <div className="text-center">
                        <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
                        <p className="text-muted-foreground mb-4">
                          Normal Admin can only access Pending Documents and Support Ticket sections.
                        </p>
                        <Button onClick={() => setLocation("/admin/documents")}>
                          Go to Pending Documents
                        </Button>
                      </div>
                    </div>
                  );
                }
                // Default: show dashboard overview
                return <AdminDashboardOverview admin={admin} />;
              }}</Route>
            </Switch>
            )}
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  };

  // Always return the same component structure - prevents hook order issues
  return renderContent();
}
