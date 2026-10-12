'use client';

import React, { useState } from 'react';
import { useFinancial } from '@/lib/context/financial-context';
import { parseCurrencyToCents, formatCurrencyInput } from '@/lib/formatters';
import { BillType } from '@/lib/types';
import { X, Receipt, ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface BillModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BillModal({ isOpen, onClose }: BillModalProps) {
  const { categories, addBill } = useFinancial();

  const [type, setType] = useState<BillType>('payable');
  const [amountStr, setAmountStr] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [recurrence, setRecurrence] = useState<'none' | 'monthly' | 'weekly' | 'yearly'>('monthly');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat-outros');
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
      setError('Informe uma descrição para a conta');
      return;
    }

    addBill({
      amountCents,
      type,
      description: description.trim(),
      dueDate,
      recurrence,
      categoryId,
      isPaid: false,
    });

    setAmountStr('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-[#121324] border border-slate-100 dark:border-slate-800/80 rounded-3xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400">
              <Receipt className="h-5 w-5" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-sora">
              Nova Conta ou Compromisso
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

        {/* Type toggle */}
        <div className="mt-4 grid grid-cols-2 gap-2 p-1 bg-slate-100/70 dark:bg-white/5 rounded-2xl">
          <button
            type="button"
            onClick={() => setType('payable')}
            className={`py-2.5 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              type === 'payable'
                ? 'bg-white dark:bg-[#1f2038] text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ArrowDownRight className="h-4 w-4" />
            Conta a Pagar
          </button>
          <button
            type="button"
            onClick={() => setType('receivable')}
            className={`py-2.5 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              type === 'receivable'
                ? 'bg-white dark:bg-[#1f2038] text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ArrowUpRight className="h-4 w-4" />
            Recebimento Previsto
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {error && (
            <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 p-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
              {error}
            </div>
          )}

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

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Descrição da conta
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Aluguel, Luz, Internet, Parcela do Cartão"
              className="w-full h-11 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 px-3.5 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 items-start">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Vencimento
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full h-11 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 px-3 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Recorrência
              </label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as 'none' | 'monthly' | 'weekly' | 'yearly')}
                className="w-full h-11 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 px-3 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
              >
                <option value="none">Apenas uma vez</option>
                <option value="monthly">Mensal</option>
                <option value="weekly">Semanal</option>
                <option value="yearly">Anual</option>
              </select>
            </div>
          </div>

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

          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-white/5">
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
              Cadastrar Compromisso
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
