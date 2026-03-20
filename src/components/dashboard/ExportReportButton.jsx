import React, { useState } from "react";
import { Download, FileText, FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { toast } from "sonner";

function escapeCsv(val) {
  if (val === null || val === undefined) return "";
  const str = String(val);
  return str.includes(",") || str.includes('"') || str.includes("\n")
    ? `"${str.replace(/"/g, '""')}"`
    : str;
}

function rowsToCsv(headers, rows) {
  return [
    headers.join(","),
    ...rows.map((r) => r.map(escapeCsv).join(",")),
  ].join("\n");
}

function downloadFile(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function buildReportData() {
  const transactions = await base44.entities.Transaction.list("-transaction_date", 500);
  return transactions;
}

export default function ExportReportButton({ cryptoList = [], portfolioTotal = 0 }) {
  const [loading, setLoading] = useState(false);

  const dateStr = format(new Date(), "yyyy-MM-dd");

  const exportCSV = async () => {
    setLoading(true);
    try {
      const transactions = await buildReportData();

      // --- Portfolio Holdings ---
      const holdingsHeaders = ["Asset", "Symbol", "Holdings", "Price (USD)", "Value (USD)", "Allocation (%)"];
      const holdingsRows = cryptoList.map((c) => {
        const value = c.price * c.holdings;
        const alloc = portfolioTotal > 0 ? ((value / portfolioTotal) * 100).toFixed(2) : "0.00";
        return [c.name, c.symbol, c.holdings, c.price.toFixed(2), value.toFixed(2), alloc + "%"];
      });
      holdingsRows.push(["TOTAL", "", "", "", portfolioTotal.toFixed(2), "100%"]);
      const holdingsCsv = rowsToCsv(holdingsHeaders, holdingsRows);

      // --- Trade History ---
      const tradeHeaders = ["Date", "Type", "Side", "Asset", "Amount", "Price (USD)", "Total Value (USD)", "Status", "Notes"];
      const tradeRows = transactions.map((t) => [
        format(new Date(t.transaction_date), "yyyy-MM-dd HH:mm:ss"),
        t.type,
        t.side || "",
        t.crypto_symbol || "",
        t.amount,
        t.price || "",
        t.total_value || t.amount,
        t.status,
        t.notes || "",
      ]);
      const tradesCsv = rowsToCsv(tradeHeaders, tradeRows);

      const fullCsv = `PORTFOLIO HOLDINGS — ${dateStr}\n\n${holdingsCsv}\n\n\nTRADE & WITHDRAWAL HISTORY\n\n${tradesCsv}`;
      downloadFile(fullCsv, `blockchain-tradex-report-${dateStr}.csv`, "text/csv");
      toast.success("CSV report downloaded");
    } catch (e) {
      toast.error("Export failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = async () => {
    setLoading(true);
    try {
      const { jsPDF } = await import("jspdf");
      const transactions = await buildReportData();

      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const W = doc.internal.pageSize.getWidth();
      let y = 18;

      const addPageIfNeeded = (neededSpace = 12) => {
        if (y + neededSpace > 280) {
          doc.addPage();
          y = 18;
        }
      };

      // Title
      doc.setFontSize(18);
      doc.setTextColor(34, 197, 94); // primary green
      doc.text("Blockchain Tradex — Portfolio Report", W / 2, y, { align: "center" });
      y += 7;
      doc.setFontSize(9);
      doc.setTextColor(120, 130, 150);
      doc.text(`Generated: ${format(new Date(), "MMMM d, yyyy 'at' HH:mm")}`, W / 2, y, { align: "center" });
      y += 10;

      // Portfolio summary box
      doc.setFillColor(20, 24, 34);
      doc.roundedRect(14, y, W - 28, 20, 3, 3, "F");
      doc.setFontSize(10);
      doc.setTextColor(34, 197, 94);
      doc.text("Total Portfolio Value", 20, y + 7);
      doc.setFontSize(14);
      doc.setTextColor(230, 240, 255);
      doc.text(`$${portfolioTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 20, y + 15);
      doc.setFontSize(9);
      doc.setTextColor(120, 130, 150);
      doc.text(`${cryptoList.length} assets held`, W - 20, y + 11, { align: "right" });
      y += 28;

      // Holdings table
      doc.setFontSize(11);
      doc.setTextColor(34, 197, 94);
      doc.text("Portfolio Holdings", 14, y);
      y += 6;

      const hCols = [14, 40, 72, 110, 145, 175];
      const hHeaders = ["Asset", "Symbol", "Holdings", "Price (USD)", "Value (USD)", "Alloc %"];
      doc.setFillColor(30, 36, 50);
      doc.rect(14, y - 4, W - 28, 7, "F");
      doc.setFontSize(8);
      doc.setTextColor(180, 190, 210);
      hHeaders.forEach((h, i) => doc.text(h, hCols[i], y));
      y += 5;

      cryptoList.forEach((c, idx) => {
        addPageIfNeeded(8);
        if (idx % 2 === 0) {
          doc.setFillColor(22, 27, 38);
          doc.rect(14, y - 3.5, W - 28, 7, "F");
        }
        const value = c.price * c.holdings;
        const alloc = portfolioTotal > 0 ? ((value / portfolioTotal) * 100).toFixed(1) + "%" : "0%";
        doc.setTextColor(210, 220, 235);
        doc.setFontSize(8);
        doc.text(c.name, hCols[0], y);
        doc.text(c.symbol, hCols[1], y);
        doc.text(String(c.holdings), hCols[2], y);
        doc.text(`$${c.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, hCols[3], y);
        doc.text(`$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, hCols[4], y);
        doc.text(alloc, hCols[5], y);
        y += 7;
      });

      // Total row
      addPageIfNeeded(8);
      doc.setFillColor(34, 197, 94, 30);
      doc.rect(14, y - 3.5, W - 28, 7, "F");
      doc.setTextColor(34, 197, 94);
      doc.setFontSize(8);
      doc.text("TOTAL", hCols[0], y);
      doc.text(`$${portfolioTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, hCols[4], y);
      doc.text("100%", hCols[5], y);
      y += 14;

      // Trade history
      addPageIfNeeded(20);
      doc.setFontSize(11);
      doc.setTextColor(34, 197, 94);
      doc.text("Trade & Withdrawal History", 14, y);
      y += 6;

      const tCols = [14, 52, 72, 92, 115, 143, 172];
      const tHeaders = ["Date", "Type", "Side", "Asset", "Amount", "Value (USD)", "Status"];
      doc.setFillColor(30, 36, 50);
      doc.rect(14, y - 4, W - 28, 7, "F");
      doc.setFontSize(8);
      doc.setTextColor(180, 190, 210);
      tHeaders.forEach((h, i) => doc.text(h, tCols[i], y));
      y += 5;

      transactions.slice(0, 100).forEach((t, idx) => {
        addPageIfNeeded(8);
        if (idx % 2 === 0) {
          doc.setFillColor(22, 27, 38);
          doc.rect(14, y - 3.5, W - 28, 7, "F");
        }
        doc.setTextColor(210, 220, 235);
        doc.setFontSize(7.5);
        doc.text(format(new Date(t.transaction_date), "MM/dd/yy HH:mm"), tCols[0], y);
        doc.text(t.type || "", tCols[1], y);
        doc.text(t.side || "—", tCols[2], y);
        doc.text(t.crypto_symbol || "USD", tCols[3], y);
        doc.text(String(t.amount ?? ""), tCols[4], y);
        doc.text(`$${(t.total_value ?? t.amount ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`, tCols[5], y);
        // Status color
        if (t.status === "completed") doc.setTextColor(34, 197, 94);
        else if (t.status === "pending") doc.setTextColor(250, 204, 21);
        else doc.setTextColor(239, 68, 68);
        doc.text(t.status || "", tCols[6], y);
        doc.setTextColor(210, 220, 235);
        y += 7;
      });

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(80, 90, 110);
        doc.text(`Blockchain Tradex — Confidential — Page ${i} of ${pageCount}`, W / 2, 290, { align: "center" });
      }

      doc.save(`blockchain-tradex-report-${dateStr}.pdf`);
      toast.success("PDF report downloaded");
    } catch (e) {
      toast.error("Export failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Export Report
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Download Format</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={exportCSV} className="gap-2 cursor-pointer">
          <FileSpreadsheet className="w-4 h-4 text-primary" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportPDF} className="gap-2 cursor-pointer">
          <FileText className="w-4 h-4 text-primary" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}