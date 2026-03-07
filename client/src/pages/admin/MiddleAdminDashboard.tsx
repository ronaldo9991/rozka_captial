import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/DataTable";
import StatCard from "@/components/StatCard";
import { Users, FileText, Wallet, DollarSign, Loader2, MapPin } from "lucide-react";
import type { AdminUser, User, Document, TradingAccount } from "@shared/schema";

interface AdminStats {
  totalUsers: number;
  pendingDocuments: number;
  totalTradingAccounts: number;
  totalDeposits: number;
}

interface CountryAssignment {
  id: string;
  adminId: string;
  country: string;
  assignedAt: Date;
}

interface MiddleAdminDashboardProps {
  admin: AdminUser;
}

export default function MiddleAdminDashboard({ admin }: MiddleAdminDashboardProps) {
  const { data: stats, isLoading: loadingStats } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: users = [], isLoading: loadingUsers } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: documents = [], isLoading: loadingDocuments } = useQuery<Document[]>({
    queryKey: ["/api/admin/documents"],
  });

  const { data: tradingAccounts = [], isLoading: loadingAccounts } = useQuery<TradingAccount[]>({
    queryKey: ["/api/admin/trading-accounts"],
  });

  const { data: assignments = [], isLoading: loadingAssignments } = useQuery<CountryAssignment[]>({
    queryKey: ["/api/admin/country-assignments", admin.id],
  });

  const userColumns = [
    {
      key: "username",
      label: "Username",
      render: (value: string) => <span className="font-semibold">{value}</span>,
    },
    { key: "email", label: "Email" },
    { key: "fullName", label: "Full Name" },
    { key: "country", label: "Country" },
    {
      key: "verified",
      label: "Verified",
      render: (value: boolean) => (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? "Verified" : "Unverified"}
        </Badge>
      ),
    },
    {
      key: "enabled",
      label: "Status",
      render: (value: boolean) => (
        <Badge variant={value ? "default" : "outline"}>
          {value ? "Enabled" : "Disabled"}
        </Badge>
      ),
    },
  ];

  const documentColumns = [
    {
      key: "userId",
      label: "User",
      render: (_: string, row: Document) => {
        const user = users.find((u) => u.id === row.userId);
        return <span className="font-semibold">{user?.username || "Unknown"}</span>;
      },
    },
    { key: "type", label: "Document Type" },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <Badge variant={value === "Pending" ? "secondary" : value === "Verified" ? "default" : "outline"}>
          {value}
        </Badge>
      ),
    },
    {
      key: "uploadedAt",
      label: "Upload Date",
      render: (value: Date) => new Date(value).toLocaleDateString(),
    },
  ];

  const accountColumns = [
    {
      key: "accountId",
      label: "Account ID",
      render: (value: string) => <span className="font-mono font-semibold">{value}</span>,
    },
    {
      key: "type",
      label: "Type",
      render: (value: string) => (
        <Badge variant={value === "Live" ? "default" : "secondary"}>
          {value}
        </Badge>
      ),
    },
    { key: "group", label: "Group" },
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

  if (loadingStats || loadingUsers || loadingDocuments || loadingAccounts || loadingAssignments) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const assignedCountries = assignments.map((a) => a.country);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Middle Admin Dashboard</h1>
        <p className="text-muted-foreground">Managing users from assigned countries</p>
      </div>

      <Card className="p-6 border-card-border">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Assigned Countries</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {assignedCountries.length > 0 ? (
            assignedCountries.map((country) => (
              <Badge key={country} variant="default" data-testid={`badge-country-${country}`}>
                {country}
              </Badge>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">No countries assigned yet</p>
          )}
        </div>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers.toString() || "0"}
          icon={Users}
          index={0}
        />
        <StatCard
          title="Pending Documents"
          value={stats?.pendingDocuments.toString() || "0"}
          icon={FileText}
          index={1}
        />
        <StatCard
          title="Trading Accounts"
          value={stats?.totalTradingAccounts.toString() || "0"}
          icon={Wallet}
          index={2}
        />
        <StatCard
          title="Total Deposits"
          value={stats?.totalDeposits.toString() || "0"}
          icon={DollarSign}
          index={3}
        />
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Users from Assigned Countries</h2>
        {users.length > 0 ? (
          <DataTable columns={userColumns} data={users} />
        ) : (
          <Card className="p-12 text-center border-card-border">
            <p className="text-muted-foreground">No users found</p>
          </Card>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Documents</h2>
        {documents.length > 0 ? (
          <DataTable columns={documentColumns} data={documents} />
        ) : (
          <Card className="p-12 text-center border-card-border">
            <p className="text-muted-foreground">No documents found</p>
          </Card>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Trading Accounts</h2>
        {tradingAccounts.length > 0 ? (
          <DataTable columns={accountColumns} data={tradingAccounts} />
        ) : (
          <Card className="p-12 text-center border-card-border">
            <p className="text-muted-foreground">No trading accounts found</p>
          </Card>
        )}
      </div>
    </div>
  );
}
