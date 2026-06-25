"use server";

import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";
import { revalidatePath } from "next/cache";

export async function getGoals() {
  try {
    const user = await checkUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const goals = await db.goal.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        account: {
          select: { name: true }
        }
      }
    });

    return goals;
  } catch (error) {
    console.error("Error fetching goals:", error);
    throw new Error(error.message);
  }
}

export async function createGoal(data) {
  try {
    const user = await checkUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const goalData = { ...data, userId: user.id };
    if (goalData.accountId === "UNLINKED" || goalData.accountId === "") {
      goalData.accountId = null;
    }

    const goal = await db.goal.create({
      data: goalData,
    });

    if (goalData.saved > 0 && goalData.accountId) {
      await db.account.update({
        where: { id: goalData.accountId },
        data: { balance: { increment: goalData.saved } }
      });
      await db.transaction.create({
        data: {
          userId: user.id,
          accountId: goalData.accountId,
          amount: goalData.saved,
          type: "INCOME",
          category: "Savings",
          description: `Goal Funding: ${goalData.name}`,
          date: new Date()
        }
      });
    }

    revalidatePath("/dashboard/goals");
    return { success: true, data: goal };
  } catch (error) {
    console.error("Error creating goal:", error);
    throw new Error(error.message);
  }
}

export async function updateGoal(id, data) {
  try {
    const user = await checkUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    // Verify ownership
    const existingGoal = await db.goal.findUnique({
      where: { id },
    });

    if (!existingGoal || existingGoal.userId !== user.id) {
      throw new Error("Goal not found");
    }

    const goal = await db.goal.update({
      where: { id },
      data,
    });

    if (data.saved !== undefined && existingGoal.accountId) {
      const amountAdded = data.saved - existingGoal.saved;
      if (amountAdded > 0) {
        await db.account.update({
          where: { id: existingGoal.accountId },
          data: { balance: { increment: amountAdded } }
        });
        await db.transaction.create({
          data: {
            userId: user.id,
            accountId: existingGoal.accountId,
            amount: amountAdded,
            type: "INCOME",
            category: "Savings",
            description: `Goal Funding: ${existingGoal.name}`,
            date: new Date()
          }
        });
      }
    }

    revalidatePath("/dashboard/goals");
    return { success: true, data: goal };
  } catch (error) {
    console.error("Error updating goal:", error);
    throw new Error(error.message);
  }
}

export async function deleteGoal(id) {
  try {
    const user = await checkUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    // Verify ownership
    const existing = await db.goal.findUnique({
      where: { id },
    });
    if (!existing || existing.userId !== user.id) {
      throw new Error("Goal not found or unauthorized");
    }

    await db.goal.delete({
      where: { id },
    });

    revalidatePath("/dashboard/goals");
    return { success: true };
  } catch (error) {
    console.error("Error deleting goal:", error);
    throw new Error(error.message);
  }
}
