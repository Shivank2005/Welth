"use client";

import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/format";
import AccountActions from "@/components/account-actions";
import PlaidLinkButton from "@/components/plaid-link-button";
import SetuLinkButton from "@/components/setu-link-button";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Landmark, Lock, Unlock } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AccountGrid({ initialAccounts }) {
  const router = useRouter();
  const [accounts, setAccounts] = useState(initialAccounts);

  // Sync with server updates
  useEffect(() => {
    setAccounts(initialAccounts);
  }, [initialAccounts]);

  async function handleDefaultToggle(accountId, newChecked) {
    // Optimistically update the UI instantly for all switches
    setAccounts((prev) =>
      prev.map((acc) => ({
        ...acc,
        isDefault: acc.id === accountId ? newChecked : newChecked ? false : acc.isDefault,
      }))
    );

    try {
      const res = await fetch(`/api/accounts/${accountId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: newChecked }),
      });

      if (!res.ok) throw new Error("Failed to set default account");

      toast.success("Default account updated", { id: "default-toggle" });
      router.refresh();
    } catch (err) {
      // Revert to original state on error
      setAccounts(initialAccounts);
      toast.error(err.message);
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {accounts.map((account) => {
        const reserved = account.goals?.reduce((sum, g) => sum + g.saved, 0) || 0;
        const available = account.balance - reserved;
        const reservedPct = account.balance > 0 ? Math.min((reserved / account.balance) * 100, 100) : 0;
        
        return (
        <Link key={account.id} href={`/account/${account.id}`}>
          <Card className="group flex flex-col cursor-pointer hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 h-full bg-white/40 dark:bg-slate-950/40 hover:bg-white/60 dark:hover:bg-slate-950/60 backdrop-blur-xl border border-white/40 dark:border-slate-800/60 hover:border-primary/20 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{account.name}</CardTitle>
            <div className="flex items-center gap-2" onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}>
              <Switch
                checked={account.isDefault}
                onCheckedChange={(checked) => handleDefaultToggle(account.id, checked)}
              />
              <AccountActions accountId={account.id} isDefault={account.isDefault} />
            </div>
          </CardHeader>
          <CardContent className="flex-1 pb-4">
            <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">{formatCurrency(account.balance)}</p>
            <p className="text-xs text-muted-foreground mt-1 capitalize font-medium">
              {account.type.toLowerCase()} Account
            </p>
            
            {reserved > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 space-y-3">
                <div className="flex justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Available</span>
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(available)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-violet-600 dark:text-violet-400">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Reserved for Goals</span>
                  </div>
                  <span className="font-semibold text-violet-700 dark:text-violet-300">{formatCurrency(reserved)}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                  <div className="bg-primary/70 h-full" style={{ width: `${100 - reservedPct}%` }} />
                  <div className="bg-violet-500 h-full" style={{ width: `${reservedPct}%` }} />
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-4">
            {account.plaidAccessToken ? (
              <div className="flex w-full items-center justify-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50/50 dark:bg-emerald-950/30 p-2 rounded-md backdrop-blur-sm border border-emerald-200/50 dark:border-emerald-800/50">
                <Landmark className="h-4 w-4" />
                Connected to Bank
              </div>
            ) : (
              <div className="w-full" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                {["USD", "EUR", "GBP"].includes(account.currency) ? (
                  <PlaidLinkButton accountId={account.id} />
                ) : account.currency === "INR" ? (
                  <SetuLinkButton accountId={account.id} />
                ) : (
                  <div className="flex w-full items-center justify-center gap-2 text-sm text-gray-500 bg-gray-50 dark:bg-gray-900 p-2 rounded-md border border-gray-200 dark:border-gray-800">
                    Bank Sync Unsupported
                  </div>
                )}
              </div>
            )}
          </CardFooter>
        </Card>
        </Link>
      )})}
    </div>
  );
}
