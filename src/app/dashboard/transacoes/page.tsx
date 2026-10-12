'use client';

import React, { useState, useMemo } from 'react';
import { useFinancial } from '@/lib/context/financial-context';
import { formatCurrency } from '@/lib/formatters';
import { TransactionModal } from '@/components/modals/transaction-modal';
import {
  Plus,
  Search,
  Trash2,
  ArrowUpRight,
  FileSpreadsheet,
  Utensils,
  Home,
  Car,
  Tv,
  HeartPulse,
  GraduationCap,
  ShoppingBag,
  Receipt,
  CreditCard,
} from 'lucide-react';

export default function TransacoesPage() {
  const { transactions, categories, deleteTransaction } = useFinancial();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtered transactions
  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch = tx.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || tx.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [transactions, searchTerm, typeFilter]);

  const handleDelete = (id: string, desc: string) => {
    if (confirm(`Excluir "${desc}"?`)) {
      deleteTransaction(id);
    }
  };

  const handleExportCSV = () => {
    const headers = 'ID,Data,Tipo,Descricao,Categoria,Valor_Centavos,Valor_BRL\n';
    const rows = filtered
      .map((tx) => {
        return `"${tx.id}","${tx.date}","${tx.type}","${tx.description.replace(/"/g, '""')}","${tx.categoryId}",${tx.amountCents},"${(tx.amountCents / 100).toFixed(2)}"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `transacoes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
    <div className="mx-auto max-w-xl px-4 py-5 space-y-4 pb-24">
      {/* Top Header: Title + Sliders filter + Export & Add buttons */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-sora">
            Transações
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {filtered.length} {filtered.length === 1 ? 'registro' : 'registros'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            title="Exportar CSV"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-600 dark:text-slate-300 transition cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#121324] hover:bg-[#1f2038] dark:bg-violet-600 dark:hover:bg-violet-700 text-white transition shadow-sm cursor-pointer"
            title="Nova Transação"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Pill Filters: Todas | Entradas | Saídas (Exact Screen 6 design) */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => setTypeFilter('all')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
            typeFilter === 'all'
              ? 'bg-[#121324] text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400'
          }`}
        >
          Todas
        </button>
        <button
          type="button"
          onClick={() => setTypeFilter('income')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
            typeFilter === 'income'
              ? 'bg-[#121324] text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400'
          }`}
        >
          Entradas
        </button>
        <button
          type="button"
          onClick={() => setTypeFilter('expense')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
            typeFilter === 'expense'
              ? 'bg-[#121324] text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400'
          }`}
        >
          Saídas
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar transação..."
          className="w-full h-10 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 py-2 pl-9 pr-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
        />
      </div>

      {/* Transactions List (Clean White Card matching Screen 6) */}
      <div className="bg-white dark:bg-[#121324] border border-slate-100 dark:border-slate-800/80 rounded-3xl p-3 sm:p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] divide-y divide-slate-100 dark:divide-white/5">
        {filtered.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-400">
            Nenhuma transação encontrada.
          </div>
        ) : (
          filtered.map((tx) => {
            const cat = categories.find((c) => c.id === tx.categoryId);
            return (
              <div
                key={tx.id}
                className="flex items-center justify-between py-3 px-1 text-xs gap-3 transition hover:bg-slate-50/50 dark:hover:bg-white/[0.02] rounded-xl"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${
                      tx.type === 'income'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                        : 'bg-slate-50 text-slate-700 border-slate-100 dark:bg-white/5 dark:text-slate-300 dark:border-white/5'
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
                      {tx.date.split('-').reverse().slice(0, 2).join('/')} • {cat?.name || 'Geral'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`font-bold text-xs sm:text-sm whitespace-nowrap ${
                      tx.type === 'income'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-500 dark:text-rose-400'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amountCents)}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleDelete(tx.id, tx.description)}
                    className="p-1 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                    title="Excluir"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
