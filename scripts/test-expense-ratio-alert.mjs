import { sendExpenseRatioEmail } from './lib/email.js';
import dotenv from 'dotenv';
dotenv.config();

async function testExpenseRatio() {
  console.log("Testing expense ratio email...");
  try {
    const res = await sendExpenseRatioEmail({ 
      to: process.env.EMAIL_USER, 
      subject: "Test Expense Ratio Alert", 
      insights: "Your expense ratio is higher than usual. Consider reviewing your subscriptions." 
    });
    console.log("Expense ratio email test result:", res);
  } catch (e) {
    console.error(e);
  }
}
testExpenseRatio();
