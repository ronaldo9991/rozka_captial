import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface DepositExportData {
  id: string;
  userId: string;
  accountId: string;
  amount: string;
  merchant: string;
  status: string;
  depositDate: Date | null;
  createdAt: Date;
  userName?: string;
  userEmail?: string;
  userFullName?: string;
  userUsername?: string;
  accountNumber?: string;
  accountType?: string;
  transactionId?: string;
}

export interface WithdrawalExportData {
  id: string;
  userId: string;
  accountId: string;
  amount: string;
  method: string;
  status: string;
  bankName?: string | null;
  accountNumber?: string | null;
  createdAt: Date;
  userName?: string;
  userEmail?: string;
  userFullName?: string;
  userUsername?: string;
  accountNumberDisplay?: string;
  accountType?: string;
  rejectionReason?: string | null;
}

/**
 * Generate PDF for deposits
 */
export function generateDepositsPDF(
  deposits: DepositExportData[],
  title: string = "Deposits Report"
): void {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 20);
  
  // Add date
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
  
  // Prepare table data with all user details
  const tableData = deposits.map((deposit) => [
    deposit.id.slice(0, 8) + "...",
    deposit.userFullName || deposit.userName || deposit.userUsername || "Unknown",
    deposit.userEmail || "N/A",
    deposit.accountNumber || deposit.accountId,
    deposit.accountType || "N/A",
    new Date(deposit.depositDate || deposit.createdAt).toLocaleDateString(),
    deposit.merchant,
    `$${parseFloat(deposit.amount).toFixed(2)}`,
    deposit.status,
    deposit.transactionId || "N/A",
  ]);

  // Add table with expanded columns
  autoTable(doc, {
    head: [["ID", "Client Name", "Email", "Account", "Type", "Date", "Merchant", "Amount", "Status", "Transaction ID"]],
    body: tableData,
    startY: 35,
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [255, 215, 0], textColor: [0, 0, 0], fontSize: 8, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: {
      0: { cellWidth: 25 }, // ID
      1: { cellWidth: 40 }, // Client Name
      2: { cellWidth: 45 }, // Email
      3: { cellWidth: 30 }, // Account
      4: { cellWidth: 25 }, // Type
      5: { cellWidth: 30 }, // Date
      6: { cellWidth: 30 }, // Merchant
      7: { cellWidth: 25 }, // Amount
      8: { cellWidth: 25 }, // Status
      9: { cellWidth: 35 }, // Transaction ID
    },
  });

  // Add summary
  const totalAmount = deposits.reduce((sum, d) => sum + parseFloat(d.amount), 0);
  const pendingCount = deposits.filter((d) => d.status === "Pending").length;
  const completedCount = deposits.filter((d) => d.status === "Completed").length;
  const failedCount = deposits.filter((d) => d.status === "Failed").length;

  const finalY = (doc as any).lastAutoTable.finalY || 35;
  doc.setFontSize(12);
  doc.text("Summary", 14, finalY + 15);
  doc.setFontSize(10);
  doc.text(`Total Deposits: ${deposits.length}`, 14, finalY + 22);
  doc.text(`Total Amount: $${totalAmount.toFixed(2)}`, 14, finalY + 28);
  doc.text(`Pending: ${pendingCount} | Completed: ${completedCount} | Failed: ${failedCount}`, 14, finalY + 34);

  // Save PDF
  doc.save(`deposits-${new Date().toISOString().split("T")[0]}.pdf`);
}

/**
 * Generate PDF for withdrawals
 */
export function generateWithdrawalsPDF(
  withdrawals: WithdrawalExportData[],
  title: string = "Withdrawals Report"
): void {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 20);
  
  // Add date
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
  
  // Prepare table data with all user details
  const tableData = withdrawals.map((withdrawal) => [
    withdrawal.id.slice(0, 8) + "...",
    withdrawal.userFullName || withdrawal.userName || withdrawal.userUsername || "Unknown",
    withdrawal.userEmail || "N/A",
    withdrawal.accountNumberDisplay || withdrawal.accountId,
    withdrawal.accountType || "N/A",
    withdrawal.method,
    `$${parseFloat(withdrawal.amount).toFixed(2)}`,
    withdrawal.bankName || "N/A",
    withdrawal.accountNumber || "N/A",
    new Date(withdrawal.createdAt).toLocaleDateString(),
    withdrawal.status,
    withdrawal.rejectionReason || "N/A",
  ]);

  // Add table with expanded columns
  autoTable(doc, {
    head: [["ID", "Client Name", "Email", "Account", "Type", "Method", "Amount", "Bank", "Account #", "Date", "Status", "Rejection Reason"]],
    body: tableData,
    startY: 35,
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [255, 215, 0], textColor: [0, 0, 0], fontSize: 8, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: {
      0: { cellWidth: 25 }, // ID
      1: { cellWidth: 40 }, // Client Name
      2: { cellWidth: 45 }, // Email
      3: { cellWidth: 30 }, // Account
      4: { cellWidth: 25 }, // Type
      5: { cellWidth: 30 }, // Method
      6: { cellWidth: 25 }, // Amount
      7: { cellWidth: 30 }, // Bank
      8: { cellWidth: 35 }, // Account #
      9: { cellWidth: 30 }, // Date
      10: { cellWidth: 25 }, // Status
      11: { cellWidth: 40 }, // Rejection Reason
    },
  });

  // Add summary
  const totalAmount = withdrawals.reduce((sum, w) => sum + parseFloat(w.amount), 0);
  const pendingCount = withdrawals.filter((w) => w.status === "Pending").length;
  const completedCount = withdrawals.filter((w) => w.status === "Completed").length;
  const rejectedCount = withdrawals.filter((w) => w.status === "Rejected").length;

  const finalY = (doc as any).lastAutoTable.finalY || 35;
  doc.setFontSize(12);
  doc.text("Summary", 14, finalY + 15);
  doc.setFontSize(10);
  doc.text(`Total Withdrawals: ${withdrawals.length}`, 14, finalY + 22);
  doc.text(`Total Amount: $${totalAmount.toFixed(2)}`, 14, finalY + 28);
  doc.text(`Pending: ${pendingCount} | Completed: ${completedCount} | Rejected: ${rejectedCount}`, 14, finalY + 34);
  
  // Add report metadata
  doc.setFontSize(8);
  doc.text(`Report generated on ${new Date().toLocaleString()}`, 14, finalY + 42);
  doc.text(`Total unique clients: ${new Set(withdrawals.map(w => w.userId)).size}`, 14, finalY + 48);

  // Save PDF
  doc.save(`withdrawals-${new Date().toISOString().split("T")[0]}.pdf`);
}

