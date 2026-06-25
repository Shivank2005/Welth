import { NextResponse } from "next/server";
import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/prisma";
import { categorizeTransaction } from "@/lib/gemini";

// Mock Indian transactions
const MOCK_SETU_TRANSACTIONS = [
  { name: "UPI/Zomato/Restaurant", amount: -850 },
  { name: "UPI/Swiggy Instamart", amount: -1250 },
  { name: "NEFT/Infosys/Salary", amount: 120000 },
  { name: "UPI/Jio Recharge", amount: -749 },
  { name: "POS/D-Mart", amount: -3450 },
  { name: "UPI/Uber Rides", amount: -350 },
  { name: "IMPS/Rent Payment", amount: -25000 },
  { name: "UPI/MakeMyTrip", amount: -12500 },
  { name: "ACH/Mutual Fund SIP", amount: -15000 },
  { name: "UPI/BookMyShow", amount: -950 },
  { name: "UPI/Blinkit", amount: -650 },
  { name: "POS/Apollo Pharmacy", amount: -430 },
  { name: "Cashback Received", amount: 250 },
];

export async function POST(req) {
  try {
    const user = await checkUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { accountId } = await req.json();

    if (!accountId) {
      return NextResponse.json({ error: "Account ID is required" }, { status: 400 });
    }

    const account = await db.account.findUnique({
      where: { id: accountId },
    });

    if (!account || account.userId !== user.id) {
      return NextResponse.json({ error: "Account not found or unauthorized" }, { status: 404 });
    }

    console.log(`Generating mock Setu transactions for account ${accountId}...`);

    const savedTransactions = [];

    // Simulate adding random dates over the last 30 days
    for (let i = 0; i < MOCK_SETU_TRANSACTIONS.length; i++) {
      const txn = MOCK_SETU_TRANSACTIONS[i];
      const type = txn.amount >= 0 ? "INCOME" : "EXPENSE";
      const absoluteAmount = Math.abs(txn.amount);
      
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));

      const category = await categorizeTransaction(txn.name, type);

      const newTxn = await db.transaction.create({
        data: {
          amount: absoluteAmount,
          type,
          category,
          description: txn.name,
          date: date,
          accountId: account.id,
          userId: user.id,
        },
      });
      
      savedTransactions.push(newTxn);

      await db.account.update({
        where: { id: account.id },
        data: {
          balance: {
            increment: type === "INCOME" ? absoluteAmount : -absoluteAmount,
          },
        },
      });
    }

    return NextResponse.json({ 
      success: true, 
      syncedCount: savedTransactions.length 
    });
  } catch (error) {
    console.error("Error syncing Setu transactions:", error);
    return NextResponse.json(
      { error: "Failed to sync transactions via Setu API" },
      { status: 500 }
    );
  }
}
