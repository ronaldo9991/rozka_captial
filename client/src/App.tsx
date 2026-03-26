import { lazy, Suspense } from "react";
import { Switch, Route, Router, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ScrollToTop from "@/components/ScrollToTop";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { PageLoadingSkeleton } from "@/components/ui/loading-skeleton";
import ErrorBoundary from "@/components/ErrorBoundary";

// Lazy load all pages for code splitting
const NotFound = lazy(() => import("@/pages/not-found"));
const Home = lazy(() => import("@/pages/Home"));
const About = lazy(() => import("@/pages/About"));
const Forex = lazy(() => import("@/pages/Forex"));
const Contact = lazy(() => import("@/pages/Contact"));
const Complaints = lazy(() => import("@/pages/Complaints"));
const SignIn = lazy(() => import("@/pages/SignIn"));
const SignUp = lazy(() => import("@/pages/SignUp"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));

// New Public Pages
const IntroducingBroker = lazy(() => import("@/pages/IntroducingBroker"));
const DepositsWithdrawals = lazy(() => import("@/pages/DepositsWithdrawals"));
const TradingContest = lazy(() => import("@/pages/TradingContest"));
const ButtonShowcase = lazy(() => import("@/pages/ButtonShowcase"));

// Forex Sub-Pages
const WhatIsForex = lazy(() => import("@/pages/WhatIsForex"));
const ForexAdvantages = lazy(() => import("@/pages/ForexAdvantages"));
const ForexPedia = lazy(() => import("@/pages/ForexPedia"));
const DepositBonus = lazy(() => import("@/pages/DepositBonus"));
const NoDepositBonus = lazy(() => import("@/pages/NoDepositBonus"));

// Dashboard Pages
const DashboardLayout = lazy(() => import("@/pages/dashboard/DashboardLayout"));
const DashboardHome = lazy(() => import("@/pages/dashboard/DashboardHome"));
const Documents = lazy(() => import("@/pages/dashboard/Documents"));
const TradingAccounts = lazy(() => import("@/pages/dashboard/TradingAccounts"));
const Deposit = lazy(() => import("@/pages/dashboard/Deposit"));
const Withdraw = lazy(() => import("@/pages/dashboard/Withdraw"));
const TradingHistory = lazy(() => import("@/pages/dashboard/TradingHistory"));
const Profile = lazy(() => import("@/pages/dashboard/Profile"));
const Support = lazy(() => import("@/pages/dashboard/Support"));
const Downloads = lazy(() => import("@/pages/dashboard/Downloads"));
const InternalTransfer = lazy(() => import("@/pages/dashboard/InternalTransfer"));
const ExternalTransfer = lazy(() => import("@/pages/dashboard/ExternalTransfer"));
const IBAccount = lazy(() => import("@/pages/dashboard/IBAccount"));

// Admin Pages
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminLogin = lazy(() => import("@/pages/admin/AdminLogin"));
const SecureAdminLogin = lazy(() => import("@/pages/admin/SecureAdminLogin"));

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/forex" component={Forex} />
      <Route path="/contact" component={Contact} />
      <Route path="/complaints" component={Complaints} />
      <Route path="/signin" component={SignIn} />
      <Route path="/signup" component={SignUp} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      
      {/* Admin Routes - Login pages (MUST be before all other admin routes) */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/secure-login" component={SecureAdminLogin} />
      
      {/* New Public Pages */}
      <Route path="/introducing-broker" component={IntroducingBroker} />
      <Route path="/deposits-withdrawals" component={DepositsWithdrawals} />
      <Route path="/trading-contest" component={TradingContest} />
      <Route path="/button-showcase" component={ButtonShowcase} />
      
      {/* Forex Sub-Pages */}
      <Route path="/what-is-forex" component={WhatIsForex} />
      <Route path="/forex-advantages" component={ForexAdvantages} />
      <Route path="/forexpedia" component={ForexPedia} />
      <Route path="/deposit-bonus" component={DepositBonus} />
      <Route path="/no-deposit-bonus" component={NoDepositBonus} />
      
      <Route path="/dashboard">
        <DashboardLayout>
          <DashboardHome />
        </DashboardLayout>
      </Route>
      <Route path="/dashboard/documents">
        <DashboardLayout>
          <Documents />
        </DashboardLayout>
      </Route>
      <Route path="/dashboard/accounts">
        <DashboardLayout>
          <TradingAccounts />
        </DashboardLayout>
      </Route>
      <Route path="/dashboard/deposit">
        <DashboardLayout>
          <Deposit />
        </DashboardLayout>
      </Route>
      <Route path="/dashboard/withdraw">
        <DashboardLayout>
          <Withdraw />
        </DashboardLayout>
      </Route>
      <Route path="/dashboard/history">
        <DashboardLayout>
          <TradingHistory />
        </DashboardLayout>
      </Route>
      <Route path="/dashboard/profile">
        <DashboardLayout>
          <Profile />
        </DashboardLayout>
      </Route>
      <Route path="/dashboard/support">
        <DashboardLayout>
          <Support />
        </DashboardLayout>
      </Route>
      <Route path="/dashboard/downloads">
        <DashboardLayout>
          <Downloads />
        </DashboardLayout>
      </Route>
      <Route path="/dashboard/internal-transfer">
        <DashboardLayout>
          <InternalTransfer />
        </DashboardLayout>
      </Route>
      <Route path="/dashboard/external-transfer">
        <DashboardLayout>
          <ExternalTransfer />
        </DashboardLayout>
      </Route>
      <Route path="/dashboard/ib-account">
        <DashboardLayout>
          <IBAccount />
        </DashboardLayout>
      </Route>

      {/* Admin Routes - All admin paths go to AdminDashboard which handles internal routing */}
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/accounts/live" component={AdminDashboard} />
      <Route path="/admin/accounts/ib" component={AdminDashboard} />
      <Route path="/admin/accounts/champion" component={AdminDashboard} />
      <Route path="/admin/accounts/ndb" component={AdminDashboard} />
      <Route path="/admin/accounts/social-trading" component={AdminDashboard} />
      <Route path="/admin/accounts/bonus-shifting" component={AdminDashboard} />
      <Route path="/admin/accounts" component={AdminDashboard} />
      <Route path="/admin/clients/:id" component={AdminDashboard} />
      <Route path="/admin/clients" component={AdminDashboard} />
      <Route path="/admin/countries" component={AdminDashboard} />
      <Route path="/admin/documents" component={AdminDashboard} />
      <Route path="/admin/deposits" component={AdminDashboard} />
      <Route path="/admin/withdrawals" component={AdminDashboard} />
      <Route path="/admin/fund-transfer" component={AdminDashboard} />
      <Route path="/admin/fund-transfer/internal" component={AdminDashboard} />
      <Route path="/admin/fund-transfer/external" component={AdminDashboard} />
      <Route path="/admin/referrals" component={AdminDashboard} />
      <Route path="/admin/commissions" component={AdminDashboard} />
      <Route path="/admin/crypto-wallets" component={AdminDashboard} />
      <Route path="/admin/ib-commissions" component={AdminDashboard} />
      <Route path="/admin/support" component={AdminDashboard} />
      <Route path="/admin/logs" component={AdminDashboard} />
      <Route path="/admin/create-admins" component={AdminDashboard} />
      <Route path="/admin/withdrawals-otp" component={AdminDashboard} />
      <Route path="/admin/topup" component={AdminDashboard} />
      <Route path="/admin/topup-cards" component={AdminDashboard} />
      <Route path="/admin/ib-cb-wallets" component={AdminDashboard} />
      <Route path="/admin/reports" component={AdminDashboard} />
      <Route path="/admin/reports/deposits" component={AdminDashboard} />
      <Route path="/admin/reports/withdrawals" component={AdminDashboard} />
      <Route path="/admin/reports/topup" component={AdminDashboard} />
      <Route path="/admin" component={AdminDashboard} />

      <Route component={NotFound} />
    </Switch>
  );
}

// Component to conditionally show WhatsAppFloat (hide on admin routes)
function ConditionalWhatsAppFloat() {
  const [location] = useLocation();
  // Hide WhatsApp chat in admin panel
  if (location.startsWith("/admin")) {
    return null;
  }
  return <WhatsAppFloat />;
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Router>
            <ScrollToTop />
            <Suspense fallback={<PageLoadingSkeleton />}>
              <ErrorBoundary>
                <AppRouter />
              </ErrorBoundary>
            </Suspense>
          </Router>
          <Toaster />
          <ConditionalWhatsAppFloat />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
