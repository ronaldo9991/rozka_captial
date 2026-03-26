import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User, MapPin, Lock, CheckCircle2 } from "lucide-react";
import { FullPageLoader, InlineLoader } from "@/components/DashboardLoader";
import type { User as UserType } from "@shared/schema";

export default function Profile() {
  const { toast } = useToast();

  // Fetch user profile with real-time updates
  const { data: profile, isLoading } = useQuery<Omit<UserType, "password">>({
    queryKey: ["/api/profile"],
    refetchInterval: false,
    refetchOnWindowFocus: true,
    staleTime: 120000, // 2 minutes
  });

  // Personal info form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [zipCode, setZipCode] = useState("");

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || "");
      setEmail(profile.email || "");
      setPhone(profile.phone || "");
      setCountry(profile.country || "");
      setCity(profile.city || "");
      setAddress(profile.address || "");
      setZipCode(profile.zipCode || "");
    }
  }, [profile]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PATCH", "/api/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      fullName,
      phone,
      country,
      city,
      address,
      zipCode,
    });
  };

  if (isLoading) {
    return <FullPageLoader text="Loading profile..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your account information and preferences.
        </p>
      </div>

      {/* Verification Status */}
      <Card className="p-6 border-card-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">Account Verification</h3>
            <p className="text-sm text-muted-foreground">
              {profile?.verified
                ? "Your account is verified and fully activated."
                : "Complete your profile and upload documents to get verified."}
            </p>
          </div>
          <div>
            {profile?.verified ? (
              <div className="flex items-center gap-2 text-chart-2">
                <CheckCircle2 className="w-6 h-6 fill-current" />
                <span className="font-semibold">Verified</span>
              </div>
            ) : (
              <Button variant="outline" data-testid="button-complete-verification">
                Complete Verification
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Personal Information */}
      <Card className="p-6 border-card-border">
        <div className="flex items-center gap-2 mb-6">
          <User className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Personal Information</h2>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={profile?.username || ""}
                disabled
                data-testid="input-username"
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Username cannot be changed
              </p>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled
                data-testid="input-email"
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Contact support to change email
              </p>
            </div>

            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                data-testid="input-fullname"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1234567890"
                data-testid="input-phone"
              />
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Address Information</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Enter your country"
                  data-testid="input-country"
                />
              </div>

              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter your city"
                  data-testid="input-city"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your street address"
                  data-testid="input-address"
                />
              </div>

              <div>
                <Label htmlFor="zipCode">ZIP / Postal Code</Label>
                <Input
                  id="zipCode"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="Enter postal code"
                  data-testid="input-zipcode"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={updateProfileMutation.isPending}
              data-testid="button-save-profile"
            >
              {updateProfileMutation.isPending ? (
                <>
                  <InlineLoader className="mr-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Security Settings */}
      <Card className="p-6 border-card-border">
        <div className="flex items-center gap-2 mb-6">
          <Lock className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Security Settings</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-semibold mb-1">Password</h3>
              <p className="text-sm text-muted-foreground">
                Change your password to keep your account secure
              </p>
            </div>
            <Button variant="outline" data-testid="button-change-password">
              Change Password
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-semibold mb-1">Two-Factor Authentication</h3>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <Button variant="outline" data-testid="button-enable-2fa">
              Enable 2FA
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-semibold mb-1">Active Sessions</h3>
              <p className="text-sm text-muted-foreground">
                Manage your active login sessions
              </p>
            </div>
            <Button variant="outline" data-testid="button-view-sessions">
              View Sessions
            </Button>
          </div>
        </div>
      </Card>

      {/* Account Information */}
      <Card className="p-6 border-card-border">
        <h2 className="text-xl font-semibold mb-4">Account Information</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Account ID:</span>
            <span className="ml-2 font-mono font-semibold">
              {profile?.id.slice(0, 8)}...
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Member Since:</span>
            <span className="ml-2 font-semibold">
              {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "-"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Verification Status:</span>
            <span className={`ml-2 font-semibold ${profile?.verified ? "text-chart-2" : "text-yellow-500"}`}>
              {profile?.verified ? "Verified" : "Pending"}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
