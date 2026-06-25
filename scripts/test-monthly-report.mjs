import { sendMonthlyReportEmail } from './lib/email.js';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function testMonthlyReport() {
  const user = await prisma.user.findFirst();
  if (!user || !user.email) {
    console.error("No users found in the database with an email!");
    process.exit(1);
  }

  console.log(`Sending Monthly Report test email to: ${user.email}`);

  await sendMonthlyReportEmail({
    to: user.email,
    name: user.name || "Test User",
    monthName: "November",
    totalIncome: 72187.27,
    totalExpense: 21101.32,
    categoryBreakdown: {
      "Utilities": 365.68,
      "Transport": 4822.91,
      "Shopping": 211.71,
      "Food": 1074.83
    },
    insights: "<li>Your net balance is $51,085.95, which is a significant amount that can be allocated towards savings.</li><li>Your biggest spending categories are TRANSPORT and FOOD.</li>"
  });

  console.log("✅ Monthly Report Email Sent");
}

testMonthlyReport();
