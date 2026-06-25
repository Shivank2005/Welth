"use client";

import { useRouter } from "next/navigation";

import { useState, useEffect } from "react";
import { formatCurrency, formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import DeleteTransactionButton from "@/components/delete-transaction-button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Clock, MoreHorizontal, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Landmark, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const categoryColors = {
  HOUSING: "bg-yellow-500 hover:bg-yellow-600 text-white",
  FOOD: "bg-orange-500 hover:bg-orange-600 text-white",
  TRANSPORT: "bg-blue-500 hover:bg-blue-600 text-white",
  ENTERTAINMENT: "bg-purple-500 hover:bg-purple-600 text-white",
  HEALTH: "bg-red-500 hover:bg-red-600 text-white",
  EDUCATION: "bg-cyan-500 hover:bg-cyan-600 text-white",
  SHOPPING: "bg-pink-500 hover:bg-pink-600 text-white",
  UTILITIES: "bg-gray-500 hover:bg-gray-600 text-white",
  SALARY: "bg-emerald-500 hover:bg-emerald-600 text-white",
  FREELANCE: "bg-teal-500 hover:bg-teal-600 text-white",
  INVESTMENT: "bg-indigo-500 hover:bg-indigo-600 text-white",
  GIFT: "bg-fuchsia-500 hover:bg-fuchsia-600 text-white",
  OTHER: "bg-slate-500 hover:bg-slate-600 text-white",
};

export default function TransactionTable({ transactions }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [recurringFilter, setRecurringFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [sortDirection, setSortDirection] = useState("desc");

  const ITEMS_PER_PAGE = 10;

  const isTxRecurring = (tx) => {
    return tx.isRecurring || tx.description?.toLowerCase().includes("recurring") || tx.description?.includes("[Auto]");
  };

  const filteredTransactions = transactions.filter(tx => {
    if (search && !tx.description?.toLowerCase().includes(search.toLowerCase()) && !tx.category.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (typeFilter !== "ALL" && tx.type !== typeFilter) {
      return false;
    }
    
    const recurring = isTxRecurring(tx);
    
    if (recurringFilter === "RECURRING" && !recurring) {
      return false;
    }
    if (recurringFilter === "NON_RECURRING" && recurring) {
      return false;
    }
    return true;
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortDirection === "desc" ? dateB - dateA : dateA - dateB;
  });

  const totalPages = Math.ceil(sortedTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = sortedTransactions.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const toggleSort = () => {
    setSortDirection(prev => prev === "desc" ? "asc" : "desc");
  };

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search transactions..." 
            className="pl-8 bg-white dark:bg-slate-950"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={(val) => { setTypeFilter(val); setPage(1); }}>
            <SelectTrigger className="w-[130px] bg-white dark:bg-slate-950">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="INCOME">Income</SelectItem>
              <SelectItem value="EXPENSE">Expense</SelectItem>
            </SelectContent>
          </Select>

          <Select value={recurringFilter} onValueChange={(val) => { setRecurringFilter(val); setPage(1); }}>
            <SelectTrigger className="w-[150px] bg-white dark:bg-slate-950">
              <SelectValue placeholder="All Transactions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Transactions</SelectItem>
              <SelectItem value="RECURRING">Recurring Only</SelectItem>
              <SelectItem value="NON_RECURRING">Non-recurring Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border bg-white dark:bg-slate-950">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[150px]">
                <div 
                  className="flex items-center cursor-pointer hover:text-foreground select-none"
                  onClick={toggleSort}
                >
                  Date 
                  {sortDirection === "desc" ? (
                    <ChevronDown className="ml-1 h-3 w-3" />
                  ) : (
                    <ChevronUp className="ml-1 h-3 w-3" />
                  )}
                </div>
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-left">Amount</TableHead>
              <TableHead>Recurring</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No transactions found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium">{formatDate(tx.date)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-base text-foreground/90">{tx.description || "—"}</span>
                      {tx.account?.name && (
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground/80 font-medium bg-slate-100 dark:bg-slate-800/50 px-2 py-0.5 rounded-full mt-1 self-start">
                          <Landmark className="h-3 w-3" />
                          {tx.account.name}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${categoryColors[tx.category] || "bg-slate-500"} border-0 capitalize`}>
                      {tx.category.toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className={`text-left font-medium ${tx.type === "INCOME" ? "text-emerald-500" : "text-red-500"}`}>
                    {tx.type === "INCOME" ? "+" : "-"}
                    {formatCurrency(tx.amount, tx.account?.currency || "USD")}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-muted-foreground font-normal bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                      <Clock className="mr-1 h-3 w-3" />
                      {isTxRecurring(tx) ? "Recurring" : "One-time"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <DeleteTransactionButton id={tx.id} />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/transaction/create?edit=${tx.id}`)}>
                            Edit Transaction
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 py-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setPage(p => Math.max(1, p - 1))} 
            disabled={page === 1} 
            className="h-9 w-9 rounded-md"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            Page {page} of {totalPages}
          </span>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
            disabled={page === totalPages} 
            className="h-9 w-9 rounded-md"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
