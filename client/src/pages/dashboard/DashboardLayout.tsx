import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import VerificationGuard from "@/components/VerificationGuard";
import { AccountProvider } from "@/contexts/AccountContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AccountProvider>
      <div className="flex flex-col h-screen w-full">
        {/* Top Navigation Bar */}
        <DashboardSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-6 bg-gradient-to-br from-background via-accent/5 to-background">
            <div className="max-w-[1280px] mx-auto">
              <VerificationGuard>
                {children}
              </VerificationGuard>
            </div>
          </main>
        </div>
      </div>
    </AccountProvider>
  );
}
