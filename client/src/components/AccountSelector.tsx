import { useAccount } from "@/contexts/AccountContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Monitor, RefreshCw, Loader2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AccountSelectorProps {
  showLiveDemoToggle?: boolean;
}

export default function AccountSelector({ 
  showLiveDemoToggle = true 
}: AccountSelectorProps) {
  const { toast } = useToast();
  const {
    selectedAccount,
    setSelectedAccount,
    accountMode,
    setAccountMode,
    accounts,
    isLoading,
  } = useAccount();

  // Filter accounts by mode (Live or Demo)
  const filteredAccounts = accounts.filter((acc) => {
    if (accountMode === "Live") {
      return acc.type === "Live" && acc.enabled;
    } else {
      return acc.type === "Demo" && acc.enabled;
    }
  });

  const handleAccountChange = (accountId: string) => {
    const account = accounts.find((acc) => acc.id === accountId);
    if (account) {
      setSelectedAccount(account);
      toast({
        title: "Account Switched",
        description: `Switched to ${account.accountId} (${account.type})`,
      });
      // Invalidate queries to refresh data in real-time
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trading-accounts"] });
    }
  };

  const handleModeChange = (mode: "Live" | "Demo") => {
    setAccountMode(mode);
    toast({
      title: "Mode Switched",
      description: `Switched to ${mode} mode`,
    });
    // Invalidate queries to refresh data in real-time
    queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
  };

  const refreshAccounts = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/trading-accounts"] });
    toast({
      title: "Refreshing",
      description: "Updating account information...",
    });
  };

  if (isLoading) {
    return (
      <Card className="p-4 border-card-border">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading accounts...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 border-primary/30 bg-black/80 backdrop-blur-xl">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        {/* Live/Demo Toggle */}
        {showLiveDemoToggle && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Mode:</span>
            <div className="flex gap-1 bg-primary/10 rounded-lg p-1">
              <Button
                variant={accountMode === "Live" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleModeChange("Live")}
                className={`${
                  accountMode === "Live"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Live
              </Button>
              <Button
                variant={accountMode === "Demo" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleModeChange("Demo")}
                className={`${
                  accountMode === "Demo"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Demo
              </Button>
            </div>
          </div>
        )}

        {/* Account Selector */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Trading Account:</span>
            <Select
              value={selectedAccount?.id || ""}
              onValueChange={handleAccountChange}
            >
              <SelectTrigger className="w-full md:w-[300px] bg-black/40 border-primary/20">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {filteredAccounts.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No {accountMode} accounts available
                  </SelectItem>
                ) : (
                  filteredAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex items-center justify-between w-full gap-4">
                        <span className="font-mono font-semibold">{account.accountId}</span>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={account.type === "Live" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {account.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            ${parseFloat(account.balance || "0").toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Selected Account Info */}
        {selectedAccount && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Balance</div>
              <div className="text-sm font-semibold text-primary">
                ${parseFloat(selectedAccount.balance || "0").toFixed(2)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Equity</div>
              <div className="text-sm font-semibold">
                ${parseFloat(selectedAccount.equity || "0").toFixed(2)}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshAccounts}
              className="hover:bg-primary/10"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open("https://web.binofox.com/terminal", "_blank")}
              className="border-primary/30 hover:bg-primary/10"
            >
              <Monitor className="w-4 h-4 mr-2" />
              Open Terminal
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

