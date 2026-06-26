"use server";

import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";
import { revalidatePath, revalidateTag } from "next/cache";

export async function getBudgets() {
  const user = await checkUser();
  if (!user) throw new Error("Unauthorized");

  const budgets = await db.budget.findMany({
    where: { userId: user.id },
  });

  return budgets;
}

export async function upsertBudget(data) {
  const user = await checkUser();
  if (!user) throw new Error("Unauthorized");

  const { category, amount } = data;

  const existingBudget = await db.budget.findFirst({
    where: { userId: user.id, category },
  });

  if (existingBudget) {
    await db.budget.update({
      where: { id: existingBudget.id },
      data: { amount },
    });
  } else {
    await db.budget.create({
      data: {
        userId: user.id,
        category,
        amount,
      },
    });
  }

  revalidateTag(`dashboard-data-${user.id}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/budgets");
  
  return { success: true };
}

export async function getBudgetProgress() {
  const user = await checkUser();
  if (!user) throw new Error("Unauthorized");

  // Get all budgets for the user
  const budgets = await db.budget.findMany({
    where: { userId: user.id },
  });

  if (!budgets.length) return [];

  // Get current month's expenses
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const expenses = await db.transaction.findMany({
    where: {
      userId: user.id,
      type: "EXPENSE",
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    include: {
      account: {
        select: {
          name: true,
        },
      },
    },
  });

  // Calculate progress per category
  return budgets.map((budget) => {
    const budgetExpenses = expenses.filter((tx) => tx.category === budget.category);
    const spent = budgetExpenses.reduce((sum, tx) => sum + tx.amount, 0);

    // Group by account
    const accountSummaryMap = {};
    budgetExpenses.forEach((tx) => {
      const accountName = tx.account?.name || "Unknown Account";
      if (!accountSummaryMap[accountName]) {
        accountSummaryMap[accountName] = 0;
      }
      accountSummaryMap[accountName] += tx.amount;
    });

    const accountBreakdown = Object.entries(accountSummaryMap)
      .map(([name, amount]) => ({
        name,
        amount,
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      ...budget,
      spent,
      progress: budget.amount > 0 ? Math.min((spent / budget.amount) * 100, 100) : 0,
      isExceeded: spent > budget.amount,
      accountBreakdown,
    };
  });
}

import { unstable_cache } from "next/cache";

async function _getDefaultAccountBudget(user) {
  if (!user) throw new Error("Unauthorized");

  const [budget, defaultAccount] = await Promise.all([
    db.budget.findFirst({
      where: { userId: user.id, category: "DEFAULT_ACCOUNT" },
    }),
    db.account.findFirst({
      where: { userId: user.id, isDefault: true },
    }),
  ]);

  if (!defaultAccount) return null;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const expenses = await db.transaction.aggregate({
    _sum: { amount: true },
    where: {
      userId: user.id,
      accountId: defaultAccount.id,
      type: "EXPENSE",
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
  });

  const spent = expenses._sum.amount || 0;
  const amount = budget?.amount || 0;

  return {
    id: budget?.id,
    amount,
    spent,
    progress: amount > 0 ? Math.min((spent / amount) * 100, 100) : 0,
    isExceeded: spent > amount,
}

export async function getDefaultAccountBudget() {
  const user = await checkUser();
  if (!user) return null;

  const cachedFn = unstable_cache(
    async () => _getDefaultAccountBudget(user),
    [`budget-data-${user.id}`],
    {
      tags: [`dashboard-data-${user.id}`],
      revalidate: 3600,
    }
  );
  return cachedFn();
}

export async function updateDefaultAccountBudget(amount) {
  const user = await checkUser();
  if (!user) throw new Error("Unauthorized");

  const existingBudget = await db.budget.findFirst({
    where: { userId: user.id, category: "DEFAULT_ACCOUNT" },
  });

  if (existingBudget) {
    await db.budget.update({
      where: { id: existingBudget.id },
      data: { amount },
    });
  } else {
    await db.budget.create({
      data: {
        userId: user.id,
        category: "DEFAULT_ACCOUNT",
        amount,
      },
    });
  }

  revalidateTag(`dashboard-data-${user.id}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteBudget(id) {
  const user = await checkUser();
  if (!user) throw new Error("Unauthorized");

  await db.budget.delete({
    where: { id, userId: user.id },
  });

  revalidateTag(`dashboard-data-${user.id}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/budgets");

  return { success: true };
}
