'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { useFinancial } from '@/lib/context/financial-context';
import { formatCurrency, formatDateBR } from '@/lib/formatters';
import { calculateCategoryBreakdown } from '@/lib/financial-engine';
import { TransactionModal } from '@/components/modals/transaction-modal';
import { BillModal } from '@/components/modals/bill-modal';
import {
  Calendar,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  Receipt,
  HelpCircle,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  PieChart,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const {
    overview,
    settings,
    transactions,
    bills,
    categories,
    markBillAsPaid,
  } = useFinancial();

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txModalType, setTxModalType] = useState<'expense' | 'income'>('expense');
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);

  const openNewExpense = () => {
    setTxModalType('expense');
    setIsTxModalOpen(true);
  };

  const openNewIncome = () => {
    setTxModalType('income');
    setIsTxModalOpen(true);
  };

  const categoryBreakdown = calculateCategoryBreakdown(transactions, categories);

  // Filter pending bills due before or on payday
  const upcomingBills = bills
    .filter((b) => b.type === 'payable' && b.status === 'pending')
    .slice(0, 4);

  // Recent 5 transactions
  const recentTransactions = transactions.slice(0, 5);

  const handlePayBill = (billId: string) => {
    markBillAsPaid(billId);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      {/* 1. Header with greeting and payday status */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="tech-pill !py-1 !px-3 !text-xs mb-2">
            <span className="tech-led" />
            <span>PAINEL FINANCEIRO DIÁRIO</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Olá, {user?.displayName || 'você'}
          </h1>
          <p className="text-xs text-[#a9a8c6] font-mono-tech mt-1 flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-[#22ffb4]" />
            <span>
              Próximo salário em:{' '}
              <strong className="text-white">
                {settings?.nextPayday ? formatDateBR(settings.nextPayday) : 'A definir'}
              </strong>
              {' '}({overview.daysRemaining} {overview.daysRemaining === 1 ? 'dia' : 'dias'} restantes)
            </span>
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-3">
          <button onClick={openNewExpense} className="btn-tech-primary !py-2.5 !px-4 !text-xs">
            <Plus className="h-4 w-4" />
            Nova Despesa
          </button>
          <button onClick={openNewIncome} className="btn-tech-ghost !py-2.5 !px-4 !text-xs">
            <ArrowUpRight className="h-4 w-4 text-[#22ffb4]" />
            Receita
          </button>
          <button onClick={() => setIsBillModalOpen(true)} className="btn-tech-ghost !py-2.5 !px-4 !text-xs">
            <Receipt className="h-4 w-4 text-[#5b8cff]" />
            Nova Conta
          </button>
        </div>
      </div>

      {/* 2. Core Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card Principal */}
        <div className="tech-card beam-card p-6 sm:p-7 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="font-mono-tech text-xs uppercase tracking-wider text-[#a9a8c6]">
              Dinheiro Disponível até o Salário
            </span>
            <button
              onClick={() => setShowFormulaDetails(!showFormulaDetails)}
              className="flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[11px] font-mono-tech text-[#c9c8e2] hover:text-[#22ffb4] hover:border-[#22ffb4]/30 transition"
            >
              <HelpCircle className="h-3.5 w-3.5 text-[#22ffb4]" />
              <span>Como é calculado?</span>
            </button>
          </div>

          <div className="mt-4">
            <div
              className={`text-4xl sm:text-5xl font-black tracking-tight ${
                overview.isDeficit ? 'text-rose-400' : 'text-white'
              }`}
            >
              {formatCurrency(overview.availableForPlanningCents)}
            </div>

            {overview.isDeficit ? (
              <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-rose-950/40 border border-rose-500/30 p-3.5 text-xs text-rose-200">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                <span>
                  <strong>Aviso de Déficit Previsto:</strong> Suas contas pendentes e reserva
                  superam o saldo disponível neste ciclo. Replaneje seus compromissos.
                </span>
              </div>
            ) : (
              <p className="mt-2 text-xs text-[#c9c8e2] leading-relaxed">
                Valor livre para o dia a dia, com contas agendadas e reserva de segurança devidamente protegidas.
              </p>
            )}

            {/* Formula breakdown drawer */}
            {showFormulaDetails && (
              <div className="mt-5 rounded-2xl border border-white/10 bg-[#07081a]/90 p-4 text-xs space-y-2 animate-fade-in font-mono-tech">
                <div className="font-bold text-[#22ffb4] pb-1 border-b border-white/10 flex items-center justify-between">
                  <span>COMPOSIÇÃO DO CÁLCULO</span>
                  <span className="text-[10px] text-[#a9a8c6]">Sem dupla dedução</span>
                </div>
                <div className="flex justify-between text-[#c9c8e2]">
                  <span>(+) Saldo financeiro atual:</span>
                  <span className="font-semibold text-white">{formatCurrency(overview.currentBalanceCents)}</span>
                </div>
                <div className="flex justify-between text-[#c9c8e2]">
                  <span>(+) Entradas previstas no período:</span>
                  <span className="font-semibold text-[#22ffb4]">{formatCurrency(overview.plannedIncomesCents)}</span>
                </div>
                <div className="flex justify-between text-rose-400">
                  <span>(-) Contas pendentes até o salário:</span>
                  <span className="font-semibold">- {formatCurrency(overview.pendingBillsCents)}</span>
                </div>
                <div className="flex justify-between text-amber-300">
                  <span>(-) Reserva de segurança blindada:</span>
                  <span className="font-semibold">- {formatCurrency(overview.safetyReserveCents)}</span>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between font-bold text-white text-sm">
                  <span>(=) Dinheiro livre para gastar:</span>
                  <span className="text-[#22ffb4]">{formatCurrency(overview.availableForPlanningCents)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card Secundário */}
        <div className="tech-card p-6 sm:p-7 bg-gradient-to-br from-[#0e1026] to-[#12163b] border-[#5b8cff]/30 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="font-mono-tech text-xs uppercase tracking-wider text-[#5b8cff]">
              Limite Diário Sugerido
            </span>
            <span className="tech-pill !py-0.5 !px-2.5 !text-[10px] text-[#22ffb4]">
              {overview.daysRemaining} {overview.daysRemaining === 1 ? 'dia restante' : 'dias restantes'}
            </span>
          </div>

          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black text-[#22ffb4] tracking-tight">
                {formatCurrency(overview.suggestedDailyLimitCents)}
              </span>
              <span className="text-sm font-mono-tech text-[#c9c8e2]">/ dia</span>
            </div>

            <p className="mt-2 text-xs text-[#c9c8e2] leading-relaxed">
              {overview.isDeficit
                ? 'Limite temporariamente fixado em R$ 0,00 devido ao déficit projetado.'
                : 'Valor recomendado para gastar hoje mantendo seu equilíbrio até o próximo recebimento.'}
            </p>

            <div className="mt-5 flex items-center gap-2.5 rounded-2xl bg-white/5 border border-white/10 p-3 text-[11px] text-[#c9c8e2]">
              <Sparkles className="h-4 w-4 text-[#22ffb4] shrink-0" />
              <span>
                Orientação dinâmica calculada em tempo real com base nos lançamentos informados.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Stat Pills Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="tech-card p-4">
          <span className="font-mono-tech text-[11px] text-[#a9a8c6] uppercase">Saldo Atual</span>
          <div className="mt-1 text-lg font-bold text-white">
            {formatCurrency(overview.currentBalanceCents)}
          </div>
        </div>

        <div className="tech-card p-4">
          <span className="font-mono-tech text-[11px] text-[#a9a8c6] uppercase">Contas Pendentes</span>
          <div className="mt-1 text-lg font-bold text-rose-400">
            {formatCurrency(overview.pendingBillsCents)}
          </div>
        </div>

        <div className="tech-card p-4">
          <span className="font-mono-tech text-[11px] text-[#a9a8c6] uppercase">Gastos no Ciclo</span>
          <div className="mt-1 text-lg font-bold text-[#c9c8e2]">
            {formatCurrency(overview.expensesInPeriodCents)}
          </div>
        </div>

        <div className="tech-card p-4">
          <span className="font-mono-tech text-[11px] text-[#a9a8c6] uppercase">Reserva Blindada</span>
          <div className="mt-1 text-lg font-bold text-amber-300">
            {formatCurrency(overview.safetyReserveCents)}
          </div>
        </div>
      </div>

      {/* 4. Category Breakdown & Upcoming Bills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gastos por Categoria */}
        <div className="tech-card p-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <PieChart className="h-4 w-4 text-[#22ffb4]" />
              <h3 className="text-sm font-bold text-white">Gastos por Categoria</h3>
            </div>
            <span className="text-xs font-mono-tech text-[#a9a8c6]">
              Total: {formatCurrency(overview.expensesInPeriodCents)}
            </span>
          </div>

          <div className="mt-5">
            {categoryBreakdown.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs text-[#a9a8c6]">Nenhum gasto registrado neste ciclo.</p>
                <button
                  onClick={openNewExpense}
                  className="mt-3 btn-tech-ghost !py-2 !px-4 !text-xs"
                >
                  <Plus className="h-3.5 w-3.5 text-[#22ffb4]" />
                  Lançar Primeiro Gasto
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {categoryBreakdown.map((cat) => (
                  <div key={cat.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-white">{cat.name}</span>
                      <div className="flex items-center gap-2 font-mono-tech">
                        <span className="font-bold text-[#22ffb4]">{formatCurrency(cat.totalCents)}</span>
                        <span className="text-[10px] text-[#a9a8c6]">({cat.percentage}%)</span>
                      </div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[#22ffb4] to-[#5b8cff]"
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Próximos Vencimentos de Contas */}
        <div className="tech-card p-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-rose-400" />
              <h3 className="text-sm font-bold text-white">Próximos Vencimentos</h3>
            </div>
            <Link
              href="/dashboard/contas"
              className="text-xs font-mono-tech text-[#5b8cff] hover:text-[#22ffb4] flex items-center gap-1 transition"
            >
              Gerenciar <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-5">
            {upcomingBills.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="mx-auto h-8 w-8 text-[#22ffb4] mb-2" />
                <p className="text-xs text-[#c9c8e2]">Todas as contas do período estão em dia!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingBills.map((bill) => (
                  <div
                    key={bill.id}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3.5 text-xs transition hover:border-[#22ffb4]/30"
                  >
                    <div>
                      <div className="font-bold text-white">{bill.description}</div>
                      <div className="text-[11px] font-mono-tech text-[#a9a8c6] mt-0.5">
                        Vencimento: {formatDateBR(bill.dueDate)}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-rose-400 font-mono-tech">
                        {formatCurrency(bill.amountCents)}
                      </span>
                      <button
                        onClick={() => handlePayBill(bill.id)}
                        className="rounded-full bg-gradient-to-r from-[#22ffb4] to-[#5fffc8] px-3 py-1 text-[11px] font-bold text-[#04110c] shadow-[0_0_12px_rgba(34,255,180,0.3)] transition hover:scale-105 active:scale-95"
                      >
                        Pagar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Recent Transactions */}
      <div className="tech-card p-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <h3 className="text-sm font-bold text-white">Últimas Transações</h3>
          <Link
            href="/dashboard/transacoes"
            className="text-xs font-mono-tech text-[#5b8cff] hover:text-[#22ffb4] flex items-center gap-1 transition"
          >
            Ver todas ({transactions.length}) <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-5">
          {recentTransactions.length === 0 ? (
            <div className="text-center py-6 text-xs text-[#a9a8c6]">
              Nenhuma transação lançada ainda. Clique em &quot;Nova Despesa&quot; acima.
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                        tx.type === 'income'
                          ? 'bg-[#22ffb4]/10 text-[#22ffb4] border border-[#22ffb4]/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {tx.type === 'income' ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{tx.description}</div>
                      <div className="text-[10px] font-mono-tech text-[#a9a8c6]">
                        {formatDateBR(tx.date)}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`font-mono-tech font-bold ${
                      tx.type === 'income' ? 'text-[#22ffb4]' : 'text-white'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amountCents)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        defaultType={txModalType}
      />
      <BillModal isOpen={isBillModalOpen} onClose={() => setIsBillModalOpen(false)} />
    </div>
  );
}
