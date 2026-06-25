"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { PieChart } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on the AI assistant page to give it full height
  if (pathname === "/dashboard/assistant") {
    return null;
  }

  return (
    <footer className="border-t bg-gray-50 dark:bg-slate-900 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <PieChart className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">Welth</span>
            </Link>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
              An AI-powered personal finance platform that helps you track, analyze, and optimize your spending with real-time insights.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Product</h4>
            <ul className="mt-4 space-y-3 text-sm text-gray-500 dark:text-gray-400">
              <li><Link href="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link></li>
              <li><Link href="/transactions" className="hover:text-blue-600 transition-colors">Transactions</Link></li>
              <li><Link href="/accounts" className="hover:text-blue-600 transition-colors">Accounts</Link></li>
              <li><Link href="/budgets" className="hover:text-blue-600 transition-colors">Budgets</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Company</h4>
            <ul className="mt-4 space-y-3 text-sm text-gray-500 dark:text-gray-400">
              <li><Link href="#about" className="hover:text-blue-600 transition-colors">About Us</Link></li>
              <li><Link href="#careers" className="hover:text-blue-600 transition-colors">Careers</Link></li>
              <li><Link href="#press" className="hover:text-blue-600 transition-colors">Press</Link></li>
              <li><Link href="#contact" className="hover:text-blue-600 transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Legal</h4>
            <ul className="mt-4 space-y-3 text-sm text-gray-500 dark:text-gray-400">
              <li><Link href="#privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
              <li><Link href="#terms" className="hover:text-blue-600 transition-colors">Terms of Service</Link></li>
              <li><Link href="#security" className="hover:text-blue-600 transition-colors">Security</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t dark:border-slate-800 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Welth. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
