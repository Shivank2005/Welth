import { redirect } from "next/navigation";
import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/prisma";
import TransactionForm from "@/components/transaction-form";

export default async function CreateTransactionPage({ searchParams }) {
  const user = await checkUser();
  if (!user) redirect("/sign-in");

  const resolvedParams = await searchParams;
  const editId = resolvedParams?.edit;

  let initialData = null;
  if (editId) {
    const transaction = await db.transaction.findUnique({
      where: { id: editId, userId: user.id },
    });
    if (transaction) {
      initialData = {
        id: transaction.id,
        amount: transaction.amount.toString(),
        type: transaction.type,
        category: transaction.category,
        description: transaction.description || "",
        date: transaction.date.toISOString().slice(0, 10),
        accountId: transaction.accountId,
        isRecurring: transaction.isRecurring,
      };
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <TransactionForm initialData={initialData} />
    </div>
  );
}
