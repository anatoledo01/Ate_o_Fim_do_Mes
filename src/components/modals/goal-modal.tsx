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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fade-in">
      <div className="tech-card w-full max-w-md p-6 border border-white/10 bg-[#0c0d24]/95 shadow-[0_25px_80px_rgba(0,0,0,0.85)] relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#ffd000] to-transparent opacity-60" />

        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-[#ffd000]" />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-sora">
                Nova Meta Financeira
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {error && (
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-2.5 text-xs font-mono text-rose-300">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold font-mono text-slate-300 mb-2">
              Título do Objetivo
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Reserva de Emergência, Viagem de Férias"
              autoFocus
              className="w-full h-11 rounded-xl border border-white/10 bg-[#07081a] px-3.5 text-xs text-white placeholder:text-slate-600 focus:border-[#ffd000] focus:outline-hidden transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5 items-start">
            <div>
              <label className="block text-xs font-semibold font-mono text-slate-300 mb-2">
                Valor Desejado (R$)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={targetStr}
                onChange={(e) => setTargetStr(formatCurrencyInput(e.target.value))}
                placeholder="0,00"
                className="w-full h-11 rounded-xl border border-white/10 bg-[#07081a] px-3 text-xs font-mono font-bold text-white placeholder:text-slate-600 focus:border-[#ffd000] focus:outline-hidden transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold font-mono text-slate-300 mb-2">
                Já Acumulado (R$)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={currentStr}
                onChange={(e) => setCurrentStr(formatCurrencyInput(e.target.value))}
                placeholder="0,00"
                className="w-full h-11 rounded-xl border border-white/10 bg-[#07081a] px-3 text-xs font-mono text-white placeholder:text-slate-600 focus:border-[#ffd000] focus:outline-hidden transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold font-mono text-slate-300 mb-2">
              Prazo Estimado (Opcional)
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full h-11 rounded-xl border border-white/10 bg-[#07081a] px-3.5 text-xs font-mono text-white focus:border-[#ffd000] focus:outline-hidden transition"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-mono text-slate-400 hover:text-white hover:bg-white/5 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#ffd000] px-5 py-2 text-xs font-mono font-bold text-[#05060f] transition hover:bg-[#ffe043] hover:shadow-[0_0_20px_rgba(255,208,0,0.4)] active:scale-98"
            >
              Criar Objetivo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
