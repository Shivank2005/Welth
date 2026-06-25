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
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import { aiScanReceipt, scanAndCreateTransaction } from "@/actions/ai";
import {
  Camera,
  Upload,
  Check,
  X,
  Loader2,
  Receipt,
  Sparkles,
} from "lucide-react";

export default function ReceiptScanner({ accounts = [] }) {
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be under 10MB.");
      return;
    }

    setError("");
    setResult(null);
    setSaved(false);

    // Create preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    // Convert to base64 for Gemini
    setScanning(true);
    try {
      const base64Reader = new FileReader();
      const base64Data = await new Promise((resolve, reject) => {
        base64Reader.onload = () => {
          const base64 = base64Reader.result.split(",")[1];
          resolve(base64);
        };
        base64Reader.onerror = reject;
        base64Reader.readAsDataURL(file);
      });

      const data = await aiScanReceipt(base64Data, file.type);
      setResult(data);
    } catch (err) {
      setError(err.message || "Failed to scan receipt.");
    } finally {
      setScanning(false);
    }
  };

  const handleSave = async () => {
    if (!result || !preview) return;

    setSaving(true);
    try {
      const base64Data = preview.split(",")[1];
      const defaultAccount = accounts.find((a) => a.isDefault) || accounts[0];

      await scanAndCreateTransaction(
        base64Data,
        "image/jpeg",
        defaultAccount?.id
      );

      setSaved(true);
    } catch (err) {
      setError(err.message || "Failed to save transaction.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setPreview(null);
    setResult(null);
    setError("");
    setSaved(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-500" />
            AI Receipt Scanner
          </CardTitle>
          <CardDescription>
            Upload a receipt photo and AI will extract the details automatically
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!preview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="group cursor-pointer rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center transition-all hover:border-violet-400 hover:bg-violet-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-violet-600 dark:hover:bg-violet-950"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 text-violet-600 transition-transform group-hover:scale-110 dark:bg-violet-900 dark:text-violet-300">
                <Camera className="h-8 w-8" />
              </div>
              <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
                Click to upload a receipt
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                JPG, PNG, or WEBP — max 10MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Preview + Result side by side */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Image Preview */}
                <div className="overflow-hidden rounded-xl border">
                  <img
                    src={preview}
                    alt="Receipt preview"
                    className="h-64 w-full object-contain bg-slate-50 dark:bg-slate-900"
                  />
                </div>

                {/* Extracted Data */}
                <div className="flex flex-col justify-center">
                  {scanning ? (
                    <div className="flex flex-col items-center gap-3 py-8">
                      <div className="relative">
                        <Receipt className="h-12 w-12 text-violet-400" />
                        <Loader2 className="absolute -right-2 -top-2 h-6 w-6 animate-spin text-violet-600" />
                      </div>
                      <p className="font-medium text-violet-700 dark:text-violet-300">
                        AI is reading your receipt...
                      </p>
                    </div>
                  ) : result ? (
                    <div className="space-y-3 rounded-xl border bg-emerald-50 p-4 dark:bg-emerald-950">
                      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                        <Check className="h-5 w-5" />
                        <span className="font-semibold">Receipt Scanned!</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Amount</span>
                          <span className="font-bold text-lg">
                            {formatCurrency(result.amount)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Date</span>
                          <span className="font-medium">{result.date}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Description</span>
                          <span className="font-medium">{result.description}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Category</span>
                          <Badge variant="secondary" className="capitalize">
                            {result.category?.toLowerCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {result && !saved && (
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    {saving ? "Saving..." : "Save as Transaction"}
                  </Button>
                )}
                {saved && (
                  <div className="flex items-center gap-2 rounded-lg bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                    <Check className="h-4 w-4" />
                    Transaction saved!
                  </div>
                )}
                <Button variant="outline" onClick={handleReset} className="gap-2">
                  <Upload className="h-4 w-4" />
                  {saved ? "Scan Another" : "Try Different Photo"}
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              <X className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
