import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shield, Eye, EyeOff } from "lucide-react";
import Logo from "@/components/Logo";
import { motion } from "framer-motion";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "Error",
        description: "Please enter both username and password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Admin login uses separate backend URL if configured, otherwise uses same backend
      const adminApiUrl = import.meta.env.VITE_ADMIN_API_URL || import.meta.env.VITE_API_URL || "";
      const adminLoginEndpoint = adminApiUrl 
        ? `${adminApiUrl}/api/admin/auth/signin`
        : "/api/admin/auth/signin";
      
      const response = await fetch(adminLoginEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include", // Include cookies for session management
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || "Invalid credentials");
      }

      const { admin, loginAttempts = 0, canAccessDashboard = true } = responseData;
      
      if (!admin) {
        throw new Error("Invalid response from server");
      }
      
      // Single login attempt grants immediate access - no need to check canAccessDashboard
      // Show role-specific welcome message
      let welcomeTitle = "Welcome back!";
      if (admin.role === "super_admin") {
        welcomeTitle = "Welcome back Super Admin!";
      } else if (admin.role === "middle_admin") {
        welcomeTitle = "Welcome back Middle Admin!";
      } else if (admin.role === "normal_admin") {
        welcomeTitle = "Welcome back Admin!";
      }
      
      toast({
        title: welcomeTitle,
        description: `Logged in as ${admin?.fullName || admin?.username || "Admin"}`,
      });

      // Determine redirect route based on admin role
      // Normal admin should go to documents, others to dashboard
      const isNormalAdmin = admin.role === "normal_admin" || 
                           admin.role?.toLowerCase().includes("normal");
      const redirectRoute = isNormalAdmin ? "/admin/documents" : "/admin/dashboard";
      
      // Verify session is set before redirecting
      // This prevents the "login twice" issue where session cookie isn't ready yet
      try {
        const adminApiUrl = import.meta.env.VITE_ADMIN_API_URL || import.meta.env.VITE_API_URL || "";
        const adminMeEndpoint = adminApiUrl 
          ? `${adminApiUrl}/api/admin/auth/me`
          : "/api/admin/auth/me";
        
        const verifyResponse = await fetch(adminMeEndpoint, {
          method: "GET",
          credentials: "include",
        });
        
        if (verifyResponse.ok) {
          // Session is confirmed, safe to redirect
          window.location.href = redirectRoute;
        } else {
          // Session not ready yet, wait a bit and retry
          await new Promise(resolve => setTimeout(resolve, 500));
          window.location.href = redirectRoute;
        }
      } catch (verifyError) {
        // If verification fails, still redirect after a short delay
        // The session should be set by now
        console.warn("Session verification failed, redirecting anyway:", verifyError);
        setTimeout(() => {
          window.location.href = redirectRoute;
        }, 300);
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative">
      {/* Full-Screen Trading Wallpaper Background */}
      <div className="fixed inset-0 w-full h-full z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.4 }}
        >
          <source src="/videos/Mekness.mp4" type="video/mp4" />
        </video>
        {/* Gradient overlay for better text readability */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.75) 40%, rgba(0,0,0,0.65) 60%, rgba(0,0,0,0.75) 100%)'
          }}
        ></div>
        {/* Additional dark overlay for depth */}
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Left Panel - Promotional Content (Exness Style) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden z-10">
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center p-12 xl:p-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <Logo size="lg" />
            <p className="text-primary text-sm font-semibold mt-2 uppercase tracking-wider">ADMIN PORTAL</p>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight"
          >
            Secure access to your admin dashboard.
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-gray-300 text-lg xl:text-xl leading-relaxed max-w-md"
          >
            Manage your trading platform with advanced tools, real-time analytics, and comprehensive control.
          </motion.p>
        </div>
      </div>

      {/* Right Panel - Form (Exness Style) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 relative overflow-y-auto z-10">
        <div className="w-full max-w-md">
          {/* Legal Notice at Top */}
          <p className="text-xs text-gray-400 mb-6 text-center">
            For more information and legal documentation, please visit{" "}
            <a href="/" className="text-primary hover:underline">binofox.com</a>
          </p>

          {/* Form Card - More Transparent */}
          <Card className="bg-black/40 backdrop-blur-md border border-gray-700/50 p-6 sm:p-8 shadow-2xl">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-6 h-6 text-primary" />
                <Logo showText={false} />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Admin Portal
              </h2>
              <p className="text-gray-400 text-sm">
                Secure access for administrators only
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username/Email */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm text-gray-300">
                  Username or Email
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username or email"
                  disabled={isLoading}
                  className="h-11 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-primary"
                  data-testid="input-admin-username"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-gray-300">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    disabled={isLoading}
                    className="h-11 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-primary pr-10"
                    data-testid="input-admin-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-black font-semibold text-base disabled:opacity-50"
                data-testid="button-admin-login"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center text-xs text-gray-500">
              <p>Binofox Limited Administration</p>
              <p className="mt-1">Secure • Encrypted • Audited</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
