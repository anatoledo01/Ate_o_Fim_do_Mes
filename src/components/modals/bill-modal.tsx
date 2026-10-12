'use client';

import React, { useState } from 'react';
import { useFinancial } from '@/lib/context/financial-context';
import { getTodayDateString, parseCurrencyToCents, formatCurrencyInput } from '@/lib/formatters';
import { X, Receipt } from 'lucide-react';

interface BillModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BillModal({ isOpen, onClose }: BillModalProps) {
  const { addBill, categories } = useFinancial();
  const [type, setType] = useState<'payable' | 'receivable'>('payable');
  const [amountStr, setAmountStr] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(getTodayDateString());
  const [categoryId, setCategoryId] = useState('contas');
  const [recurrence, setRecurrence] = useState<'none' | 'monthly' | 'weekly' | 'yearly'>('monthly');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const amountCents = parseCurrencyToCents(amountStr);
    if (amountCents <= 0) {
      setError('Por favor, informe um valor válido maior que zero.');
      return;
    }
    if (!description.trim()) {
      setError('Por favor, digite o nome ou descrição da conta.');
      return;
    }

    addBill({
      type,
      amountCents,
      description: description.trim(),
      dueDate: dueDate || getTodayDateString(),
      categoryId,
      recurrence,
      status: 'pending',
    });

    setAmountStr('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-fade-in">
      <div className="tech-card tech-modal-card w-full max-w-md p-6 border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#5b8cff] to-transparent opacity-60" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-[#5b8cff]" />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-sora">
                Nova Conta ou Compromisso
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Type toggle */}
        <div className="mt-4 grid grid-cols-2 gap-2 p-1 tech-toggle-group rounded-xl border border-white/5">
          <button
            type="button"
            onClick={() => setType('payable')}
            className={`py-2 text-xs font-mono font-semibold rounded-lg transition ${
              type === 'payable'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Conta a Pagar
          </button>
          <button
            type="button"
            onClick={() => setType('receivable')}
            className={`py-2 text-xs font-mono font-semibold rounded-lg transition ${
              type === 'receivable'
                ? 'bg-[#22ffb4]/20 text-[#22ffb4] border border-[#22ffb4]/40 shadow-[0_0_15px_rgba(34,255,180,0.2)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Recebimento Previsto
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {error && (
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-2.5 text-xs font-mono text-rose-300">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold font-mono text-slate-300 mb-2">
              Valor (R$)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-mono font-bold text-slate-500">
                R$
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={amountStr}
                onChange={(e) => setAmountStr(formatCurrencyInput(e.target.value))}
                placeholder="0,00"
                autoFocus
                className="w-full h-12 rounded-xl border border-white/10 tech-input pl-11 pr-4 text-lg font-bold font-mono text-white placeholder:text-slate-500 focus:border-[#5b8cff] focus:outline-hidden transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold font-mono text-slate-300 mb-2">
              Descrição da conta
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Aluguel, Luz, Internet, Parcela do Cartão"
              className="w-full h-11 rounded-xl border border-white/10 tech-input px-3.5 text-xs text-white placeholder:text-slate-500 focus:border-[#5b8cff] focus:outline-hidden transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5 items-start">
            <div>
              <label className="block text-xs font-semibold font-mono text-slate-300 mb-2">
                Vencimento
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full h-11 rounded-xl border border-white/10 tech-input px-3 text-xs font-mono text-white focus:border-[#5b8cff] focus:outline-hidden transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold font-mono text-slate-300 mb-2">
                Recorrência
              </label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as 'none' | 'monthly' | 'weekly' | 'yearly')}
                className="w-full h-11 rounded-xl border border-white/10 tech-input px-3 text-xs text-white focus:border-[#5b8cff] focus:outline-hidden transition"
              >
                <option value="none">Apenas uma vez</option>
                <option value="monthly">Mensal</option>
                <option value="weekly">Semanal</option>
                <option value="yearly">Anual</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold font-mono text-slate-300 mb-2">
              Categoria
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full h-11 rounded-xl border border-white/10 tech-input px-3.5 text-xs text-white focus:border-[#5b8cff] focus:outline-hidden transition"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
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
              className="rounded-xl bg-[#5b8cff] px-5 py-2 text-xs font-mono font-bold text-white transition hover:bg-[#6e9aff] hover:shadow-[0_0_20px_rgba(91,140,255,0.4)] active:scale-98 cursor-pointer"
            >
              Cadastrar Compromisso
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
