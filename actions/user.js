"use server";

import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";
import { revalidatePath } from "next/cache";
import { SUPPORTED_CURRENCIES } from "@/lib/constants";

export async function getUserCurrency() {
  try {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");
    
    const dbUser = await db.user.findUnique({ where: { id: user.id } });
    return dbUser.baseCurrency;
  } catch (error) {
    return "USD";
  }
}

export async function updateUserCurrency(currencyCode) {
  try {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");

    if (!SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode)) {
      throw new Error("Unsupported currency");
    }

    await db.user.update({
      where: { id: user.id },
      data: { baseCurrency: currencyCode },
    });

    revalidatePath("/dashboard");
    revalidatePath("/account");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
