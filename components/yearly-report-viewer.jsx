"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wallet, ArrowDownLeft, ArrowUpRight, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function YearlyReportViewer({ 
  year, 
  totalIncome, 
  totalExpense, 
  totalBalance, 
  monthlyData, 
  baseCurrency 
}) {
  const router = useRouter();
  // Default selected metric is 'balance'
  const [selectedMetric, setSelectedMetric] = useState('balance');

  const handleYearChange = (newYear) => {
    router.push(`/dashboard/reports?year=${newYear}`);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

  return (
    <div className="space-y-8">
      {/* Year Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Yearly Report</h1>
          <p className="text-muted-foreground mt-1">Review your cash flow breakdown by year.</p>
        </div>
        <div className="w-32">
          <Select value={year.toString()} onValueChange={handleYearChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map(y => (
                <SelectItem key={y} value={y}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Balance Card */}
        <Card 
          className={`cursor-pointer transition-all border-2 ${selectedMetric === 'balance' ? 'border-blue-500 shadow-md ring-1 ring-blue-500/20' : 'border-transparent hover:border-slate-200 dark:hover:border-slate-800'}`}
          onClick={() => setSelectedMetric('balance')}
        >
          <CardHeader className="pb-2">
            <CardDescription className="flex justify-between items-center">
              Net Balance
              <Wallet className={`h-4 w-4 ${selectedMetric === 'balance' ? 'text-blue-600' : 'text-slate-400'}`} />
            </CardDescription>
            <CardTitle className={`text-2xl ${totalBalance >= 0 ? 'text-slate-900 dark:text-white' : 'text-red-600'}`}>
              {formatCurrency(totalBalance, baseCurrency)}
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Income Card */}
        <Card 
          className={`cursor-pointer transition-all border-2 ${selectedMetric === 'income' ? 'border-green-500 shadow-md ring-1 ring-green-500/20' : 'border-transparent hover:border-slate-200 dark:hover:border-slate-800'}`}
          onClick={() => setSelectedMetric('income')}
        >
          <CardHeader className="pb-2">
            <CardDescription className="flex justify-between items-center">
              Total Income
              <ArrowUpRight className={`h-4 w-4 ${selectedMetric === 'income' ? 'text-green-600' : 'text-slate-400'}`} />
            </CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {formatCurrency(totalIncome, baseCurrency)}
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Expense Card */}
        <Card 
          className={`cursor-pointer transition-all border-2 ${selectedMetric === 'expense' ? 'border-red-500 shadow-md ring-1 ring-red-500/20' : 'border-transparent hover:border-slate-200 dark:hover:border-slate-800'}`}
          onClick={() => setSelectedMetric('expense')}
        >
          <CardHeader className="pb-2">
            <CardDescription className="flex justify-between items-center">
              Total Expenses
              <ArrowDownLeft className={`h-4 w-4 ${selectedMetric === 'expense' ? 'text-red-600' : 'text-slate-400'}`} />
            </CardDescription>
            <CardTitle className="text-2xl text-red-600">
              {formatCurrency(totalExpense, baseCurrency)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-violet-500" />
            Monthly {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Breakdown
          </CardTitle>
          <CardDescription>Month-by-month values for {year}.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">
                    {selectedMetric === 'balance' ? 'Net Balance' : selectedMetric === 'income' ? 'Income' : 'Spending'}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyData.map((month) => (
                  <TableRow key={month.monthIndex}>
                    <TableCell className="font-medium">{month.monthName}</TableCell>
                    <TableCell className={`text-right ${selectedMetric === 'income' ? 'text-green-600 font-medium' : selectedMetric === 'expense' ? 'text-red-600 font-medium' : month.balance < 0 ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>
                      {formatCurrency(month[selectedMetric], baseCurrency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
