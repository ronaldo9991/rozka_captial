import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import type { TradingAccount } from "@shared/schema";

interface AccountContextType {
  selectedAccount: TradingAccount | null;
  setSelectedAccount: (account: TradingAccount | null) => void;
  accountMode: "Live" | "Demo";
  setAccountMode: (mode: "Live" | "Demo") => void;
  accounts: TradingAccount[];
  isLoading: boolean;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [selectedAccount, setSelectedAccountState] = useState<TradingAccount | null>(null);
  const [accountMode, setAccountModeState] = useState<"Live" | "Demo">("Live");

  // Fetch trading accounts - no automatic refresh, only on mount and window focus
  const { data: accounts = [], isLoading } = useQuery<TradingAccount[]>({
    queryKey: ["/api/trading-accounts"],
    refetchInterval: false, // No automatic refresh
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Load from localStorage on mount
  useEffect(() => {
    const savedAccountId = localStorage.getItem("selectedAccountId");
    const savedMode = localStorage.getItem("accountMode") as "Live" | "Demo" | null;
    
    if (savedMode) {
      setAccountModeState(savedMode);
    }
    
    if (savedAccountId && accounts.length > 0) {
      const account = accounts.find((acc) => acc.id === savedAccountId);
      if (account) {
        setSelectedAccountState(account);
      }
    } else if (accounts.length > 0 && !selectedAccount) {
      // Auto-select first account of current mode
      const filtered = accounts.filter(
        (acc) => acc.type === accountMode && acc.enabled
      );
      if (filtered.length > 0) {
        setSelectedAccountState(filtered[0]);
        localStorage.setItem("selectedAccountId", filtered[0].id);
      }
    }
  }, [accounts, accountMode]);

  const setSelectedAccount = (account: TradingAccount | null) => {
    setSelectedAccountState(account);
    if (account) {
      localStorage.setItem("selectedAccountId", account.id);
    } else {
      localStorage.removeItem("selectedAccountId");
    }
  };

  const setAccountMode = (mode: "Live" | "Demo") => {
    setAccountModeState(mode);
    localStorage.setItem("accountMode", mode);
    
    // Auto-select first account of new mode
    const filtered = accounts.filter(
      (acc) => acc.type === mode && acc.enabled
    );
    if (filtered.length > 0) {
      setSelectedAccountState(filtered[0]);
      localStorage.setItem("selectedAccountId", filtered[0].id);
    } else {
      setSelectedAccountState(null);
      localStorage.removeItem("selectedAccountId");
    }
  };

  return (
    <AccountContext.Provider
      value={{
        selectedAccount,
        setSelectedAccount,
        accountMode,
        setAccountMode,
        accounts,
        isLoading,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error("useAccount must be used within an AccountProvider");
  }
  return context;
}

