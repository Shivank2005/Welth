"use server";

import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";
import { revalidatePath } from "next/cache";

/**
 * Exports all user transactions as a CSV string.
 */
export async function exportTransactionsCSV() {
  const user = await checkUser();
  if (!user) throw new Error("Unauthorized");

  const transactions = await db.transaction.findMany({
    where: { userId: user.id },
    include: { account: true },
    orderBy: { date: "desc" },
  });

  // CSV Header
  let csv = "Date,Type,Category,Amount,Description,Account\n";

  // CSV Rows
  for (const tx of transactions) {
    const date = new Date(tx.date).toISOString().split("T")[0];
    // Escape description to handle commas or quotes
    const desc = tx.description ? `"${tx.description.replace(/"/g, '""')}"` : "";
    const accountName = `"${tx.account.name.replace(/"/g, '""')}"`;
    
    csv += `${date},${tx.type},${tx.category},${tx.amount},${desc},${accountName}\n`;
  }

  return csv;
}

/**
 * Imports transactions from a parsed CSV structure.
 * Expected format: array of objects { date, type, category, amount, description }
 */
export async function importTransactionsCSV(transactionsData, accountId) {
  const user = await checkUser();
  if (!user) throw new Error("Unauthorized");

  if (!accountId) throw new Error("Account ID is required for import");

  let imported = 0;
  const errors = [];

  for (let i = 0; i < transactionsData.length; i++) {
    const row = transactionsData[i];
    try {
      const amount = parseFloat(row.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Invalid amount");
      }

      const date = new Date(row.date);
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date");
      }

      const type = row.type?.toUpperCase() === "INCOME" ? "INCOME" : "EXPENSE";
      const category = row.category?.toUpperCase() || "OTHER";
      
      // We could add validation against EXPENSE_CATEGORIES/INCOME_CATEGORIES here,
      // but defaulting to whatever is provided (and falling back to 'OTHER' in UI) is safer for raw imports.

      await db.transaction.create({
        data: {
          amount,
          type,
          category,
          description: row.description || "Imported transaction",
          date,
          userId: user.id,
          accountId: accountId,
        },
      });

      // Update account balance
      const balanceChange = type === "INCOME" ? amount : -amount;
      await db.account.update({
        where: { id: accountId },
        data: { balance: { increment: balanceChange } },
      });

      imported++;
    } catch (err) {
      errors.push(`Row ${i + 1}: ${err.message}`);
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/account");
  
  return { imported, errors };
}
