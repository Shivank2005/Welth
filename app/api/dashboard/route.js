import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/dashboard-data";
import {
  getUserIdOrUnauthorized,
  serverError,
  unauthorized,
} from "@/lib/api";

export async function GET() {
  try {
    const userId = await getUserIdOrUnauthorized();
    if (!userId) return unauthorized();

    const data = await getDashboardData(userId);

    return NextResponse.json({
      totalBalance: data.totalBalance,
      totalIncome: data.totalIncome,
      totalExpense: data.totalExpense,
      accounts: data.accounts,
      recentTransactions: data.transactions,
    });
  } catch (error) {
    console.error("GET /api/dashboard", error);
    return serverError();
  }
}
