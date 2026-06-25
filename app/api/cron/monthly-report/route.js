import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { sendMonthlyReportEmail } from "@/lib/email";
import { generateMonthlyInsights } from "@/lib/gemini";

export async function GET(request) {
  try {
    // 1. Verify Vercel Cron Secret (Security)
    const authHeader = request.headers.get("authorization");
    if (
      process.env.CRON_SECRET && 
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Calculate the previous month's date range
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const startOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
    const endOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const monthName = lastMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

    // 3. Fetch all users
    const users = await db.user.findMany();
    let emailsSent = 0;

    for (const user of users) {
      if (!user.email) continue;

      // 4. Fetch all transactions for this user from the previous month
      const transactions = await db.transaction.findMany({
        where: {
          userId: user.id,
          date: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
      });

      if (transactions.length === 0) continue; // Skip if they had no activity last month

      let totalIncome = 0;
      let totalExpense = 0;
      const categoryBreakdown = {};

      transactions.forEach(tx => {
        if (tx.type === "INCOME") {
          totalIncome += tx.amount;
        } else if (tx.type === "EXPENSE") {
          totalExpense += tx.amount;
          if (!categoryBreakdown[tx.category]) {
            categoryBreakdown[tx.category] = 0;
          }
          categoryBreakdown[tx.category] += tx.amount;
        }
      });

      // 5. Generate AI Insights based on their actual spending
      const insights = await generateMonthlyInsights(totalIncome, totalExpense, categoryBreakdown);

      // 6. Send the beautifully formatted email
      await sendMonthlyReportEmail({
        to: user.email,
        name: user.name || "Welth User",
        monthName: monthName,
        totalIncome,
        totalExpense,
        categoryBreakdown,
        insights
      });

      emailsSent++;
    }

    return NextResponse.json({ success: true, message: `Dispatched ${emailsSent} monthly reports.` });
  } catch (error) {
    console.error("Cron Job Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
