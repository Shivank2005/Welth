"use client";

import Link from "next/link";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { SignedIn } from "@clerk/nextjs";

export default function AiAssistantFab() {
  const pathname = usePathname();

  // Don't show the FAB if we're already on the assistant page
  if (pathname === "/dashboard/assistant") {
    return null;
  }

  return (
    <SignedIn>
      <div className="fixed bottom-6 right-6 z-50">
        <Link href="/dashboard/assistant">
          <Button 
            size="icon" 
            className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <Bot className="h-7 w-7 text-white" />
            <span className="sr-only">AI Assistant</span>
          </Button>
        </Link>
      </div>
    </SignedIn>
  );
}
