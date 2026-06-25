import { db } from "@/lib/prisma";
import { getExchangeRates } from "@/lib/currency";

export async function getYearlyReportData(userId, year) {
  const user = await db.user.findUnique({ where: { id: userId } });
  const baseCurrency = user?.baseCurrency || "USD";

  const startDate = new Date(year, 0, 1); // Jan 1st of the year
  const endDate = new Date(year, 11, 31, 23, 59, 59, 999); // Dec 31st of the year

  const transactions = await db.transaction.findMany({
    where: {
      userId,
      date: { gte: startDate, lte: endDate },
    },
    include: { account: { select: { currency: true } } },
    orderBy: { date: "asc" },
  });

  const rates = await getExchangeRates();
  const baseRate = rates[baseCurrency] || 1;

  let totalIncome = 0;
  let totalExpense = 0;

  // Initialize all 12 months
  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    monthIndex: i,
    monthName: new Date(year, i).toLocaleString('default', { month: 'short' }),
    income: 0,
    expense: 0,
    balance: 0,
  }));

  transactions.forEach((tx) => {
    const txRate = rates[tx.account?.currency || "USD"] || 1;
    const valueInBase = (tx.amount / txRate) * baseRate;
    
    const monthIndex = tx.date.getMonth();
    
    if (tx.type === "INCOME") {
      totalIncome += valueInBase;
      monthlyData[monthIndex].income += valueInBase;
    } else if (tx.type === "EXPENSE") {
      totalExpense += valueInBase;
      monthlyData[monthIndex].expense += valueInBase;
    }
  });

  // Calculate balance per month
  monthlyData.forEach(data => {
    data.balance = data.income - data.expense;
  });

  const totalBalance = totalIncome - totalExpense;

  return {
    totalIncome,
    totalExpense,
    totalBalance,
    monthlyData,
    baseCurrency,
    year,
  };
}
