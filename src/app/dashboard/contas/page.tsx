'use client';

import React, { useState, useMemo } from 'react';
import { useFinancial } from '@/lib/context/financial-context';
import { formatCurrency, formatDateBR, getTodayDateString } from '@/lib/formatters';
import { BillModal } from '@/components/modals/bill-modal';
import { ConfirmPaymentModal } from '@/components/modals/confirm-payment-modal';
import { FinancialBill } from '@/lib/types';
import { RECURRENCE_LABELS } from '@/lib/constants';
import confetti from 'canvas-confetti';
import {
  Receipt,
  Plus,
  CheckCircle2,
  Trash2,
  Utensils,
  Home,
  Car,
  Tv,
  HeartPulse,
  GraduationCap,
  ShoppingBag,
  CreditCard,
} from 'lucide-react';

export default function ContasPage() {
  const { bills, categories, deleteBill, markBillAsPaid } = useFinancial();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'paid'>('pending');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payingBillId, setPayingBillId] = useState<string | null>(null);
  const [confirmingBill, setConfirmingBill] = useState<FinancialBill | null>(null);

  const today = getTodayDateString();

  // Metrics
  const totalPayablePending = useMemo(() => {
    return bills
      .filter((b) => b.type === 'payable' && b.status === 'pending')
      .reduce((acc, b) => acc + b.amountCents, 0);
  }, [bills]);

  const totalOverdue = useMemo(() => {
    return bills
      .filter((b) => b.type === 'payable' && b.status === 'pending' && b.dueDate < today)
      .reduce((acc, b) => acc + b.amountCents, 0);
  }, [bills, today]);

  const totalReceivablePending = useMemo(() => {
    return bills
      .filter((b) => b.type === 'receivable' && b.status === 'pending')
      .reduce((acc, b) => acc + b.amountCents, 0);
  }, [bills]);

  // Tab filtering
  const filteredBills = useMemo(() => {
    return bills.filter((b) => {
      if (activeTab === 'pending') return b.status === 'pending';
      if (activeTab === 'paid') return b.status === 'paid' || b.status === 'received';
      return true;
    });
  }, [bills, activeTab]);

  const executePayment = () => {
    if (!confirmingBill) return;
    const billId = confirmingBill.id;
    setPayingBillId(billId);
    markBillAsPaid(billId);
    setConfirmingBill(null);
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {}
    setTimeout(() => setPayingBillId(null), 300);
  };

  const handleDelete = (billId: string, desc: string) => {
    if (confirm(`Remover "${desc}"?`)) {
      deleteBill(billId);
    }
  };

  const getCategoryIcon = (catId?: string) => {
    switch (catId) {
      case 'alimentacao':
        return <Utensils className="h-4 w-4" />;
      case 'moradia':
        return <Home className="h-4 w-4" />;
      case 'transporte':
        return <Car className="h-4 w-4" />;
      case 'assinaturas':
        return <Tv className="h-4 w-4" />;
      case 'saude':
        return <HeartPulse className="h-4 w-4" />;
      case 'educacao':
        return <GraduationCap className="h-4 w-4" />;
      case 'compras':
        return <ShoppingBag className="h-4 w-4" />;
      case 'contas':
        return <Receipt className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6 space-y-5 pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#5b8cff]/20 to-[#8b5cf6]/20 text-[#5b8cff] border border-[#5b8cff]/30 shadow-xs">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white font-sora">
              Contas e Boletos
            </h1>
            <span className="text-xs font-mono-tech text-[#8f8ea8]">
              {bills.length} {bills.length === 1 ? 'cadastrada' : 'cadastradas'}
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-tech-primary !py-2 !px-3.5 !text-xs"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nova Conta</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="tech-card p-2 sm:p-3.5 min-w-0">
          <span className="text-[9px] sm:text-[10px] font-mono-tech uppercase text-[#8f8ea8] block truncate">A Pagar</span>
          <div className="mt-1 text-[11px] sm:text-sm md:text-base font-bold font-mono-tech text-rose-400 whitespace-nowrap leading-tight truncate">
            {formatCurrency(totalPayablePending)}
          </div>
        </div>

        <div className="tech-card p-2 sm:p-3.5 min-w-0">
          <span className="text-[9px] sm:text-[10px] font-mono-tech uppercase text-[#8f8ea8] block truncate">Vencidas</span>
          <div className="mt-1 text-[11px] sm:text-sm md:text-base font-bold font-mono-tech text-amber-400 whitespace-nowrap leading-tight truncate">
            {formatCurrency(totalOverdue)}
          </div>
        </div>

        <div className="tech-card p-2 sm:p-3.5 min-w-0">
          <span className="text-[9px] sm:text-[10px] font-mono-tech uppercase text-[#8f8ea8] block truncate">A Receber</span>
          <div className="mt-1 text-[11px] sm:text-sm md:text-base font-bold font-mono-tech text-[#22ffb4] whitespace-nowrap leading-tight truncate">
            {formatCurrency(totalReceivablePending)}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 p-1 bg-white/5 rounded-2xl border border-white/10 w-fit">
        <button
          onClick={() => setActiveTab('pending')}
          className={`py-1 px-3 text-xs font-semibold rounded-xl transition font-mono-tech ${
            activeTab === 'pending'
              ? 'bg-[#22ffb4] text-[#04110c] shadow-xs'
              : 'text-[#8f8ea8] hover:text-white'
          }`}
        >
          Pendentes ({bills.filter((b) => b.status === 'pending').length})
        </button>
        <button
          onClick={() => setActiveTab('paid')}
          className={`py-1 px-3 text-xs font-semibold rounded-xl transition font-mono-tech ${
            activeTab === 'paid'
              ? 'bg-[#5b8cff] text-white shadow-xs'
              : 'text-[#8f8ea8] hover:text-white'
          }`}
        >
          Pagas ({bills.filter((b) => b.status === 'paid' || b.status === 'received').length})
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`py-1 px-3 text-xs font-semibold rounded-xl transition font-mono-tech ${
            activeTab === 'all'
              ? 'bg-white/10 text-white shadow-xs'
              : 'text-[#8f8ea8] hover:text-white'
          }`}
        >
          Todas ({bills.length})
        </button>
      </div>

      {/* Bills List */}
      <div className="tech-card divide-y divide-white/5 overflow-hidden">
        {filteredBills.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#8f8ea8] font-mono-tech">
            Nenhuma conta nesta listagem.
          </div>
        ) : (
          filteredBills.map((bill) => {
            const isOverdue = bill.status === 'pending' && bill.dueDate < today;
            const isPaid = bill.status === 'paid' || bill.status === 'received';
            const cat = categories.find((c) => c.id === bill.categoryId);

            return (
              <div
                key={bill.id}
                className="p-3.5 text-xs transition hover:bg-white/[0.02]"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border mt-0.5 ${
                      isPaid
                        ? 'border-[#22ffb4]/30 bg-[#22ffb4]/10 text-[#22ffb4]'
                        : isOverdue
                        ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                        : 'border-white/10 bg-white/5 text-[#8f8ea8]'
                    }`}
                  >
                    {isPaid ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      getCategoryIcon(bill.categoryId)
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    {/* Row 1: Title (left) & Amount (right) */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold text-white truncate text-xs sm:text-sm flex items-center gap-1.5 min-w-0">
                        <span className="truncate">{bill.description}</span>
                        {isOverdue && (
                          <span className="shrink-0 rounded-md border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.2 text-[9px] font-mono-tech font-bold text-amber-300">
                            Vencida
                          </span>
                        )}
                      </div>

                      <span
                        className={`font-mono-tech font-bold text-xs sm:text-sm whitespace-nowrap shrink-0 ${
                          bill.type === 'payable' ? 'text-rose-400' : 'text-[#22ffb4]'
                        }`}
                      >
                        {formatCurrency(bill.amountCents)}
                      </span>
                    </div>

                    {/* Row 2: Due date and category (left) & Actions (right) */}
                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono-tech text-[#8f8ea8] truncate min-w-0">
                        <span className="whitespace-nowrap">Venc. {formatDateBR(bill.dueDate)}</span>
                        <span>•</span>
                        <span className="truncate">{cat?.name || 'Geral'}</span>
                        <span className="hidden xs:inline">•</span>
                        <span className="hidden xs:inline truncate">
                          {RECURRENCE_LABELS[bill.recurrence] || bill.recurrence}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {!isPaid ? (
                          <button
                            type="button"
                            onClick={() => setConfirmingBill(bill)}
                            disabled={payingBillId === bill.id}
                            className="rounded-full btn-pay-action px-3.5 py-1 text-[11px] font-bold shadow-xs transition active:scale-95 disabled:opacity-60 cursor-pointer"
                          >
                            Pagar
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#22ffb4]/10 text-[#22ffb4] border border-[#22ffb4]/30 px-2.5 py-0.5 text-[10px] font-mono-tech font-bold">
                            <CheckCircle2 className="h-3 w-3" /> Pago
                          </span>
                        )}

                        <button
                          onClick={() => handleDelete(bill.id, bill.description)}
                          className="rounded-lg p-1 text-[#8f8ea8] hover:text-rose-400 hover:bg-rose-500/10 transition"
                          title="Excluir"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <BillModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <ConfirmPaymentModal
        isOpen={!!confirmingBill}
        onClose={() => setConfirmingBill(null)}
        onConfirm={executePayment}
        billDescription={confirmingBill?.description || ''}
        billAmountCents={confirmingBill?.amountCents || 0}
        billDueDate={confirmingBill?.dueDate}
        isPaying={payingBillId === confirmingBill?.id}
      />
    </div>
  );
}
