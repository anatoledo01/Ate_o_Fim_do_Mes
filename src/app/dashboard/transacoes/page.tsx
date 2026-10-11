'use client';

import React, { useState, useMemo } from 'react';
import { useFinancial } from '@/lib/context/financial-context';
import { formatCurrency, formatDateBR } from '@/lib/formatters';
import { TransactionModal } from '@/components/modals/transaction-modal';
import {
  ArrowLeftRight,
  Plus,
  Search,
  Trash2,
  ArrowDownRight,
  ArrowUpRight,
  FileSpreadsheet,
} from 'lucide-react';

export default function TransacoesPage() {
  const { transactions, categories, deleteTransaction } = useFinancial();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // Totals for filtered transactions
  const totalIncomes = filtered
    .filter((tx) => tx.type === 'income')
    .reduce((acc, tx) => acc + tx.amountCents, 0);

  const totalExpenses = filtered
    .filter((tx) => tx.type === 'expense')
    .reduce((acc, tx) => acc + tx.amountCents, 0);

  const handleDelete = (id: string, desc: string) => {
    if (confirm(`Deseja realmente excluir a transação "${desc}"?`)) {
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="tech-pill mb-2 inline-flex">
            <span className="dot-chip" />
            <span className="text-[11px] font-mono tracking-wider uppercase text-[#22ffb4]">Extrato Inteligente</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sora flex items-center gap-2">
            <ArrowLeftRight className="h-6 w-6 text-[#22ffb4]" />
            Transações e Movimentações
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Histórico cronológico detalhado de todas as suas entradas e saídas.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#0e1026] px-3.5 py-2 text-xs font-semibold text-slate-300 hover:border-[#5b8cff]/50 hover:text-white transition shadow-sm"
          >
            <FileSpreadsheet className="h-4 w-4 text-[#22ffb4]" />
            Exportar CSV
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-tech-primary"
          >
            <span className="flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              Nova Transação
            </span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="tech-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Total Entradas</span>
            <ArrowUpRight className="h-4 w-4 text-[#22ffb4]" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-[#22ffb4]">
            {formatCurrency(totalIncomes)}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Recebimentos no período</span>
        </div>

        <div className="tech-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Total Saídas</span>
            <ArrowDownRight className="h-4 w-4 text-[#ff4fd8]" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-[#ff4fd8]">
            {formatCurrency(totalExpenses)}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Despesas e gastos diários</span>
        </div>

        <div className="tech-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Saldo no Período</span>
            <span className="text-xs font-mono text-[#5b8cff]">Líquido</span>
          </div>
          <div className={`mt-2 text-xl font-bold font-mono ${totalIncomes - totalExpenses >= 0 ? 'text-white' : 'text-[#ff4fd8]'}`}>
            {formatCurrency(totalIncomes - totalExpenses)}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Entradas menos despesas</span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="tech-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por descrição..."
              className="w-full rounded-xl border border-white/10 bg-[#07081a] py-2 pl-9 pr-3 text-xs text-white placeholder:text-slate-500 focus:border-[#5b8cff] focus:outline-hidden transition font-sans"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'all' | 'expense' | 'income')}
            className="rounded-xl border border-white/10 bg-[#07081a] py-2 px-3 text-xs text-white focus:border-[#5b8cff] focus:outline-hidden transition"
          >
            <option value="all">Todos os tipos</option>
            <option value="expense">Apenas Despesas</option>
            <option value="income">Apenas Receitas</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#07081a] py-2 px-3 text-xs text-white focus:border-[#5b8cff] focus:outline-hidden transition"
          >
            <option value="all">Todas as categorias</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions List Table */}
      <div className="tech-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-14 text-center text-xs text-slate-400 font-mono">
            Nenhuma transação encontrada para os filtros selecionados.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map((tx) => {
              const cat = categories.find((c) => c.id === tx.categoryId);
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 transition hover:bg-white/[0.03]"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                        tx.type === 'income'
                          ? 'border-[#22ffb4]/30 bg-[#22ffb4]/10 text-[#22ffb4]'
                          : 'border-[#ff4fd8]/30 bg-[#ff4fd8]/10 text-[#ff4fd8]'
                      }`}
                    >
                      {tx.type === 'income' ? (
                        <ArrowUpRight className="h-5 w-5" />
                      ) : (
                        <ArrowDownRight className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-xs sm:text-sm text-white">
                        {tx.description}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                        <span className="font-mono">{formatDateBR(tx.date)}</span>
                        <span>•</span>
                        <span className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-mono text-slate-300">
                          {cat?.name || 'Geral'}
                        </span>
                        {tx.notes && <span className="italic text-slate-500">({tx.notes})</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div
                      className={`text-right font-bold font-mono text-xs sm:text-sm ${
                        tx.type === 'income'
                          ? 'text-[#22ffb4]'
                          : 'text-white'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amountCents)}
                    </div>

                    <button
                      onClick={() => handleDelete(tx.id, tx.description)}
                      className="rounded-lg p-1.5 text-slate-400 hover:border hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400 transition"
                      title="Excluir transação"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
