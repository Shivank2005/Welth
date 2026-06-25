"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUPPORTED_CURRENCIES } from "@/lib/constants";
import { updateUserCurrency } from "@/actions/user";

export function SettingsForm({ defaultCurrency }) {
  const router = useRouter();
  const [currency, setCurrency] = useState(defaultCurrency || "USD");

  async function handleValueChange(val) {
    setCurrency(val);
    toast.loading("Updating currency...", { id: "currency-update" });
    try {
      const res = await updateUserCurrency(val);
      if (res.success) {
        toast.success("Currency updated successfully!", { id: "currency-update" });
        router.refresh();
      } else {
        toast.error("Failed to update currency: " + res.error, { id: "currency-update" });
      }
    } catch (err) {
      toast.error("An unexpected error occurred.", { id: "currency-update" });
    }
  }

  return (
    <Select value={currency} onValueChange={handleValueChange}>
      <SelectTrigger className="w-[140px] bg-transparent border-slate-200 dark:border-slate-800 focus:ring-0 focus:ring-offset-0 focus:outline-none">
        <SelectValue placeholder="Select currency" />
      </SelectTrigger>
      <SelectContent>
        {SUPPORTED_CURRENCIES.map((c) => (
          <SelectItem key={c.code} value={c.code}>
            {c.code} ({c.symbol})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
