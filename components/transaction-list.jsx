"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import DeleteTransactionButton from "@/components/delete-transaction-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import TransactionTable from "@/components/transaction-table";
import { Button } from "@/components/ui/button";

export default function TransactionList({ transactions }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-6">
        <div className="space-y-1.5">
          <CardTitle>Recent transactions</CardTitle>
          <CardDescription>Your latest activity</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-4">
              {transactions.length === 0
                ? "No transactions found. Add a transaction or generate demo data to get started."
                : "No transactions found for this account."}
            </p>
            {transactions.length === 0 && (
              <div className="flex gap-4">
                <Link href="/transaction/create">
                  <Button variant="outline">Add Transaction</Button>
                </Link>
                <Link href="/dashboard/settings">
                  <Button variant="secondary">Generate Demo Data</Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <TransactionTable transactions={transactions} />
        )}
      </CardContent>
    </Card>
  );
}
