"use client";

import { useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function GlobalAccountSelector({ accounts, currentAccountId }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleAccountChange = (value) => {
    startTransition(() => {
      if (value === "all") {
        router.push(pathname);
      } else {
        router.push(`${pathname}?account=${value}`);
      }
    });
  };

  return (
    <div className="flex items-center gap-3">
      {isPending && (
        <span className="text-xs text-muted-foreground animate-pulse font-medium">
          Loading Data...
        </span>
      )}
      <Select 
        value={currentAccountId || "all"} 
        onValueChange={handleAccountChange}
        disabled={isPending}
      >
        <SelectTrigger className={`w-[200px] shadow-sm font-medium ${isPending ? "opacity-50" : ""}`}>
          <SelectValue placeholder="All Accounts" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Accounts (Global View)</SelectItem>
          {accounts.map((account) => (
            <SelectItem key={account.id} value={account.id}>
              {account.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
