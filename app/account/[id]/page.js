import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/format";
import { getPaginatedTransactions } from "@/actions/transaction";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import TransactionTable from "@/components/transaction-table";
import AccountChart from "@/components/account-chart";
import { ChevronLeft, ChevronRight, ArrowLeft, Wallet, Landmark, CreditCard, Plus, Lock, Unlock } from "lucide-react";

export default async function AccountDetailsPage({ params, searchParams }) {
  const user = await checkUser();
  if (!user) redirect("/sign-in");

  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const accountId = resolvedParams.id;
  const page = parseInt(resolvedSearchParams.page) || 1;
  const limit = 10;

  const account = await db.account.findUnique({
    where: { id: accountId, userId: user.id },
    include: { goals: { select: { saved: true } } },
  });

  if (!account) {
    notFound();
  }

  const { transactions, totalPages, totalCount } = await getPaginatedTransactions({
    accountId,
    page,
    limit,
  });

  const getAccountIcon = (type) => {
    switch (type) {
      case "SAVINGS":
        return <Landmark className="h-6 w-6 text-blue-500" />;
      case "CREDIT":
        return <CreditCard className="h-6 w-6 text-purple-500" />;
      case "CHECKING":
      default:
        return <Wallet className="h-6 w-6 text-emerald-500" />;
    }
  };

  const reserved = account.goals?.reduce((sum, g) => sum + g.saved, 0) || 0;
  const available = account.balance - reserved;

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <div className="flex gap-4 items-end justify-between pb-4 border-b border-border/40">
        <div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent pb-1">
            {account.name}
          </h1>
          <p className="text-muted-foreground text-sm capitalize">
            {account.type.toLowerCase()} Account
          </p>
        </div>
        <div className="text-right pb-2">
          <div className="text-xl sm:text-2xl font-bold flex flex-col items-end gap-1">
            <span>{formatCurrency(account.balance, account.currency)}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {totalCount} Transactions
          </p>
        </div>
      </div>

      <AccountChart 
        accountId={accountId} 
        currency={account.currency} 
        balance={account.balance}
        available={available}
        reserved={reserved}
      />

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>View and manage activity for this account.</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No transactions found for this account.
            </div>
          ) : (
            <div className="space-y-4">
              <TransactionTable transactions={transactions} />

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 py-4">
                  <Link 
                    href={`/account/${accountId}?page=${Math.max(page - 1, 1)}`}
                    className={page === 1 ? "pointer-events-none" : ""}
                  >
                    <Button variant="outline" size="icon" disabled={page === 1} className="h-9 w-9 rounded-md">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </Link>
                  <span className="text-sm font-medium">
                    Page {page} of {totalPages}
                  </span>
                  <Link 
                    href={`/account/${accountId}?page=${Math.min(page + 1, totalPages)}`}
                    className={page === totalPages ? "pointer-events-none" : ""}
                  >
                    <Button variant="outline" size="icon" disabled={page === totalPages} className="h-9 w-9 rounded-md">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
