"use server";

import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";
import { askFinancialAssistant } from "@/lib/gemini";
import { unstable_cache } from "next/cache";

import { getExchangeRates } from "@/lib/currency";

export async function getFinancialHealth(accountId) {
  try {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");
    
    const dbUser = await db.user.findUnique({ where: { id: user.id } });
    const baseCurrency = dbUser?.baseCurrency || "USD";

    const [accounts, incomeAgg, expenseAgg] = await Promise.all([
      db.account.findMany({ where: { userId: user.id } }),
      db.transaction.findMany({
        where: { userId: user.id, type: "INCOME", ...(accountId ? { accountId } : {}) },
        include: { account: { select: { currency: true } } },
      }),
      db.transaction.findMany({
        where: { userId: user.id, type: "EXPENSE", ...(accountId ? { accountId } : {}) },
        include: { account: { select: { currency: true } } },
      }),
    ]);

    const rates = await getExchangeRates();
    const baseRate = rates[baseCurrency] || 1;

    // Convert account balances
    const selectedAccounts = accountId ? accounts.filter((a) => a.id === accountId) : accounts;
    const totalBalance = selectedAccounts.reduce((sum, a) => {
      const accRate = rates[a.currency || "USD"] || 1;
      return sum + (a.balance / accRate) * baseRate;
    }, 0);

    // Convert incomes
    const totalIncome = incomeAgg.reduce((sum, tx) => {
      const txRate = rates[tx.account?.currency || "USD"] || 1;
      return sum + (tx.amount / txRate) * baseRate;
    }, 0);

    // Convert expenses
    const totalExpense = expenseAgg.reduce((sum, tx) => {
      const txRate = rates[tx.account?.currency || "USD"] || 1;
      return sum + (tx.amount / txRate) * baseRate;
    }, 0);

    // 1. Savings Rate (40 points max)
    // Formula: ((Income - Expense) / Income) * 100
    // >= 20% = 40 pts, >= 10% = 30 pts, >= 5% = 20 pts, else 10 pts
    let savingsRate = 0;
    let savingsPoints = 0;
    let savingsStatus = "Needs Work";
    if (totalIncome > 0) {
      savingsRate = ((totalIncome - totalExpense) / totalIncome) * 100;
      if (savingsRate >= 20) { savingsPoints = 40; savingsStatus = "Excellent"; }
      else if (savingsRate >= 10) { savingsPoints = 30; savingsStatus = "Good"; }
      else if (savingsRate >= 5) { savingsPoints = 20; savingsStatus = "Average"; }
      else { savingsPoints = 10; }
    } else {
        savingsStatus = "No Income";
    }

    // 2. Debt / Spend Ratio (30 points max)
    // Formula: (Expense / Income) * 100
    // <= 50% = 30 pts, <= 75% = 20 pts, <= 90% = 10 pts, else 0 pts
    let spendRatio = 0;
    let debtPoints = 0;
    let debtStatus = "Needs Work";
    if (totalIncome > 0) {
      spendRatio = (totalExpense / totalIncome) * 100;
      if (spendRatio <= 50) { debtPoints = 30; debtStatus = "Excellent"; }
      else if (spendRatio <= 75) { debtPoints = 20; debtStatus = "Good"; }
      else if (spendRatio <= 90) { debtPoints = 10; debtStatus = "Average"; }
    } else {
      debtStatus = "No Income";
    }

    // 3. Emergency Fund (30 points max)
    // Target: 3 months of expenses. Actual: Balance / Avg Monthly Expense
    // For simplicity, we use totalExpense (lifetime or whatever is in DB) as a proxy if we assume they've been using it for a while.
    // Let's assume totalExpense is over the last X months. Better to just use:
    // >= 3x Monthly Expense = 30 pts, >= 1x = 20 pts, else 10 pts.
    let emergencyPoints = 0;
    let emergencyStatus = "Needs Work";
    const estimatedMonthlyExpense = totalExpense > 0 ? totalExpense / 3 : 1000; // rough estimate
    if (totalBalance >= estimatedMonthlyExpense * 3) {
      emergencyPoints = 30;
      emergencyStatus = "Excellent";
    } else if (totalBalance >= estimatedMonthlyExpense) {
      emergencyPoints = 20;
      emergencyStatus = "Good";
    } else if (totalBalance > 0) {
      emergencyPoints = 10;
      emergencyStatus = "Average";
    }

    // Final Score
    const score = Math.min(100, Math.max(0, savingsPoints + debtPoints + emergencyPoints));

    return {
      score,
      metrics: {
        savingsRate: { value: savingsRate.toFixed(1) + "%", status: savingsStatus },
        debtRatio: { value: spendRatio.toFixed(1) + "%", status: debtStatus },
        emergencyFund: { value: "Based on Balances", status: emergencyStatus },
      }
    };
  } catch (error) {
    console.error("Error calculating health score:", error);
    throw new Error(error.message);
  }
}

