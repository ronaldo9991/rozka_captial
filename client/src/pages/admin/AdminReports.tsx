import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import DataTable from "@/components/DataTable";
import { Search, FileSpreadsheet, FileText, Download, CalendarIcon, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FullPageLoader } from "@/components/DashboardLoader";
import type { User, Deposit, Withdrawal } from "@shared/schema";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Extend jsPDF types
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export default function AdminReports() {
  const [activeTab, setActiveTab] = useState("deposits");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const { toast } = useToast();

  // Fetch data
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    staleTime: 60000,
  });

  const { data: deposits = [], isLoading: depositsLoading } = useQuery<Deposit[]>({
    queryKey: ["/api/admin/deposits"],
    staleTime: 30000,
  });

  const { data: withdrawals = [], isLoading: withdrawalsLoading } = useQuery<Withdrawal[]>({
    queryKey: ["/api/admin/withdrawals"],
    staleTime: 30000,
  });

  // Create user map
  const userMap = new Map(users.map(u => [u.id, u]));

  // Filter data by date range
  const filterByDate = <T extends { createdAt?: Date }>(data: T[]) => {
    return data.filter(item => {
      if (!item.createdAt) return true;
      const itemDate = new Date(item.createdAt);
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        if (itemDate < fromDate) return false;
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (itemDate > toDate) return false;
      }
      return true;
    });
  };

  // Filter by search
  const filterBySearch = <T extends Record<string, any>>(data: T[], fields: string[]) => {
    if (!searchTerm) return data;
    const searchLower = searchTerm.toLowerCase();
    return data.filter(item => {
      return fields.some(field => {
        const value = item[field];
        if (typeof value === "string") return value.toLowerCase().includes(searchLower);
        if (typeof value === "number") return value.toString().includes(searchLower);
        return false;
      });
    });
  };

  // Prepare deposits data
  const depositsData = filterBySearch(
    filterByDate(deposits).map(d => {
      const user = userMap.get(d.userId);
      return {
        id: d.id?.slice(-5) || "N/A",
        client: user?.fullName || user?.username || "Unknown",
        accountId: d.accountId || "N/A",
        date: d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "N/A",
        method: d.method || "N/A",
        amount: `USD ${parseFloat(d.amount || "0").toFixed(2)}`,
        rawAmount: parseFloat(d.amount || "0"),
        status: d.status || "Pending",
      };
    }),
    ["client", "accountId", "method"]
  );

  // Prepare withdrawals data
  const withdrawalsData = filterBySearch(
    filterByDate(withdrawals).map(w => {
      const user = userMap.get(w.userId);
      return {
        id: w.id?.slice(-5) || "N/A",
        client: user?.fullName || user?.username || "Unknown",
        accountId: w.accountId || "N/A",
        date: w.createdAt ? new Date(w.createdAt).toLocaleDateString() : "N/A",
        method: w.method || "Wire Transfer",
        amount: `USD ${parseFloat(w.amount || "0").toFixed(2)}`,
        rawAmount: parseFloat(w.amount || "0"),
        status: w.status || "Pending",
      };
    }),
    ["client", "accountId", "method"]
  );

  // Prepare topup data (simulated from deposits)
  const topupData = filterBySearch(
    filterByDate(deposits)
      .filter(d => d.method === "TopUp" || d.method === "topup" || d.method === "Cash")
      .map(d => {
        const user = userMap.get(d.userId);
        return {
          id: d.id?.slice(-5) || "N/A",
          client: user?.fullName || user?.username || "Unknown",
          accountId: d.accountId || "N/A",
          date: d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "N/A",
          method: "TopUp",
          amount: `USD ${parseFloat(d.amount || "0").toFixed(2)}`,
          rawAmount: parseFloat(d.amount || "0"),
          status: d.status || "Pending",
        };
      }),
    ["client", "accountId"]
  );

  // Calculate totals
  const totalDeposits = depositsData.reduce((sum, d) => sum + d.rawAmount, 0);
  const totalWithdrawals = withdrawalsData.reduce((sum, w) => sum + w.rawAmount, 0);
  const totalTopups = topupData.reduce((sum, t) => sum + t.rawAmount, 0);

  // Export to Excel
  const exportToExcel = (data: any[], filename: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data.map(({ rawAmount, ...rest }) => rest));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast({
      title: "Excel Exported",
      description: `${filename} report has been downloaded.`,
    });
  };

  // Export to PDF
  const exportToPDF = (data: any[], filename: string, title: string) => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.setTextColor(212, 175, 55); // Gold color
    doc.text(title, 14, 22);
    
    // Add date range
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
    if (dateFrom || dateTo) {
      const fromStr = dateFrom ? format(dateFrom, "dd/MM/yyyy") : "Start";
      const toStr = dateTo ? format(dateTo, "dd/MM/yyyy") : "End";
      doc.text(`Date Range: ${fromStr} - ${toStr}`, 14, 36);
    }
    
    // Add table
    const tableData = data.map(({ rawAmount, ...rest }) => Object.values(rest));
    const headers = Object.keys(data[0] || {}).filter(k => k !== "rawAmount");
    
    doc.autoTable({
      head: [headers.map(h => h.charAt(0).toUpperCase() + h.slice(1))],
      body: tableData,
      startY: dateFrom || dateTo ? 42 : 36,
      theme: "grid",
      headStyles: {
        fillColor: [212, 175, 55],
        textColor: [0, 0, 0],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
    });
    
    // Add total
    const finalY = (doc as any).lastAutoTable.finalY || 50;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    const total = data.reduce((sum, d) => sum + (d.rawAmount || 0), 0);
    doc.text(`Total Amount: USD ${total.toFixed(2)}`, 14, finalY + 10);
    
    doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
    toast({
      title: "PDF Exported",
      description: `${filename} report has been downloaded.`,
    });
  };

  const columns = [
    { key: "id", label: "ID", sortable: true },
    { key: "client", label: "Client", sortable: true },
    { key: "accountId", label: "Account", sortable: true },
    { key: "date", label: "Date", sortable: true },
    { key: "method", label: "Method", sortable: true },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      render: (value: string) => (
        <span className="font-semibold text-green-600">{value}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => {
        const colors: Record<string, string> = {
          Completed: "bg-green-500",
          Approved: "bg-green-500",
          Pending: "bg-yellow-500",
          Rejected: "bg-red-500",
        };
        return (
          <Badge className={`${colors[value] || "bg-gray-500"} text-white`}>
            {value}
          </Badge>
        );
      },
    },
  ];

  if (usersLoading || depositsLoading || withdrawalsLoading) {
    return <FullPageLoader text="Loading reports..." />;
  }

  const getCurrentData = () => {
    switch (activeTab) {
      case "deposits": return depositsData;
      case "withdrawals": return withdrawalsData;
      case "topup": return topupData;
      default: return [];
    }
  };

  const getCurrentTitle = () => {
    switch (activeTab) {
      case "deposits": return "Deposits Report";
      case "withdrawals": return "Withdrawals Report";
      case "topup": return "TopUp Report";
      default: return "Report";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Generate and export financial reports</p>
        </div>
        <div className="flex gap-2">
          <span className="text-sm text-muted-foreground">Home</span>
          <span className="text-sm text-muted-foreground">/</span>
          <span className="text-sm font-medium">Reports</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 border-green-500/30 bg-green-500/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Deposits</p>
              <p className="text-3xl font-bold text-green-600">
                ${totalDeposits.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{depositsData.length} transactions</p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-red-500/30 bg-red-500/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Withdrawals</p>
              <p className="text-3xl font-bold text-red-600">
                ${totalWithdrawals.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{withdrawalsData.length} transactions</p>
            </div>
            <div className="p-3 bg-red-500/20 rounded-full">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-blue-500/30 bg-blue-500/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total TopUps</p>
              <p className="text-3xl font-bold text-blue-600">
                ${totalTopups.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{topupData.length} transactions</p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-full">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-40 justify-start text-left font-normal",
                    !dateFrom && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, "dd/MM/yyyy") : <span>From</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={setDateFrom}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <span className="text-muted-foreground">to</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-40 justify-start text-left font-normal",
                    !dateTo && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, "dd/MM/yyyy") : <span>To</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={setDateTo}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex-1" />

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList className="bg-card border">
            <TabsTrigger value="deposits" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
              Deposits Report
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
              Withdrawals Report
            </TabsTrigger>
            <TabsTrigger value="topup" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              TopUp Report
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-green-500 text-green-600 hover:bg-green-500/10"
              onClick={() => exportToExcel(getCurrentData(), getCurrentTitle().replace(" ", "_"))}
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
            <Button
              variant="outline"
              className="border-red-500 text-red-600 hover:bg-red-500/10"
              onClick={() => exportToPDF(getCurrentData(), getCurrentTitle().replace(" ", "_"), getCurrentTitle())}
            >
              <FileText className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        <TabsContent value="deposits" className="mt-4">
          <Card className="p-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold">Deposits Report</h2>
              <p className="text-sm text-muted-foreground">
                Showing {depositsData.length} deposit transactions
                {dateFrom || dateTo ? ` from ${dateFrom ? format(dateFrom, "dd/MM/yyyy") : "start"} to ${dateTo ? format(dateTo, "dd/MM/yyyy") : "end"}` : ""}
              </p>
            </div>
            <DataTable
              columns={columns}
              data={depositsData}
              exportFileName="deposits-report"
              showExportButtons={false}
            />
            <div className="mt-4 pt-4 border-t text-right">
              <span className="text-lg font-semibold">
                Total amount: <span className="text-green-600">USD {totalDeposits.toFixed(2)}</span>
              </span>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="withdrawals" className="mt-4">
          <Card className="p-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold">Withdrawals Report</h2>
              <p className="text-sm text-muted-foreground">
                Showing {withdrawalsData.length} withdrawal transactions
                {dateFrom || dateTo ? ` from ${dateFrom ? format(dateFrom, "dd/MM/yyyy") : "start"} to ${dateTo ? format(dateTo, "dd/MM/yyyy") : "end"}` : ""}
              </p>
            </div>
            <DataTable
              columns={columns}
              data={withdrawalsData}
              exportFileName="withdrawals-report"
              showExportButtons={false}
            />
            <div className="mt-4 pt-4 border-t text-right">
              <span className="text-lg font-semibold">
                Total amount: <span className="text-red-600">USD {totalWithdrawals.toFixed(2)}</span>
              </span>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="topup" className="mt-4">
          <Card className="p-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold">TopUp Report</h2>
              <p className="text-sm text-muted-foreground">
                Showing {topupData.length} topup transactions
                {dateFrom || dateTo ? ` from ${dateFrom ? format(dateFrom, "dd/MM/yyyy") : "start"} to ${dateTo ? format(dateTo, "dd/MM/yyyy") : "end"}` : ""}
              </p>
            </div>
            <DataTable
              columns={columns}
              data={topupData}
              exportFileName="topup-report"
              showExportButtons={false}
            />
            <div className="mt-4 pt-4 border-t text-right">
              <span className="text-lg font-semibold">
                Total amount: <span className="text-blue-600">USD {totalTopups.toFixed(2)}</span>
              </span>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

