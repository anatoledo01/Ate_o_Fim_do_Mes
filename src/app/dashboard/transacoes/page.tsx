'use client';

import React, { useState, useMemo } from 'react';
import { useFinancial } from '@/lib/context/financial-context';
import { formatCurrency, getTodayDateString } from '@/lib/formatters';
import { TransactionModal } from '@/components/modals/transaction-modal';
import {
  ArrowLeftRight,
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
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const today = getTodayDateString();

  // Filtered transactions
  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch = tx.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || tx.type === typeFilter;
      const matchesCategory = categoryFilter === 'all' || tx.categoryId === categoryFilter;
      return matchesSearch && matchesType && matchesCategory;
    });
  }, [transactions, searchTerm, typeFilter, categoryFilter]);

  // Group by date (like Mockup Phone 2: "Hoje", "Ontem", "DD/MM/YYYY")
  const groupedTransactions = useMemo(() => {
    const groups: { [date: string]: typeof filtered } = {};
    for (const tx of filtered) {
      if (!groups[tx.date]) {
        groups[tx.date] = [];
      }
      groups[tx.date].push(tx);
    }
    // Return sorted dates descending
    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a))
      .map((date) => ({
        date,
        items: groups[date],
      }));
  }, [filtered]);

  // Totals for filtered transactions
  const totalIncomes = filtered
    .filter((tx) => tx.type === 'income')
    .reduce((acc, tx) => acc + tx.amountCents, 0);

  const totalExpenses = filtered
    .filter((tx) => tx.type === 'expense')
    .reduce((acc, tx) => acc + tx.amountCents, 0);

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

  const formatDateHeader = (dateStr: string) => {
    if (dateStr === today) return 'Hoje';
    const [y, m, d] = dateStr.split('-').map(Number);
    const dObj = new Date(y, m - 1, d);
    return dObj.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6 space-y-5 pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#22ffb4]/20 to-[#5b8cff]/20 text-[#22ffb4] border border-[#22ffb4]/30 shadow-xs">
            <ArrowLeftRight className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white font-sora">
              Transações
            </h1>
            <span className="text-xs font-mono-tech text-[#8f8ea8]">
              {filtered.length} {filtered.length === 1 ? 'registro' : 'registros'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            title="Exportar CSV"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#8f8ea8] hover:text-white transition"
          >
            <FileSpreadsheet className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-tech-primary !py-2 !px-3.5 !text-xs"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nova Transação</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="tech-card p-2.5 sm:p-3.5">
          <span className="text-[10px] font-mono-tech uppercase text-[#8f8ea8] block">Entradas</span>
          <div className="mt-1 text-xs sm:text-sm md:text-base font-bold font-mono-tech text-[#22ffb4] whitespace-nowrap leading-tight">
            {formatCurrency(totalIncomes)}
          </div>
        </div>

        <div className="tech-card p-2.5 sm:p-3.5">
          <span className="text-[10px] font-mono-tech uppercase text-[#8f8ea8] block">Saídas</span>
          <div className="mt-1 text-xs sm:text-sm md:text-base font-bold font-mono-tech text-rose-400 whitespace-nowrap leading-tight">
            {formatCurrency(totalExpenses)}
          </div>
        </div>

        <div className="tech-card p-2.5 sm:p-3.5">
          <span className="text-[10px] font-mono-tech uppercase text-[#8f8ea8] block">Balanço</span>
          <div
            className={`mt-1 text-xs sm:text-sm md:text-base font-bold font-mono-tech whitespace-nowrap leading-tight ${
              totalIncomes - totalExpenses >= 0 ? 'text-white' : 'text-rose-400'
            }`}
          >
            {formatCurrency(totalIncomes - totalExpenses)}
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8f8ea8]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar..."
            className="w-full h-10 rounded-xl border border-white/10 tech-input py-2 pl-9 pr-3 text-xs text-white placeholder:text-[#8f8ea8] focus:border-[#22ffb4] focus:outline-hidden transition font-sans"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'all' | 'expense' | 'income')}
            className="h-10 rounded-xl border border-white/10 tech-input px-3 text-xs text-white focus:border-[#22ffb4] focus:outline-hidden transition"
          >
            <option value="all">Todos</option>
            <option value="expense">Despesas</option>
            <option value="income">Receitas</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 rounded-xl border border-white/10 tech-input px-3 text-xs text-white focus:border-[#22ffb4] focus:outline-hidden transition"
          >
            <option value="all">Categorias</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Date-Grouped Transaction List (Matching Mockup Phone 2) */}
      <div className="space-y-4">
        {groupedTransactions.length === 0 ? (
          <div className="tech-card py-12 text-center text-xs text-[#8f8ea8] font-mono-tech">
            Nenhuma movimentação encontrada.
          </div>
        ) : (
          groupedTransactions.map((group) => (
            <div key={group.date} className="space-y-1.5">
              {/* Date Header */}
              <div className="px-1 text-[11px] font-bold font-mono-tech uppercase tracking-wider text-[#8f8ea8] capitalize">
                {formatDateHeader(group.date)}
              </div>

              {/* Transactions in group */}
              <div className="tech-card divide-y divide-white/5 overflow-hidden">
                {group.items.map((tx) => {
                  const cat = categories.find((c) => c.id === tx.categoryId);
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3.5 text-xs gap-3 transition hover:bg-white/[0.02]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                            tx.type === 'income'
                              ? 'bg-[#22ffb4]/15 text-[#22ffb4] border border-[#22ffb4]/30'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {tx.type === 'income' ? (
                            <ArrowUpRight className="h-4 w-4" />
                          ) : (
                            getCategoryIcon(tx.categoryId)
                          )}
                        </div>
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <div className="font-semibold text-white truncate text-xs sm:text-sm">
                            {tx.description}
                          </div>
                          <div className="text-[10px] font-mono-tech text-[#8f8ea8] truncate">
                            {cat?.name || 'Geral'}
                            {tx.notes ? ` • ${tx.notes}` : ''}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0 text-right">
                        <span
                          className={`font-mono-tech font-bold text-xs sm:text-sm whitespace-nowrap ${
                            tx.type === 'income' ? 'text-[#22ffb4]' : 'text-white'
                          }`}
                        >
                          {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amountCents)}
                        </span>

                        <button
                          onClick={() => handleDelete(tx.id, tx.description)}
                          className="rounded-lg p-1.5 text-[#8f8ea8] hover:text-rose-400 hover:bg-rose-500/10 transition"
                          title="Excluir"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
