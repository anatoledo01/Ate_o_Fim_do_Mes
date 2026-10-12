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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="tech-card tech-modal-card beam-card w-full max-w-sm p-6 relative space-y-5 animate-in fade-in zoom-in-95 border border-white/10 shadow-2xl">
        {/* Top Icon & Close */}
        <div className="flex items-center justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#22ffb4]/20 to-[#5b8cff]/20 text-[#22ffb4] border border-[#22ffb4]/40 shadow-[0_0_15px_rgba(34,255,180,0.3)]">
            <Receipt className="h-5 w-5 stroke-[2.2]" />
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPaying}
            className="rounded-xl p-1.5 text-[#8f8ea8] hover:text-white hover:bg-white/10 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Question & Title */}
        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-white font-sora">
            Confirmar Pagamento
          </h3>
          <p className="text-xs text-[#c9c8e2]">
            Tem certeza que deseja pagar esta conta?
          </p>
        </div>

        {/* Bill Summary Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 tech-toggle-group p-4 space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-semibold text-white truncate">
              {billDescription || 'Conta sem descrição'}
            </span>
            {billDueDate && (
              <span className="text-[10px] font-mono-tech text-[#8f8ea8] shrink-0">
                Venc. {formatDateBR(billDueDate)}
              </span>
            )}
          </div>

          <div className="text-2xl font-black font-mono-tech text-[#22ffb4] tracking-tight">
            {formatCurrency(billAmountCents)}
          </div>

          <p className="text-[11px] font-mono-tech text-[#8f8ea8] pt-1 border-t border-white/5">
            O valor será baixado e deduzido do seu planejamento diário.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={isPaying}
            className="flex-1 btn-tech-ghost !py-2.5 !text-xs"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPaying}
            className="flex-1 btn-tech-primary !py-2.5 !text-xs cursor-pointer"
          >
            {isPaying ? (
              <span className="flex items-center justify-center gap-1.5">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#04110c] border-t-transparent" />
                <span>Liquidando...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Sim, Pagar</span>
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
