"use server";

import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";
import { revalidatePath } from "next/cache";

export async function generateDemoData() {
  try {
    const user = await checkUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // 0. Unset other default accounts
    await db.account.updateMany({
      where: { userId: user.id },
      data: { isDefault: false },
    });

    // 1. Create a Demo Account
    const account = await db.account.create({
      data: {
        name: "Demo Checking",
        type: "CHECKING",
        balance: 5000,
        currency: "USD",
        isDefault: true,
        userId: user.id,
      },
    });

    // 2. Generate 50 realistic transactions
    const categories = ["HOUSING", "TRANSPORTATION", "GROCERIES", "ENTERTAINMENT", "UTILITIES"];
    const now = new Date();
    
    const transactions = [];
    // Ensure at least one recurring transaction
    transactions.push({
      amount: 1500,
      type: "EXPENSE",
      category: "HOUSING",
      description: "Flat Rent (Recurring)",
      date: new Date(now.getFullYear(), now.getMonth(), 1),
      userId: user.id,
      accountId: account.id,
      isRecurring: true,
    });

    for (let i = 0; i < 49; i++) {
      const type = "EXPENSE";
      const category = categories[Math.floor(Math.random() * categories.length)];
      const amount = Math.floor(Math.random() * 150) + 10;
      
      const date = new Date(now);
      date.setDate(date.getDate() - Math.floor(Math.random() * 30)); // Random date within last 30 days

      transactions.push({
        amount,
        type,
        category,
        description: `Demo ${category} Transaction`,
        date,
        userId: user.id,
        accountId: account.id,
      });
    }

    await db.transaction.createMany({
      data: transactions,
    });

    // 3. Create a Demo Budget
    await db.budget.create({
      data: {
        amount: 800,
        category: "GROCERIES",
        userId: user.id,
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error generating demo data:", error);
    return { success: false, error: error.message };
  }
}
