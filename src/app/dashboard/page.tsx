'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { useFinancial } from '@/lib/context/financial-context';
import { formatCurrency, formatDateBR } from '@/lib/formatters';
import { TransactionModal } from '@/components/modals/transaction-modal';
import { BillModal } from '@/components/modals/bill-modal';
import { ConfirmPaymentModal } from '@/components/modals/confirm-payment-modal';
import { useTheme } from '@/lib/context/theme-context';
import { FinancialBill } from '@/lib/types';
import confetti from 'canvas-confetti';
import {
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Receipt,
  HelpCircle,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  ShoppingBag,
  Home,
  Utensils,
  Car,
  Tv,
  HeartPulse,
  GraduationCap,
  CreditCard,
  Sun,
  Moon,
  X,
  Settings,
  Briefcase,
  ShoppingCart,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const {
    overview,
    settings,
    transactions,
    bills,
    markBillAsPaid,
  } = useFinancial();

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txModalType, setTxModalType] = useState<'expense' | 'income'>('expense');
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const [hideValues, setHideValues] = useState(false);
  const [billsTab, setBillsTab] = useState<'pending' | 'paid'>('pending');

  const [payingBillId, setPayingBillId] = useState<string | null>(null);
  const [confirmingBill, setConfirmingBill] = useState<FinancialBill | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const openNewExpense = () => {
    setTxModalType('expense');
    setIsTxModalOpen(true);
  };

  const openNewIncome = () => {
    setTxModalType('income');
    setIsTxModalOpen(true);
  };

  // Bills filtered by tab (Pendentes / Pagas)
  const displayBills = bills
    .filter((b) => (billsTab === 'pending' ? b.status === 'pending' : b.status === 'paid' || b.status === 'received'))
    .slice(0, 5);

  const recentTransactions = transactions.slice(0, 6);

  const executePayment = () => {
    if (!confirmingBill) return;
    const billId = confirmingBill.id;
    const desc = confirmingBill.description;
    setPayingBillId(billId);
    try {
      markBillAsPaid(billId);
      setConfirmingBill(null);
      setSuccessToast(`Conta "${desc || 'selecionada'}" liquidada com sucesso!`);
      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {}
      setTimeout(() => setSuccessToast(null), 3500);
    } catch (e) {
      console.error('Erro ao baixar conta:', e);
    } finally {
      setTimeout(() => setPayingBillId(null), 300);
    }
  };

  // Helper for masked values
  const displayVal = (cents: number, prefix: string = '') => {
    if (hideValues) return '••••••';
    return `${prefix}${formatCurrency(cents)}`;
  };

  // Helper to map category to icon
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
    <div className="mx-auto max-w-xl px-4 py-5 space-y-4 relative pb-20">
      {/* Toast Feedback */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 rounded-2xl border border-emerald-500/40 bg-slate-900/95 px-4 py-3 text-xs font-bold text-emerald-400 shadow-xl backdrop-blur-2xl animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* 1. Header (Screen 5: Olá, Nome 👋 + subtitle + Settings Gear + Theme Toggle) */}
      <div className="flex items-start justify-between pt-1 gap-2">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-sora">
            Olá, {user?.displayName || 'Ana'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Veja quanto você pode gastar até o próximo salário.
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-600 dark:text-slate-300 transition cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-300" />
            ) : (
              <Moon className="h-4 w-4 text-slate-600" />
            )}
          </button>

          {/* Settings Gear Link */}
          <Link
            href="/dashboard/configuracoes"
            title="Configurações"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-600 dark:text-slate-300 transition"
          >
            <Settings className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* 2. Card 1: Saldo disponível agora (Screen 5: Dark Navy card with Eye toggle & Payday row) */}
      <div className="hero-navy-card rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        {/* Top row: Label + Eye toggle */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400 tracking-wide">
            Saldo disponível agora
          </span>
          <button
            type="button"
            onClick={() => setHideValues(!hideValues)}
            title={hideValues ? 'Mostrar valores' : 'Ocultar valores'}
            className="text-slate-400 hover:text-white transition p-1 cursor-pointer"
          >
            {hideValues ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {/* Big Balance Amount */}
        <div className="mt-2 mb-4">
          <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {displayVal(overview.currentBalanceCents)}
          </div>
        </div>

        {/* Payday Sub-row */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-300 min-w-0">
            <Calendar className="h-3.5 w-3.5 text-violet-400 shrink-0" />
            <span className="truncate">
              Próximo salário em {overview.daysRemaining} {overview.daysRemaining === 1 ? 'dia' : 'dias'}
            </span>
          </div>
          <span className="text-xs sm:text-sm font-bold text-white shrink-0">
            {displayVal(settings?.primaryIncomeCents || 450000)}
          </span>
        </div>
      </div>

      {/* 3. Card 2: Você pode gastar (Screen 5: Soft Lavender Card with Progress Bar) */}
      <div className="bg-[#f4f0fd] dark:bg-[#1a162b] border border-[#e9e1fa] dark:border-[#2f2750] rounded-3xl p-5 sm:p-6 shadow-xs relative">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#5a5378] dark:text-[#b4a9db]">
            Você pode gastar:
          </span>
          <button
            type="button"
            onClick={() => setShowFormulaModal(true)}
            className="text-[11px] font-semibold text-violet-700 dark:text-violet-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Como funciona?</span>
          </button>
        </div>

        {/* Amount */}
        <div className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#1a1336] dark:text-white tracking-tight">
          {displayVal(overview.suggestedDailyLimitCents)}
          <span className="text-xs font-normal text-[#7d759b] dark:text-[#a59bc8] ml-1.5">/dia</span>
        </div>

        {/* Progress Bar */}
        <div className="mt-3.5 w-full bg-[#ded6f8] dark:bg-[#2d254b] h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#7c3aed] h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(
                100,
                Math.max(
                  8,
                  overview.currentBalanceCents > 0
                    ? ((overview.currentBalanceCents - overview.pendingBillsCents) /
                        overview.currentBalanceCents) *
                        100
                    : 15
                )
              )}%`,
            }}
          />
        </div>

        {/* Bottom context label */}
        <div className="mt-2 text-xs text-[#7d759b] dark:text-[#a59bc8] font-medium flex items-center justify-between">
          <span>de {displayVal(overview.currentBalanceCents)}</span>
          {overview.isDeficit && (
            <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> Déficit projetado
            </span>
          )}
        </div>
      </div>

      {/* 4. Action Pills Row (Nova Despesa, Receita, Nova Conta) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1">
        <button
          type="button"
          onClick={openNewExpense}
          className="btn-pill-dark bg-[#121324] hover:bg-[#1e2038] text-white font-semibold text-xs py-2.5 px-2 sm:px-3 rounded-full flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="truncate">Nova Despesa</span>
        </button>

        <button
          type="button"
          onClick={openNewIncome}
          className="btn-pill-white bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-semibold text-xs py-2.5 px-2 sm:px-3 rounded-full flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition cursor-pointer"
        >
          <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />
          <span className="truncate">Receita</span>
        </button>

        <button
          type="button"
          onClick={() => setIsBillModalOpen(true)}
          className="btn-pill-white bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-semibold text-xs py-2.5 px-2 sm:px-3 rounded-full flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition cursor-pointer"
        >
          <Receipt className="h-3.5 w-3.5 text-violet-600" />
          <span className="truncate">Nova Conta</span>
        </button>
      </div>

      {/* 5. Card 3: Resumo do mês (Screen 5: Entradas, Contas fixas, Gastos variáveis) */}
      <div className="bg-white dark:bg-[#121324] border border-slate-100 dark:border-slate-800/80 rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            Resumo do mês
          </span>
          <Link
            href="/dashboard/transacoes"
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center gap-1 transition"
          >
            Ver todos <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-3.5 space-y-3">
          {/* Entradas */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                <Briefcase className="h-4 w-4" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">
                Entradas
              </span>
            </div>
            <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">
              + {displayVal(overview.plannedIncomesCents || overview.incomesInPeriodCents)}
            </span>
          </div>

          {/* Contas fixas */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-500 border border-rose-100/60 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20">
                <ShoppingCart className="h-4 w-4" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">
                Contas fixas
              </span>
            </div>
            <span className="text-xs sm:text-sm font-bold text-rose-500 dark:text-rose-400">
              - {displayVal(overview.pendingBillsCents)}
            </span>
          </div>

          {/* Gastos variáveis */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-500 border border-amber-100/60 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">
                Gastos variáveis
              </span>
            </div>
            <span className="text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400">
              {displayVal(overview.expensesInPeriodCents)}
            </span>
          </div>
        </div>
      </div>

      {/* 6. Próximos Vencimentos (With Pagar button & Confirmation Modal) */}
      <div className="bg-white dark:bg-[#121324] border border-slate-100 dark:border-slate-800/80 rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            Próximos Vencimentos
          </span>
          <Link
            href="/dashboard/contas"
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center gap-1 transition"
          >
            Ver todas <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Filter Tabs: Pendentes | Pagas */}
        <div className="mt-3 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setBillsTab('pending')}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition cursor-pointer ${
              billsTab === 'pending'
                ? 'bg-[#121324] text-white keep-white tab-pill-active dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400'
            }`}
          >
            Pendentes
          </button>
          <button
            type="button"
            onClick={() => setBillsTab('paid')}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition cursor-pointer ${
              billsTab === 'paid'
                ? 'bg-[#121324] text-white keep-white tab-pill-active dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400'
            }`}
          >
            Pagas
          </button>
        </div>

        {/* Bills list */}
        <div className="mt-3.5 space-y-2">
          {displayBills.length === 0 ? (
            <div className="text-center py-5">
              <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-500 mb-1 opacity-80" />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {billsTab === 'pending' ? 'Nenhuma conta pendente.' : 'Nenhuma conta quitada ainda.'}
              </p>
            </div>
          ) : (
            displayBills.map((bill) => (
              <div
                key={bill.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 transition hover:border-slate-200 dark:hover:border-white/10"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
                    {getCategoryIcon(bill.categoryId)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {bill.description}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      Vence em {formatDateBR(bill.dueDate)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 pl-2">
                  <span className="text-xs sm:text-sm font-bold text-rose-500 dark:text-rose-400">
                    {displayVal(bill.amountCents)}
                  </span>
                  {bill.status === 'pending' ? (
                    <button
                      type="button"
                      onClick={() => setConfirmingBill(bill)}
                      disabled={payingBillId === bill.id}
                      className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 text-[11px] font-bold shadow-xs transition active:scale-95 disabled:opacity-60 cursor-pointer"
                    >
                      Pagar
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
                      <CheckCircle2 className="h-3 w-3" /> Pago
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 7. Últimas Transações (Clean Grouped Style from Mockup Screen 6) */}
      <div className="bg-white dark:bg-[#121324] border border-slate-100 dark:border-slate-800/80 rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            Últimas Transações
          </span>
          <Link
            href="/dashboard/transacoes"
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center gap-1 transition"
          >
            Ver extrato ({transactions.length}) <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-3 divide-y divide-slate-100 dark:divide-white/5">
          {recentTransactions.length === 0 ? (
            <div className="text-center py-5 text-xs text-slate-500 dark:text-slate-400">
              Nenhuma transação lançada ainda.
            </div>
          ) : (
            recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-2.5 text-xs gap-3">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                      tx.type === 'income'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300'
                    }`}
                  >
                    {tx.type === 'income' ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      getCategoryIcon(tx.categoryId)
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-900 dark:text-white truncate text-xs sm:text-sm">
                      {tx.description}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {formatDateBR(tx.date)}
                    </div>
                  </div>
                </div>

                <div
                  className={`font-bold shrink-0 text-right whitespace-nowrap text-xs sm:text-sm ${
                    tx.type === 'income'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-500 dark:text-rose-400'
                  }`}
                >
                  {tx.type === 'income' ? '+' : '-'} {displayVal(tx.amountCents)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Formula Modal (Clean popover, only on demand) */}
      {showFormulaModal && (
        <div className="fixed inset-0 z-[100] app-modal-backdrop flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="tech-card tech-modal-card w-full max-w-sm p-5 relative my-auto max-h-[calc(100dvh-1.5rem)] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-bold font-mono-tech text-[#22ffb4]">
                CÁLCULO DO LIMITE DIÁRIO
              </span>
              <button
                type="button"
                onClick={() => setShowFormulaModal(false)}
                className="text-[#8f8ea8] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono-tech">
              <div className="flex justify-between text-[#c9c8e2]">
                <span>Saldo em conta:</span>
                <span className="font-semibold text-white">
                  {formatCurrency(overview.currentBalanceCents)}
                </span>
              </div>
              <div className="flex justify-between text-[#c9c8e2]">
                <span>(+) Entradas previstas:</span>
                <span className="font-semibold text-[#22ffb4]">
                  {formatCurrency(overview.plannedIncomesCents)}
                </span>
              </div>
              <div className="flex justify-between text-rose-400">
                <span>(-) Contas pendentes:</span>
                <span className="font-semibold">- {formatCurrency(overview.pendingBillsCents)}</span>
              </div>
              <div className="flex justify-between text-amber-300">
                <span>(-) Reserva blindada:</span>
                <span className="font-semibold">- {formatCurrency(overview.safetyReserveCents)}</span>
              </div>
              <div className="pt-2 border-t border-white/10 flex justify-between font-bold text-white">
                <span>(=) Dinheiro livre:</span>
                <span className="text-[#22ffb4]">
                  {formatCurrency(overview.availableForPlanningCents)}
                </span>
              </div>
              <div className="flex justify-between text-[#8f8ea8] pt-1">
                <span>(÷) Dias restantes:</span>
                <span>{overview.daysRemaining} dias</span>
              </div>
              <div className="pt-2 border-t border-white/10 flex justify-between font-bold text-sm text-[#22ffb4]">
                <span>(=) Limite diário:</span>
                <span>{formatCurrency(overview.suggestedDailyLimitCents)}/dia</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowFormulaModal(false)}
              className="w-full btn-tech-primary !py-2 !text-xs"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        defaultType={txModalType}
      />
      <BillModal isOpen={isBillModalOpen} onClose={() => setIsBillModalOpen(false)} />
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
