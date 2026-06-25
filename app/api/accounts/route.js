import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/prisma";
import {
  badRequest,
  getUserIdOrUnauthorized,
  serverError,
  unauthorized,
} from "@/lib/api";

export async function GET() {
  try {
    const userId = await getUserIdOrUnauthorized();
    if (!userId) return unauthorized();

    const accounts = await db.account.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    });

    return NextResponse.json({ accounts });
  } catch (error) {
    console.error("GET /api/accounts", error);
    return serverError();
  }
}

export async function POST(request) {
  try {
    const userId = await getUserIdOrUnauthorized();
    if (!userId) return unauthorized();

    const body = await request.json();
    const { name, type = "CHECKING", balance = 0, currency = "USD", isDefault = false } = body;

    if (!name?.trim()) {
      return badRequest("Account name is required");
    }

    const accountCount = await db.account.count({
      where: { userId },
    });

    // Make it default if it's explicitly requested or if it's the first account
    const shouldBeDefault = isDefault || accountCount === 0;

    const account = await db.$transaction(async (tx) => {
      if (shouldBeDefault) {
        // Reset all other accounts as default
        await tx.account.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }

      return await tx.account.create({
        data: {
          name: name.trim(),
          type,
          balance: Number(balance) || 0,
          currency,
          isDefault: shouldBeDefault,
          userId,
        },
      });
    });

    revalidatePath("/dashboard", "layout");
    revalidatePath("/account", "layout");

    return NextResponse.json({ account }, { status: 201 });
  } catch (error) {
    console.error("POST /api/accounts", error);
    return serverError();
  }
}
