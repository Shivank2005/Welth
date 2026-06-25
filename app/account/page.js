import Link from "next/link";
import { redirect } from "next/navigation";
import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import AccountForm from "@/components/account-form";
import AccountActions from "@/components/account-actions";
import PlaidLinkButton from "@/components/plaid-link-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AccountGrid from "@/components/account-grid";

export default async function AccountPage() {
  const user = await checkUser();
  if (!user) redirect("/sign-in");

  const accounts = await db.account.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    include: { goals: { select: { saved: true } } },
  });

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Accounts</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage where your money is tracked</p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline">Back to dashboard</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add new account</CardTitle>
          <CardDescription>Checking, savings, or credit</CardDescription>
        </CardHeader>
        <CardContent>
          <AccountForm />
        </CardContent>
      </Card>

      <AccountGrid initialAccounts={accounts} />
    </div>
  );
}
