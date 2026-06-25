import { getRecurringTransactions } from "@/actions/recurring";
import RecurringTransactions from "@/components/recurring-transactions";
import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PageTransition } from "@/components/animations";

export default async function RecurringPage() {
  const user = await checkUser();
  if (!user) redirect("/sign-in");

  const recurring = await getRecurringTransactions();

  // Fetch user accounts for the form dropdown
  const accounts = await db.account.findMany({
    where: { userId: user.id },
    orderBy: { isDefault: "desc" },
  });

  return (
    <PageTransition className="container mx-auto space-y-8 px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Recurring Transactions
        </h1>
        <p className="text-muted-foreground">
          Manage subscriptions, bills, and recurring income
        </p>
      </div>
      <RecurringTransactions recurring={recurring} accounts={accounts} />
    </PageTransition>
  );
}
