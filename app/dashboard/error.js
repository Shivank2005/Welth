"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardError({ error }) {
  return (
    <div className="container mx-auto px-4 py-32 text-center">
      <h2 className="text-xl font-semibold text-gray-900">Could not load dashboard</h2>
      <p className="mt-2 text-gray-600">
        {error.message?.includes("connect") ||
        error.message?.includes("tenant")
          ? "Database connection failed. Check DATABASE_URL and DIRECT_URL in your .env file."
          : error.message}
      </p>
      <Link href="/" className="mt-6 inline-block">
        <Button variant="outline">Go home</Button>
      </Link>
    </div>
  );
}
