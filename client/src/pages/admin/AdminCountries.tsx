import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Loader2, Globe, Users, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import DataTable from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import type { User } from "@shared/schema";
import { CountryFlag } from "@/lib/country-flags";

interface CountryStats {
  country: string;
  totalUsers: number;
  totalAccounts: number;
  totalDeposits: number;
  users: User[];
}

export default function AdminCountries() {
  const { data: users = [], isLoading: usersLoading, refetch: refetchUsers, isFetching: isRefreshingUsers } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    refetchInterval: 30000,
  });

  const { data: accounts = [], refetch: refetchAccounts, isFetching: isRefreshingAccounts } = useQuery({
    queryKey: ["/api/admin/trading-accounts"],
    refetchInterval: 30000,
  });

  const { data: deposits = [], refetch: refetchDeposits, isFetching: isRefreshingDeposits } = useQuery({
    queryKey: ["/api/admin/deposits"],
    refetchInterval: 30000,
  });

  // Combined refresh function
  const handleRefresh = async () => {
    await Promise.all([refetchUsers(), refetchAccounts(), refetchDeposits()]);
  };

  if (usersLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate country statistics
  const countryMap = new Map<string, CountryStats>();

  users.forEach((user) => {
    const country = user.country || "Unknown";
    if (!countryMap.has(country)) {
      countryMap.set(country, {
        country,
        totalUsers: 0,
        totalAccounts: 0,
        totalDeposits: 0,
        users: [],
      });
    }
    const stats = countryMap.get(country)!;
    stats.totalUsers++;
    stats.users.push(user);
  });

  // Count accounts by country
  accounts.forEach((account: any) => {
    const user = users.find((u) => u.id === account.userId);
    if (user && user.country) {
      const country = user.country;
      if (countryMap.has(country)) {
        countryMap.get(country)!.totalAccounts++;
      }
    }
  });

  // Count deposits by country
  deposits.forEach((deposit: any) => {
    const user = users.find((u) => u.id === deposit.userId);
    if (user && user.country) {
      const country = user.country;
      if (countryMap.has(country)) {
        const depositAmount = parseFloat(deposit.amount || "0");
        countryMap.get(country)!.totalDeposits += depositAmount;
      }
    }
  });

  const countryStats = Array.from(countryMap.values())
    .sort((a, b) => b.totalUsers - a.totalUsers)
    .map((stats) => ({
      ...stats,
      totalDeposits: stats.totalDeposits.toFixed(2),
    }));

  const totalCountries = countryStats.length;
  const totalUsers = users.length;
  const totalAccounts = accounts.length;
  const totalDeposits = deposits.reduce(
    (sum, d: any) => sum + parseFloat(d.amount || "0"),
    0
  );

  const columns = [
    {
      key: "country",
      label: "Country",
      render: (_: any, row: CountryStats) => (
        <div className="flex items-center gap-2">
          <CountryFlag country={row.country} size="md" />
          <span className="font-semibold">{row.country}</span>
        </div>
      ),
    },
    {
      key: "totalUsers",
      label: "Total Users",
      render: (_: any, row: CountryStats) => (
        <Badge className="bg-primary/20 text-primary hover:bg-primary/30">
          {row.totalUsers}
        </Badge>
      ),
    },
    {
      key: "totalAccounts",
      label: "Total Accounts",
      render: (_: any, row: CountryStats) => (
        <Badge className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30">
          {row.totalAccounts}
        </Badge>
      ),
    },
    {
      key: "totalDeposits",
      label: "Total Deposits",
      render: (_: any, row: CountryStats) => (
        <span className="font-semibold text-green-400">
          ${parseFloat(row.totalDeposits).toLocaleString()}
        </span>
      ),
    },
    {
      key: "users",
      label: "Users",
      render: (_: any, row: CountryStats) => (
        <div className="max-w-xs">
          <div className="flex flex-wrap gap-1">
            {row.users.slice(0, 3).map((user) => (
              <Badge
                key={user.id}
                variant="outline"
                className="text-xs"
              >
                {user?.fullName || user?.username || user?.email || 'Unknown'}
              </Badge>
            ))}
            {row.users.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{row.users.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
          Countries
        </h1>
        <p className="text-muted-foreground">
          View user distribution and statistics by country
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 border-primary/30 bg-gradient-to-br from-black/80 to-primary/10 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <Globe className="w-8 h-8 text-primary" />
              <span className="text-xs uppercase tracking-wider text-primary/70">
                Total Countries
              </span>
            </div>
            <div className="text-3xl font-bold text-primary mb-1">
              {totalCountries}
            </div>
            <p className="text-xs text-muted-foreground">
              Countries with registered users
            </p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 border-primary/30 bg-gradient-to-br from-black/80 to-primary/10 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-blue-400" />
              <span className="text-xs uppercase tracking-wider text-blue-400/70">
                Total Users
              </span>
            </div>
            <div className="text-3xl font-bold text-blue-400 mb-1">
              {totalUsers}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all countries
            </p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 border-primary/30 bg-gradient-to-br from-black/80 to-primary/10 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-green-400" />
              <span className="text-xs uppercase tracking-wider text-green-400/70">
                Total Accounts
              </span>
            </div>
            <div className="text-3xl font-bold text-green-400 mb-1">
              {totalAccounts}
            </div>
            <p className="text-xs text-muted-foreground">
              Trading accounts created
            </p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 border-primary/30 bg-gradient-to-br from-black/80 to-primary/10 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-yellow-400" />
              <span className="text-xs uppercase tracking-wider text-yellow-400/70">
                Total Deposits
              </span>
            </div>
            <div className="text-3xl font-bold text-yellow-400 mb-1">
              ${totalDeposits.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total deposit volume
            </p>
          </Card>
        </motion.div>
      </div>

      {/* Countries Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-6 border-primary/30 bg-gradient-to-br from-black/80 to-primary/10 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
              <Globe className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                Country Breakdown
              </h3>
              <p className="text-xs text-muted-foreground">
                Detailed statistics by country
              </p>
            </div>
          </div>

          {countryStats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Globe className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No country data available</p>
            </div>
          ) : (
            <DataTable 
              data={countryStats} 
              columns={columns}
              onRefresh={handleRefresh}
              isRefreshing={isRefreshingUsers || isRefreshingAccounts || isRefreshingDeposits}
            />
          )}
        </Card>
      </motion.div>
    </div>
  );
}