export async function getSpendingPrediction(accountId) {
  try {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");

    const generatePrediction = unstable_cache(
      async () => {
        // Fetch the last 30 days of transactions
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const dbUser = await db.user.findUnique({ where: { id: user.id } });
        const baseCurrency = dbUser?.baseCurrency || "USD";

        const recentTransactions = await db.transaction.findMany({
          where: { 
            userId: user.id,
            type: "EXPENSE",
            date: { gte: thirtyDaysAgo },
            ...(accountId ? { accountId } : {})
          },
          select: { amount: true, category: true, date: true, account: { select: { currency: true } } }
        });

        const rates = await getExchangeRates();
        const baseRate = rates[baseCurrency] || 1;

        const convertedTransactions = recentTransactions.map(tx => {
          const txRate = rates[tx.account?.currency || "USD"] || 1;
          return {
            ...tx,
            amount: (tx.amount / txRate) * baseRate
          };
        });

        const totalRecentExpense = convertedTransactions.reduce((sum, tx) => sum + tx.amount, 0);

        const categoryTotals = {};
        for (const tx of convertedTransactions) {
          categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
        }
        const topCategory = Object.keys(categoryTotals).sort((a, b) => categoryTotals[b] - categoryTotals[a])[0] || "OTHER";
        
        const predictedAmount = totalRecentExpense * 1.02;

        const context = `
          User's total spending last 30 days: ${totalRecentExpense}
          Top spending category: ${topCategory} with amount ${categoryTotals[topCategory] || 0}
          Predicted spending next 30 days based on run-rate: ${predictedAmount}
        `;

        const prompt = `Based on the following financial data, provide a spending prediction for the next month. Data: ${context}
Respond ONLY in valid JSON format, with no additional text:
{
  "trend": "<up|down|stable>",
  "reasoning": "<1 short, punchy sentence explaining the trend. Sound like a helpful human financial advisor. Do not just state numbers like a robot.>",
  "advice": "<1 short, actionable sentence on how to optimize this. Be direct and encouraging.>"
}`;

        let aiInsight = {
          trend: "stable",
          reasoning: "Your spending is matching your usual habits nicely.",
          advice: "Keep an eye on your top categories to stay under budget."
        };

        try {
          const responseText = await askFinancialAssistant([{ role: "user", content: prompt }], "You are a financial AI. Always return raw JSON only.");
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            aiInsight = JSON.parse(jsonMatch[0]);
          }
        } catch (e) {
          console.error("Failed to parse AI JSON insight:", e);
        }

        return {
          predictedAmount,
          insight: aiInsight,
          topCategory,
          baseCurrency
        };
      },
      [`spending-prediction-${user.id}-${accountId || "all"}`],
      {
        revalidate: 3600, // cache for 1 hour
        tags: [`user-${user.id}-transactions`]
      }
    );

    return await generatePrediction();
  } catch (error) {
    console.error("Error getting spending prediction:", error);
    throw new Error(error.message);
  }
}
