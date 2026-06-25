"use server";

import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";

export async function getPaginatedTransactions({ accountId, page = 1, limit = 10 }) {
  const user = await checkUser();
  if (!user) throw new Error("Unauthorized");

  const skip = (page - 1) * limit;

  try {
    const [transactions, totalCount] = await Promise.all([
      db.transaction.findMany({
        where: {
          userId: user.id,
          accountId: accountId,
        },
        orderBy: { date: "desc" },
        skip,
        take: limit,
        include: { account: true },
      }),
      db.transaction.count({
        where: {
          userId: user.id,
          accountId: accountId,
        },
      }),
    ]);

    return {
      transactions,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching paginated transactions:", error);
    throw new Error("Failed to fetch transactions");
  }
}

export async function getTransactionOverview({ accountId, dateRange }) {
  const user = await checkUser();
  if (!user) throw new Error("Unauthorized");

  const now = new Date();
  let startDate = new Date(); // Start relative to today

  switch (dateRange) {
    case "7D":
      startDate.setDate(startDate.getDate() - 7);
      break;
    case "1M":
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case "3M":
      startDate.setMonth(startDate.getMonth() - 3);
      break;
    case "6M":
      startDate.setMonth(startDate.getMonth() - 6);
      break;
    case "ALL":
    default:
      startDate = new Date(0); // 1970 for All Time
      break;
  }

  try {
    const transactions = await db.transaction.findMany({
      where: {
        userId: user.id,
        accountId: accountId,
        date: {
          gte: startDate,
          lte: now,
        },
      },
      orderBy: { date: "asc" },
    });

    let totalIncome = 0;
    let totalExpense = 0;

    const groupedByDate = {};

    transactions.forEach((tx) => {
      // Group by 'MMM dd' format (e.g. 'Sep 09')
      const dateKey = tx.date.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
      
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = { date: dateKey, income: 0, expense: 0 };
      }

      if (tx.type === "INCOME") {
        totalIncome += tx.amount;
        groupedByDate[dateKey].income += tx.amount;
      } else {
        totalExpense += tx.amount;
        groupedByDate[dateKey].expense += tx.amount;
      }
    });

    const chartData = Object.values(groupedByDate);
    const net = totalIncome - totalExpense;

    return {
      totals: {
        income: totalIncome,
        expense: totalExpense,
        net,
      },
      chartData,
    };
  } catch (error) {
    console.error("Error fetching transaction overview:", error);
    throw new Error("Failed to fetch transaction overview");
  }
}
