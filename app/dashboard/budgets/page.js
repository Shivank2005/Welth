import { getBudgetProgress } from "@/actions/budget";
import BudgetProgress from "@/components/budget-progress";
import { checkUser } from "@/lib/checkUser";
import { redirect } from "next/navigation";
import { PageTransition } from "@/components/animations";

export default async function BudgetsPage() {
  const user = await checkUser();
  if (!user) redirect("/sign-in");

  const budgets = await getBudgetProgress();

  return (
    <PageTransition className="container mx-auto space-y-8 px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Monthly Budgets</h1>
        <p className="text-muted-foreground">Manage your spending limits per category</p>
      </div>
      <BudgetProgress budgets={budgets} />
    </PageTransition>
  );
}
