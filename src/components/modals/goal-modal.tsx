'use client';

import React, { useState } from 'react';
import { useFinancial } from '@/lib/context/financial-context';
import { parseCurrencyToCents, formatCurrencyInput } from '@/lib/formatters';
import { X, Target } from 'lucide-react';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GoalModal({ isOpen, onClose }: GoalModalProps) {
  const { addGoal } = useFinancial();
  const [title, setTitle] = useState('');
  const [targetStr, setTargetStr] = useState('');
  const [currentStr, setCurrentStr] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [category] = useState('Reserva');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const targetAmountCents = parseCurrencyToCents(targetStr);
    const currentAmountCents = parseCurrencyToCents(currentStr || '0');

    if (!title.trim()) {
      setError('Informe um título para seu objetivo financeiro.');
      return;
    }
    if (targetAmountCents <= 0) {
      setError('O valor desejado deve ser maior que zero.');
      return;
    }

    addGoal({
      title: title.trim(),
      targetAmountCents,
      currentAmountCents,
      targetDate: targetDate || undefined,
      category,
    });

    setTitle('');
    setTargetStr('');
    setCurrentStr('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] app-modal-backdrop flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-[#121324] border border-slate-100 dark:border-slate-800/80 rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-2xl relative my-auto max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400">
              <Target className="h-5 w-5" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-sora">
              Nova Meta Financeira
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-3 sm:mt-4 flex flex-col min-h-0 flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto pr-1 space-y-3.5 custom-modal-scrollbar">
            {error && (
              <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 p-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Título do Objetivo
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Reserva de Emergência, Viagem de Férias"
                autoFocus
                className="w-full h-11 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 px-3.5 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 items-start">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Valor Desejado (R$)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={targetStr}
                  onChange={(e) => setTargetStr(formatCurrencyInput(e.target.value))}
                  placeholder="0,00"
                  className="w-full h-11 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 px-3 text-xs font-bold font-sora text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Já Acumulado (R$)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={currentStr}
                  onChange={(e) => setCurrentStr(formatCurrencyInput(e.target.value))}
                  placeholder="0,00"
                  className="w-full h-11 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 px-3 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Prazo Estimado (Opcional)
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full h-11 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 px-3.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
              />
            </div>
          </div>

          <div className="pt-3.5 mt-2 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-[#121324] shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-2xl bg-[#121324] hover:bg-[#1e2038] dark:bg-violet-600 dark:hover:bg-violet-700 text-white px-5 py-2.5 text-xs font-semibold shadow-md active:scale-98 transition cursor-pointer"
            >
              Criar Objetivo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
