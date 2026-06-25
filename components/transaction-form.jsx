"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/categories";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Sparkles, Loader2, Camera } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { aiCategorize } from "@/actions/ai";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ReceiptScanner from "@/components/receipt-scanner";

export default function TransactionForm({ initialData }) {
  const router = useRouter();
  const [isScanner, setIsScanner] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categorizing, setCategorizing] = useState(false);
  const [form, setForm] = useState(initialData || {
    amount: "",
    type: "EXPENSE",
    category: "FOOD",
    description: "",
    date: new Date().toISOString().slice(0, 10),
    accountId: "",
    isRecurring: false,
    recurringInterval: "MONTHLY",
  });

  useEffect(() => {
    fetch("/api/accounts")
      .then((res) => res.json())
      .then((data) => {
        if (data.accounts?.length) {
          const defaultAccount =
            data.accounts.find((a) => a.isDefault) ?? data.accounts[0];
          setAccounts(data.accounts);
          if (!initialData) {
            setForm((f) => ({ ...f, accountId: defaultAccount.id }));
          }
        }
      })
      .catch(() => setError("Failed to load accounts"));
  }, [initialData]);

  const categories =
    form.type === "INCOME" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = initialData ? `/api/transactions/${initialData.id}` : "/api/transactions";
      const method = initialData ? "PUT" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create transaction");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      {isScanner && !initialData ? (
        <div className="space-y-4">
          <ReceiptScanner accounts={accounts} onComplete={() => { router.push("/dashboard"); router.refresh(); }} />
          <Button variant="outline" className="w-full" onClick={() => setIsScanner(false)}>
            Cancel
          </Button>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{initialData ? "Edit Transaction" : "Add Transaction"}</CardTitle>
            <CardDescription>{initialData ? "Update your transaction details" : "Record income or an expense"}</CardDescription>
          </CardHeader>
          <CardContent>
            {!initialData && (
              <Button
                type="button"
                className="w-full mb-6 bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 shadow-md"
                onClick={() => setIsScanner(true)}
              >
                <Camera className="mr-2 h-4 w-4" />
                Scan Receipt with AI
              </Button>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select
                value={form.type}
                onValueChange={(type) =>
                  setForm((f) => ({
                    ...f,
                    type,
                    category: type === "INCOME" ? "SALARY" : "FOOD",
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                  <SelectItem value="INCOME">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount</label>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={form.amount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, amount: e.target.value }))
                }
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select
              value={form.category}
              onValueChange={(category) =>
                setForm((f) => ({ ...f, category }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
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

          <div className="space-y-2">
            <label className="text-sm font-medium">Account</label>
            <Select
              value={form.accountId}
              onValueChange={(accountId) =>
                setForm((f) => ({ ...f, accountId }))
              }
            >
              <SelectTrigger className="w-full">
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

          <div className="space-y-2 flex flex-col">
            <label className="text-sm font-medium">Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal h-10 border-input",
                    !form.date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  {form.date ? (
                    format(new Date(form.date + "T00:00:00"), "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={form.date ? new Date(form.date + "T00:00:00") : new Date()}
                  onSelect={(date) => {
                    if (date) {
                      setForm((f) => ({
                        ...f,
                        date: format(date, "yyyy-MM-dd")
                      }));
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description (optional)</label>
            <div className="flex gap-2">
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Coffee, rent, salary..."
                className="flex-1"
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={!form.description.trim() || categorizing}
                      onClick={async () => {
                        setCategorizing(true);
                        try {
                          const { category } = await aiCategorize(form.description, form.type);
                          setForm((f) => ({ ...f, category }));
                        } catch (err) {
                          console.error(err);
                        } finally {
                          setCategorizing(false);
                        }
                      }}
                      className="shrink-0"
                    >
                      {categorizing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4 text-violet-500" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>AI auto-categorize</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isRecurring"
              checked={form.isRecurring}
              onCheckedChange={(isRecurring) => setForm((f) => ({ ...f, isRecurring }))}
            />
            <label
              htmlFor="isRecurring"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Make this a recurring transaction
            </label>
          </div>

          {form.isRecurring && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Frequency</label>
              <Select
                value={form.recurringInterval}
                onValueChange={(recurringInterval) =>
                  setForm((f) => ({ ...f, recurringInterval }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAILY">Daily</SelectItem>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="YEARLY">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}


          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading || !form.accountId}>
            {loading ? "Saving..." : (initialData ? "Update transaction" : "Save transaction")}
          </Button>
        </form>
      </CardContent>
    </Card>
    )}
    </div>
  );
}
