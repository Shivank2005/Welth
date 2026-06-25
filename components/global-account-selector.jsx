"use client";

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

  const handleAccountChange = (value) => {
    if (value === "all") {
      router.push(pathname);
    } else {
      router.push(`${pathname}?account=${value}`);
    }
  };

  return (
    <Select value={currentAccountId || "all"} onValueChange={handleAccountChange}>
      <SelectTrigger className="w-[200px] shadow-sm font-medium">
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
  );
}
