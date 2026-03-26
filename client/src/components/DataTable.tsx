import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Download, FileText, FileSpreadsheet, FileCode, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// Extend jsPDF types
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
  sortValue?: (row: any) => any; // Custom function to extract sort value
  exportValue?: (row: any) => string | number; // Custom function to extract export value (for PDF/CSV/Excel)
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  rowsPerPage?: number;
  exportFileName?: string;
  showExportButtons?: boolean;
  onRefresh?: () => void | Promise<void>;
  isRefreshing?: boolean;
}

type SortDirection = "asc" | "desc" | null;

export default function DataTable({
  columns,
  data,
  rowsPerPage = 10,
  exportFileName = "export",
  showExportButtons = true,
  onRefresh,
  isRefreshing = false,
}: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [currentRowsPerPage, setCurrentRowsPerPage] = useState(rowsPerPage);

  // Reset to page 1 when data changes or rows per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data.length, currentRowsPerPage]);

  // Helper function to get nested value from object using dot notation
  const getNestedValue = (obj: any, path: string): any => {
    if (!path) return undefined;
    const keys = path.split(".");
    let value = obj;
    for (const key of keys) {
      if (value == null) return undefined;
      value = value[key];
    }
    return value;
  };

  // Extract text content from rendered cells for export
  const getCellText = (value: any, row: any, column: Column): string => {
    // Priority 1: Use exportValue function if provided (most reliable)
    if (column.exportValue) {
      const exportVal = column.exportValue(row);
      if (exportVal != null) return String(exportVal);
    }
    
    // Priority 2: Try to extract from render function result
    if (column.render) {
      const rendered = column.render(value, row);
      // If render returns a simple string/number, use it
      if (typeof rendered === "string") return rendered;
      if (typeof rendered === "number") return String(rendered);
      
      // For React elements, try to extract text content
      if (rendered && typeof rendered === "object") {
        // Check if it's a React element with children
        if ("props" in rendered && rendered.props) {
          // Try to get children text
          if (typeof rendered.props.children === "string") {
            return rendered.props.children;
          }
          if (typeof rendered.props.children === "number") {
            return String(rendered.props.children);
          }
          // For Badge components, try to get the text
          if (rendered.props.children && typeof rendered.props.children === "string") {
            return rendered.props.children;
          }
        }
      }
    }
    
    // Priority 3: Use sortValue if available (often contains the display value)
    if (column.sortValue) {
      const sortVal = column.sortValue(row);
      if (sortVal != null) {
        // Convert to string, handling dates
        if (sortVal instanceof Date) {
          return sortVal.toLocaleDateString();
        }
        return String(sortVal);
      }
    }
    
    // Priority 4: Support nested keys for value extraction
    const actualValue = getNestedValue(row, column.key) ?? value;
    
    // Handle dates
    if (actualValue instanceof Date) {
      return actualValue.toLocaleDateString();
    }
    
    // Handle null/undefined
    if (actualValue == null) return "";
    
    // Return string representation
    return String(actualValue);
  };

  // Export to PDF
  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Filter out columns that should be excluded from export (empty exportValue)
      const exportColumns = columns.filter((col) => {
        // Skip action columns (they typically have empty exportValue)
        if (col.key === "actions" || col.label.toLowerCase() === "action") {
          return false;
        }
        if (col.exportValue) {
          // If exportValue is explicitly set to return empty string, exclude it
          // But we need to check if it's actually meant to be excluded
          // We'll check by trying it on first row if available
          if (sortedData.length > 0) {
            try {
              const testValue = col.exportValue(sortedData[0]);
              // If it returns empty string, it's likely meant to be excluded
              if (testValue === "") return false;
            } catch (e) {
              // If error, include it anyway
            }
          }
        }
        return true; // Include columns without exportValue or with valid exportValue
      });
      
      // Prepare table data with only exportable columns
      const tableData = sortedData.map((row) =>
        exportColumns.map((col) => getCellText(row[col.key], row, col))
      );

      // Add title
      doc.setFontSize(16);
      doc.text(exportFileName.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()), 14, 15);
      
      // Add generation date
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);

      // Add table using autoTable
      autoTable(doc, {
        head: [exportColumns.map((col) => col.label)],
        body: tableData,
        startY: 28,
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [255, 140, 0], textColor: [0, 0, 0], fontStyle: "bold" },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        columnStyles: {
          // Auto-adjust column widths
          0: { cellWidth: "auto" },
        },
        margin: { top: 28 },
      });

      doc.save(`${exportFileName}.pdf`);
    } catch (error) {
      console.error("PDF export error:", error);
      // Fallback: try using doc.autoTable directly
      try {
        const doc = new jsPDF();
        
        // Filter out excluded columns
        const exportColumns = columns.filter((col) => {
          if (col.key === "actions" || col.label.toLowerCase() === "action") {
            return false;
          }
          if (col.exportValue && sortedData.length > 0) {
            try {
              const testValue = col.exportValue(sortedData[0]);
              if (testValue === "") return false;
            } catch (e) {
              // If error, include it anyway
            }
          }
          return true;
        });
        
        const tableData = sortedData.map((row) =>
          exportColumns.map((col) => getCellText(row[col.key], row, col))
        );
        
        doc.setFontSize(16);
        doc.text(exportFileName.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()), 14, 15);
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);
        
        doc.autoTable({
          head: [exportColumns.map((col) => col.label)],
          body: tableData,
          startY: 28,
          styles: { fontSize: 9, cellPadding: 3 },
          headStyles: { fillColor: [255, 140, 0], textColor: [0, 0, 0], fontStyle: "bold" },
          alternateRowStyles: { fillColor: [245, 245, 245] },
        });
        doc.save(`${exportFileName}.pdf`);
      } catch (fallbackError) {
        console.error("PDF export fallback error:", fallbackError);
        alert("Failed to export PDF. Please try again.");
      }
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    // Filter out columns that should be excluded from export
    const exportColumns = columns.filter((col) => {
      if (col.key === "actions" || col.label.toLowerCase() === "action") {
        return false;
      }
      if (col.exportValue && sortedData.length > 0) {
        try {
          const testValue = col.exportValue(sortedData[0]);
          if (testValue === "") return false;
        } catch (e) {
          // If error, include it anyway
        }
      }
      return true;
    });
    
    // Prepare data for Excel
    const excelData = sortedData.map((row) => {
      const rowData: any = {};
      exportColumns.forEach((col) => {
        rowData[col.label] = getCellText(row[col.key], row, col);
      });
      return rowData;
    });

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // Auto-size columns
    const maxWidth = 50;
    const colWidths = exportColumns.map((col) => {
      const headerLength = col.label.length;
      if (excelData.length === 0) {
        return Math.min(headerLength + 2, maxWidth);
      }
      const maxDataLength = Math.max(
        ...excelData.map((row) => String(row[col.label] || "").length)
      );
      return Math.min(Math.max(headerLength, maxDataLength) + 2, maxWidth);
    });
    ws["!cols"] = colWidths.map((w) => ({ wch: w }));
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    // Write file
    XLSX.writeFile(wb, `${exportFileName}.xlsx`);
  };

  // Export to CSV
  const exportToCSV = () => {
    // Filter out columns that should be excluded from export
    const exportColumns = columns.filter((col) => {
      if (col.key === "actions" || col.label.toLowerCase() === "action") {
        return false;
      }
      if (col.exportValue && sortedData.length > 0) {
        try {
          const testValue = col.exportValue(sortedData[0]);
          if (testValue === "") return false;
        } catch (e) {
          // If error, include it anyway
        }
      }
      return true;
    });
    
    // Prepare data for CSV (same structure as Excel)
    const csvData = sortedData.map((row) => {
      const rowData: any = {};
      exportColumns.forEach((col) => {
        rowData[col.label] = getCellText(row[col.key], row, col);
      });
      return rowData;
    });

    // Create CSV content
    const headers = exportColumns.map((col) => col.label);
    
    // Escape CSV values (handle commas, quotes, newlines)
    const escapeCSV = (value: string): string => {
      if (value == null) return "";
      const stringValue = String(value);
      // If value contains comma, quote, or newline, wrap in quotes and escape quotes
      if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    // Build CSV rows
    const csvRows = [
      headers.map(escapeCSV).join(","), // Header row
      ...csvData.map((row) =>
        headers.map((header) => escapeCSV(row[header] || "")).join(",")
      ),
    ];

    const csvContent = csvRows.join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${exportFileName}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle column sorting
  const handleSort = (columnKey: string) => {
    if (sortKey === columnKey) {
      // Cycle through: asc -> desc -> no sort
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortDirection(null);
        setSortKey(null);
      }
    } else {
      setSortKey(columnKey);
      setSortDirection("asc");
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Sort data
  let sortedData = [...data];
  if (sortKey && sortDirection) {
    // Find the column definition to check for custom sort function
    const column = columns.find((col) => col.key === sortKey);
    
    sortedData.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      // Use custom sort function if provided
      if (column?.sortValue) {
        aVal = column.sortValue(a);
        bVal = column.sortValue(b);
      } else {
        // Support nested keys (e.g., "user.phone")
        aVal = getNestedValue(a, sortKey) ?? a[sortKey];
        bVal = getNestedValue(b, sortKey) ?? b[sortKey];
      }

      // Handle null/undefined values
      if (aVal == null) aVal = "";
      if (bVal == null) bVal = "";

      // Convert to string for comparison if not a number or date
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();

      // Handle dates
      if (aVal instanceof Date) aVal = aVal.getTime();
      if (bVal instanceof Date) bVal = bVal.getTime();
      if (typeof aVal === "string" && !isNaN(Date.parse(aVal))) {
        aVal = new Date(aVal).getTime();
      }
      if (typeof bVal === "string" && !isNaN(Date.parse(bVal))) {
        bVal = new Date(bVal).getTime();
      }

      // Handle numeric strings (for phone numbers, IDs, etc.)
      if (typeof aVal === "string" && /^\d+$/.test(aVal.replace(/[^0-9]/g, ""))) {
        aVal = parseInt(aVal.replace(/[^0-9]/g, "")) || 0;
      }
      if (typeof bVal === "string" && /^\d+$/.test(bVal.replace(/[^0-9]/g, ""))) {
        bVal = parseInt(bVal.replace(/[^0-9]/g, "")) || 0;
      }

      if (sortDirection === "asc") {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });
  }

  const totalPages = Math.ceil(sortedData.length / currentRowsPerPage);
  const startIndex = (currentPage - 1) * currentRowsPerPage;
  const endIndex = startIndex + currentRowsPerPage;
  const currentData = sortedData.slice(startIndex, endIndex);

  return (
    <div className="space-y-4">
      {/* Top Controls: Show entries and Export Buttons */}
      <div className="flex items-center justify-between">
        {/* Show entries dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Show</span>
          <Select
            value={currentRowsPerPage.toString()}
            onValueChange={(value) => {
              setCurrentRowsPerPage(Number(value));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-20 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">entries</span>
        </div>

        {/* Refresh and Export Buttons */}
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          )}
          {showExportButtons && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToPDF}
                className="gap-2"
              >
                <FileText className="w-4 h-4" />
                Export PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToExcel}
                className="gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Export Excel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                className="gap-2"
              >
                <FileCode className="w-4 h-4" />
                Export CSV
              </Button>
            </>
          )}
        </div>
      </div>
      <div className="border border-card-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-primary/30 bg-accent/30 hover:bg-accent/30">
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className="text-primary font-semibold"
                  data-testid={`header-${column.key}`}
                >
                  {column.sortable !== false ? (
                    <button
                      onClick={() => handleSort(column.key)}
                      className="flex items-center gap-2 hover:text-primary/80 transition-colors"
                >
                  {column.label}
                      {sortKey === column.key ? (
                        sortDirection === "asc" ? (
                          <ArrowUp className="w-4 h-4" />
                        ) : (
                          <ArrowDown className="w-4 h-4" />
                        )
                      ) : (
                        <ArrowUpDown className="w-4 h-4 opacity-40" />
                      )}
                    </button>
                  ) : (
                    column.label
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length > 0 ? (
              currentData.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  className="border-b border-border hover-elevate"
                  data-testid={`row-${rowIndex}`}
                >
                  {columns.map((column) => (
                    <TableCell key={column.key} data-testid={`cell-${column.key}-${rowIndex}`}>
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-12">
                  <p className="text-muted-foreground">No Records Found</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {sortedData.length > 0 && (
        <div className="flex items-center justify-between pt-4 border-t border-card-border relative z-50">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, sortedData.length)} of{" "}
            {sortedData.length} entries
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-2 relative z-50">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentPage((p) => Math.max(1, p - 1));
                }}
                disabled={currentPage === 1}
                data-testid="button-prev-page"
                className="relative z-50"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              
              {/* Page number buttons */}
              <div className="flex items-center gap-1 relative z-50">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 7) {
                    pageNum = i + 1;
                  } else if (currentPage <= 4) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 3) {
                    pageNum = totalPages - 6 + i;
                  } else {
                    pageNum = currentPage - 3 + i;
                  }
                  
                  const isActive = pageNum === currentPage;
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentPage(pageNum);
                      }}
                      className={`relative z-50 min-w-[2.5rem] ${isActive ? "bg-primary text-primary-foreground" : ""}`}
                      data-testid={`button-page-${pageNum}`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentPage((p) => Math.min(totalPages, p + 1));
                }}
                disabled={currentPage === totalPages}
                data-testid="button-next-page"
                className="relative z-50"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
