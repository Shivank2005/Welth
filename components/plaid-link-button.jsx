"use client";

import { useState, useCallback, useEffect } from "react";
import { usePlaidLink } from "react-plaid-link";
import { Button } from "@/components/ui/button";
import { Loader2, Landmark } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function PlaidLinkButton({ accountId }) {
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Fetch the link token when component mounts
    const fetchToken = async () => {
      try {
        const response = await fetch("/api/plaid/create-link-token", {
          method: "POST",
        });
        const data = await response.json();
        setToken(data.link_token);
      } catch (error) {
        console.error("Error fetching Plaid link token:", error);
      }
    };
    fetchToken();
  }, []);

  const onSuccess = useCallback(async (public_token, metadata) => {
    setIsLoading(true);
    try {
      // Exchange public token
      const exchangeRes = await fetch("/api/plaid/exchange-public-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicToken: public_token,
          accountId: accountId,
        }),
      });

      if (!exchangeRes.ok) throw new Error("Failed to exchange token");

      toast.success("Bank account linked successfully!");
      
      // Immediately trigger a sync
      toast.info("Syncing your latest transactions...");
      const syncRes = await fetch("/api/plaid/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId }),
      });

      if (!syncRes.ok) throw new Error("Failed to sync transactions");
      
      const syncData = await syncRes.json();
      toast.success(`Synced ${syncData.syncedCount} new transactions!`);
      
      router.refresh();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [accountId, router]);

  const { open, ready } = usePlaidLink({
    token,
    onSuccess,
  });

  return (
    <Button 
      onClick={() => open()} 
      disabled={!ready || !token || isLoading}
      variant="outline"
      className="w-full bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 border-blue-200 text-blue-700"
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Landmark className="mr-2 h-4 w-4" />
      )}
      {isLoading ? "Connecting..." : "Connect Bank"}
    </Button>
  );
}
