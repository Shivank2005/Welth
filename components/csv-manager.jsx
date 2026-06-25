"use client";

import { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { exportTransactionsCSV, importTransactionsCSV } from "@/actions/csv";
import { formatCurrency, formatDate } from "@/lib/format";
import { Download, Upload, FileSpreadsheet, Check, X, Loader2 } from "lucide-react";

export default function CsvManager({ accounts = [] }) {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(
    accounts.find((a) => a.isDefault)?.id || accounts[0]?.id || ""
  );
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleExport = async () => {
    setExporting(true);
    try {
      const csvString = await exportTransactionsCSV();
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `welth-transactions-${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export transactions.");
    } finally {
      setExporting(false);
    }
  };

  const parseCSV = (text) => {
    // Very basic CSV parser. Assumes header: Date,Type,Category,Amount,Description
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
    if (lines.length < 2) throw new Error("File is empty or missing headers");

    const headers = lines[0].toLowerCase().split(",").map(h => h.trim());
    
    // Check required headers
    const required = ["date", "type", "category", "amount"];
    for (const req of required) {
      if (!headers.includes(req)) {
        throw new Error(`Missing required column: ${req}`);
      }
    }

    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Regex to handle commas inside quotes (simplistic)
      const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(",");
      
      const row = {};
      headers.forEach((h, idx) => {
        let val = values[idx] || "";
        // Remove quotes if present
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.substring(1, val.length - 1).replace(/""/g, '"');
        }
        row[h] = val.trim();
      });
      data.push(row);
    }
    return data;
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      setError("Please upload a .csv file.");
      return;
    }

    setError("");
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const parsedData = parseCSV(text);
        if (parsedData.length === 0) {
          throw new Error("No data rows found in CSV");
        }
        setPreview(parsedData);
      } catch (err) {
        setError(err.message || "Failed to parse CSV file.");
      }
    };
    reader.onerror = () => setError("Failed to read file.");
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!preview || !selectedAccount) return;

    setImporting(true);
    setError("");
    setImportResult(null);

    try {
      const result = await importTransactionsCSV(preview, selectedAccount);
      setImportResult(result);
      if (result.errors.length > 0) {
        setError(`Imported ${result.imported} rows, but encountered ${result.errors.length} errors.`);
      }
    } catch (err) {
      setError(err.message || "Import failed.");
    } finally {
      setImporting(false);
    }
  };

  const handleReset = () => {
    setPreview(null);
    setImportResult(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* EXPORT CARD */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-violet-500" />
            Export Data
          </CardTitle>
          <CardDescription>
            Download all your transactions as a CSV file for backup or analysis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleExport} 
            disabled={exporting}
            className="w-full sm:w-auto"
          >
            {exporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="mr-2 h-4 w-4" />
            )}
            {exporting ? "Generating CSV..." : "Export to CSV"}
          </Button>
        </CardContent>
      </Card>

      {/* IMPORT CARD */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-emerald-500" />
            Import Data
          </CardTitle>
          <CardDescription>
            Upload a CSV file to add multiple transactions at once. 
            Required columns: Date, Type, Category, Amount.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!preview ? (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group cursor-pointer rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center transition-all hover:border-emerald-400 hover:bg-emerald-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-emerald-600 dark:hover:bg-emerald-950/50"
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 transition-transform group-hover:scale-110 dark:bg-emerald-900 dark:text-emerald-300">
                  <FileSpreadsheet className="h-6 w-6" />
                </div>
                <p className="font-medium text-slate-700 dark:text-slate-300">
                  Click to select CSV file
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Destination Account</label>
                <Select value={selectedAccount} onValueChange={setSelectedAccount} disabled={importResult?.imported > 0}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Preview Table */}
              {!importResult && (
                <div className="rounded-md border text-sm max-h-[250px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {preview.slice(0, 5).map((row, i) => (
                        <TableRow key={i}>
                          <TableCell>{row.date}</TableCell>
                          <TableCell>
                            <Badge variant={row.type?.toUpperCase() === "INCOME" ? "default" : "secondary"} className="text-[10px]">
                              {row.type || "?"}
                            </Badge>
                          </TableCell>
                          <TableCell>{row.category}</TableCell>
                          <TableCell className="text-right font-medium text-muted-foreground">
                            {row.amount}
                          </TableCell>
                        </TableRow>
                      ))}
                      {preview.length > 5 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground bg-slate-50/50 dark:bg-slate-900/50">
                            + {preview.length - 5} more rows...
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}

              {importResult && importResult.imported > 0 && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-100 p-3 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                  <Check className="h-5 w-5" />
                  Successfully imported {importResult.imported} transactions!
                </div>
              )}

              <div className="flex gap-2">
                {!importResult ? (
                  <Button 
                    onClick={handleImport} 
                    disabled={importing || !selectedAccount}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {importing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                    {importing ? "Importing..." : `Import ${preview.length} Rows`}
                  </Button>
                ) : null}
                <Button variant="outline" onClick={handleReset} className={importResult ? "w-full" : "flex-none"}>
                  {importResult ? "Done" : "Cancel"}
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/50 dark:text-red-300 flex items-start gap-2">
              <X className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="whitespace-pre-wrap">{error}</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
