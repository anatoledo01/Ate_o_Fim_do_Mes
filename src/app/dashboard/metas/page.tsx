'use client';

import React, { useState } from 'react';
import { useFinancial } from '@/lib/context/financial-context';
import { formatCurrency, formatDateBR, parseCurrencyToCents, formatCurrencyInput } from '@/lib/formatters';
import { GoalModal } from '@/components/modals/goal-modal';
import { Target, Plus, Trash2, Calendar, Shield } from 'lucide-react';

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

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="tech-pill mb-2 inline-flex">
            <span className="dot-chip" />
            <span className="text-[11px] font-mono tracking-wider uppercase text-[#c058ff]">Planejamento Estratégico</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sora flex items-center gap-2">
            <Target className="h-6 w-6 text-[#c058ff]" />
            Planejamento e Metas
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Defina metas financeiras e estabeleça limites mensais para guiar seus hábitos.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-tech-primary"
        >
          <span className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            Nova Meta
          </span>
        </button>
      </div>

      {/* Monthly Budget Ceiling Setting */}
      <div className="tech-card p-5">
        <h3 className="text-sm font-bold text-white font-sora flex items-center gap-2">
          <Shield className="h-4 w-4 text-[#5b8cff]" />
          Teto de Gastos Mensal
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Defina o valor máximo que você pretende desembolsar ao longo de um mês completo.
        </p>

        <form onSubmit={handleSaveBudgetLimit} className="mt-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold font-mono text-slate-400">
              R$
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={monthlyLimitStr}
              onChange={(e) => setMonthlyLimitStr(formatCurrencyInput(e.target.value))}
              placeholder="Ex: 4.000,00"
              className="w-full rounded-xl border border-white/10 bg-[#07081a] py-2 pl-10 pr-3 text-sm font-semibold font-mono text-white placeholder:text-slate-500 focus:border-[#5b8cff] focus:outline-hidden transition"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto rounded-xl border border-[#5b8cff]/40 bg-[#5b8cff]/15 px-4 py-2 text-xs font-semibold text-[#5b8cff] hover:bg-[#5b8cff]/25 active:scale-95 transition font-mono"
          >
            Salvar Limite
          </button>
          {savedSuccess && (
            <span className="text-xs font-semibold font-mono text-[#22ffb4] animate-fade-in">
              ✓ Limite atualizado com sucesso!
            </span>
          )}
        </form>
      </div>

      {/* Goals Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white font-sora">
          Objetivos Financeiros ({goals.length})
        </h3>

        {goals.length === 0 ? (
          <div className="tech-card p-10 text-center text-xs text-slate-400 font-mono">
            Nenhuma meta cadastrada ainda. Crie um objetivo como &quot;Reserva de Emergência&quot; ou &quot;Viagem&quot;.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((goal) => {
              const percentage = Math.min(
                100,
                Math.round((goal.currentAmountCents / goal.targetAmountCents) * 100)
              );

              return (
                <div
                  key={goal.id}
                  className="tech-card p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-mono text-slate-300">
                        {goal.category || 'Objetivo'}
                      </span>
                      <h4 className="mt-1.5 text-sm font-bold text-white font-sora">
                        {goal.title}
                      </h4>
                    </div>

                    <button
                      onClick={() => handleDeleteGoal(goal.id, goal.title)}
                      className="rounded-lg p-1.5 text-slate-400 hover:border hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Amounts */}
                  <div className="mt-4 flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono">Acumulado</span>
                      <div className="text-base font-bold font-mono text-[#22ffb4]">
                        {formatCurrency(goal.currentAmountCents)}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-mono">Meta Desejada</span>
                      <div className="text-sm font-bold font-mono text-slate-300">
                        {formatCurrency(goal.targetAmountCents)}
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[11px] font-semibold font-mono text-slate-400 mb-1">
                      <span>Progresso</span>
                      <span className="text-[#22ffb4]">{percentage}%</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-white/5 overflow-hidden border border-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#5b8cff] to-[#22ffb4] transition-all duration-500 shadow-[0_0_12px_rgba(34,255,180,0.5)]"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  {goal.targetDate && (
                    <div className="mt-4 flex items-center gap-1.5 text-[11px] font-mono text-slate-400 border-t border-white/5 pt-3">
                      <Calendar className="h-3.5 w-3.5 text-[#5b8cff]" />
                      <span>Prazo estimado: {formatDateBR(goal.targetDate)}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <GoalModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
