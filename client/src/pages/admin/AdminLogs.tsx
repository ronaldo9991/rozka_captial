import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/DataTable";
import { Search, Activity, Loader2 } from "lucide-react";
import type { ActivityLog, AdminUser } from "@shared/schema";

export default function AdminLogs() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: logs = [], isLoading, refetch: refetchLogs, isFetching: isRefreshingLogs } = useQuery<ActivityLog[]>({
    queryKey: ["/api/admin/activity-logs"],
    refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
    refetchOnWindowFocus: true,
    staleTime: 0, // Always consider stale for real-time updates
  });

  const { data: admins = [] } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/admins"],
  });

  const getAdminName = (adminId: string | null) => {
    if (!adminId) return "System";
    const admin = admins.find((a) => a.id === adminId);
    return admin?.fullName || admin?.username || "Unknown";
  };

  const filteredLogs = logs.filter((log) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      log.action?.toLowerCase().includes(search) ||
      log.entity?.toLowerCase().includes(search) ||
      log.details?.toLowerCase().includes(search) ||
      getAdminName(log.adminId)?.toLowerCase().includes(search)
    );
  });

  const columns = [
    {
      key: "id",
      label: "Log ID",
      render: (value: string) => (
        <span className="font-mono text-xs">{value.slice(0, 8)}</span>
      ),
    },
    {
      key: "adminId",
      label: "Admin",
      sortable: true,
      sortValue: (row: ActivityLog) => getAdminName(row.adminId).toLowerCase(),
      render: (value: string | null) => (
        <span className="font-semibold">{getAdminName(value)}</span>
      ),
    },
    {
      key: "action",
      label: "Action",
      render: (value: string) => {
        const actionColors: Record<string, string> = {
          signin: "bg-blue-500",
          logout: "bg-gray-500",
          create: "bg-green-500",
          update: "bg-yellow-500",
          delete: "bg-red-500",
          approve: "bg-green-600",
          reject: "bg-red-600",
          enable: "bg-green-500",
          disable: "bg-orange-500",
        };
        
        const actionType = value.split("_")[0];
        const color = actionColors[actionType] || "bg-gray-500";
        
        return (
          <Badge className={`${color} text-white`}>
            {value.replace(/_/g, " ").toUpperCase()}
          </Badge>
        );
      },
    },
    {
      key: "entity",
      label: "Entity",
      render: (value: string) => (
        <Badge variant="outline">{value}</Badge>
      ),
    },
    {
      key: "entityId",
      label: "Entity ID",
      render: (value: string | null) => (
        <span className="font-mono text-xs">{value ? value.slice(0, 8) + "..." : "N/A"}</span>
      ),
    },
    {
      key: "details",
      label: "Details",
      render: (value: string | null) => (
        <span className="text-sm text-muted-foreground max-w-xs truncate block">
          {value || "No details"}
        </span>
      ),
    },
    {
      key: "ipAddress",
      label: "IP Address",
      render: (value: string | null) => (
        <span className="font-mono text-xs">{value || "N/A"}</span>
      ),
    },
    {
      key: "createdAt",
      label: "Timestamp",
      render: (value: Date) => (
        <div className="text-sm">
          <div>{new Date(value).toLocaleDateString()}</div>
          <div className="text-muted-foreground">{new Date(value).toLocaleTimeString()}</div>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Activity className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-1">Logs</h1>
          <p className="text-muted-foreground">System activity and audit trail</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="p-4 border-card-border">
          <p className="text-sm text-muted-foreground mb-1">Total Logs</p>
          <p className="text-2xl font-bold">{logs.length}</p>
        </Card>
        <Card className="p-4 border-card-border">
          <p className="text-sm text-muted-foreground mb-1">Today's Activity</p>
          <p className="text-2xl font-bold">
            {logs.filter((l) => new Date(l.createdAt).toDateString() === new Date().toDateString()).length}
          </p>
        </Card>
        <Card className="p-4 border-card-border">
          <p className="text-sm text-muted-foreground mb-1">Sign-ins</p>
          <p className="text-2xl font-bold text-blue-600">
            {logs.filter((l) => l.action === "signin").length}
          </p>
        </Card>
        <Card className="p-4 border-card-border">
          <p className="text-sm text-muted-foreground mb-1">Critical Actions</p>
          <p className="text-2xl font-bold text-red-600">
            {logs.filter((l) => l.action.includes("delete") || l.action.includes("disable")).length}
          </p>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-4 border-card-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by admin, action, entity, or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Logs Table */}
      <Card className="border-card-border">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Activity Logs</h2>
        </div>
        {filteredLogs.length > 0 ? (
          <DataTable 
            columns={columns} 
            data={filteredLogs} 
            exportFileName="activity-logs"
            onRefresh={() => refetchLogs()}
            isRefreshing={isRefreshingLogs}
          />
        ) : (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">
              {searchTerm ? "No logs match your search" : "No activity logs found"}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

