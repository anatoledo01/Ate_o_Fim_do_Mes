'use client';

import React, { useState } from 'react';
import { useFinancial } from '@/lib/context/financial-context';
import { parseCurrencyToCents, formatCurrencyInput } from '@/lib/formatters';
import { TransactionType } from '@/lib/types';
import { X, ArrowDownRight, ArrowUpRight, DollarSign } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: TransactionType;
}

export function TransactionModal({
  isOpen,
  onClose,
  defaultType = 'expense',
}: TransactionModalProps) {
  const { categories, addTransaction } = useFinancial();

  const [type, setType] = useState<TransactionType>(defaultType);
  const [amountStr, setAmountStr] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat-outros');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountCents = parseCurrencyToCents(amountStr);

    if (amountCents <= 0) {
      setError('Informe um valor maior que zero');
      return;
    }
    if (!description.trim()) {
      setError('Informe uma descrição');
      return;
    }

    addTransaction({
      amountCents,
      type,
      description: description.trim(),
      categoryId,
      date,
      notes: notes.trim() || undefined,
    });

    setAmountStr('');
    setDescription('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] app-modal-backdrop flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-[#121324] border border-slate-100 dark:border-slate-800/80 rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-2xl relative my-auto max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5 shrink-0">
          <div className="flex items-center gap-2">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${type === 'expense' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'}`}>
              {type === 'expense' ? <ArrowDownRight className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-sora">
              {type === 'expense' ? 'Registrar Despesa' : 'Registrar Receita'}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-3 sm:mt-4 flex flex-col min-h-0 flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto pr-1 space-y-3.5 custom-modal-scrollbar">
            {/* Type toggle buttons */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100/70 dark:bg-white/5 rounded-2xl">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition cursor-pointer ${
                  type === 'expense'
                    ? 'bg-white dark:bg-[#1f2038] text-rose-600 dark:text-rose-400 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ArrowDownRight className="h-4 w-4" />
                Despesa
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition cursor-pointer ${
                  type === 'income'
                    ? 'bg-white dark:bg-[#1f2038] text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ArrowUpRight className="h-4 w-4" />
                Receita
              </button>
            </div>

            {error && (
              <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 p-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                {error}
              </div>
            )}

            {/* Amount input */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Valor (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  R$
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={amountStr}
                  onChange={(e) => setAmountStr(formatCurrencyInput(e.target.value))}
                  placeholder="0,00"
                  autoFocus
                  className="w-full h-12 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 pl-11 pr-4 text-xl font-bold font-sora text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Descrição
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Almoço, Farmácia, Combustível"
                className="w-full h-11 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 px-3.5 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Categoria
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-11 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 px-3.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Data da Operação
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-11 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 px-3.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
              />
            </div>

            {/* Notes (optional) */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Observações (Opcional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Cartão de débito, comprovante salvo"
                className="w-full h-11 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 px-3.5 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
              />
            </div>
          </div>

          {/* Sticky Actions Footer */}
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
              Confirmar Registro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
