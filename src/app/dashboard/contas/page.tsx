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
    <div className="mx-auto max-w-xl px-4 py-5 space-y-4 pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-sora">
            Contas e Boletos
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {bills.length} {bills.length === 1 ? 'cadastrada' : 'cadastradas'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#121324] hover:bg-[#1f2038] dark:bg-violet-600 dark:hover:bg-violet-700 text-white transition shadow-sm cursor-pointer"
          title="Nova Conta"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
            activeTab === 'pending'
              ? 'bg-[#121324] text-white keep-white tab-pill-active dark:bg-white dark:text-slate-900 shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400'
          }`}
        >
          Pendentes ({bills.filter((b) => b.status === 'pending').length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('paid')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
            activeTab === 'paid'
              ? 'bg-[#121324] text-white keep-white tab-pill-active dark:bg-white dark:text-slate-900 shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400'
          }`}
        >
          Pagas ({bills.filter((b) => b.status === 'paid' || b.status === 'received').length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
            activeTab === 'all'
              ? 'bg-[#121324] text-white keep-white tab-pill-active dark:bg-white dark:text-slate-900 shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400'
          }`}
        >
          Todas
        </button>
      </div>

      {/* Bills List */}
      <div className="bg-white dark:bg-[#121324] border border-slate-100 dark:border-slate-800/80 rounded-3xl p-3 sm:p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] divide-y divide-slate-100 dark:divide-white/5">
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
                className="py-3 px-1 text-xs transition hover:bg-slate-50/50 dark:hover:bg-white/[0.02] rounded-2xl"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${
                      isPaid
                        ? 'border-emerald-100 bg-emerald-50 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400'
                        : isOverdue
                        ? 'border-amber-100 bg-amber-50 text-amber-600 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400'
                        : 'border-slate-100 bg-slate-50 text-slate-700 dark:border-white/5 dark:bg-white/5 dark:text-slate-300'
                    }`}
                  >
                    {isPaid ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      getCategoryIcon(bill.categoryId)
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-0.5">
                    {/* Row 1: Title (left) & Amount (right) */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold text-slate-900 dark:text-white truncate text-xs sm:text-sm flex items-center gap-1.5 min-w-0">
                        <span className="truncate">{bill.description}</span>
                        {isOverdue && (
                          <span className="shrink-0 rounded-full bg-rose-50 text-rose-600 border border-rose-200 px-2 py-0.2 text-[9px] font-bold">
                            Vencida
                          </span>
                        )}
                      </div>

                      <span
                        className={`font-bold text-xs sm:text-sm whitespace-nowrap shrink-0 ${
                          bill.type === 'payable' ? 'text-rose-500 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {formatCurrency(bill.amountCents)}
                      </span>
                    </div>

                    {/* Row 2: Due date and category (left) & Actions (right) */}
                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 truncate min-w-0">
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
