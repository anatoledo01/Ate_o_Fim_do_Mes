'use client';

import React, { useState, useMemo } from 'react';
import { useFinancial } from '@/lib/context/financial-context';
import { formatCurrency, formatDateBR, getTodayDateString } from '@/lib/formatters';
import { BillModal } from '@/components/modals/bill-modal';
import { RECURRENCE_LABELS } from '@/lib/constants';
import {
  Receipt,
  Plus,
  CheckCircle2,
  Clock,
  Trash2,
  AlertCircle,
} from 'lucide-react';

export default function ContasPage() {
  const { bills, categories, deleteBill, markBillAsPaid } = useFinancial();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'paid'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handlePay = (billId: string, _desc?: string) => {
    markBillAsPaid(billId);
  };

  const handleDelete = (billId: string, desc: string) => {
    if (confirm(`Deseja realmente remover o compromisso "${desc}"?`)) {
      deleteBill(billId);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sora flex items-center gap-2">
            <Receipt className="h-6 w-6 text-[#5b8cff]" />
            Contas a Pagar e Receber
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Administre seus compromissos futuros. Valores pendentes são descontados do limite diário disponível.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-tech-primary"
        >
          <span className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            Novo Compromisso
          </span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="tech-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Total a Pagar (Pendentes)</span>
            <AlertCircle className="h-4 w-4 text-[#ff4fd8]" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-[#ff4fd8]">
            {formatCurrency(totalPayablePending)}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Reservado do seu planejamento</span>
        </div>

        <div className="tech-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Contas Vencidas</span>
            <Clock className="h-4 w-4 text-[#f59e0b]" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-[#f59e0b]">
            {formatCurrency(totalOverdue)}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Exigem atenção imediata</span>
        </div>

        <div className="tech-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Recebimentos Previstos</span>
            <CheckCircle2 className="h-4 w-4 text-[#22ffb4]" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-[#22ffb4]">
            {formatCurrency(totalReceivablePending)}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Entradas agendadas no ciclo</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`py-1.5 px-3.5 text-xs font-semibold rounded-lg transition font-mono ${
            activeTab === 'all'
              ? 'border border-[#5b8cff]/50 bg-[#5b8cff]/15 text-[#5b8cff]'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Todos ({bills.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`py-1.5 px-3.5 text-xs font-semibold rounded-lg transition font-mono ${
            activeTab === 'pending'
              ? 'border border-[#ff4fd8]/50 bg-[#ff4fd8]/15 text-[#ff4fd8]'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Pendentes ({bills.filter((b) => b.status === 'pending').length})
        </button>
        <button
          onClick={() => setActiveTab('paid')}
          className={`py-1.5 px-3.5 text-xs font-semibold rounded-lg transition font-mono ${
            activeTab === 'paid'
              ? 'border border-[#22ffb4]/50 bg-[#22ffb4]/15 text-[#22ffb4]'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Liquidados ({bills.filter((b) => b.status === 'paid' || b.status === 'received').length})
        </button>
      </div>

      {/* Bills List */}
      <div className="tech-card overflow-hidden">
        {filteredBills.length === 0 ? (
          <div className="py-14 text-center text-xs text-slate-400 font-mono">
            Nenhum compromisso cadastrado nesta categoria.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredBills.map((bill) => {
              const isOverdue = bill.status === 'pending' && bill.dueDate < today;
              const isPaid = bill.status === 'paid' || bill.status === 'received';
              const cat = categories.find((c) => c.id === bill.categoryId);

              return (
                <div
                  key={bill.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 transition hover:bg-white/[0.03]"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border mt-0.5 ${
                        isPaid
                          ? 'border-[#22ffb4]/30 bg-[#22ffb4]/10 text-[#22ffb4]'
                          : isOverdue
                          ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                          : 'border-white/10 bg-white/5 text-slate-400'
                      }`}
                    >
                      {isPaid ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : isOverdue ? (
                        <AlertCircle className="h-5 w-5" />
                      ) : (
                        <Clock className="h-5 w-5" />
                      )}
                    </div>

                    <div>
                      <div className="font-semibold text-xs sm:text-sm text-white flex items-center gap-2">
                        <span>{bill.description}</span>
                        {isOverdue && (
                          <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-amber-300">
                            Vencida
                          </span>
                        )}
                        {isPaid && (
                          <span className="rounded-md border border-[#22ffb4]/30 bg-[#22ffb4]/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-[#22ffb4]">
                            Liquidada
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-400">
                        <span className="font-mono">Vencimento: {formatDateBR(bill.dueDate)}</span>
                        <span>•</span>
                        <span className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-mono text-slate-300">
                          {cat?.name || 'Geral'}
                        </span>
                        <span>•</span>
                        <span className="text-slate-500 text-[10px] font-mono">
                          {RECURRENCE_LABELS[bill.recurrence] || bill.recurrence}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pl-12 sm:pl-0">
                    <div className="text-right">
                      <div
                        className={`font-bold font-mono text-xs sm:text-sm ${
                          bill.type === 'payable' ? 'text-[#ff4fd8]' : 'text-[#22ffb4]'
                        }`}
                      >
                        {formatCurrency(bill.amountCents)}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {bill.type === 'payable' ? 'A pagar' : 'A receber'}
                      </span>
                    </div>

                    {!isPaid && (
                      <button
                        onClick={() => handlePay(bill.id, bill.description)}
                        className="rounded-xl border border-[#22ffb4]/40 bg-[#22ffb4]/10 px-3.5 py-1.5 text-xs font-semibold text-[#22ffb4] hover:bg-[#22ffb4]/20 active:scale-95 transition shadow-sm font-mono"
                      >
                        Liquidar
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(bill.id, bill.description)}
                      className="rounded-lg p-1.5 text-slate-400 hover:border hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400 transition"
                      title="Excluir conta"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BillModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
