"use server";

import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";
import { categorizeTransaction, scanReceipt } from "@/lib/gemini";
import { revalidatePath } from "next/cache";

/**
 * AI-powered auto-categorization for a transaction description.
 */
export async function aiCategorize(description, type = "EXPENSE") {
  const user = await checkUser();
  if (!user) throw new Error("Unauthorized");

  const category = await categorizeTransaction(description, type);
  return { category };
}

/**
 * Scan a receipt image and return extracted data.
 * Expects base64-encoded image data.
 */
export async function aiScanReceipt(base64Data, mimeType) {
  const user = await checkUser();
  if (!user) throw new Error("Unauthorized");

  const result = await scanReceipt(base64Data, mimeType);
  if (!result) {
    throw new Error("Could not read the receipt. Please try a clearer image.");
  }

  return result;
}

/**
 * Scan a receipt AND create the transaction in one step.
 */
export async function scanAndCreateTransaction(base64Data, mimeType, accountId) {
  const user = await checkUser();
  if (!user) throw new Error("Unauthorized");

  const receiptData = await scanReceipt(base64Data, mimeType);
  if (!receiptData) {
    throw new Error("Could not read the receipt. Please try a clearer image.");
  }

  // Use default account if none specified
  let targetAccountId = accountId;
  if (!targetAccountId) {
    const defaultAccount = await db.account.findFirst({
      where: { userId: user.id, isDefault: true },
    });
    if (!defaultAccount) throw new Error("No account found.");
    targetAccountId = defaultAccount.id;
  }

  // Create the transaction
  const transaction = await db.transaction.create({
    data: {
      amount: receiptData.amount,
      type: "EXPENSE",
      category: receiptData.category || "OTHER",
      description: receiptData.description || "Receipt scan",
      date: new Date(receiptData.date || new Date()),
      userId: user.id,
      accountId: targetAccountId,
    },
  });

  // Update account balance
  await db.account.update({
    where: { id: targetAccountId },
    data: { balance: { decrement: receiptData.amount } },
  });

  revalidatePath("/dashboard");

  return {
    receiptData,
    transactionId: transaction.id,
  };
}

/**
 * Get financial context string for the AI assistant.
 */
export async function getFinancialContext() {
  const user = await checkUser();
  if (!user) throw new Error("Unauthorized");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Get accounts
  const accounts = await db.account.findMany({
    where: { userId: user.id },
  });

  // Get this month's transactions
  const monthTransactions = await db.transaction.findMany({
    where: {
      userId: user.id,
      date: { gte: startOfMonth, lte: endOfMonth },
    },
    include: { account: true },
    orderBy: { date: "desc" },
  });

  // Get budgets
  const budgets = await db.budget.findMany({
    where: { userId: user.id },
  });

  // Get goals
  const goals = await db.goal.findMany({
    where: { userId: user.id },
  });

  // Get recurring transactions
  const recurring = await db.recurringTransaction.findMany({
    where: { userId: user.id },
  });

  // Calculate summaries
  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  const totalReserved = goals.reduce((sum, g) => sum + g.saved, 0);
  const totalAvailable = totalBalance - totalReserved;

  const monthIncome = monthTransactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);
  const monthExpense = monthTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  // Category breakdown
  const categorySpending = {};
  monthTransactions
    .filter((t) => t.type === "EXPENSE")
    .forEach((t) => {
      categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
    });

  // Build context string
  let context = `
=== ACCOUNTS ===
${accounts.map((a) => `- ${a.name} (${a.type}): $${a.balance.toFixed(2)}`).join("\n")}
Total Balance: $${totalBalance.toFixed(2)}
Available Balance: $${totalAvailable.toFixed(2)}

=== FINANCIAL GOALS ===
${goals.length > 0
  ? goals.map((g) => `- ${g.name}: $${g.saved.toFixed(2)} saved of $${g.target.toFixed(2)} target (${((g.saved / g.target) * 100).toFixed(0)}%)`).join("\n")
  : "No goals set."}

=== THIS MONTH (${now.toLocaleString("en-US", { month: "long", year: "numeric" })}) ===
Income: $${monthIncome.toFixed(2)}
Expenses: $${monthExpense.toFixed(2)}
Net: $${(monthIncome - monthExpense).toFixed(2)}

=== SPENDING BY CATEGORY (This Month) ===
${Object.entries(categorySpending)
  .sort(([, a], [, b]) => b - a)
  .map(([cat, amt]) => `- ${cat}: $${amt.toFixed(2)}`)
  .join("\n") || "No expenses this month."}

=== BUDGETS ===
${budgets.length > 0
  ? budgets.map((b) => {
      const spent = categorySpending[b.category] || 0;
      return `- ${b.category}: $${spent.toFixed(2)} / $${b.amount.toFixed(2)} (${((spent / b.amount) * 100).toFixed(0)}%)`;
    }).join("\n")
  : "No budgets set."}

=== RECURRING TRANSACTIONS ===
${recurring.length > 0
  ? recurring.map((r) => `- ${r.description || r.category}: $${r.amount.toFixed(2)} (${r.frequency}) - Next: ${r.nextDate.toISOString().slice(0, 10)}`).join("\n")
  : "No recurring transactions."}

=== RECENT TRANSACTIONS (Last 10) ===
${monthTransactions
  .slice(0, 10)
  .map((t) => `- ${t.date.toISOString().slice(0, 10)} | ${t.type} | ${t.category} | $${t.amount.toFixed(2)} | ${t.description || "—"} | Account: ${t.account.name}`)
  .join("\n") || "No recent transactions."}
`;

  return context;
}
