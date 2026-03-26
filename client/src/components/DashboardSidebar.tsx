import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Home,
  FileText,
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  History,
  User,
  LogOut,
  MessageSquare,
  Download,
  ArrowRightLeft,
  ArrowRight,
  UserPlus,
  Menu,
  X,
  ChevronDown,
  Zap,
  Monitor,
} from "lucide-react";
import Logo from "./Logo";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import AnimatedGrid from "./AnimatedGrid";
import ParticleField from "./ParticleField";
import { cn } from "@/lib/utils";
import { useState } from "react";

// Organized menu items - flattened for better display
const mainNavItems = [
  { title: "Dashboard", icon: Home, url: "/dashboard" },
  { title: "Web Terminal", icon: Monitor, url: "https://web.rozkacapitals.com/terminal", external: true, priority: true },
  { title: "Trading Accounts", icon: Wallet, url: "/dashboard/accounts" },
  { title: "History", icon: History, url: "/dashboard/history" },
  { title: "Deposit", icon: ArrowDownToLine, url: "/dashboard/deposit", priority: true },
  { title: "Withdraw", icon: ArrowUpFromLine, url: "/dashboard/withdraw", priority: true },
  { title: "IB Account", icon: UserPlus, url: "/dashboard/ib-account" },
];

const financialItems = [
  { title: "Internal Transfer", icon: ArrowRightLeft, url: "/dashboard/internal-transfer" },
  { title: "External Transfer", icon: ArrowRight, url: "/dashboard/external-transfer" },
];

const accountItems = [
  { title: "Documents", icon: FileText, url: "/dashboard/documents" },
  { title: "Downloads", icon: Download, url: "/dashboard/downloads" },
  { title: "Support", icon: MessageSquare, url: "/dashboard/support" },
  { title: "Profile", icon: User, url: "/dashboard/profile" },
];

