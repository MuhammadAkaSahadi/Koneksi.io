"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Calendar, CreditCard, Package, DollarSign } from "lucide-react";
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

interface TransactionDetailDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh?: () => void;
}

export function TransactionDetailDialog({
  transaction,
  open,
  onOpenChange,
  onRefresh,
}: TransactionDetailDialogProps) {
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  if (!transaction) return null;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const supabase = createClient();

      // Fetch updated transaction data
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", transaction.id)
        .single();

      if (error) throw error;

      toast.success("Status transaksi berhasil diperbarui");

      if (onRefresh) {
        onRefresh();
      }

      // Close dialog after refresh
      setTimeout(() => {
        onOpenChange(false);
      }, 1000);
    } catch (error) {
      console.error("Error refreshing transaction:", error);
      toast.error("Gagal memperbarui status transaksi");
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Success</Badge>;
      case "pending":
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Pending</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-700 border-red-200">Failed</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-700 border-slate-200">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Detail Transaksi
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Status Badge */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <span className="text-sm font-medium text-slate-600">Status</span>
            {getStatusBadge(transaction.status)}
          </div>

          {/* Transaction ID */}
          <div className="space-y-2">
            <div className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg">
              <CreditCard className="h-5 w-5 text-slate-400 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-500 mb-1">ID Transaksi</p>
                <p className="text-sm font-mono font-semibold text-slate-900 break-all">
                  {transaction.transaction_id_midtrans}
                </p>
              </div>
            </div>
          </div>

          {/* Course Name */}
          <div className="space-y-2">
            <div className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg">
              <Package className="h-5 w-5 text-slate-400 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-500 mb-1">Produk</p>
                <p className="text-sm font-semibold text-slate-900">
                  {transaction.item_name}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="space-y-2">
            <div className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg">
              <DollarSign className="h-5 w-5 text-slate-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-medium text-slate-500 mb-3">Rincian Pembayaran</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(transaction.subtotal)}
                    </span>
                  </div>
                  {transaction.voucher_amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Diskon Voucher</span>
                      <span className="font-semibold text-emerald-600">
                        -{formatCurrency(transaction.voucher_amount)}
                      </span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-200">
                    <div className="flex justify-between">
                      <span className="text-sm font-semibold text-slate-900">Total</span>
                      <span className="text-base font-bold text-[#0891b2]">
                        {formatCurrency(transaction.total_amount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Type & Date */}
          <div className="grid grid-cols-2 gap-3">
            {transaction.payment_type && (
              <div className="p-4 border border-slate-200 rounded-lg">
                <p className="text-xs font-medium text-slate-500 mb-1">Metode Pembayaran</p>
                <p className="text-sm font-semibold text-slate-900 capitalize">
                  {transaction.payment_type}
                </p>
              </div>
            )}
            <div className="p-4 border border-slate-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Tanggal</p>
                  <p className="text-xs font-medium text-slate-900">
                    {formatDate(transaction.created_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Refresh Button - Only show if status is pending */}
          {transaction.status.toLowerCase() === "pending" && (
            <div className="pt-4 border-t border-slate-200">
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="w-full bg-[#0891b2] hover:bg-[#0891b2]/90 text-white"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                {isRefreshing ? "Memperbarui..." : "Refresh Status"}
              </Button>
              <p className="text-xs text-slate-500 text-center mt-2">
                Klik tombol ini jika kamu sudah melakukan pembayaran
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
