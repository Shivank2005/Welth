"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EXPENSE_CATEGORIES } from "@/lib/categories";
import { upsertBudget, deleteBudget } from "@/actions/budget";
import { StaggerContainer, StaggerItem, AnimatedCard } from "@/components/animations";
import { Landmark, MoreHorizontal, Pencil, Trash } from "lucide-react";

export default function BudgetProgress({ budgets = [] }) {
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCategory || !amount) return;

    setLoading(true);
    try {
      await upsertBudget({
        category: selectedCategory,
        amount: parseFloat(amount),
      });
      setSelectedCategory("");
      setAmount("");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (budget) => {
    setSelectedCategory(budget.category);
    setAmount(budget.amount.toString());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this budget?")) return;
    try {
      await deleteBudget(id);
    } catch (error) {
      console.error("Failed to delete budget:", error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create or Update Budget</CardTitle>
          <CardDescription>Set a monthly spending limit for a category</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Monthly Limit ($)</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full md:w-auto">
              {loading ? "Saving..." : "Save Budget"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <StaggerContainer className="grid gap-4 md:grid-cols-2">
        {budgets.length === 0 ? (
          <Card className="md:col-span-2">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground text-sm">
                You don&apos;t have any budgets set up yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          budgets.map((budget) => (
            <StaggerItem key={budget.id} className="h-full">
              <AnimatedCard className="h-full">
                <Card className="h-full flex flex-col bg-white/40 dark:bg-slate-950/40 backdrop-blur-xl border border-white/40 dark:border-slate-800/60 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold capitalize text-slate-800 dark:text-slate-100">
                        {budget.category.toLowerCase()}
                      </CardTitle>
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-bold ${budget.isExceeded ? "text-red-500" : "text-slate-500 dark:text-slate-400"}`}>
                          {budget.progress.toFixed(0)}%
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                              <MoreHorizontal className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36 rounded-xl shadow-lg border-slate-200 dark:border-slate-800">
                            <DropdownMenuItem onClick={() => handleEdit(budget)} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md m-1 transition-colors">
                              <Pencil className="w-4 h-4 mr-2 text-slate-500" />
                              <span className="font-medium text-slate-700 dark:text-slate-300">Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(budget.id)} className="cursor-pointer text-red-600 focus:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md m-1 transition-colors">
                              <Trash className="w-4 h-4 mr-2 text-red-500" />
                              <span className="font-medium text-red-600 dark:text-red-500">Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                    <div>
                      <Progress 
                        value={budget.progress} 
                        className="h-2 mb-2" 
                        indicatorClassName={budget.isExceeded ? "bg-red-600" : "bg-emerald-500"}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{formatCurrency(budget.spent)} spent</span>
                        <span>{formatCurrency(budget.amount)} limit</span>
                      </div>
                    </div>

                    {budget.accountBreakdown && budget.accountBreakdown.length > 0 && (
                      <div className="pt-1 space-y-2 mt-auto">
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Spent by Account
                        </span>
                        <div className="space-y-2">
                          {budget.accountBreakdown.map((acc) => {
                            const pct = budget.spent > 0 ? (acc.amount / budget.spent) * 100 : 0;
                            return (
                              <div key={acc.name} className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Landmark className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                                    <span className="truncate max-w-[120px]">{acc.name}</span>
                                  </div>
                                  <span className="font-medium text-slate-700 dark:text-slate-300">
                                    {formatCurrency(acc.amount)}{" "}
                                    <span className="text-[10px] text-muted-foreground font-normal">
                                      ({pct.toFixed(0)}%)
                                    </span>
                                  </span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800/80 h-1 rounded-full overflow-hidden">
                                  <div 
                                    className="bg-primary/50 dark:bg-primary/45 h-full rounded-full" 
                                    style={{ width: `${pct}%` }} 
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </AnimatedCard>
            </StaggerItem>
          ))
        )}
      </StaggerContainer>
    </div>
  );
}