export default function DashboardSidebar() {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { 
        method: "POST",
        credentials: "include"
      });
      
      if (response.ok) {
        queryClient.clear();
        setLocation("/signin");
      } else {
        console.error("Logout failed:", response.statusText);
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Futuristic Nav Item Component with Enhanced Animations
  const FuturisticNavItem = ({ item, isActive, priority }: { 
    item: typeof mainNavItems[0] & { external?: boolean }, 
    isActive: boolean, 
    priority?: boolean 
  }) => (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.a
            href={item.url}
            target={item.external ? "_blank" : undefined}
            rel={item.external ? "noopener noreferrer" : undefined}
            className={cn(
              // Keep every menu tile perfectly aligned in the fixed 64px header.
              "relative flex flex-col items-center justify-center gap-1 px-2 py-1.5 rounded-lg",
              "transition-colors duration-200 group/item min-w-[88px] h-12",
              "border border-transparent",
              isActive 
                ? "bg-primary/15 border-primary/30 text-primary" 
                : "hover:bg-primary/8 hover:border-primary/20 text-foreground/70 hover:text-primary",
              priority && "ring-1 ring-primary/20"
            )}
          >
            {/* Icon - no animations, optimized size */}
            <div className="relative">
              <item.icon className={cn(
                "w-5 h-5 relative z-10 transition-colors duration-200",
                isActive && "text-primary",
                "group-hover/item:text-primary"
              )} />
            </div>
            
            {/* Label - no animations */}
            <span
              className={cn(
                "text-[10px] font-medium uppercase tracking-wider transition-colors duration-200",
                "whitespace-nowrap leading-none",
                isActive && "text-primary font-semibold"
              )}
            >
              {item.title}
            </span>
            
            {/* Active bottom indicator - static */}
            {isActive && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
            )}
          </motion.a>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-sidebar/95 border-primary/30 backdrop-blur-xl">
          <p className="font-semibold text-primary">{item.title}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <nav className="relative w-full border-b border-primary/20 bg-gradient-to-b from-sidebar via-sidebar/98 to-sidebar z-50 overflow-hidden">
      {/* Advanced Futuristic Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Cyber Grid */}
        <AnimatedGrid variant="cyber" className="opacity-[0.02]" />
        
        {/* Reduced particles for performance */}
        <ParticleField count={8} className="opacity-[0.04]" />
        
        {/* Animated data stream lines */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-0 h-full w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent"
            style={{ left: `${20 + i * 30}%` }}
            animate={{
              y: ["-100%", "200%"],
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: i * 1.3,
              ease: "linear",
            }}
          />
        ))}
        
        {/* Horizontal scan line */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"
          animate={{
            x: ["-100%", "200%"],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        
        {/* Pulsing energy orbs */}
        <motion.div
          className="absolute top-1/2 left-[15%] w-48 h-16 bg-primary/8 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.1, 0.3, 0.1],
            x: [0, 30, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 right-[15%] w-48 h-16 bg-primary/8 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.6, 1],
            opacity: [0.08, 0.25, 0.08],
            x: [0, -30, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      {/* Holographic border with glow */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px]">
        <div className="h-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <motion.div
          className="absolute inset-0 bg-primary/30 blur-sm"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        />
      </div>

      {/* Main Navigation Container */}
      <div className="relative max-w-[1280px] mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo Section with Enhanced Effects */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 flex-shrink-0"
          >
            <div className="relative group">
              <Logo size="sm" />
              
              {/* Connection lines from logo */}
              <motion.div
                className="absolute top-1/2 left-full w-8 h-px bg-gradient-to-r from-primary/30 to-transparent ml-2"
                animate={{
                  scaleX: [0.5, 1, 0.5],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              />
            </div>
            
            {/* System status text */}
            <div className="hidden lg:flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-primary/60 font-mono">System</span>
              <span className="text-[10px] uppercase tracking-widest text-green-500 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                Online
              </span>
            </div>
          </motion.div>

          {/* Main Navigation - All Items Visible */}
          <div className="hidden md:flex items-center gap-1.5 flex-1 justify-start min-w-0 px-2">
            {/* Main Navigation Items */}
            <div className="flex items-center gap-1">
              {mainNavItems.map((item) => {
                const isActive =
                  !item.external &&
                  (item.url === "/dashboard" ? location === item.url : location.startsWith(item.url));
                return (
                  <FuturisticNavItem
                    key={item.title}
                    item={item}
                    isActive={isActive}
                    priority={item.priority}
                  />
                );
              })}
            </div>

            {/* Divider */}
            <div className="h-8 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent mx-1" />

            {/* Financial Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.button
                  className={cn(
                    "relative flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg transition-all duration-300 min-w-[88px] h-12",
                    "border border-transparent",
                    "hover:bg-primary/10 hover:border-primary/20 hover:text-primary text-foreground/70",
                    (location.startsWith("/dashboard/internal-transfer") || 
                     location.startsWith("/dashboard/external-transfer"))
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : ""
                  )}
                  whileHover={{ y: -2, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    animate={{
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                  </motion.div>
                  <span className="text-[10px] font-medium uppercase tracking-wider whitespace-nowrap leading-none">
                    Transfers
                  </span>
                </motion.button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-56 bg-sidebar/95 backdrop-blur-xl border-primary/30">
                {financialItems.map((item) => {
                  const isActive = location === item.url;
                  return (
                    <DropdownMenuItem
                      key={item.title}
                      asChild
                      className={cn(
                        "cursor-pointer",
                        isActive && "bg-primary/15 text-primary"
                      )}
                    >
                      <a href={item.url} className="flex items-center gap-2 w-full">
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </a>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Divider */}
            <div className="h-8 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent mx-1" />

            {/* Account Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.button
                  className={cn(
                    "relative flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg transition-all duration-300 min-w-[88px] h-12",
                    "border border-transparent",
                    "hover:bg-primary/10 hover:border-primary/20 hover:text-primary text-foreground/70",
                    (location.startsWith("/dashboard/documents") ||
                     location.startsWith("/dashboard/downloads") ||
                     location.startsWith("/dashboard/support") ||
                     location.startsWith("/dashboard/profile"))
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : ""
                  )}
                  whileHover={{ y: -2, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <User className="w-5 h-5" />
                  </motion.div>
                  <span className="text-[10px] font-medium uppercase tracking-wider whitespace-nowrap leading-none">
                    Account
                  </span>
                </motion.button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-56 bg-sidebar/95 backdrop-blur-xl border-primary/30">
                {accountItems.map((item) => {
                  const isActive = location === item.url;
                  return (
                    <DropdownMenuItem
                      key={item.title}
                    asChild
                      className={cn(
                        "cursor-pointer",
                        isActive && "bg-primary/15 text-primary"
                      )}
                    >
                      <a href={item.url} className="flex items-center gap-2 w-full">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </a>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Logout Button - Futuristic Style */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="hidden md:block flex-shrink-0"
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "w-10 h-10 relative overflow-hidden",
                      "border border-destructive/20 hover:border-destructive/40",
                      "hover:bg-destructive/10 hover:text-destructive",
                      "transition-all duration-300"
                    )}
                    onClick={handleLogout}
                  >
                    <motion.div
                      whileHover={{ rotate: 180 }}
                      transition={{ duration: 0.3 }}
                    >
          <LogOut className="w-4 h-4" />
                    </motion.div>
                    
                    {/* Danger glow on hover */}
                    <motion.div
                      className="absolute inset-0 bg-destructive/20 rounded-lg opacity-0 hover:opacity-100 blur-sm"
                      initial={false}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-sidebar/95 border-primary/30 backdrop-blur-xl">
                  <p className="font-semibold">Log Out</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </motion.div>

          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="w-10 h-10">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0 bg-sidebar/95 backdrop-blur-xl border-primary/20">
              <div className="relative h-full overflow-hidden">
                {/* Mobile menu background */}
                <div className="absolute inset-0 pointer-events-none">
                  <AnimatedGrid variant="cyber" className="opacity-[0.03]" />
                  <ParticleField count={20} className="opacity-10" />
                </div>

                <div className="relative h-full flex flex-col">
                  {/* Mobile Header */}
                  <div className="p-4 border-b border-primary/20">
                    <div className="flex items-center justify-between">
                      <Logo size="sm" />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>

                  {/* Mobile Navigation */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-primary/60 mb-3 flex items-center gap-2">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                        <span>Main</span>
                        <div className="h-px flex-1 bg-gradient-to-r from-primary/30 via-transparent to-transparent" />
                      </div>
                      <div className="space-y-1">
                        {mainNavItems.map((item) => {
                          const isActive = location === item.url;
                          const isExternal = (item as any).external;
                          return (
                            <motion.a
                              key={item.title}
                              href={item.url}
                              target={isExternal ? "_blank" : undefined}
                              rel={isExternal ? "noopener noreferrer" : undefined}
                              onClick={() => !isExternal && setMobileMenuOpen(false)}
                              className={cn(
                                "relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300",
                                "hover:bg-primary/10 hover:text-primary border border-transparent",
                                isActive && "bg-primary/15 border-primary/30 text-primary font-medium"
                              )}
                            >
                              <item.icon className="w-5 h-5" />
                              <span>{item.title}</span>
                              {isActive && (
                                <motion.div
                                  className="absolute right-4 w-2 h-2 bg-primary rounded-full"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: [1, 1.3, 1] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                />
                              )}
                            </motion.a>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-primary/60 mb-3 flex items-center gap-2">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                        <span>Transfers</span>
                        <div className="h-px flex-1 bg-gradient-to-r from-primary/30 via-transparent to-transparent" />
                      </div>
                      <div className="space-y-1">
                        {financialItems.map((item) => {
                          const isActive = location === item.url;
                          return (
                            <motion.a
                              key={item.title}
                              href={item.url}
                              onClick={() => setMobileMenuOpen(false)}
                              className={cn(
                                "relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300",
                                "hover:bg-primary/10 hover:text-primary border border-transparent",
                                isActive && "bg-primary/15 border-primary/30 text-primary font-medium"
                              )}
                            >
                              <item.icon className="w-5 h-5" />
                              <span>{item.title}</span>
                            </motion.a>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-primary/60 mb-3 flex items-center gap-2">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                        <span>Account</span>
                        <div className="h-px flex-1 bg-gradient-to-r from-primary/30 via-transparent to-transparent" />
                      </div>
                      <div className="space-y-1">
                        {accountItems.map((item) => {
                          const isActive = location === item.url;
                          return (
                            <motion.a
                              key={item.title}
                              href={item.url}
                              onClick={() => setMobileMenuOpen(false)}
                              className={cn(
                                "relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300",
                                "hover:bg-primary/10 hover:text-primary border border-transparent",
                                isActive && "bg-primary/15 border-primary/30 text-primary font-medium"
                              )}
                            >
                              <item.icon className="w-5 h-5" />
                              <span>{item.title}</span>
                            </motion.a>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Mobile Logout */}
                  <div className="p-4 border-t border-primary/20">
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full gap-2 border-destructive/30 hover:border-destructive/50",
                        "hover:bg-destructive/10 transition-all duration-300"
                      )}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                    >
                      <LogOut className="w-4 h-4 text-destructive/70" />
                      <span className="text-destructive/70 font-medium">Log Out</span>
        </Button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
