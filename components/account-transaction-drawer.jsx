"use client";

import { useState, useEffect } from "react";
import { formatCurrency, formatDate } from "@/lib/format";
import { getPaginatedTransactions } from "@/actions/transaction";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import TransactionTable from "@/components/transaction-table";

export default function AccountTransactionDrawer({ account, isOpen, onClose }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    if (isOpen && account) {
      setPage(1);
      fetchTransactions(1);
    }
  }, [isOpen, account]);

  const fetchTransactions = async (pageNum) => {
    setLoading(true);
    try {
      const data = await getPaginatedTransactions({ accountId: account.id, page: pageNum, limit });
      setTransactions(data.transactions);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Failed to fetch paginated transactions", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchTransactions(nextPage);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      const prevPage = page - 1;
      setPage(prevPage);
      fetchTransactions(prevPage);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle>{account?.name} Transactions</DrawerTitle>
          <DrawerDescription>View all activity for this account</DrawerDescription>
        </DrawerHeader>
        
        <div className="overflow-y-auto px-4 pb-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No transactions found for this account.
            </div>
          ) : (
            <div className="space-y-4">
              <TransactionTable transactions={transactions} />
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 py-4">
                  <Button variant="outline" size="icon" onClick={handlePrevPage} disabled={page === 1} className="h-9 w-9 rounded-md">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    Page {page} of {totalPages}
                  </span>
                  <Button variant="outline" size="icon" onClick={handleNextPage} disabled={page === totalPages} className="h-9 w-9 rounded-md">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
