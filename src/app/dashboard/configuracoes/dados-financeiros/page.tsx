'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useFinancial } from '@/lib/context/financial-context';
import { parseCurrencyToCents, formatCurrencyInput } from '@/lib/formatters';
import { IncomeFrequency } from '@/lib/types';
import { DateInput } from '@/components/date-input';
import {
  ChevronLeft,
  DollarSign,
  Calendar,
  Wallet,
  Shield,
  CheckCircle2,
  Save,
  Layers,
} from 'lucide-react';

export default function DadosFinanceirosPage() {
  const { settings, updateSettings } = useFinancial();

  const [incomeStr, setIncomeStr] = useState(
    settings ? formatCurrencyInput(String(settings.primaryIncomeCents)) : ''
  );
  const [frequency, setFrequency] = useState<IncomeFrequency>(
    settings?.incomeFrequency || 'mensal'
  );
  const [nextPayday, setNextPayday] = useState(settings?.nextPayday || '');
  const [balanceStr, setBalanceStr] = useState(
    settings ? formatCurrencyInput(String(settings.currentBalanceCents)) : ''
  );
  const [reserveStr, setReserveStr] = useState(
    settings ? formatCurrencyInput(String(settings.safetyReserveCents)) : ''
  );

  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setIncomeStr(formatCurrencyInput(String(settings.primaryIncomeCents)));
      setFrequency(settings.incomeFrequency || 'mensal');
      setNextPayday(settings.nextPayday || '');
      setBalanceStr(formatCurrencyInput(String(settings.currentBalanceCents)));
      setReserveStr(formatCurrencyInput(String(settings.safetyReserveCents)));
    }
  }, [settings]);

  const handleSaveFinancial = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      primaryIncomeCents: parseCurrencyToCents(incomeStr),
      incomeFrequency: frequency,
      nextPayday,
      currentBalanceCents: parseCurrencyToCents(balanceStr),
      safetyReserveCents: parseCurrencyToCents(reserveStr),
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-5 space-y-5 pb-28">
      {/* Header */}
      <div className="flex items-center gap-3 pt-1">
        <Link
          href="/dashboard/configuracoes"
          className="p-1 rounded-full text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-sora">
            Dados Financeiros
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ajuste seu salário, data de recebimento e saldo de emergência
          </p>
        </div>
      </div>

      {settingsSaved && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Parâmetros financeiros atualizados com sucesso!</span>
        </div>
      )}

      <form onSubmit={handleSaveFinancial} className="space-y-4">
        {/* Renda & Frequência */}
        <div className="bg-white dark:bg-[#121324] border border-slate-100 dark:border-slate-800/80 rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-emerald-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white font-sora">
              Renda e Ciclo Salarial
            </h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Salário / Renda Principal (Líquido)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  R$
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={incomeStr}
                  onChange={(e) => setIncomeStr(formatCurrencyInput(e.target.value))}
                  placeholder="0,00"
                  required
                  className="w-full h-11 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 pl-10 pr-4 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Próximo Salário (Data)
                </label>
                <DateInput
                  value={nextPayday}
                  onChange={setNextPayday}
                  required
                  accentColor="emerald"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Frequência de Recebimento
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as IncomeFrequency)}
                  className="w-full h-11 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 px-4 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="mensal">Mensal</option>
                  <option value="quinzenal">Quinzenal</option>
                  <option value="semanal">Semanal</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Saldo em Conta & Reserva */}
        <div className="bg-white dark:bg-[#121324] border border-slate-100 dark:border-slate-800/80 rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-violet-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white font-sora">
              Saldos e Reserva de Segurança
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Saldo Atual em Conta
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  R$
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={balanceStr}
                  onChange={(e) => setBalanceStr(formatCurrencyInput(e.target.value))}
                  placeholder="0,00"
                  required
                  className="w-full h-11 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 pl-10 pr-4 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Reserva de Emergência
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  R$
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={reserveStr}
                  onChange={(e) => setReserveStr(formatCurrencyInput(e.target.value))}
                  placeholder="0,00"
                  className="w-full h-11 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 pl-10 pr-4 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Botão de Salvar */}
        <div className="flex gap-3 pt-2">
          <Link
            href="/dashboard/configuracoes"
            className="flex-1 rounded-2xl border border-slate-200 dark:border-white/10 bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 font-semibold text-xs py-3.5 text-center transition cursor-pointer"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            className="flex-1 rounded-2xl bg-[#121324] dark:bg-violet-600 text-white font-semibold text-xs py-3.5 shadow-md hover:bg-[#1e2038] dark:hover:bg-violet-700 active:scale-98 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Save className="h-4 w-4" />
            <span>Salvar Parâmetros</span>
          </button>
        </div>
      </form>
    </div>
  );
}
