import { db } from "@/lib/prisma";
import { getExchangeRates } from "@/lib/currency";

import { unstable_cache } from "next/cache";

async function _getDashboardData(userId, accountId) {
  const user = await db.user.findUnique({ where: { id: userId } });
  const baseCurrency = user?.baseCurrency || "USD";

  const currentYear = new Date().getFullYear();
  const startDate = new Date(currentYear, 4, 1); // May 1
  const endDate = new Date(currentYear, 7, 0, 23, 59, 59, 999); // July 31 end of day

  const [accounts, transactions, rates] = await Promise.all([
    db.account.findMany({
      where: { userId },
      include: {
        goals: { select: { saved: true } },
      },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    }),
    db.transaction.findMany({
      where: { 
        userId, 
        date: { gte: startDate, lte: endDate },
        ...(accountId ? { accountId } : {}) 
      },
      include: { account: { select: { name: true, currency: true } } },
      orderBy: { date: "desc" },
    }),
    getExchangeRates(),
  ]);

  const incomeAgg = transactions.filter(t => t.type === "INCOME");
  const expenseAgg = transactions.filter(t => t.type === "EXPENSE");

  const baseRate = rates[baseCurrency] || 1;

  // Convert account balances to base currency
  const selectedAccounts = accountId ? accounts.filter((a) => a.id === accountId) : accounts;
  let totalBalance = 0;
  let totalReserved = 0;

  selectedAccounts.forEach((a) => {
    const accRate = rates[a.currency || "USD"] || 1;
    const valueInBase = (a.balance / accRate) * baseRate;
    totalBalance += valueInBase;

    const accountReserved = a.goals?.reduce((sum, g) => sum + g.saved, 0) || 0;
    const reservedInBase = (accountReserved / accRate) * baseRate;
    totalReserved += reservedInBase;
  });
  
  const totalAvailable = totalBalance - totalReserved;

  const monthlyData = {
    4: { name: 'May', income: 0, expense: 0, goalDeposits: 0, balance: 0 },
    5: { name: 'June', income: 0, expense: 0, goalDeposits: 0, balance: 0 },
    6: { name: 'July', income: 0, expense: 0, goalDeposits: 0, balance: 0 },
  };

  // Convert incomes
  let totalIncome = 0;
  let totalGoalIncome = 0;
  
  incomeAgg.forEach((tx) => {
    const txRate = rates[tx.account?.currency || "USD"] || 1;
    const valueInBase = (tx.amount / txRate) * baseRate;
    totalIncome += valueInBase;
    
    const month = tx.date.getMonth();
    if (monthlyData[month]) {
      monthlyData[month].income += valueInBase;
    }

    // Check if it's a Goal Funding transaction
    if (tx.category === "Savings" && tx.description?.startsWith("Goal Funding:")) {
      totalGoalIncome += valueInBase;
      if (monthlyData[month]) {
        monthlyData[month].goalDeposits += valueInBase;
      }
    }
  });

  // Convert expenses
  const totalExpense = expenseAgg.reduce((sum, tx) => {
    const txRate = rates[tx.account?.currency || "USD"] || 1;
    const valueInBase = (tx.amount / txRate) * baseRate;
    
    const month = tx.date.getMonth();
    if (monthlyData[month]) {
      monthlyData[month].expense += valueInBase;
    }
    
    return sum + valueInBase;
  }, 0);

  // Calculate monthly net balances
  Object.values(monthlyData).forEach(data => {
    data.balance = data.income - data.expense;
  });

  return {
    totalBalance,
    totalReserved,
    totalAvailable,
    totalIncome,
    totalGoalIncome,
    totalExpense,
    accounts,
    transactions,
    baseCurrency,
    monthlyData,
  };
}

export async function getDashboardData(userId, accountId) {
  const cachedFn = unstable_cache(
    async () => _getDashboardData(userId, accountId),
    [`dashboard-data-${userId}-${accountId || "all"}`],
    {
      tags: [`dashboard-data-${userId}`],
      revalidate: 3600,
    }
  );
  return cachedFn();
}
