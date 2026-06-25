"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Database } from "lucide-react";
import { toast } from "sonner";
import { generateDemoData } from "@/actions/seed";
import { useRouter } from "next/navigation";

export function DemoDataButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleGenerate() {
    setLoading(true);
    toast.loading("Generating demo data...", { id: "demo-data" });
    
    try {
      const res = await generateDemoData();
      if (res.success) {
        toast.success("Demo data generated successfully!", { id: "demo-data" });
        router.refresh();
      } else {
        toast.error("Failed to generate data: " + res.error, { id: "demo-data" });
      }
    } catch (error) {
      toast.error("An unexpected error occurred.", { id: "demo-data" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="gap-2 w-[140px]" 
      onClick={handleGenerate}
      disabled={loading}
    >
      <Database size={16} />
      {loading ? "Generating..." : "Generate Data"}
    </Button>
  );
}
