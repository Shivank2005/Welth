"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function DefaultAccountToggle({ accountId, isDefault }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  // Add local state for optimistic UI updates
  const [checked, setChecked] = useState(isDefault);

  // Sync local state if props change (e.g. from router.refresh())
  useEffect(() => {
    setChecked(isDefault);
  }, [isDefault]);

  async function handleToggle(newChecked) {
    if (loading) return;
    
    // Optimistically update UI
    setChecked(newChecked);
    setLoading(true);
    
    toast.loading("Setting default account...", { id: "default-toggle" });
    
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
      // Revert on error
      setChecked(isDefault);
      toast.error(err.message, { id: "default-toggle" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center">
      <Switch 
        id={`default-${accountId}`} 
        checked={checked} 
        onCheckedChange={handleToggle}
        disabled={loading} 
      />
    </div>
  );
}
