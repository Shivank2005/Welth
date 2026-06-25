"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { SUPPORTED_CURRENCIES } from "@/lib/constants";
import { toast } from "sonner";

export default function AccountForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    type: "CHECKING",
    balance: "0",
    currency: "USD",
    isDefault: false,
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create account");
      setForm({ name: "", type: "CHECKING", balance: "0", currency: "USD", isDefault: false });
      toast.success("Account created successfully!");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <Input
        placeholder="Account name"
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        required
        className="min-w-[160px]"
      />
      <Select
        value={form.type}
        onValueChange={(type) => setForm((f) => ({ ...f, type }))}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="CHECKING">Checking</SelectItem>
          <SelectItem value="SAVINGS">Savings</SelectItem>
          <SelectItem value="CREDIT">Credit</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={form.currency}
        onValueChange={(currency) => setForm((f) => ({ ...f, currency }))}
      >
        <SelectTrigger className="w-24">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="USD">USD ($)</SelectItem>
          <SelectItem value="EUR">EUR (€)</SelectItem>
          <SelectItem value="GBP">GBP (£)</SelectItem>
          <SelectItem value="INR">INR (₹)</SelectItem>
          <SelectItem value="CAD">CAD ($)</SelectItem>
          <SelectItem value="AUD">AUD ($)</SelectItem>
        </SelectContent>
      </Select>
      <Input
        type="number"
        step="0.01"
        placeholder="Opening balance"
        value={form.balance}
        onChange={(e) => setForm((f) => ({ ...f, balance: e.target.value }))}
        className="w-36"
      />
      <div className="flex items-center gap-2 pb-2.5">
        <Switch
          id="isDefault"
          checked={form.isDefault}
          onCheckedChange={(checked) => setForm((f) => ({ ...f, isDefault: checked }))}
        />
        <label htmlFor="isDefault" className="text-sm font-medium cursor-pointer select-none">
          Default
        </label>
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Adding..." : "Add account"}
      </Button>
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </form>
  );
}
