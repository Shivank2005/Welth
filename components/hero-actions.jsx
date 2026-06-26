"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function HeroActions() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return (
      <div className="flex justify-center gap-4">
        <Button asChild size="lg" className="bg-black text-white hover:bg-gray-800 px-8 rounded-md">
          <Link href="/dashboard">Go to dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex justify-center gap-4">
      <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
        <Button size="lg" className="bg-black text-white hover:bg-gray-800 px-8 rounded-md font-medium">
          Get Started
        </Button>
      </SignUpButton>
    </div>
  );
}
