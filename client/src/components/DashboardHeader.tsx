import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { User as UserType } from "@shared/schema";

export default function DashboardHeader() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Fetch current user data - handle 401 gracefully
  const { data: user, isLoading } = useQuery<UserType>({
    queryKey: ["/api/auth/check"],
    retry: false,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    queryFn: async () => {
      const res = await fetch("/api/auth/check", {
        credentials: "include",
      });
      if (res.status === 401) {
        // Return null instead of throwing - prevents error spam
        return null;
      }
      if (!res.ok) {
        throw new Error(`Failed to check auth: ${res.statusText}`);
      }
      return await res.json();
    },
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { 
        method: "POST",
        credentials: "include"
      });
      
      if (response.ok) {
        // Clear all cached queries
        queryClient.clear();
        // Redirect to sign in page
        setLocation("/signin");
      } else {
        console.error("Logout failed:", response.statusText);
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const displayName = isLoading ? "Loading..." : (user?.fullName || user?.username || "User");

  return (
    <header className="flex items-center justify-between p-4 border-b border-primary/20 bg-background/95 backdrop-blur-xl shadow-lg shadow-primary/5">
      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground font-mono" data-testid="text-current-time">
          <span className="hidden sm:inline text-primary font-semibold mr-2">⚡ LIVE</span>
          {currentTime.toLocaleString()}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="font-medium text-foreground/90" data-testid="text-user-name">
          {displayName}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-primary/10 transition-all duration-200" data-testid="button-user-menu">
              <User className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-sidebar/95 backdrop-blur-xl border-primary/20">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-semibold">{displayName}</span>
                <span className="text-xs text-muted-foreground">{user?.email || ""}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem data-testid="menu-profile" onClick={() => setLocation("/dashboard/profile")}>
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem data-testid="menu-settings">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem data-testid="menu-logout" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
