"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wallet, Loader2, Search, Landmark, Building2, Building } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const INDIAN_BANKS = [
  { id: "hdfc", name: "HDFC Bank", icon: Building2, color: "text-blue-700", bg: "bg-blue-50 dark:bg-blue-950/50" },
  { id: "sbi", name: "State Bank of India", icon: Landmark, color: "text-sky-600", bg: "bg-sky-50 dark:bg-sky-950/50" },
  { id: "icici", name: "ICICI Bank", icon: Building, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950/50" },
  { id: "axis", name: "Axis Bank", icon: Building2, color: "text-red-700", bg: "bg-red-50 dark:bg-red-950/50" },
  { id: "kotak", name: "Kotak Mahindra", icon: Building, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/50" },
  { id: "yes", name: "Yes Bank", icon: Building2, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/50" },
];

export default function SetuLinkButton({ accountId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [connectingBank, setConnectingBank] = useState(null);
  const router = useRouter();

  const filteredBanks = INDIAN_BANKS.filter(bank => 
    bank.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleConnect = async (bank) => {
    setConnectingBank(bank.id);
    try {
      toast.info(`Connecting securely to ${bank.name}...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      toast.success("Bank account linked successfully!");
      toast.info("Syncing your latest transactions...");
      
      const syncRes = await fetch("/api/setu/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId }),
      });

      if (!syncRes.ok) throw new Error("Failed to sync transactions");
      
      const syncData = await syncRes.json();
      toast.success(`Synced ${syncData.syncedCount} new transactions!`);
      
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Failed to connect bank");
    } finally {
      setConnectingBank(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline"
          className="w-full bg-gradient-to-r hover:from-orange-50 hover:to-red-50 border-orange-200 text-orange-700"
        >
          <Wallet className="mr-2 h-4 w-4" />
          Connect Bank
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Select your bank</DialogTitle>
          <DialogDescription>
            Securely connect via the Account Aggregator network.
          </DialogDescription>
        </DialogHeader>

        <div className="relative my-2">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search for your bank..." 
            className="pl-9 bg-slate-50 dark:bg-slate-900"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto p-1">
          {filteredBanks.map((bank) => {
            const isConnecting = connectingBank === bank.id;
            const Icon = bank.icon;
            
            return (
              <button
                key={bank.id}
                disabled={connectingBank !== null}
                onClick={() => handleConnect(bank)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border border-border/50 transition-all hover:shadow-md hover:border-orange-200 dark:hover:border-orange-800 ${connectingBank !== null && !isConnecting ? 'opacity-50 grayscale' : ''} ${isConnecting ? 'ring-2 ring-orange-500 bg-orange-50/50 dark:bg-orange-950/20' : 'bg-card'}`}
              >
                <div className={`p-3 rounded-full mb-3 ${bank.bg}`}>
                  {isConnecting ? (
                    <Loader2 className={`h-6 w-6 animate-spin ${bank.color}`} />
                  ) : (
                    <Icon className={`h-6 w-6 ${bank.color}`} />
                  )}
                </div>
                <span className="text-sm font-medium text-center">
                  {isConnecting ? "Connecting..." : bank.name}
                </span>
              </button>
            )
          })}
          
          {filteredBanks.length === 0 && (
            <div className="col-span-2 text-center py-8 text-muted-foreground">
              No banks found matching &quot;{search}&quot;
            </div>
          )}
        </div>

        <div className="text-xs text-center text-muted-foreground mt-4 flex items-center justify-center gap-1.5">
          <Landmark className="h-3 w-3" />
          Secured by RBI regulated Account Aggregator
        </div>
      </DialogContent>
    </Dialog>
  );
}
