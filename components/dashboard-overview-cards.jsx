"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StaggerContainer, StaggerItem } from "@/components/animations";
import { ArrowDownLeft, ArrowUpRight, Lock, TrendingDown, Unlock, Wallet, TrendingUp, PiggyBank, CalendarClock, ReceiptText, PieChart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Helper Custom Tooltips for Charts
const CustomTooltip = ({ active, payload, label, prefix = '', baseCurrency }) => {
  if (active && payload && payload.length) {
    // Basic format if baseCurrency is missing to avoid crashing
    const formatValue = (val) => {
      if (!baseCurrency) return `$${val.toFixed(2)}`;
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: baseCurrency }).format(val);
    };
    
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg shadow-xl">
        <p className="font-medium text-sm mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm font-bold" style={{ color: entry.color }}>
            {prefix}{formatValue(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardOverviewCards({
  totalBalance,
  totalReserved,
  totalAvailable,
  totalIncome,
  totalGoalIncome,
  totalExpense,
  baseCurrency,
  topExpenseCategory,
  monthlyData,
  transactions = [],
}) {
  const [modalOpen, setModalOpen] = useState(null); // 'balance' | 'income' | 'expense' | null
  const [selectedYear, setSelectedYear] = useState('2026');

  // Format monthly data for charts
  const months = [
    { name: 'Jan', ...monthlyData[0] },
    { name: 'Feb', ...monthlyData[1] },
    { name: 'Mar', ...monthlyData[2] },
    { name: 'Apr', ...monthlyData[3] },
    { name: 'May', ...monthlyData[4] },
    { name: 'Jun', ...monthlyData[5] },
    { name: 'Jul', ...monthlyData[6] },
    { name: 'Aug', ...monthlyData[7] },
    { name: 'Sep', ...monthlyData[8] },
    { name: 'Oct', ...monthlyData[9] },
    { name: 'Nov', ...monthlyData[10] },
    { name: 'Dec', ...monthlyData[11] },
  ].map(m => ({
    name: m.name,
    income: m.income || 0,
    expense: m.expense || 0,
    balance: m.balance || 0,
    goalDeposits: m.goalDeposits || 0,
  }));

  const currentMonthIndex = new Date().getMonth();
  const currentMonthData = months[currentMonthIndex];
  
  const displayBalance = currentMonthData.balance;
  const displayIncome = currentMonthData.income;
  const displayExpense = currentMonthData.expense;

  // Calculations for Modals
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
  
  const incomeSources = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});
    
  const expenseCategories = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const top5Transactions = [...transactions]
    .filter(t => t.type === 'EXPENSE')
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const lastUpdated = transactions.length > 0 ? new Date(transactions[0].date).toLocaleDateString() : 'Never';

  // Calculate current month's top expense category
  const currentMonthTransactions = transactions.filter(t => {
    return new Date(t.date).getMonth() === currentMonthIndex;
  });

  const currentMonthExpenseCategories = currentMonthTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const currentMonthTopExpenseCategory = Object.entries(currentMonthExpenseCategories)
    .sort(([, a], [, b]) => b - a)[0];

  const currentMonthGoalDeposits = currentMonthData.goalDeposits || 0;
  const currentMonthRegularIncome = displayIncome - currentMonthGoalDeposits;
  const currentMonthAvailable = displayBalance - currentMonthGoalDeposits;

  return (
    <div className="space-y-6">
      <StaggerContainer className="grid gap-4 md:grid-cols-3">
        {/* Balance Card */}
        <StaggerItem className="h-full">
          <Card 
            className="h-full flex flex-col justify-between cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:shadow-md hover:-translate-y-1"
            onClick={() => setModalOpen('balance')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                This Month&apos;s Net Balance
              </CardTitle>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Wallet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-2xl font-bold mb-2 flex items-center justify-between">
                <span>{formatCurrency(currentMonthAvailable, baseCurrency)}</span>
                {currentMonthAvailable >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownLeft className="h-4 w-4 text-red-500" />
                )}
              </div>
            </CardContent>
            <CardContent>
              {currentMonthGoalDeposits > 0 ? (
                <div className="space-y-3 mt-2">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <Unlock className="h-4 w-4" /> Net Balance
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(displayBalance, baseCurrency)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 font-medium text-xs">
                      <Lock className="h-3 w-3" /> Goal Deposits
                    </div>
                    <span className="font-semibold text-violet-700 dark:text-violet-300">{formatCurrency(currentMonthGoalDeposits, baseCurrency)}</span>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-500 mt-2">Click to view breakdown</div>
              )}
            </CardContent>
          </Card>
        </StaggerItem>

        {/* Income Card */}
        <StaggerItem className="h-full">
          <Card 
            className="h-full flex flex-col justify-between cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:shadow-md hover:-translate-y-1"
            onClick={() => setModalOpen('income')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                This Month&apos;s Income
              </CardTitle>
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                {formatCurrency(currentMonthRegularIncome, baseCurrency)}
              </div>
            </CardContent>
            <CardContent>
              {currentMonthGoalDeposits > 0 || currentMonthRegularIncome > 0 ? (
                <div className="space-y-3 mt-2">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <Wallet className="h-4 w-4" /> Total Income
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(displayIncome, baseCurrency)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 font-medium text-xs">
                      <Lock className="h-3 w-3" /> Goal Deposits
                    </div>
                    <span className="font-semibold text-violet-700 dark:text-violet-300">{formatCurrency(currentMonthGoalDeposits, baseCurrency)}</span>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-500 mt-2">No income this month</div>
              )}
            </CardContent>
          </Card>
        </StaggerItem>

        {/* Expenses Card */}
        <StaggerItem className="h-full">
          <Card 
            className="h-full flex flex-col justify-between cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:shadow-md hover:-translate-y-1"
            onClick={() => setModalOpen('expense')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                This Month&apos;s Expenses
              </CardTitle>
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                <ArrowDownLeft className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
                {formatCurrency(displayExpense, baseCurrency)}
              </div>
            </CardContent>
            <CardContent>
              {currentMonthTopExpenseCategory ? (
                <div className="space-y-3 mt-2">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <PieChart className="h-4 w-4" /> Top Category
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {currentMonthTopExpenseCategory[0]}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-medium text-xs">
                      <TrendingDown className="h-3 w-3" /> Highest Spend
                    </div>
                    <span className="font-semibold text-red-700 dark:text-red-300">
                      {formatCurrency(currentMonthTopExpenseCategory[1], baseCurrency)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-500 mt-2">No expenses this month</div>
              )}
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerContainer>

      {/* --- MODALS --- */}

      {/* Balance Modal */}
      <Dialog open={modalOpen === 'balance'} onOpenChange={(open) => !open && setModalOpen(null)}>
        <DialogContent className="sm:max-w-[700px] border-none bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              Net Balance Details
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2 pb-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-800 [&::-webkit-scrollbar-thumb]:rounded-full pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-sm text-slate-500 mb-1">Available Balance</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalAvailable, baseCurrency)}</p>
              </div>
              <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-100 dark:border-violet-800/30">
                <p className="text-sm text-violet-600 dark:text-violet-400 mb-1">Reserved for Goals</p>
                <p className="text-2xl font-bold text-violet-700 dark:text-violet-300">{formatCurrency(totalReserved, baseCurrency)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <PiggyBank className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Savings Rate</p>
                  <p className="text-lg font-bold">{savingsRate.toFixed(1)}%</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                  <CalendarClock className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Last Updated</p>
                  <p className="text-sm font-medium">{lastUpdated}</p>
                </div>
              </div>
            </div>

              <div className="pt-2">
              <h4 className="text-sm font-semibold mb-4">Monthly Trend</h4>
              <div className="h-[200px] w-full mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={months} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: '#64748b' }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      tickFormatter={(value) => `$${value >= 1000 ? (value / 1000) + 'k' : value}`}
                      width={40}
                    />
                    <RechartsTooltip content={<CustomTooltip baseCurrency={baseCurrency} />} />
                    <Line type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between mb-3 mt-4">
                <h4 className="text-sm font-semibold">12-Month Breakdown</h4>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[100px] h-8 text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2026">2026</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden shadow-sm">
                <div className="max-h-[250px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-800 [&::-webkit-scrollbar-thumb]:rounded-full">
                  <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-900 sticky top-0 z-10 shadow-sm">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="h-9 py-2 px-4 text-xs uppercase tracking-wider font-semibold text-slate-500">Month</TableHead>
                        <TableHead className="h-9 py-2 px-4 text-xs uppercase tracking-wider font-semibold text-slate-500 text-right">Net Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {months.map((m) => (
                        <TableRow key={m.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                          <TableCell className="py-2.5 px-4 text-sm font-medium">{m.name}</TableCell>
                          <TableCell className={`py-2.5 px-4 text-sm text-right ${m.balance < 0 ? 'text-red-600' : 'text-slate-900 dark:text-white font-medium'}`}>
                            {formatCurrency(m.balance, baseCurrency)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Income Modal */}
      <Dialog open={modalOpen === 'income'} onOpenChange={(open) => !open && setModalOpen(null)}>
        <DialogContent className="sm:max-w-[700px] border-none bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <ArrowUpRight className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              Income Analysis
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2 pb-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-800 [&::-webkit-scrollbar-thumb]:rounded-full pt-2">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800/30">
                <p className="text-sm text-green-600 dark:text-green-400 mb-1">Total Income</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{formatCurrency(totalIncome, baseCurrency)}</p>
              </div>
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-1">Goal Deposits</p>
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{formatCurrency(totalGoalIncome, baseCurrency)}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-semibold mb-4">Monthly Trend</h4>
              <div className="h-[200px] w-full mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={months} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: '#64748b' }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      tickFormatter={(value) => `$${value >= 1000 ? (value / 1000) + 'k' : value}`}
                      width={40}
                    />
                    <RechartsTooltip content={<CustomTooltip baseCurrency={baseCurrency} />} cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <PieChart className="h-4 w-4 text-slate-400" />
                Sources Breakdown
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                {Object.entries(incomeSources).length > 0 ? (
                  Object.entries(incomeSources)
                    .sort(([, a], [, b]) => b - a)
                    .map(([category, amount]) => (
                      <div key={category} className="flex justify-between items-center text-sm p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">{category}</span>
                        <span className="font-semibold text-green-600">{formatCurrency(amount, baseCurrency)}</span>
                      </div>
                    ))
                ) : (
                  <p className="text-sm text-muted-foreground">No income sources found.</p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3 mt-2">
                <h4 className="text-sm font-semibold">12-Month Breakdown</h4>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[100px] h-8 text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2026">2026</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden shadow-sm">
                <div className="max-h-[250px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-800 [&::-webkit-scrollbar-thumb]:rounded-full">
                  <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-900 sticky top-0 z-10 shadow-sm">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="h-9 py-2 px-4 text-xs uppercase tracking-wider font-semibold text-slate-500">Month</TableHead>
                        <TableHead className="h-9 py-2 px-4 text-xs uppercase tracking-wider font-semibold text-slate-500 text-right">Income</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {months.map((m) => (
                        <TableRow key={m.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                          <TableCell className="py-2.5 px-4 text-sm font-medium">{m.name}</TableCell>
                          <TableCell className="py-2.5 px-4 text-sm text-right text-green-600 font-medium">
                            {formatCurrency(m.income, baseCurrency)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Expense Modal */}
      <Dialog open={modalOpen === 'expense'} onOpenChange={(open) => !open && setModalOpen(null)}>
        <DialogContent className="sm:max-w-[700px] border-none bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <ArrowDownLeft className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              Expense Analysis
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2 pb-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-800 [&::-webkit-scrollbar-thumb]:rounded-full pt-2">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800/30">
                <p className="text-sm text-red-600 dark:text-red-400 mb-1">Total Expenses</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">{formatCurrency(totalExpense, baseCurrency)}</p>
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-800/30">
                <p className="text-sm text-orange-600 dark:text-orange-400 mb-1">Highest Spend Category</p>
                <p className="text-xl font-bold text-orange-700 dark:text-orange-300 truncate mt-1">
                  {topExpenseCategory ? topExpenseCategory[0] : 'N/A'}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-semibold mb-4">Monthly Trend</h4>
              <div className="h-[200px] w-full mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={months} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: '#64748b' }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      tickFormatter={(value) => `$${value >= 1000 ? (value / 1000) + 'k' : value}`}
                      width={40}
                    />
                    <RechartsTooltip content={<CustomTooltip baseCurrency={baseCurrency} />} cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              {/* Category Breakdown */}
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <PieChart className="h-4 w-4 text-slate-400" />
                  Top Categories
                </h4>
                <div className="space-y-2">
                  {Object.entries(expenseCategories).length > 0 ? (
                    Object.entries(expenseCategories)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 5) // Show top 5
                      .map(([category, amount]) => (
                        <div key={category} className="flex justify-between items-center text-sm p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                          <span className="text-slate-600 dark:text-slate-400 truncate pr-4 font-medium">{category}</span>
                          <span className="font-semibold text-red-600 shrink-0">{formatCurrency(amount, baseCurrency)}</span>
                        </div>
                      ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No expenses found.</p>
                  )}
                </div>
              </div>

              {/* Top 5 Transactions */}
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <ReceiptText className="h-4 w-4 text-slate-400" />
                  Largest Transactions
                </h4>
                <div className="space-y-2">
                  {top5Transactions.length > 0 ? (
                    top5Transactions.map((tx) => (
                      <div key={tx.id} className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                        <div className="overflow-hidden pr-2">
                          <p className="font-medium text-xs text-slate-900 dark:text-slate-100 truncate">{tx.description || tx.category}</p>
                        </div>
                        <span className="font-semibold text-xs text-red-600 shrink-0">
                          {formatCurrency(tx.amount, baseCurrency)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No transactions available.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
              <div className="flex items-center justify-between mb-3 mt-2">
                <h4 className="text-sm font-semibold">12-Month Breakdown</h4>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[100px] h-8 text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2026">2026</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden shadow-sm">
                <div className="max-h-[250px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-800 [&::-webkit-scrollbar-thumb]:rounded-full">
                  <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-900 sticky top-0 z-10 shadow-sm">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="h-9 py-2 px-4 text-xs uppercase tracking-wider font-semibold text-slate-500">Month</TableHead>
                        <TableHead className="h-9 py-2 px-4 text-xs uppercase tracking-wider font-semibold text-slate-500 text-right">Spending</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {months.map((m) => (
                        <TableRow key={m.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                          <TableCell className="py-2.5 px-4 text-sm font-medium">{m.name}</TableCell>
                          <TableCell className="py-2.5 px-4 text-sm text-right text-red-600 font-medium">
                            {formatCurrency(m.expense, baseCurrency)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
