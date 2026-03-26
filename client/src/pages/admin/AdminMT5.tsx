import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/DataTable";
import { Search, Eye, EyeOff, Copy, Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FullPageLoader } from "@/components/DashboardLoader";

interface MT5Account {
  id: string;
  userId: string;
  accountId: string;
  password: string;
  type: string;
  group: string;
  leverage: string;
  server: string;
  currency: string;
  balance: string;
  equity: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    email: string;
    fullName: string | null;
    phone: string | null;
    country: string | null;
  };
}

export default function AdminMT5() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [copiedAccountId, setCopiedAccountId] = useState<string | null>(null);
  const [copiedPassword, setCopiedPassword] = useState<string | null>(null);

  const { data: accounts = [], isLoading } = useQuery<MT5Account[]>({
    queryKey: ["/api/admin/mt5/accounts"],
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const filteredAccounts = accounts.filter((account) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      account.accountId.toLowerCase().includes(searchLower) ||
      account.user.username.toLowerCase().includes(searchLower) ||
      account.user.email.toLowerCase().includes(searchLower) ||
      (account.user.fullName?.toLowerCase().includes(searchLower) ?? false) ||
      account.type.toLowerCase().includes(searchLower) ||
      account.group.toLowerCase().includes(searchLower)
    );
  });

  const togglePasswordVisibility = (accountId: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [accountId]: !prev[accountId],
    }));
  };

  const copyToClipboard = async (text: string, type: "accountId" | "password", accountId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "accountId") {
        setCopiedAccountId(accountId);
        setTimeout(() => setCopiedAccountId(null), 2000);
      } else {
        setCopiedPassword(accountId);
        setTimeout(() => setCopiedPassword(null), 2000);
      }
      toast({
        title: "Copied!",
        description: `${type === "accountId" ? "Account ID" : "Password"} copied to clipboard`,
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const columns = [
    {
      header: "Client Name",
      accessor: (row: MT5Account) => (
        <div>
          <div className="font-medium">{row.user.fullName || row.user.username}</div>
          <div className="text-sm text-muted-foreground">{row.user.email}</div>
        </div>
      ),
    },
    {
      header: "MT5 Login",
      accessor: (row: MT5Account) => (
        <div className="flex items-center gap-2">
          <span className="font-mono font-medium">{row.accountId}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => copyToClipboard(row.accountId, "accountId", row.id)}
          >
            {copiedAccountId === row.id ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>
      ),
    },
    {
      header: "MT5 Password",
      accessor: (row: MT5Account) => (
        <div className="flex items-center gap-2">
          <span className="font-mono">
            {showPasswords[row.id] ? row.password : "••••••••"}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => togglePasswordVisibility(row.id)}
          >
            {showPasswords[row.id] ? (
              <EyeOff className="h-3 w-3" />
            ) : (
              <Eye className="h-3 w-3" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => copyToClipboard(row.password, "password", row.id)}
          >
            {copiedPassword === row.id ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>
      ),
    },
    {
      header: "Account Type",
      accessor: (row: MT5Account) => (
        <Badge variant={row.type === "Live" ? "default" : "secondary"}>
          {row.type}
        </Badge>
      ),
    },
    {
      header: "Group",
      accessor: "group",
    },
    {
      header: "Leverage",
      accessor: "leverage",
    },
    {
      header: "Server",
      accessor: "server",
    },
    {
      header: "Balance",
      accessor: (row: MT5Account) => (
        <span className="font-medium">
          {parseFloat(row.balance || "0").toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{" "}
          {row.currency}
        </span>
      ),
    },
    {
      header: "Equity",
      accessor: (row: MT5Account) => (
        <span className="font-medium">
          {parseFloat(row.equity || "0").toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{" "}
          {row.currency}
        </span>
      ),
    },
    {
      header: "Client Info",
      accessor: (row: MT5Account) => (
        <div className="text-sm">
          {row.user.phone && <div>Phone: {row.user.phone}</div>}
          {row.user.country && <div>Country: {row.user.country}</div>}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <FullPageLoader />;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">MT5 Accounts</h1>
          <p className="text-muted-foreground mt-1">
            Manage and view all client MT5 login credentials
          </p>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by account ID, client name, email, or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="mb-4 text-sm text-muted-foreground">
          Total Accounts: <span className="font-semibold text-foreground">{filteredAccounts.length}</span>
        </div>

        <DataTable
          data={filteredAccounts}
          columns={columns}
          searchTerm={searchTerm}
          emptyMessage="No MT5 accounts found"
        />
      </Card>
    </div>
  );
}






