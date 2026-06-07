"use client";

import { useEffect, useState } from "react";
import { X, Check, XCircle, Loader2, User, CreditCard, Hash, Calendar } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

interface Transaction {
  id: string;
  transaction_id_midtrans: string;
  user_id: string;
  item_name: string;
  subtotal: number;
  voucher_amount: number;
  total_amount: number;
  status: string;
  payment_type: string | null;
  transfer_proof_url: string | null;
  unique_code: number | null;
  created_at: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
    email: string | null;
    is_admin: boolean;
  } | null;
}

interface TransferProofModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: (transactionId: string) => Promise<void>;
  onReject?: (transactionId: string) => Promise<void>;
}

export function TransferProofModal({
  transaction,
  isOpen,
  onClose,
  onApprove,
  onReject,
}: TransferProofModalProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const supabase = createClient();

  // Load image URL when modal opens
  useEffect(() => {
    if (isOpen && transaction?.transfer_proof_url) {
      loadImageUrl(transaction.transfer_proof_url);
    } else {
      setImageUrl(null);
    }
  }, [isOpen, transaction?.transfer_proof_url]);

  // Handle ESC key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const loadImageUrl = async (path: string) => {
    setIsLoadingImage(true);
    try {
      // Get signed URL for private bucket
      const { data, error } = await supabase.storage
        .from("transfer-proofs")
        .createSignedUrl(path, 3600); // Valid for 1 hour

      if (error) {
        console.error("Error loading image:", error);
        toast.error("Gagal memuat gambar bukti transfer");
        return;
      }

      setImageUrl(data.signedUrl);
    } catch (error) {
      console.error("Error loading image:", error);
      toast.error("Gagal memuat gambar bukti transfer");
    } finally {
      setIsLoadingImage(false);
    }
  };

  const handleApprove = async () => {
    if (!transaction || !onApprove) return;

    setIsApproving(true);
    try {
      await onApprove(transaction.id);
      toast.success("Transaksi berhasil diapprove");
      onClose();
    } catch (error) {
      toast.error("Gagal approve transaksi");
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!transaction || !onReject) return;

    setIsRejecting(true);
    try {
      await onReject(transaction.id);
      toast.success("Transaksi berhasil ditolak");
      onClose();
    } catch (error) {
      toast.error("Gagal reject transaksi");
    } finally {
      setIsRejecting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (!isOpen || !transaction) return null;

  const isPending = transaction.status === "pending";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Bukti Transfer</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Transaksi #{transaction.transaction_id_midtrans}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Transaction Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <User className="w-3.5 h-3.5" />
                <span>Pembeli</span>
              </div>
              <p className="text-sm font-semibold text-slate-800">
                {transaction.profiles?.full_name || "N/A"}
              </p>
              <p className="text-xs text-slate-500">
                {transaction.profiles?.email || "N/A"}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Item</span>
              </div>
              <p className="text-sm font-semibold text-slate-800">
                {transaction.item_name}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Hash className="w-3.5 h-3.5" />
                <span>Kode Unik</span>
              </div>
              <p className="text-2xl font-bold text-primary font-mono">
                {transaction.unique_code || "-"}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Calendar className="w-3.5 h-3.5" />
                <span>Tanggal</span>
              </div>
              <p className="text-sm font-semibold text-slate-800">
                {formatDate(transaction.created_at)}
              </p>
            </div>
          </div>

          {/* Amount Breakdown */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Harga Course</span>
              <span className="font-semibold text-slate-800">
                {formatCurrency(transaction.subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Kode Unik</span>
              <span className="font-semibold text-primary">
                +{transaction.unique_code || 0}
              </span>
            </div>
            <div className="h-px bg-slate-200" />
            <div className="flex justify-between text-base">
              <span className="font-bold text-slate-800">Total Pembayaran</span>
              <span className="font-bold text-primary">
                {formatCurrency(transaction.total_amount)}
              </span>
            </div>
          </div>

          {/* Transfer Proof Image */}
          <div>
            <p className="text-sm font-semibold text-slate-800 mb-3">
              Bukti Transfer
            </p>
            <div className="relative rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
              {isLoadingImage ? (
                <div className="flex items-center justify-center h-96">
                  <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                </div>
              ) : imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Bukti Transfer"
                  className="w-full h-auto max-h-96 object-contain"
                />
              ) : (
                <div className="flex items-center justify-center h-96">
                  <p className="text-sm text-slate-500">Gambar tidak tersedia</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        {isPending && (onApprove || onReject) && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
            {onReject && (
              <button
                onClick={handleReject}
                disabled={isRejecting || isApproving}
                className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isRejecting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                Tolak
              </button>
            )}
            {onApprove && (
              <button
                onClick={handleApprove}
                disabled={isApproving || isRejecting}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isApproving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Approve
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
