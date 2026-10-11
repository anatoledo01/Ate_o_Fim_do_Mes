'use client';

import React, { useState } from 'react';
import { useFinancial } from '@/lib/context/financial-context';
import { getTodayDateString, parseCurrencyToCents } from '@/lib/formatters';
import { X, ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'expense' | 'income';
}

export function TransactionModal({ isOpen, onClose, defaultType = 'expense' }: TransactionModalProps) {
  const { addTransaction, categories } = useFinancial();
  const [type, setType] = useState<'expense' | 'income'>(defaultType);
  const [amountStr, setAmountStr] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('alimentacao');
  const [date, setDate] = useState(getTodayDateString());
  const [notes, setNotes] = useState('');
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
      setError('Por favor, digite uma descrição para a transação.');
      return;
    }

    addTransaction({
      type,
      amountCents,
      description: description.trim(),
      categoryId,
      date: date || getTodayDateString(),
      notes: notes.trim() || undefined,
    });

    // Reset and close
    setAmountStr('');
    setDescription('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fade-in">
      <div className="tech-card w-full max-w-md p-6 border border-white/10 bg-[#0c0d24]/95 shadow-[0_25px_80px_rgba(0,0,0,0.85)] relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#22ffb4] to-transparent opacity-60" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <div className="tech-pill mb-1 inline-flex">
              <span className="dot-chip" />
              <span className="text-[10px] font-mono tracking-wider uppercase text-[#22ffb4]">
                {type === 'expense' ? 'Fluxo de Saída' : 'Fluxo de Entrada'}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white font-sora">
              {type === 'expense' ? 'Registrar Despesa' : 'Registrar Receita'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Type toggle buttons */}
        <div className="mt-4 grid grid-cols-2 gap-2 p-1 bg-[#07081a] border border-white/5 rounded-xl">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-mono font-semibold transition ${
              type === 'expense'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowDownRight className="h-4 w-4 text-rose-400" />
            Despesa
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-mono font-semibold transition ${
              type === 'income'
                ? 'bg-[#22ffb4]/20 text-[#22ffb4] border border-[#22ffb4]/40 shadow-[0_0_15px_rgba(34,255,180,0.2)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowUpRight className="h-4 w-4 text-[#22ffb4]" />
            Receita
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {error && (
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-2.5 text-xs font-mono text-rose-300">
              {error}
            </div>
          )}

          {/* Amount input */}
          <div>
            <label className="block text-xs font-semibold font-mono text-slate-400 mb-1">
              Valor (R$)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-mono font-bold text-slate-500">
                R$
              </span>
              <input
                type="text"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="0,00"
                autoFocus
                className="w-full rounded-xl border border-white/10 bg-[#07081a] py-2.5 pl-11 pr-4 text-lg font-bold font-mono text-white placeholder:text-slate-600 focus:border-[#22ffb4] focus:outline-hidden transition"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold font-mono text-slate-400 mb-1">
              Descrição
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Almoço, Farmácia, Combustível"
              className="w-full rounded-xl border border-white/10 bg-[#07081a] py-2.5 px-3.5 text-xs text-white placeholder:text-slate-600 focus:border-[#22ffb4] focus:outline-hidden transition"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold font-mono text-slate-400 mb-1">
              Categoria
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#07081a] py-2.5 px-3.5 text-xs text-white focus:border-[#22ffb4] focus:outline-hidden transition [&>option]:bg-[#0c0d24] [&>option]:text-white"
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
            <label className="block text-xs font-semibold font-mono text-slate-400 mb-1">
              Data da Operação
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#07081a] py-2.5 px-3.5 text-xs font-mono text-white focus:border-[#22ffb4] focus:outline-hidden transition"
            />
          </div>

          {/* Notes (optional) */}
          <div>
            <label className="block text-xs font-semibold font-mono text-slate-400 mb-1">
              Observações (Opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Cartão de débito, comprovante salvo"
              className="w-full rounded-xl border border-white/10 bg-[#07081a] py-2.5 px-3.5 text-xs text-white placeholder:text-slate-600 focus:border-[#22ffb4] focus:outline-hidden transition"
            />
          </div>

          {/* Actions */}
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
              className="rounded-xl bg-[#22ffb4] px-5 py-2 text-xs font-mono font-bold text-[#05060f] transition hover:bg-[#34ffbf] hover:shadow-[0_0_20px_rgba(34,255,180,0.4)] active:scale-98"
            >
              Confirmar Registro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
