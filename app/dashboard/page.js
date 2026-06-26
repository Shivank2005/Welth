import Link from "next/link";
import { checkUser } from "@/lib/checkUser";
import { getDashboardData } from "@/lib/dashboard-data";
import { formatCurrency, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DashboardCharts from "@/components/dashboard-charts";
import { ArrowDownLeft, ArrowUpRight, PenBox, Wallet, Lock, Unlock, TrendingDown } from "lucide-react";
import { redirect } from "next/navigation";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/animations";
import { FinancialInsights } from "@/components/financial-insights";
import TransactionList from "@/components/transaction-list";
import MonthlyAccountBudget from "@/components/monthly-account-budget";
import { getDefaultAccountBudget } from "@/actions/budget";
import GlobalAccountSelector from "@/components/global-account-selector";
import DashboardOverviewCards from "@/components/dashboard-overview-cards";

export default async function DashboardPage({ searchParams }) {
  const user = await checkUser();
  if (!user) redirect("/sign-in");

  const resolvedSearchParams = await searchParams;
  const accountParam = resolvedSearchParams?.account;
  const accountId = accountParam === "all" ? undefined : accountParam;

  const { totalBalance, totalReserved, totalAvailable, totalIncome, totalGoalIncome, totalExpense, accounts, transactions, baseCurrency, monthlyData } =
    await getDashboardData(user.id, accountId);

  const expensesByCategory = transactions
    .filter((tx) => tx.type === "EXPENSE")
    .reduce((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      return acc;
    }, {});
  
  const topExpenseCategory = Object.entries(expensesByCategory)
    .sort(([, a], [, b]) => b - a)[0];

  const currentMonthIndex = new Date().getMonth();
  const currentMonthData = monthlyData[currentMonthIndex] || { income: 0, expense: 0, goalDeposits: 0 };
  const currentMonthRegularIncome = (currentMonthData.income || 0) - (currentMonthData.goalDeposits || 0);
  const currentMonthExpense = currentMonthData.expense || 0;

  const budgetData = await getDefaultAccountBudget();

  return (
    <PageTransition className="container mx-auto space-y-8 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Welcome, {user.firstName || "there"}! 👋</h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s an overview of your finances today.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <GlobalAccountSelector accounts={accounts} currentAccountId={accountId} />
        </div>
      </div>

      {/* Income vs Expense Progress */}
      <MonthlyAccountBudget 
        totalIncome={currentMonthRegularIncome} 
        totalExpense={currentMonthExpense} 
        customLimit={budgetData?.amount || 0}
      />

      <DashboardOverviewCards 
        totalBalance={totalBalance}
        totalReserved={totalReserved}
        totalAvailable={totalAvailable}
        totalIncome={totalIncome}
        totalGoalIncome={totalGoalIncome}
        totalExpense={totalExpense}
        baseCurrency={baseCurrency}
        topExpenseCategory={topExpenseCategory}
        monthlyData={monthlyData}
        transactions={transactions}
      />

      <DashboardCharts transactions={transactions} />

      <FinancialInsights accountId={accountId} />

      <TransactionList transactions={transactions} />
    </PageTransition>
  );
}
