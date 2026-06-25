"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Star, Trash2 } from "lucide-react";

export default function AccountActions({ accountId, isDefault }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSetDefault() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/accounts/${accountId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      if (!res.ok) throw new Error("Failed to set default account");
      router.refresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (loading) return;
    if (!confirm("Are you sure you want to delete this account? This will permanently delete all associated transactions as well!")) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/accounts/${accountId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete account");
      router.refresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {!isDefault && (
          <>
            <DropdownMenuItem onClick={handleSetDefault} className="gap-2 cursor-pointer font-semibold text-foreground">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              Set as default
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600 gap-2 cursor-pointer font-semibold">
          <Trash2 className="h-4 w-4" />
          Delete account
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
