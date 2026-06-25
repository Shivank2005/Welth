"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/categories";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  createRecurringTransaction,
  deleteRecurringTransaction,
  processRecurringTransactions,
} from "@/actions/recurring";
import {
  CalendarClock,
  Trash2,
  Zap,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
} from "lucide-react";
import { StaggerContainer, StaggerItem, AnimatedCard } from "@/components/animations";

const FREQUENCY_OPTIONS = [
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "BIWEEKLY", label: "Bi-weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "YEARLY", label: "Yearly" },
];

const FREQUENCY_LABELS = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  BIWEEKLY: "Bi-weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

export default function RecurringTransactions({
  recurring = [],
  accounts = [],
}) {
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Form state
  const [type, setType] = useState("EXPENSE");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState("MONTHLY");
  const [nextDate, setNextDate] = useState("");
  const [accountId, setAccountId] = useState("");

  const categories = type === "INCOME" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category || !amount || !nextDate) return;

    setLoading(true);
    try {
      await createRecurringTransaction({
        type,
        category,
        amount,
        description,
        frequency,
        nextDate,
        accountId: accountId || undefined,
      });
      // Reset form
      setCategory("");
      setAmount("");
      setDescription("");
      setNextDate("");
      setAccountId("");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteRecurringTransaction(id);
    } catch (error) {
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleProcess = async () => {
    setProcessing(true);
    try {
      const result = await processRecurringTransactions();
      if (result.processed > 0) {
        alert(`✅ Processed ${result.processed} recurring transaction(s)!`);
      } else {
        alert("No transactions are due yet.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  // Count how many are overdue
  const overdueCount = recurring.filter(
    (r) => new Date(r.nextDate) <= new Date()
  ).length;

  return (
    <div className="space-y-6">
      {/* Create Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5" />
            Add Recurring Transaction
          </CardTitle>
          <CardDescription>
            Set up automatic bills, subscriptions, or recurring income
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={type} onValueChange={(val) => { setType(val); setCategory(""); }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EXPENSE">Expense</SelectItem>
                    <SelectItem value="INCOME">Income</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount ($)</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 14.99"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              {/* Frequency */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Frequency</label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Next Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Next Due Date</label>
                <Input
                  type="date"
                  value={nextDate}
                  onChange={(e) => setNextDate(e.target.value)}
                />
              </div>

              {/* Account */}
              {accounts.length > 1 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Account</label>
                  <Select value={accountId} onValueChange={setAccountId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Default account" />
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
              )}

              {/* Description */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Description (optional)</label>
                <Input
                  placeholder="e.g. Netflix, Rent, Salary..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full md:w-auto">
              {loading ? "Adding..." : "Add Recurring Transaction"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Process Button */}
      {overdueCount > 0 && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
          <CardContent className="flex flex-col items-center justify-between gap-4 py-4 md:flex-row">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-semibold text-amber-800 dark:text-amber-200">
                  {overdueCount} transaction{overdueCount > 1 ? "s" : ""} due
                </p>
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Click to process and create the actual transactions
                </p>
              </div>
            </div>
            <Button
              onClick={handleProcess}
              disabled={processing}
              variant="outline"
              className="gap-2 border-amber-400 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-900"
            >
              <RefreshCw className={`h-4 w-4 ${processing ? "animate-spin" : ""}`} />
              {processing ? "Processing..." : "Process Now"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* List */}
      <StaggerContainer className="grid gap-4 md:grid-cols-2">
        {recurring.length === 0 ? (
          <Card className="md:col-span-2">
            <CardContent className="py-12 text-center text-muted-foreground">
              <CalendarClock className="mx-auto mb-3 h-10 w-10 opacity-40" />
              <p>No recurring transactions yet.</p>
              <p className="text-sm">Add bills, subscriptions, or recurring income above.</p>
            </CardContent>
          </Card>
        ) : (
          recurring.map((item) => {
            const isOverdue = new Date(item.nextDate) <= new Date();
            const isIncome = item.type === "INCOME";

            return (
              <StaggerItem key={item.id}>
                <AnimatedCard>
                  <Card
                    className={`relative overflow-hidden transition-shadow hover:shadow-md ${
                      isOverdue ? "border-amber-300 dark:border-amber-800" : ""
                    }`}
                  >
                    {/* Color accent bar */}
                    <div
                      className={`absolute left-0 top-0 h-full w-1 ${
                        isIncome ? "bg-emerald-500" : "bg-red-400"
                      }`}
                    />
                    <CardHeader className="pb-2 pl-5">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="flex items-center gap-2 text-base">
                            {isIncome ? (
                              <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <ArrowDownLeft className="h-4 w-4 text-red-500" />
                            )}
                            {item.description || item.category}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs capitalize">
                              {item.category.toLowerCase()}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {FREQUENCY_LABELS[item.frequency] || item.frequency}
                            </Badge>
                          </CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-red-600"
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pl-5">
                      <div className="flex items-end justify-between">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            Next: {formatDate(item.nextDate)}
                          </p>
                          {item.account && (
                            <p className="text-xs text-muted-foreground">
                              Account: {item.account.name}
                            </p>
                          )}
                        </div>
                        <p
                          className={`text-lg font-bold ${
                            isIncome ? "text-emerald-600" : "text-red-600"
                          }`}
                        >
                          {isIncome ? "+" : "-"}
                          {formatCurrency(item.amount)}
                        </p>
                      </div>
                      {isOverdue && (
                        <div className="mt-2 rounded bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                          ⚡ Due — ready to process
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </AnimatedCard>
              </StaggerItem>
            );
          })
        )}
      </StaggerContainer>
    </div>
  );
}
