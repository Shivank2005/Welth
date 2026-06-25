import GoalsClient from "@/components/goals-client";
import { getGoals } from "@/actions/goals";
import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Financial Goals | Welth",
  description: "Track and achieve your financial goals",
};

export default async function GoalsPage() {
  const user = await checkUser();
  if (!user) redirect("/sign-in");

  const goals = await getGoals();
  const accounts = await db.account.findMany({
    where: { userId: user.id },
    select: { id: true, name: true, balance: true },
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Goals</h1>
        <p className="text-muted-foreground">
          Set targets and track your progress towards financial freedom.
        </p>
      </div>
      
      <GoalsClient initialGoals={goals} accounts={accounts} />
    </div>
  );
}
