import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET(request) {
  try {
    // In production, verify the request comes from your cron service (e.g. Vercel Cron)
    // using a secure header or secret key. For this demo, we allow it.
    /*
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    */

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Upcoming Bill Alert (3 or 7 days)
    const upcoming3Days = new Date(today);
    upcoming3Days.setDate(today.getDate() + 3);
    
    const upcoming7Days = new Date(today);
    upcoming7Days.setDate(today.getDate() + 7);

    const upcomingBills = await db.recurringTransaction.findMany({
      where: {
        type: "EXPENSE",
        OR: [
          { nextDate: { gte: upcoming3Days, lt: new Date(upcoming3Days.getTime() + 86400000) } },
          { nextDate: { gte: upcoming7Days, lt: new Date(upcoming7Days.getTime() + 86400000) } }
        ]
      },
      include: { user: true }
    });

    for (const bill of upcomingBills) {
      const days = Math.floor((bill.nextDate - today) / (1000 * 60 * 60 * 24));
      const referenceId = `UPCOMING_BILL_${bill.id}_${bill.nextDate.toISOString().slice(0, 10)}`;
      
      const existingAlert = await db.alert.findFirst({
        where: { userId: bill.userId, type: "UPCOMING_BILL", referenceId }
      });

      if (!existingAlert) {
        // Send email (skipped for brevity, but you would use sendEmail here)
        
        await db.alert.create({
          data: {
            userId: bill.userId,
            type: "UPCOMING_BILL",
            message: `Upcoming Bill: ${bill.description || bill.category} ($${bill.amount.toFixed(2)}) is due in ${days} days.`,
            referenceId,
            status: "SENT",
          }
        });
      }
    }

    // 2. Missed Income Alert (due date passed, no transaction)
    // We check for income that was due in the past 3 days
    const past3Days = new Date(today);
    past3Days.setDate(today.getDate() - 3);

    const missedIncomes = await db.recurringTransaction.findMany({
      where: {
        type: "INCOME",
        nextDate: { gte: past3Days, lt: today }
      },
      include: { user: true }
    });

    for (const income of missedIncomes) {
      const referenceId = `MISSED_INCOME_${income.id}_${income.nextDate.toISOString().slice(0, 10)}`;
      
      const existingAlert = await db.alert.findFirst({
        where: { userId: income.userId, type: "MISSED_INCOME", referenceId }
      });

      if (!existingAlert) {
        await db.alert.create({
          data: {
            userId: income.userId,
            type: "MISSED_INCOME",
            message: `Missed Income: Expected $${income.amount.toFixed(2)} from ${income.description || income.category} on ${income.nextDate.toLocaleDateString()}.`,
            referenceId,
            status: "SENT",
          }
        });
      }
    }

    // 3. Monthly Financial Report (Runs on the 1st of the month)
    if (today.getDate() === 1) {
      const firstDayOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const monthName = firstDayOfLastMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

      const allUsers = await db.user.findMany();
      
      // Dynamic import to avoid circular dependency issues if any
      const { sendMonthlyReportEmail } = await import("@/lib/email");
      const { generateMonthlyInsights } = await import("@/lib/gemini");
      
      for (const user of allUsers) {
        // We need an email to send to
        if (!user.email) continue;
        
        // Check if we already sent it (prevent double-sends if cron triggers twice)
        const referenceId = `MONTHLY_REPORT_${user.id}_${firstDayOfLastMonth.toISOString().slice(0, 7)}`;
        const existingAlert = await db.alert.findFirst({
          where: { userId: user.id, type: "MONTHLY_REPORT", referenceId }
        });
        
        if (!existingAlert) {
          const transactions = await db.transaction.findMany({
            where: {
              userId: user.id,
              date: { gte: firstDayOfLastMonth, lt: firstDayOfThisMonth }
            }
          });
          
          let totalIncome = 0;
          let totalExpense = 0;
          const categoryBreakdown = {};
          
          for (const tx of transactions) {
            if (tx.type === "INCOME") {
              totalIncome += tx.amount;
            } else if (tx.type === "EXPENSE") {
              totalExpense += tx.amount;
              categoryBreakdown[tx.category] = (categoryBreakdown[tx.category] || 0) + tx.amount;
            }
          }
          
          if (totalIncome > 0 || totalExpense > 0) {
            const insights = await generateMonthlyInsights(totalIncome, totalExpense, categoryBreakdown);
            
            await sendMonthlyReportEmail({
              to: user.email,
              name: user.name || "User",
              monthName,
              totalIncome,
              totalExpense,
              categoryBreakdown,
              insights
            });
            
            await db.alert.create({
              data: {
                userId: user.id,
                type: "MONTHLY_REPORT",
                message: `Sent Monthly Financial Report for ${monthName}`,
                referenceId,
                status: "SENT",
              }
            });
          }
        }
      }
    }

    return NextResponse.json({ success: true, message: "Cron executed successfully." });
  } catch (error) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
