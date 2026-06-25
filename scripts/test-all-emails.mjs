import { 
  sendContactEmail, 
  sendBudgetAlertEmail, 
  sendUnusualSpendEmail, 
  sendLowBalanceEmail, 
  sendMonthlyReportEmail, 
  sendExpenseRatioEmail 
} from './lib/email.js';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function testAllEmails() {
  // Fetch a real user from the database
  const user = await prisma.user.findFirst();
  
  if (!user || !user.email) {
    console.error("No users found in the database with an email!");
    process.exit(1);
  }

  const email = user.email;
  const name = user.name || "Test User";

  console.log(`Sending all test emails TO user: ${email} FROM: ${process.env.EMAIL_USER}`);

  // 1. Contact Form Email
  await sendContactEmail({
    name: "John Doe",
    email: "johndoe@example.com",
    message: "This is a test message from the new Contact Us form!"
  });
  console.log("✅ Contact Form Email Sent");

  // 2. Budget Alert
  await sendBudgetAlertEmail({
    to: email,
    subject: "🚨 Budget Alert: Food",
    category: "Food",
    spent: 1200.00,
    budget: 1000.00,
    percentage: 120,
    insights: "To get back on track, consider reducing your food expenses for the remainder of the month by preparing meals at home, using coupons, and cutting back on dining out, which will not only help you stay within your budget but also develop healthier financial habits. By making a few simple adjustments, you can still enjoy your favorite foods while staying mindful of your spending and setting yourself up for long-term financial success."
  });
  console.log("✅ Budget Alert Email Sent");

  // 3. Unusual Spend
  await sendUnusualSpendEmail({
    to: email,
    subject: "⚠️ Unusual Spend Detected",
    category: "Shopping",
    amount: 4500.00,
    average: 300.00,
    insights: "You should review this $4500 shopping transaction immediately to verify its legitimacy, as it significantly exceeds your average spend of $300 in this category. If you don't recognize the transaction, check for any unauthorized account access or forgotten subscription services that may be causing the unusual charge."
  });
  console.log("✅ Unusual Spend Email Sent");

  // 4. Low Balance
  await sendLowBalanceEmail({
    to: email,
    subject: "📉 Low Balance Alert: Main Checking",
    accountName: "Main Checking",
    projectedBalance: 50.00,
    threshold: 200.00,
    insights: "To avoid overdraft fees and maintain a safe balance, consider transferring funds from another account to your Main Checking account as soon as possible, as your projected balance is expected to drop below the $200 threshold within 7 days. Transferring additional funds now will help ensure your balance remains above $200 and prevent potential overdraft fees, with a current projected balance of $50."
  });
  console.log("✅ Low Balance Email Sent");

  // 5. Expense Ratio
  await sendExpenseRatioEmail({
    to: email,
    subject: "⚠️ High Expense Ratio",
    income: 54000.00,
    expense: 51810.00,
    percentage: 95.9,
    insights: "Your monthly expenses have reached 96% of your total monthly income, which is alarmingly high, so it's essential to slow down your spending to avoid financial strain. To regain control of your finances, consider reducing discretionary spending and creating a budget that allocates a more reasonable percentage of your income towards expenses."
  });
  console.log("✅ Expense Ratio Email Sent");

  // 6. Monthly Report
  await sendMonthlyReportEmail({
    to: email,
    name: "Shiva",
    monthName: "November",
    totalIncome: 72187.27,
    totalExpense: 21101.32,
    categoryBreakdown: {
      "Utilities": 365.68,
      "Transport": 4822.91,
      "Shopping": 211.71,
      "Food": 1074.83
    },
    insights: "<li>Your net balance is $51,085.95, which is a significant amount that can be allocated towards savings, investments, or debt repayment, indicating a strong financial foundation.</li><li>Your biggest spending categories are TRANSPORT ($4,822.91) and FOOD ($1,074.83), which together account for over 70% of your total expenses, suggesting that exploring cost-saving measures in these areas could have a substantial impact on your overall financial health.</li><li>Considering your substantial net balance, you may want to explore investment opportunities or retirement savings plans to make the most of your financial situation and build long-term wealth, which can help secure your financial future and achieve your goals.</li>"
  });
  console.log("✅ Monthly Report Email Sent");

  console.log("All 6 emails dispatched successfully! Check your inbox.");
}

testAllEmails();
