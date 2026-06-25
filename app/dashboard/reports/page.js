import { redirect } from "next/navigation";
import { checkUser } from "@/lib/checkUser";
import { getYearlyReportData } from "@/lib/reports-data";
import YearlyReportViewer from "@/components/yearly-report-viewer";

export default async function ReportsPage({ searchParams }) {
  const user = await checkUser();
  if (!user) {
    redirect("/sign-in");
  }

  // Parse the year from query params, default to current year
  const resolvedParams = await searchParams;
  const currentYear = new Date().getFullYear();
  let selectedYear = resolvedParams?.year ? parseInt(resolvedParams.year, 10) : currentYear;

  if (isNaN(selectedYear) || selectedYear < 2000 || selectedYear > 2100) {
    selectedYear = currentYear;
  }

  const { totalIncome, totalExpense, totalBalance, monthlyData, baseCurrency } = 
    await getYearlyReportData(user.id, selectedYear);

  return (
    <div className="container mx-auto px-4 py-8">
      <YearlyReportViewer 
        year={selectedYear}
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        totalBalance={totalBalance}
        monthlyData={monthlyData}
        baseCurrency={baseCurrency}
      />
    </div>
  );
}
