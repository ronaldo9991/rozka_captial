import { useState } from "react";
import DataTable from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff, Copy } from "lucide-react";
import { FullPageLoader, InlineLoader } from "@/components/DashboardLoader";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { TradingAccount } from "@shared/schema";

export default function TradingAccounts() {
  const [accountType, setAccountType] = useState("");
  const [accountGroup, setAccountGroup] = useState("");
  const [leverage, setLeverage] = useState("");
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [showDeclaration, setShowDeclaration] = useState(false);
  const [declarationConfirmed, setDeclarationConfirmed] = useState(false);
  const { toast } = useToast();

  // Fetch trading accounts - optimized for performance
  const { data: accounts = [], isLoading } = useQuery<TradingAccount[]>({
    queryKey: ["/api/trading-accounts"],
    refetchInterval: false,
    refetchOnWindowFocus: true,
    staleTime: 60000,
  });

  // Create account mutation
  const createAccountMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/trading-accounts", data);
    },
    onSuccess: () => {
      toast({
        title: "Account Created",
        description: "Your trading account has been created successfully.",
      });
      setAccountType("");
      setAccountGroup("");
      setLeverage("");
      queryClient.invalidateQueries({ queryKey: ["/api/trading-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/mt5-credentials"] }); // Refresh MT5 credentials after account creation
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create trading account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateAccount = () => {
    // Live and Demo accounts need both accountGroup and leverage
    const isLiveOrDemo = accountType === "Live" || accountType === "Demo";
    
    // Other accounts need leverage but not accountGroup
    const isOtherAccount = !isLiveOrDemo;
    
    if (!accountType) {
      toast({
        title: "Missing Information",
        description: "Please select an account type.",
        variant: "destructive",
      });
      return;
    }
    
    if (isLiveOrDemo && !accountGroup) {
      toast({
        title: "Missing Information",
        description: "Please select an account group.",
        variant: "destructive",
      });
      return;
    }
    
    if (isLiveOrDemo && !leverage) {
      toast({
        title: "Missing Information",
        description: "Please select leverage.",
        variant: "destructive",
      });
      return;
    }
    
    if (isOtherAccount && !leverage) {
      toast({
        title: "Missing Information",
        description: "Please select leverage.",
        variant: "destructive",
      });
      return;
    }

    // Show declaration modal first
    setShowDeclaration(true);
  };

  const handleConfirmDeclaration = () => {
    if (!declarationConfirmed) {
      toast({
        title: "Confirmation Required",
        description: "Please confirm that you have read and agree to the declaration.",
        variant: "destructive",
      });
      return;
    }

    // Close modal and proceed with account creation
    setShowDeclaration(false);
    
    // Live and Demo accounts send both group and leverage, other accounts only send leverage
    const isLiveOrDemo = accountType === "Live" || accountType === "Demo";
    
    createAccountMutation.mutate({
      type: accountType,
      group: isLiveOrDemo ? accountGroup : undefined,
      leverage: leverage, // All account types need leverage
    });
    // Reset checkbox for next time
    setDeclarationConfirmed(false);
  };

  const handleCloseDeclaration = () => {
    setShowDeclaration(false);
    setDeclarationConfirmed(false);
  };

  const togglePasswordVisibility = (accountId: string) => {
    setShowPasswords((prev) => ({ ...prev, [accountId]: !prev[accountId] }));
  };


  const columns = [
    { 
      key: "accountId", 
      label: "Account ID",
      render: (value: string) => (
        <span className="font-mono font-semibold">{value}</span>
      ),
    },
    {
      key: "password",
      label: "Password",
      render: (_: string, row: TradingAccount) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm">
            {showPasswords[row.accountId] ? row.password : "••••••••"}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => togglePasswordVisibility(row.accountId)}
            data-testid={`button-toggle-password-${row.accountId}`}
          >
            {showPasswords[row.accountId] ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </Button>
        </div>
      ),
    },
    {
      key: "type",
      label: "Account Type",
      render: (value: string) => (
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
          {value === "Live" ? "Live Account" :
           value === "Demo" ? "Demo Account" :
           value === "IB" ? "IB Account" :
           value === "Champion" ? "Champion Account" :
           value === "NDB" ? "NDB Account" :
           value === "Social" ? "Social Trading Account" : value}
        </Badge>
      ),
    },
    { 
      key: "group", 
      label: "Group",
      render: (value: string) => (
        <span className="font-semibold text-primary">{value}</span>
      ),
    },
    {
      key: "leverage",
      label: "Leverage",
      render: (value: string) => (
        <Button variant="ghost" size="sm" data-testid="button-change-leverage">
          {value}
        </Button>
      ),
    },
    { 
      key: "balance", 
      label: "Balance",
      render: (value: string) => (
        <span className="font-semibold">${parseFloat(value || "0").toFixed(2)}</span>
      ),
    },
    { 
      key: "createdAt", 
      label: "Created",
      render: (value: Date) => new Date(value).toLocaleDateString(),
    },
  ];

  if (isLoading) {
    return <FullPageLoader text="Loading accounts..." />;
  }


  return (
    <div className="space-y-6">
      {/* Centered Header with Golden Lines */}
      <div className="text-center space-y-4">
        {/* Top golden line */}
        <div className="flex items-center justify-center">
          <div className="h-[2px] w-32 bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>
        
        {/* Title */}
        <h1 className="text-3xl font-bold text-primary uppercase tracking-wider">
          Trading Accounts
        </h1>
        
        {/* Bottom golden lines (double line) */}
        <div className="flex flex-col items-center justify-center gap-1">
          <div className="h-[1px] w-40 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
          <div className="h-[1px] w-40 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        </div>
        
        <p className="text-muted-foreground text-sm mt-2">
          Manage your trading accounts and leverage settings.
        </p>
      </div>


      <Card className="p-6 border-[#D4AF37]/30 bg-black/80 backdrop-blur-xl">
        <div className="border-t border-b border-[#D4AF37]/30 py-6">
          {/* Centered Request Header */}
          <div className="text-center mb-6 space-y-3">
            <div className="flex items-center justify-center">
              <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-primary to-transparent" />
            </div>
            <h2 className="text-xl font-semibold text-primary uppercase tracking-wider">Request New Trading Account</h2>
            <div className="flex flex-col items-center justify-center gap-1">
              <div className="h-[1px] w-32 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
              <div className="h-[1px] w-32 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <div>
              <Label htmlFor="accountType" className="text-gray-300">Trading Account:</Label>
              <Select value={accountType} onValueChange={(value) => {
                setAccountType(value);
                // Reset fields when account type changes
                setAccountGroup("");
                setLeverage("");
              }}>
                <SelectTrigger 
                  id="accountType" 
                  data-testid="select-account-type"
                  className="bg-black/40 border-[#D4AF37]/50 text-gray-300 focus:border-[#D4AF37]"
                >
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent className="bg-black/95 border-[#D4AF37]/50">
                  <SelectItem value="Live" className="text-gray-300 hover:bg-primary/20 focus:bg-primary/20">
                    Live Account
                  </SelectItem>
                  <SelectItem value="Demo" className="text-gray-300 hover:bg-primary/20 focus:bg-primary/20">
                    Demo Account
                  </SelectItem>
                  <SelectItem value="IB" className="text-gray-300 hover:bg-primary/20 focus:bg-primary/20">
                    IB Account
                  </SelectItem>
                  <SelectItem value="Champion" className="text-gray-300 hover:bg-primary/20 focus:bg-primary/20">
                    Champion Account
                  </SelectItem>
                  <SelectItem value="NDB" className="text-gray-300 hover:bg-primary/20 focus:bg-primary/20">
                    NDB Account
                  </SelectItem>
                  <SelectItem value="Social" className="text-gray-300 hover:bg-primary/20 focus:bg-primary/20">
                    Social Trading Account
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Account Group - Only for Live and Demo accounts */}
            {(accountType === "Live" || accountType === "Demo") && (
              <div>
                <Label htmlFor="accountGroup">Account Group</Label>
                <Select value={accountGroup} onValueChange={setAccountGroup}>
                  <SelectTrigger id="accountGroup" data-testid="select-account-group">
                    <SelectValue placeholder="Select group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Startup">Startup</SelectItem>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Pro">Pro</SelectItem>
                    <SelectItem value="VIP">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Leverage - For all account types */}
            {accountType && (
              <div>
                <Label htmlFor="leverage">Leverage</Label>
                <Select value={leverage} onValueChange={setLeverage}>
                  <SelectTrigger id="leverage" data-testid="select-leverage">
                    <SelectValue placeholder="Select leverage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1:50">1:50</SelectItem>
                    <SelectItem value="1:100">1:100</SelectItem>
                    <SelectItem value="1:200">1:200</SelectItem>
                    <SelectItem value="1:500">1:500</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex justify-center mt-6">
            <Button
              onClick={handleCreateAccount}
              className="bg-primary hover:bg-primary/90 px-8 py-6 text-lg font-semibold"
              disabled={createAccountMutation.isPending}
              data-testid="button-open-account"
            >
              {createAccountMutation.isPending ? (
                <>
                  <InlineLoader className="mr-2" />
                  Creating...
                </>
              ) : (
                "Open Trading Account"
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Declaration Modal */}
      <Dialog open={showDeclaration} onOpenChange={setShowDeclaration}>
        <DialogContent className="max-w-2xl bg-black/95 border-primary/30 text-gray-300">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-primary">
              Declaration
            </DialogTitle>
            <DialogDescription className="sr-only">
              Please read and confirm the trading account declaration
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-sm leading-relaxed">
              I am over 18 and declare that the information provided by me during the account opening process is true and correct and undertake to notify you, in writing, if there are any changes to this data. I guarantee that I do not breach any regulations of my country of residence in trading with Binofox.
            </p>
            
            <p className="text-sm leading-relaxed">
              I fully understand the nature and risks of trading Forex and other derivatives. I confirm I have read, understood and agree to be bound by all the Binofox statements, policies and agreements of the Business.
            </p>
            
            <div className="flex items-start space-x-3 pt-2">
              <Checkbox
                id="declaration-checkbox"
                checked={declarationConfirmed}
                onCheckedChange={(checked) => setDeclarationConfirmed(checked === true)}
                className="mt-1"
              />
              <Label
                htmlFor="declaration-checkbox"
                className="text-sm leading-relaxed cursor-pointer"
              >
                I confirm I have read, understood and agree to AML Policy, Client Agreement, Fraud Warning, Privacy Policy, Risk Disclaimer and Terms and Conditions agreements. I also confirm that I understand the full nature and risks involved in trading Forex, CFDs and other derivative products.
              </Label>
            </div>
          </div>

          <DialogFooter className="flex-row gap-3 sm:justify-end">
            <Button
              onClick={handleCloseDeclaration}
              variant="outline"
              className="bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
            >
              Close
            </Button>
            <Button
              onClick={handleConfirmDeclaration}
              className="bg-green-500 hover:bg-green-600 text-white"
              disabled={!declarationConfirmed}
            >
              Get Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Group accounts by type */}
      {(() => {
        const accountTypes = ["Live", "Demo", "IB", "Champion", "NDB", "Social"];
        const groupedAccounts = accountTypes.map(type => ({
          type,
          accounts: accounts.filter(acc => acc.type === type)
        })).filter(group => group.accounts.length > 0);

        if (groupedAccounts.length === 0) {
          return (
            <Card className="p-12 text-center border-card-border">
              <p className="text-muted-foreground">
                No trading accounts found. Create your first account above.
              </p>
            </Card>
          );
        }

        return groupedAccounts.map(({ type, accounts: typeAccounts }) => (
          <div key={type} className="space-y-4">
            <h2 className="text-2xl font-semibold mb-4">
              {type === "Live" ? "Live Accounts" :
               type === "Demo" ? "Demo Accounts" :
               type === "IB" ? "IB Accounts" :
               type === "Champion" ? "Champion Accounts" :
               type === "NDB" ? "NDB Accounts" :
               type === "Social" ? "Social Trading Accounts" : `${type} Accounts`}
            </h2>
            <Card className="border-primary/30 bg-black/80 backdrop-blur-xl overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
              <div className="p-6">
                <DataTable columns={columns} data={typeAccounts} />
              </div>
            </Card>
          </div>
        ));
      })()}
    </div>
  );
}
