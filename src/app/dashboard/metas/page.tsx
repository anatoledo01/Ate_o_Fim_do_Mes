'use client';

import React, { useState } from 'react';
import { useFinancial } from '@/lib/context/financial-context';
import { formatCurrency, parseCurrencyToCents, formatCurrencyInput } from '@/lib/formatters';
import { GoalModal } from '@/components/modals/goal-modal';
import { Plus, Trash2, Shield, Lightbulb, Plane, Laptop, Wallet } from 'lucide-react';

export default function MetasPage() {
  const { goals, settings, updateSettings, deleteGoal } = useFinancial();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [monthlyLimitStr, setMonthlyLimitStr] = useState(
    settings?.monthlyBudgetLimitCents ? formatCurrencyInput(String(settings.monthlyBudgetLimitCents)) : ''
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveBudgetLimit = (e: React.FormEvent) => {
    e.preventDefault();
    const cents = parseCurrencyToCents(monthlyLimitStr);
    updateSettings({ monthlyBudgetLimitCents: cents });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleDeleteGoal = (id: string, title: string) => {
    if (confirm(`Deseja remover o objetivo "${title}"?`)) {
      deleteGoal(id);
    }
  };

  const getGoalIcon = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes('viag')) return <Plane className="h-5 w-5 text-indigo-500" />;
    if (lower.includes('note') || lower.includes('comp') || lower.includes('pc'))
      return <Laptop className="h-5 w-5 text-violet-500" />;
    return <Wallet className="h-5 w-5 text-teal-500" />;
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-5 space-y-4 pb-24">
      {/* Top Header: Title + Plus Button */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-sora">
            Metas
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {goals.length} {goals.length === 1 ? 'meta ativa' : 'metas ativas'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#121324] hover:bg-[#1f2038] dark:bg-violet-600 dark:hover:bg-violet-700 text-white transition shadow-sm cursor-pointer"
          title="Nova Meta"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Goals List (Clean White Cards matching Screen 7) */}
      <div className="space-y-3">
        {goals.length === 0 ? (
          <div className="bg-white dark:bg-[#121324] border border-slate-100 dark:border-slate-800/80 rounded-3xl p-8 text-center text-xs text-slate-400">
            Nenhuma meta cadastrada ainda. Clique no &quot;+&quot; para definir uma reserva ou sonho!
          </div>
        ) : (
          goals.map((goal) => {
            const percentage = Math.min(
              100,
              Math.round((goal.currentAmountCents / goal.targetAmountCents) * 100)
            );

            return (
              <div
                key={goal.id}
                className="bg-white dark:bg-[#121324] border border-slate-100 dark:border-slate-800/80 rounded-3xl p-4 sm:p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                      {getGoalIcon(goal.title)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white font-sora">
                        {goal.title}
                      </h4>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {formatCurrency(goal.currentAmountCents)}
                        </span>{' '}
                        de {formatCurrency(goal.targetAmountCents)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {percentage}%
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteGoal(goal.id, goal.title)}
                      className="p-1 text-slate-300 hover:text-rose-500 transition cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3.5 w-full bg-slate-100 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      percentage >= 70
                        ? 'bg-teal-500'
                        : percentage >= 30
                        ? 'bg-violet-600'
                        : 'bg-indigo-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Dica do dia Card (Exact Screen 7 design: Lavender background + bulb) */}
      <div className="bg-[#f4f0fd] dark:bg-[#1a162b] border border-[#e9e1fa] dark:border-[#2f2750] rounded-3xl p-5 shadow-xs flex items-start gap-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/80 dark:bg-white/10 text-violet-700 dark:text-violet-400 shadow-xs">
          <Lightbulb className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-violet-900 dark:text-violet-300">
            Dica do dia
          </div>
          <p className="text-xs text-[#5a5378] dark:text-[#b4a9db] mt-1 leading-relaxed">
            Evite compras por impulso. Poupar pequenos valores diariamente é a forma mais consistente de bater suas metas até o fim do mês.
          </p>
        </div>
      </div>

      {/* Monthly Budget Ceiling Setting (Clean Card) */}
      <div className="bg-white dark:bg-[#121324] border border-slate-100 dark:border-slate-800/80 rounded-3xl p-4 sm:p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="h-4 w-4 text-violet-600" />
            Teto de Gastos Mensal
          </h3>
          <span className="text-[10px] text-slate-400">Orçamento Geral</span>
        </div>

        <form onSubmit={handleSaveBudgetLimit} className="mt-3 flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative w-full sm:flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              R$
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={monthlyLimitStr}
              onChange={(e) => setMonthlyLimitStr(formatCurrencyInput(e.target.value))}
              placeholder="Ex: 4.000,00"
              className="w-full h-10 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 py-2 pl-10 pr-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto rounded-full bg-[#121324] dark:bg-violet-600 hover:bg-[#1f2038] text-white px-4 py-2.5 text-xs font-semibold active:scale-95 transition cursor-pointer"
          >
            Salvar
          </button>
        </form>
        {savedSuccess && (
          <span className="block mt-2 text-xs font-semibold text-emerald-600">
            ✓ Limite atualizado com sucesso!
          </span>
        )}
      </div>

      <GoalModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
