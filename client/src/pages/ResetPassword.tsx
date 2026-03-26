import { useState, useEffect } from "react";
import { useLocation as useWouterLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";
import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/Footer";
import { Link } from "wouter";

export default function ResetPassword() {
  const [, setLocation] = useWouterLocation();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Get token from URL query parameter
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("token");
    if (urlToken) {
      setToken(urlToken);
    } else {
      // Don't show error immediately - let the component render first
      console.warn("No reset token found in URL");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast({
        title: "Error",
        description: "Reset token is missing.",
        variant: "destructive",
      });
      return;
    }

    if (!password || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please enter both password fields",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    // Validate password complexity
    const passwordRules = /^(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!passwordRules.test(password)) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters and include a number and a special character",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      setIsSuccess(true);
      toast({
        title: "Password Reset Successful!",
        description: "Your password has been reset. You can now sign in with your new password.",
      });

      // Redirect to signin after 3 seconds
      setTimeout(() => {
        setLocation("/signin");
      }, 3000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col">
        <PublicHeader />
        <div className="flex-1 flex items-center justify-center p-3 sm:p-4">
          <Card className="relative glass-card w-full max-w-md p-4 sm:p-6 md:p-8 border-card-border">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Invalid Reset Link</h2>
              <p className="text-muted-foreground mb-6">
                The reset link is invalid or has expired. Please request a new password reset.
              </p>
              <Link href="/forgot-password">
                <Button>Request New Reset Link</Button>
              </Link>
            </div>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col">
        <PublicHeader />
        <div className="flex-1 flex items-center justify-center p-3 sm:p-4">
          <Card className="relative glass-card w-full max-w-md p-4 sm:p-6 md:p-8 border-card-border">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">Password Reset Successful!</h2>
              <p className="text-muted-foreground mb-6">
                Your password has been reset successfully. Redirecting to sign in...
              </p>
              <Link href="/signin">
                <Button>Go to Sign In</Button>
              </Link>
            </div>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      
      <div className="flex-1 flex items-center justify-center p-3 sm:p-4 bg-gradient-to-br from-background via-background to-primary/5">
        <Card className="relative glass-card w-full max-w-md p-4 sm:p-6 md:p-8 border-card-border">
          <div className="flex flex-col items-center mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              <Logo showText={false} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-center">Reset Password</h1>
            <p className="text-muted-foreground text-center text-sm sm:text-base px-2">
              Enter your new password below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <Label htmlFor="password" className="text-sm sm:text-base">New Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your new password"
                disabled={isLoading}
                className="mt-1 text-sm sm:text-base"
                required
                minLength={8}
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-sm sm:text-base">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                disabled={isLoading}
                className="mt-1 text-sm sm:text-base"
                required
                minLength={8}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Password must be at least 8 characters and include a number and a special character.
            </p>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full text-sm sm:text-base"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Reset Password
                  </>
                )}
              </Button>
              
              <Link href="/signin">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-sm sm:text-base"
                  disabled={isLoading}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </form>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
}

