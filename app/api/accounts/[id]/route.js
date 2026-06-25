import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import {
  badRequest,
  getUserIdOrUnauthorized,
  serverError,
  unauthorized,
} from "@/lib/api";

export async function PATCH(request, { params }) {
  try {
    const userId = await getUserIdOrUnauthorized();
    if (!userId) return unauthorized();

    const { id } = await params;
    const body = await request.json();
    const { name, type, isDefault } = body;

    // Check if account exists and belongs to the user
    const existing = await db.account.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Atomic transaction for setting as default
    const updated = await db.$transaction(async (tx) => {
      if (isDefault) {
        // Unset all other accounts as default
        await tx.account.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }

      const updateData = {};
      if (name !== undefined) updateData.name = name.trim();
      if (type !== undefined) updateData.type = type;
      if (isDefault !== undefined) updateData.isDefault = isDefault;

      return await tx.account.update({
        where: { id },
        data: updateData,
      });
    });

    return NextResponse.json({ account: updated });
  } catch (error) {
    console.error("PATCH /api/accounts/[id]", error);
    return serverError();
  }
}

export async function DELETE(request, { params }) {
  try {
    const userId = await getUserIdOrUnauthorized();
    if (!userId) return unauthorized();

    const { id } = await params;

    // Check if account exists and belongs to the user
    const existing = await db.account.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    await db.$transaction(async (tx) => {
      // Delete the account (related transactions will delete via Cascade)
      await tx.account.delete({
        where: { id },
      });

      // If the deleted account was default, set another account as default if any exist
      if (existing.isDefault) {
        const nextAccount = await tx.account.findFirst({
          where: { userId },
          orderBy: { createdAt: "asc" },
        });

        if (nextAccount) {
          await tx.account.update({
            where: { id: nextAccount.id },
            data: { isDefault: true },
          });
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/accounts/[id]", error);
    return serverError();
  }
}
