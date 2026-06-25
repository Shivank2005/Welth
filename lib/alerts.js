import { db } from "./prisma.js";
import { sendBudgetAlertEmail, sendUnusualSpendEmail, sendLowBalanceEmail, sendExpenseRatioEmail } from "./email.js";
import { generateBudgetAlertInsights, generateUnusualSpendInsights, generateLowBalanceInsights, generateExpenseRatioInsights } from "./gemini.js";
import { checkUser } from "./checkUser.js";

/**
 * Evaluates real-time alerts after a transaction is created.
 * Checks for Budget Thresholds, Unusual Spend, and Low Balance.
 */
export async function evaluateTransactionAlerts(transaction) {
  try {
    const userId = transaction.userId;

    // 1. Budget Threshold Alerts (Over 100%)
    if (transaction.type === "EXPENSE") {
      const budget = await db.budget.findFirst({
        where: { userId, category: transaction.category },
      });

      if (budget) {
        // Calculate total spending for this month in this category
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const currentMonthTransactions = await db.transaction.findMany({
          where: {
            userId,
            type: "EXPENSE",
            category: transaction.category,
            date: { gte: startOfMonth, lte: endOfMonth },
          },
        });

        const totalSpent = currentMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
        const percentage = (totalSpent / budget.amount) * 100;

        let threshold = null;
        if (percentage > 100) threshold = 100;

        if (threshold) {
          const referenceId = `BUDGET_${transaction.category}_${now.getFullYear()}_${now.getMonth()}_${threshold}`;
          
          // Check if we already alerted for this threshold this month
          const existingAlert = await db.alert.findFirst({
            where: { userId, type: "BUDGET", referenceId },
          });

          if (!existingAlert) {
            const user = await db.user.findUnique({ where: { id: userId } });
            
            // Send email
            if (user?.email) {
              const insights = await generateBudgetAlertInsights(transaction.category, totalSpent, budget.amount);
              await sendBudgetAlertEmail({
                to: user.email,
                subject: `Budget Alert: ${transaction.category} at ${percentage.toFixed(0)}%`,
                category: transaction.category,
                spent: totalSpent,
                budget: budget.amount,
                percentage: percentage,
                insights
              });
            }

            // Record alert
            await db.alert.create({
              data: {
                userId,
                type: "BUDGET",
                message: `You reached ${threshold}% of your ${transaction.category} budget.`,
                referenceId,
                status: "SENT",
              },
            });
          }
        }
      }

      // 1.5 Global Income vs Expense Alert
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const allMonthTransactions = await db.transaction.findMany({
        where: {
          userId,
          date: { gte: startOfMonth, lte: endOfMonth },
        },
      });

      const totalIncome = allMonthTransactions.filter(t => t.type === "INCOME").reduce((sum, t) => sum + t.amount, 0);
      const totalExpense = allMonthTransactions.filter(t => t.type === "EXPENSE").reduce((sum, t) => sum + t.amount, 0);

      if (totalIncome > 0) {
        const ratio = (totalExpense / totalIncome) * 100;
        let globalThreshold = null;
        if (ratio >= 120) globalThreshold = 120;
        else if (ratio >= 100) globalThreshold = 100;
        else if (ratio >= 80) globalThreshold = 80;

        if (globalThreshold) {
          const referenceId = `GLOBAL_RATIO_${now.getFullYear()}_${now.getMonth()}_${globalThreshold}`;
          const existingAlert = await db.alert.findFirst({
            where: { userId, type: "EXPENSE_RATIO", referenceId },
          });

          if (!existingAlert) {
            const user = await db.user.findUnique({ where: { id: userId } });
            if (user?.email) {
              const insights = await generateExpenseRatioInsights(totalIncome, totalExpense, ratio);
              await sendExpenseRatioEmail({
                to: user.email,
                subject: `Income vs Expense Alert: ${ratio.toFixed(1)}%`,
                income: totalIncome,
                expense: totalExpense,
                percentage: ratio,
                insights
              });
            }

            await db.alert.create({
              data: {
                userId,
                type: "EXPENSE_RATIO",
                message: `You reached ${globalThreshold}% of your monthly income.`,
                referenceId,
                status: "SENT",
              },
            });
          }
        }
      }

      // 2. Unusual Spend Alert ( > 2x average )
      const pastTransactions = await db.transaction.findMany({
        where: {
          userId,
          type: "EXPENSE",
          category: transaction.category,
          id: { not: transaction.id },
        },
      });

      if (pastTransactions.length > 3) {
        const avgSpend = pastTransactions.reduce((sum, t) => sum + t.amount, 0) / pastTransactions.length;
        if (transaction.amount > avgSpend * 2) {
          const referenceId = `UNUSUAL_${transaction.id}`;
          
          const existingAlert = await db.alert.findFirst({
            where: { userId, type: "UNUSUAL_SPEND", referenceId },
          });

          if (!existingAlert) {
            const user = await db.user.findUnique({ where: { id: userId } });
            
            // Send email
            if (user?.email) {
              const insights = await generateUnusualSpendInsights(transaction.category, transaction.amount, avgSpend);
              await sendUnusualSpendEmail({
                to: user.email,
                subject: `Unusual Spend Alert: $${transaction.amount.toFixed(2)} in ${transaction.category}`,
                category: transaction.category,
                amount: transaction.amount,
                average: avgSpend,
                insights
              });
            }

            // Log it in the database
            await db.alert.create({
              data: {
                userId,
                type: "UNUSUAL_SPEND",
                message: `Unusual spend detected: $${transaction.amount.toFixed(2)} in ${transaction.category}.`,
                referenceId,
                status: "SENT",
              },
            });
          }
        }
      }
    }

    // 3. Low Balance Projection (Balance - 7 days upcoming recurring)
    const account = await db.account.findUnique({ where: { id: transaction.accountId } });
    if (account) {
      const today = new Date();
      const next7Days = new Date(today);
      next7Days.setDate(today.getDate() + 7);

      const upcomingExpenses = await db.recurringTransaction.findMany({
        where: {
          accountId: account.id,
          type: "EXPENSE",
          nextDate: { gte: today, lte: next7Days },
        },
      });

      const upcomingTotal = upcomingExpenses.reduce((sum, r) => sum + r.amount, 0);
      const projectedBalance = account.balance - upcomingTotal;

      const LOW_BALANCE_THRESHOLD = 100; // configurable
      if (projectedBalance < LOW_BALANCE_THRESHOLD) {
        const referenceId = `LOW_BALANCE_${account.id}_${today.getFullYear()}_${today.getMonth()}_${today.getDate()}`;
        
        const existingAlert = await db.alert.findFirst({
          where: { userId, type: "LOW_BALANCE", referenceId },
        });

        if (!existingAlert) {
          const user = await db.user.findUnique({ where: { id: userId } });
          
          if (user?.email) {
            const insights = await generateLowBalanceInsights(account.name, projectedBalance, LOW_BALANCE_THRESHOLD);
            await sendLowBalanceEmail({
              to: user.email,
              subject: `Low Balance Alert: ${account.name}`,
              accountName: account.name,
              projectedBalance,
              threshold: LOW_BALANCE_THRESHOLD,
              insights
            });
          }

          await db.alert.create({
            data: {
              userId,
              type: "LOW_BALANCE",
              message: `Low balance warning: Projected balance for ${account.name} drops to $${projectedBalance.toFixed(2)} in the next 7 days.`,
              referenceId,
              status: "SENT",
            },
          });
        }
      }
    }
  } catch (error) {
    console.error("Error evaluating transaction alerts:", error);
  }
}
