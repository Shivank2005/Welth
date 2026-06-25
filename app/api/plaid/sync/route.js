import { NextResponse } from "next/server";
import { plaidClient } from "@/lib/plaid";
import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/prisma";
import { categorizeTransaction } from "@/lib/gemini";

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

    // Get the account to find the Plaid Access Token
    const account = await db.account.findUnique({
      where: { id: accountId },
    });

    if (!account || account.userId !== user.id) {
      return NextResponse.json({ error: "Account not found or unauthorized" }, { status: 404 });
    }

    if (!account.plaidAccessToken) {
      return NextResponse.json({ error: "Account is not connected to Plaid" }, { status: 400 });
    }

    // Call Plaid Transactions Sync
    // In a real app, you would store `next_cursor` in the DB to fetch only NEW transactions.
    // For simplicity, we'll fetch the initial batch (no cursor).
    let cursor = null;
    let added = [];
    let hasMore = true;

    while (hasMore) {
      const response = await plaidClient.transactionsSync({
        access_token: account.plaidAccessToken,
        cursor: cursor,
      });

      added = added.concat(response.data.added);
      cursor = response.data.next_cursor;
      hasMore = response.data.has_more;
    }

    console.log(`Fetched ${added.length} transactions from Plaid`);

    // Process and save new transactions
    const savedTransactions = [];

    for (const txn of added) {
      // Check if transaction already exists (prevent duplicates)
      const existingTxn = await db.transaction.findUnique({
        where: { plaidTransactionId: txn.transaction_id },
      });

      if (!existingTxn) {
        // Plaid amounts are positive for expenses, negative for income.
        // We need to invert this to match our system where amount is absolute and type is EXPENSE/INCOME.
        const type = txn.amount >= 0 ? "EXPENSE" : "INCOME";
        const absoluteAmount = Math.abs(txn.amount);

        // Run it through our Groq Llama 3 AI for categorization
        const category = await categorizeTransaction(txn.name, type);

        const newTxn = await db.transaction.create({
          data: {
            amount: absoluteAmount,
            type,
            category,
            description: txn.name,
            date: new Date(txn.date),
            accountId: account.id,
            userId: user.id,
            plaidTransactionId: txn.transaction_id,
          },
        });
        
        savedTransactions.push(newTxn);

        // Update account balance
        await db.account.update({
          where: { id: account.id },
          data: {
            balance: {
              increment: type === "INCOME" ? absoluteAmount : -absoluteAmount,
            },
          },
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      syncedCount: savedTransactions.length 
    });
  } catch (error) {
    console.error("Error syncing Plaid transactions:", error);
    return NextResponse.json(
      { error: "Failed to sync transactions" },
      { status: 500 }
    );
  }
}
