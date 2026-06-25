"use client";

import { useState, useEffect } from "react";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { LayoutDashboard, PenBox, Repeat, Bot, ArrowRightLeft, MoreHorizontal, PieChart, Landmark, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${isScrolled ? "bg-white/80 backdrop-blur-md border-b shadow-sm" : "bg-white/0 border-transparent"}`}>
      <nav className={`container mx-auto flex items-center justify-between px-4 text-foreground transition-all duration-300 ${isScrolled ? "py-2" : "py-4"}`}>
        <Link href="/" className="shrink-0">
          <Image
            src="/logo.png"
            alt="Welth logo"
            height={48}
            width={160}
            className="h-10 w-auto object-contain md:h-12"
            priority
          />
        </Link>
        <div className="flex items-center gap-2 md:gap-4">
          <SignedIn>
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="gap-2">
                <LayoutDashboard size={18} />
                <span className="hidden md:inline">Dashboard</span>
              </Button>
            </Link>
            <Link href="/account">
              <Button variant="outline" size="sm">
                <span className="hidden md:inline">Accounts</span>
                <span className="md:hidden">Accounts</span>
              </Button>
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <MoreHorizontal size={18} />
                  <span className="hidden md:inline">More</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/budgets" className="flex items-center gap-2 cursor-pointer">
                    <PieChart size={16} /> Budgets
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/recurring" className="flex items-center gap-2 cursor-pointer">
                    <Repeat size={16} /> Recurring
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/dashboard/goals" className="flex items-center gap-2 cursor-pointer">
                    <Landmark size={16} /> Goals
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/dashboard/import-export" className="flex items-center gap-2 cursor-pointer">
                    <ArrowRightLeft size={16} /> Import / Export
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/transaction/create">
              <Button size="sm" className="gap-2">
                <PenBox size={18} />
                <span className="hidden md:inline">Add Transaction</span>
              </Button>
            </Link>

            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-9 h-9 md:w-10 md:h-10",
                },
              }}
            />
            <Link href="/dashboard/settings">
              <Button variant="ghost" size="icon" className="text-slate-600 hover:text-slate-900">
                <Settings size={20} />
              </Button>
            </Link>
          </SignedIn>
          <SignedOut>
            <SignInButton forceRedirectUrl="/dashboard">
              <Button variant="outline" size="sm">
                Login
              </Button>
            </SignInButton>
          </SignedOut>
        </div>
      </nav>
    </header>
  );
};

export default Header;
