import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import Logo from "./Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useLocation } from "wouter";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Sparkles, CheckCircle2, Home, Eye, EyeOff, X } from "lucide-react";
import SearchableCountrySelect from "./SearchableCountrySelect";
import SearchableCitySelect from "./SearchableCitySelect";
import { getPhoneCodeForCountry } from "@/utils/countryPhoneCodes";
import ReCAPTCHA from "react-google-recaptcha";

interface AuthCardProps {
  type?: "signin" | "signup";
}

export default function AuthCard({ type = "signup" }: AuthCardProps) {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [referralLink, setReferralLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  // Auto-fill referral link from URL parameter (ref) - only on signup page
  useEffect(() => {
    if (type === "signup") {
      const urlParams = new URLSearchParams(window.location.search);
      const refParam = urlParams.get("ref");
      if (refParam) {
        // Automatically populate referral link field with the ref parameter from URL
        // This happens when someone clicks a referral link like /signup?ref=123456
        setReferralLink(refParam);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]); // Only run when type changes, not when referralLink changes

  // Auto-update phone code when country changes
  useEffect(() => {
    if (country && type === "signup") {
      const phoneCode = getPhoneCodeForCountry(country);
      if (!phone || !phone.trim().startsWith("+")) {
        setPhone(phoneCode + " ");
      } else {
        const phoneMatch = phone.match(/^\+\d{1,4}\s*(.+)$/);
        if (phoneMatch) {
          setPhone(phoneCode + " " + phoneMatch[1]);
        } else {
          setPhone(phoneCode + " ");
        }
      }
    }
  }, [country, type]);

  // Password validation
  const passwordRequirements = {
    length: password.length >= 8,
    upperLower: /(?=.*[a-z])(?=.*[A-Z])/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (type === "signup") {
        if (!name || !email || !password || !confirmPassword || !phone || !country || !city) {
          throw new Error("Please fill in all required fields");
        }

        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }

        // Password complexity validation
        const passwordRules = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
        if (!passwordRules.test(password)) {
          throw new Error("Password must be at least 8 characters with uppercase, lowercase, number, and special character");
        }

        // Extract referral ID from referral link if provided
        let ref = referralLink.trim();
        if (ref && ref.includes("/")) {
          const parts = ref.split("/");
          ref = parts[parts.length - 1];
        }

        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: email.split("@")[0],
            email,
            password,
            fullName: name,
            phone,
            country,
            city,
            ref: ref || undefined,
          }),
          credentials: "include",
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Authentication failed");
        }

        toast({
          title: "Account Created!",
          description: "Your account has been created successfully.",
        });
        setLocation("/dashboard");
      } else {
        // Validate reCAPTCHA for signin (only if site key is configured and valid)
        const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
        const hasValidSiteKey = recaptchaSiteKey && typeof recaptchaSiteKey === 'string' && recaptchaSiteKey.trim().length > 0;
        if (hasValidSiteKey && !recaptchaToken) {
          toast({
            title: "reCAPTCHA Required",
            description: "Please complete the reCAPTCHA verification.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // Client login - admin must use admin login page
        const userResponse = await fetch("/api/auth/signin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            email, 
            password, 
            ...(recaptchaToken && { recaptchaToken }) 
          }),
          credentials: "include",
        });

        const userData = await userResponse.json();
        if (!userResponse.ok) {
          // Check if this is an admin account that needs to use admin login
          if (userData.isAdmin && userData.redirectTo) {
            toast({
              title: "Admin Account Detected",
              description: "Please use the admin login page to access your account.",
            });
            setLocation(userData.redirectTo);
            return;
          }
          throw new Error(userData.message || "Invalid credentials");
        }

        // Regular user login
        // Reset reCAPTCHA
        recaptchaRef.current?.reset();
        setRecaptchaToken(null);
        
        toast({
          title: "Welcome Back!",
          description: "You've been signed in successfully.",
        });
        setLocation("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black flex items-center justify-center px-4 py-8 overflow-x-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src="/bg.png"
          alt="Rozka Capitals Background"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.55 }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black via-black/80 to-black/90"></div>
      </div>
      
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[150px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 100, 0],
          }}
        ></motion.div>
        {/* Additional dark overlay for depth */}
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Left Panel - Promotional Content (Exness Style) - Fixed Position */}
      <div className="hidden lg:flex lg:w-1/2 fixed left-0 top-0 h-screen overflow-hidden z-10">
        {/* Content */}
        <div className={`relative z-10 flex flex-col w-full ${type === "signup" ? "justify-start pt-12 xl:pt-16 px-12 xl:px-16" : "justify-center p-12 xl:p-16"}`}>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <Logo size="lg" />
            <p className="text-primary text-sm font-semibold mt-2 uppercase tracking-wider">BORN TO TRADE</p>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight"
          >
            Take your <span className="text-primary">trading</span> to the next level.
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-gray-300 text-lg xl:text-xl leading-relaxed max-w-md"
          >
            Trade with unmatched <span className="text-primary">security</span>, faster <span className="text-primary">execution</span> and the best <span className="text-primary">pricing</span> in the market.
          </motion.p>
        </div>
      </div>

      {/* Right Panel - Form (Exness Style) */}
      <div className="w-full lg:w-1/2 lg:ml-auto flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 relative overflow-y-auto z-10 min-h-screen">
        <div className="w-full max-w-md">
          {/* Legal Notice at Top */}
          <div className="mb-6 flex flex-col items-center gap-3">
            <Link href="/">
              <Button
                variant="outline"
                className="text-sm border-gray-700 hover:border-primary hover:bg-primary/10 text-gray-300 hover:text-primary transition-colors"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </Link>
            <p className="text-xs text-gray-400 text-center">
              For more information and legal documentation, please visit{" "}
              <Link href="/" className="text-primary hover:underline">rozkacapitals.com</Link>
            </p>
          </div>

          {/* Form Card - More Transparent */}
          <Card className="bg-black/40 backdrop-blur-md border border-gray-700/50 p-6 sm:p-8 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                {type === "signin" ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="text-gray-400 text-sm">
                {type === "signin"
                  ? "Sign in to access your trading account"
                  : "Join thousands of traders worldwide"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {type === "signup" ? (
                <>
                  {/* Country/Region */}
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-sm text-gray-300">
                      Country/Region of residence <span className="text-primary">*</span>
                    </Label>
                    <SearchableCountrySelect
                      id="country"
                      value={country}
                      onChange={setCountry}
                      placeholder="Select your country"
                      disabled={loading}
                      className="w-full h-11 bg-gray-900 border-gray-700 text-white focus:border-primary"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm text-gray-300">
                      Your email address <span className="text-primary">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="h-11 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-primary"
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm text-gray-300">
                      Password <span className="text-primary">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        className="h-11 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-primary pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    
                    {/* Password Requirements */}
                    {password && (
                      <div className="space-y-1.5 mt-3 text-xs">
                        <div className={`flex items-center gap-2 ${passwordRequirements.length ? "text-green-400" : "text-red-400"}`}>
                          {passwordRequirements.length ? <CheckCircle2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
                          <span>At least 8 characters</span>
                        </div>
                        <div className={`flex items-center gap-2 ${passwordRequirements.upperLower ? "text-green-400" : "text-red-400"}`}>
                          {passwordRequirements.upperLower ? <CheckCircle2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
                          <span>At least one upper and one lower case letter</span>
                        </div>
                        <div className={`flex items-center gap-2 ${passwordRequirements.number ? "text-green-400" : "text-red-400"}`}>
                          {passwordRequirements.number ? <CheckCircle2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
                          <span>At least one number</span>
                        </div>
                        <div className={`flex items-center gap-2 ${passwordRequirements.special ? "text-green-400" : "text-red-400"}`}>
                          {passwordRequirements.special ? <CheckCircle2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
                          <span>At least one special character</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm text-gray-300">
                      Confirm Password <span className="text-primary">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={loading}
                        className="h-11 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-primary pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                    )}
                    {confirmPassword && password === confirmPassword && password && (
                      <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Passwords match
                      </p>
                    )}
                  </div>

                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm text-gray-300">
                      Full Name <span className="text-primary">*</span>
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={loading}
                      className="h-11 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-primary"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm text-gray-300">
                      Phone Number <span className="text-primary">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 234 567 8900"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      disabled={loading}
                      className="h-11 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-primary"
                    />
                  </div>

                  {/* City */}
                  {country && (
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-sm text-gray-300">
                        City <span className="text-primary">*</span>
                      </Label>
                      <SearchableCitySelect
                        id="city"
                        value={city}
                        onChange={setCity}
                        country={country}
                        placeholder="Select your city"
                        disabled={loading || !country}
                        className="w-full h-11 bg-gray-900 border-gray-700 text-white focus:border-primary"
                      />
                    </div>
                  )}

                  {/* Referral Link (Optional) */}
                  <div className="space-y-2">
                    <Label htmlFor="referralLink" className="text-sm text-gray-300">
                      Referral Link <span className="text-gray-500 text-xs">(Optional)</span>
                    </Label>
                    <Input
                      id="referralLink"
                      type="text"
                      placeholder="Enter referral link or ID"
                      value={referralLink}
                      onChange={(e) => setReferralLink(e.target.value)}
                      disabled={loading}
                      className="h-11 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-primary"
                    />
                  </div>

                  {/* US Declaration Checkbox */}
                  <div className="flex items-start gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="usDeclaration"
                      required
                      className="mt-1 w-4 h-4 rounded border-gray-700 bg-gray-900 text-primary focus:ring-primary"
                    />
                    <label htmlFor="usDeclaration" className="text-xs text-gray-400 leading-relaxed">
                      I declare and confirm that I am not a citizen or resident of the US for tax purposes.
                    </label>
                  </div>
                </>
              ) : (
                <>
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm text-gray-300">
                      Your email address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="h-11 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-primary"
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-sm text-gray-300">
                        Password
                      </Label>
                      <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                        Forgot Password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        className="h-11 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-primary pr-10"
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

                  {/* reCAPTCHA for signin - only show if site key is configured and valid */}
                  {(() => {
                    const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
                    // Only render if sitekey exists and is a non-empty string
                    if (recaptchaSiteKey && typeof recaptchaSiteKey === 'string' && recaptchaSiteKey.trim().length > 0) {
                      return (
                        <div className="flex justify-center pt-2">
                          <ReCAPTCHA
                            ref={recaptchaRef}
                            sitekey={recaptchaSiteKey}
                            onChange={(token) => setRecaptchaToken(token)}
                            onExpired={() => setRecaptchaToken(null)}
                            onError={() => {
                              console.error("[reCAPTCHA] Error occurred");
                              setRecaptchaToken(null);
                            }}
                          />
                        </div>
                      );
                    }
                    return null;
                  })()}
                </>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || (type === "signup" && (!passwordRequirements.length || !passwordRequirements.upperLower || !passwordRequirements.number || !passwordRequirements.special))}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-black font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {type === "signin" ? "Signing In..." : "Creating Account..."}
                  </>
                ) : (
                  type === "signin" ? "Sign In" : "Register"
                )}
              </Button>
            </form>

            {/* Footer Links */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                {type === "signin" ? (
                  <>
                    Don't have an account?{" "}
                    <Link href="/signup" className="text-primary hover:underline">
                      Sign up
                    </Link>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <Link href="/signin" className="text-primary hover:underline">
                      Sign in
                    </Link>
                  </>
                )}
              </p>
            </div>

            {/* Legal Text */}
            <div className="mt-8 pt-6 border-t border-gray-800">
              <p className="text-[10px] text-gray-500 leading-relaxed">
                Registration is with Rozka Capitals Limited, regulated by the relevant authorities, based on your selected country. 
                By clicking Register, you agree to the Client Agreement and service terms and conditions listed in documents 
                including General Business Terms, Partnership Agreement, Privacy Policy, Risk Disclosure and Warning Notice 
                and Key Facts Statement. You also confirm that you fully understand the nature and the risks of the services and 
                products envisaged. Trading CFDs is not suitable for everyone; it should be done by traders with a high risk 
                tolerance and who can afford potential losses.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
