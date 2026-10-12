'use client';

import React from 'react';
import { formatCurrency, formatDateBR } from '@/lib/formatters';
import { Receipt, CheckCircle2, X } from 'lucide-react';

interface ConfirmPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  billDescription: string;
  billAmountCents: number;
  billDueDate?: string;
  isPaying?: boolean;
}

export function ConfirmPaymentModal({
  isOpen,
  onClose,
  onConfirm,
  billDescription,
  billAmountCents,
  billDueDate,
  isPaying = false,
}: ConfirmPaymentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] app-modal-backdrop flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-[#121324] border border-slate-100 dark:border-slate-800/80 rounded-3xl w-full max-w-sm p-5 sm:p-6 relative my-auto max-h-[calc(100dvh-1.5rem)] space-y-5 shadow-2xl animate-in fade-in zoom-in-95 overflow-y-auto">
        {/* Top Icon & Close */}
        <div className="flex items-center justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/40">
            <Receipt className="h-5 w-5 stroke-[2.2]" />
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPaying}
            className="rounded-full p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Question & Title */}
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-sora">
            Confirmar Pagamento
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tem certeza que deseja pagar esta conta?
          </p>
        </div>

        {/* Bill Summary Card */}
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-white/5 p-4 space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
              {billDescription || 'Conta sem descrição'}
            </span>
            {billDueDate && (
              <span className="text-[10px] text-slate-500 dark:text-slate-400 shrink-0">
                Venc. {formatDateBR(billDueDate)}
              </span>
            )}
          </div>

          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-sora tracking-tight">
            {formatCurrency(billAmountCents)}
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-white/5">
            O valor será marcado como quitado e baixado do seu orçamento pendente.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={isPaying}
            className="flex-1 rounded-2xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 py-3 text-xs font-semibold transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPaying}
            className="flex-1 rounded-2xl bg-[#121324] hover:bg-[#1e2038] dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white py-3 text-xs font-semibold shadow-md transition cursor-pointer disabled:opacity-50"
          >
            {isPaying ? (
              <span className="flex items-center justify-center gap-1.5">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Liquidando...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>Sim, pagar</span>
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
