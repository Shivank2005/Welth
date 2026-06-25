import { checkUser } from "@/lib/checkUser";
import { getUserCurrency } from "@/actions/user";
import { SettingsForm } from "./settings-form";
import { redirect } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { DemoDataButton } from "@/components/demo-data-button";
import { Button } from "@/components/ui/button";
import { DownloadCloud, Trash2 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SettingsPage() {
  const user = await checkUser();
  if (!user) redirect("/sign-in");

  const currentCurrency = await getUserCurrency();

  return (
    <div className="w-full space-y-8 px-6 py-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2 text-left">Settings</h1>
        <p className="text-muted-foreground text-left">Manage your account preferences and data</p>
      </div>

      <div className="space-y-4">
        
        {/* Appearance Row */}
        <Card className="flex flex-row items-center justify-between p-0">
          <CardHeader className="flex-1 text-left">
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Select your preferred interface theme.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-6">
            <ThemeToggle />
          </CardContent>
        </Card>

        {/* Currency Row */}
        <Card className="flex flex-row items-center justify-between p-0">
          <CardHeader className="flex-1 text-left">
            <CardTitle>Base Currency</CardTitle>
            <CardDescription>Your default currency for dashboard conversions.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-6">
            <SettingsForm defaultCurrency={currentCurrency} />
          </CardContent>
        </Card>

        {/* Demo Data Row */}
        <Card className="flex flex-row items-center justify-between p-0">
          <CardHeader className="flex-1 text-left">
            <CardTitle>Demo Data</CardTitle>
            <CardDescription>Instantly populate your account with realistic dummy transactions for portfolio review.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-6">
            <DemoDataButton />
          </CardContent>
        </Card>

        {/* Export Data Row */}
        <Card className="flex flex-row items-center justify-between p-0">
          <CardHeader className="flex-1 text-left">
            <CardTitle>Export Data</CardTitle>
            <CardDescription>Download all your transactions and budgets.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-6">
            <Link href="/dashboard/import-export">
              <Button variant="outline" size="sm" className="gap-2 w-[140px]">
                <DownloadCloud size={16} /> Export
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Danger Zone Row */}
        <Card className="flex flex-row items-center justify-between p-0 border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10">
          <CardHeader className="flex-1 text-left">
            <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
            <CardDescription className="text-red-500/80 dark:text-red-400/80">Permanently delete your account data.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-6">
            <Button variant="destructive" size="sm" className="w-[140px]" disabled>
              Delete Data
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
