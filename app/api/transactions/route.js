import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import {
  badRequest,
  getUserIdOrUnauthorized,
  serverError,
  unauthorized,
} from "@/lib/api";
import { evaluateTransactionAlerts } from "@/lib/alerts";

export async function GET(request) {
  try {
    const userId = await getUserIdOrUnauthorized();
    if (!userId) return unauthorized();

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);

    const transactions = await db.transaction.findMany({
      where: { userId },
      include: { account: { select: { id: true, name: true } } },
      orderBy: { date: "desc" },
      take: limit,
    });

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("GET /api/transactions", error);
    return serverError();
  }
}

export async function POST(request) {
  try {
    const userId = await getUserIdOrUnauthorized();
    if (!userId) return unauthorized();

    const body = await request.json();
    const { amount, type, category, description, date, accountId, isRecurring, recurringInterval } = body;

    if (!amount || !type || !category || !accountId) {
      return badRequest("amount, type, category, and accountId are required");
    }

    const parsedAmount = Number(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return badRequest("Amount must be a positive number");
    }

    const account = await db.account.findFirst({
      where: { id: accountId, userId },
    });

    if (!account) {
      return badRequest("Account not found");
    }

    const transactionDate = date ? new Date(date) : new Date();
    const balanceDelta = type === "INCOME" ? parsedAmount : -parsedAmount;

    const transaction = await db.$transaction(async (tx) => {
      const created = await tx.transaction.create({
        data: {
          amount: parsedAmount,
          type,
          category,
          description: description?.trim() || null,
          date: transactionDate,
          userId,
          accountId,
          isRecurring: isRecurring || false,
        },
        include: { account: { select: { id: true, name: true } } },
      });

      await tx.account.update({
        where: { id: accountId },
        data: { balance: { increment: balanceDelta } },
      });

      return created;
    });

    if (isRecurring) {
      // Calculate next occurrence
      const nextDate = new Date(transactionDate);
      switch (recurringInterval) {
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

      await db.recurringTransaction.create({
        data: {
          amount: parsedAmount,
          type,
          category,
          description: description?.trim() || null,
          frequency: recurringInterval || "MONTHLY",
          nextDate,
          userId,
          accountId,
        },
      });
    }

    // Fire and forget alert evaluation
    evaluateTransactionAlerts(transaction);

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    console.error("POST /api/transactions", error);
    return serverError();
  }
}
