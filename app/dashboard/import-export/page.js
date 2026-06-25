import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CsvManager from "@/components/csv-manager";

export default async function ImportExportPage() {
  const user = await checkUser();
  if (!user) redirect("/sign-in");

  const accounts = await db.account.findMany({
    where: { userId: user.id },
    orderBy: { isDefault: "desc" },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Import / Export</h1>
        <p className="text-muted-foreground">
          Transfer your financial data in and out of Welth using CSV files.
        </p>
      </div>
      <CsvManager accounts={accounts} />
    </div>
  );
}
