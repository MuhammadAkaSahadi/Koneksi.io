"use client";

import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TransactionDetailDialog } from "@/components/dashboard/TransactionDetailDialog";
import { MoreVertical, Eye, RefreshCw } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

interface Transaction {
  id: string;
  transaction_id_midtrans: string;
  item_name: string;
  subtotal: number;
  voucher_amount: number;
  total_amount: number;
  status: string;
  payment_type: string | null;
  created_at: string;
}

interface TransactionsPageClientProps {
  initialTransactions: Transaction[];
}

export function TransactionsPageClient({
  initialTransactions,
}: TransactionsPageClientProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [limit, setLimit] = useState(8);

  const supabase = useMemo(() => createClient(), []);

  // Subscribe to real-time updates
  React.useEffect(() => {
    const channel = supabase
      .channel("user-transactions-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions" },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            const newTrx = payload.new as Transaction;
            setTransactions((prev) => [newTrx, ...prev]);
            toast.success("Transaksi baru ditambahkan");
          } else if (payload.eventType === "UPDATE") {
            const updatedTrx = payload.new as Transaction;
            setTransactions((prev) =>
              prev.map((trx) => (trx.id === updatedTrx.id ? updatedTrx : trx))
            );
            toast.info("Status transaksi diperbarui");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleViewDetail = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDialogOpen(true);
  };

  const handleRefresh = async () => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setTransactions(data || []);
      toast.success("Data transaksi berhasil diperbarui");
    } catch (error) {
      console.error("Error refreshing transactions:", error);
      toast.error("Gagal memperbarui data transaksi");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 font-semibold">
            Success
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200 font-semibold">
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200 font-semibold">
            Failed
          </Badge>
        );
      default:
        return (
          <Badge className="bg-slate-100 text-slate-700 border-slate-200 font-semibold">
            {status}
          </Badge>
        );
    }
  };

  const displayedTransactions = transactions.slice(0, limit);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Alert Banner */}
      <div className="bg-gradient-to-r from-amber-400 to-orange-400 rounded-xl p-4 shadow-sm">
        <p className="text-sm font-semibold text-white">
          Sudah bayar tapi status masih pending? Masuk ke detail transaksi kemudian
          klik button refresh
        </p>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="font-bold text-slate-700 text-sm">
                  ID Transaksi
                </TableHead>
                <TableHead className="font-bold text-slate-700 text-sm">
                  Course
                </TableHead>
                <TableHead className="font-bold text-slate-700 text-sm">
                  Status
                </TableHead>
                <TableHead className="font-bold text-slate-700 text-sm text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedTransactions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-12 text-slate-500"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="h-8 w-8 text-slate-300" />
                      <p className="text-sm font-medium">
                        Belum ada transaksi
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                displayedTransactions.map((transaction) => (
                  <TableRow
                    key={transaction.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <TableCell className="font-mono text-sm font-semibold text-slate-900">
                      {transaction.transaction_id_midtrans}
                    </TableCell>
                    <TableCell className="text-sm text-slate-700 max-w-md">
                      {transaction.item_name}
                    </TableCell>
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-slate-100 transition-colors">
                            <MoreVertical className="h-4 w-4 text-slate-600" />
                            <span className="sr-only">Actions</span>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleViewDetail(transaction)}
                            className="cursor-pointer"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Lihat Detail
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Limit Selector */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <label
              htmlFor="limit"
              className="text-sm font-medium text-slate-700"
            >
              Limit:
            </label>
            <select
              id="limit"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="text-sm border border-slate-300 rounded-md px-2 py-1 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0891b2] focus:border-transparent"
            >
              <option value={5}>5</option>
              <option value={8}>8</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-xs text-slate-500 ml-2">
              Menampilkan {displayedTransactions.length} dari {transactions.length} transaksi
            </span>
          </div>
        </div>
      </div>

      {/* Transaction Detail Dialog */}
      <TransactionDetailDialog
        transaction={selectedTransaction}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onRefresh={handleRefresh}
      />
    </div>
  );
}
