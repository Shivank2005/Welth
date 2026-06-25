"use server";

import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";
import { revalidatePath } from "next/cache";

export async function getRecurringTransactions() {
  const user = await checkUser();
  if (!user) throw new Error("Unauthorized");

  const recurring = await db.recurringTransaction.findMany({
    where: { userId: user.id },
    include: { account: true },
    orderBy: { nextDate: "asc" },
  });

  return recurring;
}

export async function createRecurringTransaction(data) {
  const user = await checkUser();
  if (!user) throw new Error("Unauthorized");

  const { amount, type, category, description, frequency, nextDate, accountId } = data;

  // If no accountId provided, use the default account
  let targetAccountId = accountId;
  if (!targetAccountId) {
    const defaultAccount = await db.account.findFirst({
      where: { userId: user.id, isDefault: true },
    });
    if (!defaultAccount) throw new Error("No account found. Please create an account first.");
    targetAccountId = defaultAccount.id;
  }

  const recurring = await db.recurringTransaction.create({
    data: {
      amount: parseFloat(amount),
      type,
      category,
      description: description || null,
      frequency,
      nextDate: new Date(nextDate),
      userId: user.id,
      accountId: targetAccountId,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/recurring");

  return { success: true, data: recurring };
}

export async function deleteRecurringTransaction(id) {
  const user = await checkUser();
  if (!user) throw new Error("Unauthorized");

  await db.recurringTransaction.delete({
    where: { id, userId: user.id },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/recurring");

  return { success: true };
}

export async function processRecurringTransactions() {
  const user = await checkUser();
  if (!user) throw new Error("Unauthorized");

  const now = new Date();

  // Find all recurring transactions that are due (nextDate <= now)
  const dueTransactions = await db.recurringTransaction.findMany({
    where: {
      userId: user.id,
      nextDate: { lte: now },
    },
    include: { account: true },
  });

  if (dueTransactions.length === 0) {
    return { processed: 0 };
  }

  let processed = 0;

  for (const recurring of dueTransactions) {
    // Create the actual transaction
    await db.transaction.create({
      data: {
        amount: recurring.amount,
        type: recurring.type,
        category: recurring.category,
        description: `[Auto] ${recurring.description || recurring.category}`,
        date: recurring.nextDate,
        userId: recurring.userId,
        accountId: recurring.accountId,
        isRecurring: true,
        recurringId: recurring.id,
      },
    });

    // Update account balance
    const balanceChange =
      recurring.type === "INCOME" ? recurring.amount : -recurring.amount;

    await db.account.update({
      where: { id: recurring.accountId },
      data: { balance: { increment: balanceChange } },
    });

    // Calculate next occurrence
    const nextDate = new Date(recurring.nextDate);
    switch (recurring.frequency) {
      case "DAILY":
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case "WEEKLY":
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case "BIWEEKLY":
        nextDate.setDate(nextDate.getDate() + 14);
        break;
      case "MONTHLY":
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case "YEARLY":
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
      default:
        nextDate.setMonth(nextDate.getMonth() + 1);
    }

    await db.recurringTransaction.update({
      where: { id: recurring.id },
      data: { nextDate },
    });

    processed++;
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/recurring");

  return { processed };
}
