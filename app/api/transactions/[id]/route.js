import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import {
  getUserIdOrUnauthorized,
  serverError,
  unauthorized,
} from "@/lib/api";

export async function DELETE(request, { params }) {
  try {
    const userId = await getUserIdOrUnauthorized();
    if (!userId) return unauthorized();

    const { id } = await params;

    const existing = await db.transaction.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const balanceDelta =
      existing.type === "INCOME" ? -existing.amount : existing.amount;

    await db.$transaction([
      db.transaction.delete({ where: { id } }),
      db.account.update({
        where: { id: existing.accountId },
        data: { balance: { increment: balanceDelta } },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/transactions/[id]", error);
    return serverError();
  }
}

export async function PUT(request, { params }) {
  try {
    const userId = await getUserIdOrUnauthorized();
    if (!userId) return unauthorized();

    const { id } = await params;
    const body = await request.json();
    const { amount, type, category, description, date, accountId } = body;

    const existing = await db.transaction.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const parsedAmount = Number(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 });
    }

    // Calculate old balance impact
    const oldBalanceDelta = existing.type === "INCOME" ? -existing.amount : existing.amount;

    // Calculate new balance impact
    const newBalanceDelta = type === "INCOME" ? parsedAmount : -parsedAmount;

    // We also need to handle if the accountId changed, but to keep it simple, we assume same account or we update both
    const transactionDate = date ? new Date(date) : new Date();

    const transaction = await db.$transaction(async (tx) => {
      // 1. Revert old transaction from old account
      await tx.account.update({
        where: { id: existing.accountId },
        data: { balance: { increment: oldBalanceDelta } },
      });

      // 2. Update transaction
      const updated = await tx.transaction.update({
        where: { id },
        data: {
          amount: parsedAmount,
          type,
          category,
          description: description?.trim() || null,
          date: transactionDate,
          accountId,
        },
      });

      // 3. Apply new transaction to new account
      await tx.account.update({
        where: { id: accountId },
        data: { balance: { increment: newBalanceDelta } },
      });

      return updated;
    });

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error("PUT /api/transactions/[id]", error);
    return serverError();
  }
}
