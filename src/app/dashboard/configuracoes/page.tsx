'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { useFinancial } from '@/lib/context/financial-context';
import { parseCurrencyToCents } from '@/lib/formatters';
import { IncomeFrequency } from '@/lib/types';
import {
  Settings,
  User,
  DollarSign,
  Shield,
  Download,
  Trash2,
  CheckCircle2,
  Tag,
  Bell,
} from 'lucide-react';

export default function ConfiguracoesPage() {
  const router = useRouter();
  const { user, updateUserProfile, logout } = useAuth();
  const {
    settings,
    updateSettings,
    categories,
    exportDataJSON,
    deleteAccount,
  } = useFinancial();

  // Profile state
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [profileSaved, setProfileSaved] = useState(false);

  // Financial settings state
  const [incomeStr, setIncomeStr] = useState(
    settings ? (settings.primaryIncomeCents / 100).toFixed(2) : ''
  );
  const [frequency, setFrequency] = useState<IncomeFrequency>(
    settings?.incomeFrequency || 'mensal'
  );
  const [nextPayday, setNextPayday] = useState(settings?.nextPayday || '');
  const [balanceStr, setBalanceStr] = useState(
    settings ? (settings.currentBalanceCents / 100).toFixed(2) : ''
  );
  const [reserveStr, setReserveStr] = useState(
    settings ? (settings.safetyReserveCents / 100).toFixed(2) : ''
  );
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Notifications
  const [dailyReminder, setDailyReminder] = useState(true);
  const [billAlerts, setBillAlerts] = useState(true);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (displayName.trim()) {
      updateUserProfile({ displayName: displayName.trim() });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    }
  };

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

  const handleExportJSON = () => {
    const jsonString = exportDataJSON();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ate_o_fim_do_mes_export_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteAccount = async () => {
    if (
      confirm(
        'ATENÇÃO: Deseja realmente excluir sua conta e TODOS os registros financeiros? Essa ação é irreversível conforme princípios da LGPD.'
      )
    ) {
      deleteAccount();
      await logout();
      router.push('/');
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 space-y-6">
      {/* Header */}
      <div>
        <div className="tech-pill mb-2 inline-flex">
          <span className="dot-chip" />
          <span className="text-[11px] font-mono tracking-wider uppercase text-[#22ffb4]">Painel de Controle</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sora flex items-center gap-2">
          <Settings className="h-6 w-6 text-[#22ffb4]" />
          Configurações
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Gerencie seu perfil, parâmetros de cálculo financeiro, exportação de dados e privacidade.
        </p>
      </div>

      {/* 1. Perfil do Usuário */}
      <div className="tech-card p-5">
        <h3 className="text-sm font-bold text-white font-sora flex items-center gap-2">
          <User className="h-4 w-4 text-[#5b8cff]" />
          Dados do Perfil
        </h3>

        <form onSubmit={handleSaveProfile} className="mt-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold font-mono text-slate-400 mb-1.5">
                Nome de exibição
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-[#07081a] py-2.5 px-3.5 text-xs text-white placeholder:text-slate-500 focus:border-[#5b8cff] focus:outline-hidden transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold font-mono text-slate-400 mb-1.5">
                E-mail da conta
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full rounded-xl border border-white/5 bg-white/5 py-2.5 px-3.5 text-xs text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              className="rounded-xl border border-[#5b8cff]/40 bg-[#5b8cff]/15 px-4 py-2 text-xs font-semibold text-[#5b8cff] hover:bg-[#5b8cff]/25 active:scale-95 transition font-mono"
            >
              Salvar Perfil
            </button>
            {profileSaved && (
              <span className="text-xs font-semibold font-mono text-[#22ffb4] flex items-center gap-1 animate-fade-in">
                <CheckCircle2 className="h-3.5 w-3.5" /> Salvo com sucesso!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* 2. Parâmetros Financeiros */}
      <div className="tech-card p-5">
        <h3 className="text-sm font-bold text-white font-sora flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-[#22ffb4]" />
          Parâmetros Financeiros e Ciclo
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Esses valores alimentam o motor de cálculo do seu limite diário em tempo real.
        </p>

        <form onSubmit={handleSaveFinancial} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold font-mono text-slate-400 mb-1.5">
                Renda Principal Líquida (R$)
              </label>
              <input
                type="text"
                value={incomeStr}
                onChange={(e) => setIncomeStr(e.target.value)}
                placeholder="Ex: 5.000,00"
                className="w-full rounded-xl border border-white/10 bg-[#07081a] py-2.5 px-3.5 text-xs font-mono text-white placeholder:text-slate-500 focus:border-[#22ffb4] focus:outline-hidden transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold font-mono text-slate-400 mb-1.5">
                Frequência de Recebimento
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as IncomeFrequency)}
                className="w-full rounded-xl border border-white/10 bg-[#07081a] py-2.5 px-3.5 text-xs text-white focus:border-[#22ffb4] focus:outline-hidden transition"
              >
                <option value="mensal">Mensal</option>
                <option value="quinzenal">Quinzenal</option>
                <option value="semanal">Semanal</option>
                <option value="variavel">Renda Variável</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold font-mono text-slate-400 mb-1.5">
                Próxima Data de Recebimento
              </label>
              <input
                type="date"
                value={nextPayday}
                onChange={(e) => setNextPayday(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#07081a] py-2.5 px-3.5 text-xs font-mono text-white focus:border-[#22ffb4] focus:outline-hidden transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold font-mono text-slate-400 mb-1.5">
                Saldo Atual em Conta (R$)
              </label>
              <input
                type="text"
                value={balanceStr}
                onChange={(e) => setBalanceStr(e.target.value)}
                placeholder="Ex: 1.200,00"
                className="w-full rounded-xl border border-white/10 bg-[#07081a] py-2.5 px-3.5 text-xs font-mono text-white placeholder:text-slate-500 focus:border-[#22ffb4] focus:outline-hidden transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold font-mono text-slate-400 mb-1.5">
                Reserva de Segurança Blindada (R$)
              </label>
              <input
                type="text"
                value={reserveStr}
                onChange={(e) => setReserveStr(e.target.value)}
                placeholder="Ex: 500,00"
                className="w-full rounded-xl border border-white/10 bg-[#07081a] py-2.5 px-3.5 text-xs font-mono text-white placeholder:text-slate-500 focus:border-[#22ffb4] focus:outline-hidden transition"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="btn-tech-primary"
            >
              <span>Atualizar Parâmetros</span>
            </button>
            {settingsSaved && (
              <span className="text-xs font-semibold font-mono text-[#22ffb4] flex items-center gap-1 animate-fade-in">
                <CheckCircle2 className="h-3.5 w-3.5" /> Parâmetros atualizados!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* 3. Categorias Cadastradas */}
      <div className="tech-card p-5">
        <h3 className="text-sm font-bold text-white font-sora flex items-center gap-2">
          <Tag className="h-4 w-4 text-[#c058ff]" />
          Categorias Disponíveis ({categories.length})
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Categorias padronizadas para classificar receitas, despesas e faturas.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((c) => (
            <div
              key={c.id}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-mono text-slate-300 hover:border-white/20 transition"
            >
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: c.color || '#5b8cff' }}
              />
              <span>{c.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Notificações */}
      <div className="tech-card p-5">
        <h3 className="text-sm font-bold text-white font-sora flex items-center gap-2">
          <Bell className="h-4 w-4 text-[#f59e0b]" />
          Preferências de Notificação
        </h3>

        <div className="mt-4 space-y-4">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={dailyReminder}
              onChange={(e) => setDailyReminder(e.target.checked)}
              className="h-4 w-4 rounded-sm accent-[#22ffb4]"
            />
            <span className="text-xs font-mono text-slate-400 group-hover:text-slate-300 transition">
              Lembrete diário matinal com meu limite de gastos do dia
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={billAlerts}
              onChange={(e) => setBillAlerts(e.target.checked)}
              className="h-4 w-4 rounded-sm accent-[#22ffb4]"
            />
            <span className="text-xs font-mono text-slate-400 group-hover:text-slate-300 transition">
              Alerta de contas que vencem nos próximos 2 dias
            </span>
          </label>
        </div>
      </div>

      {/* 5. Privacidade, Exportação LGPD & Exclusão */}
      <div className="tech-card p-5">
        <h3 className="text-sm font-bold text-white font-sora flex items-center gap-2">
          <Shield className="h-4 w-4 text-[#5b8cff]" />
          Privacidade e Gestão de Dados (LGPD)
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Você tem total controle e propriedade sobre os seus dados financeiros pessoais.
        </p>

        <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={handleExportJSON}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#5b8cff]/40 bg-[#5b8cff]/10 px-4 py-2.5 text-xs font-semibold font-mono text-[#5b8cff] transition hover:bg-[#5b8cff]/20 active:scale-95"
          >
            <Download className="h-4 w-4" />
            Exportar Todos os Meus Dados (JSON)
          </button>

          <button
            type="button"
            onClick={handleDeleteAccount}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs font-semibold font-mono text-rose-400 transition hover:bg-rose-500/20 active:scale-95"
          >
            <Trash2 className="h-4 w-4" />
            Excluir Minha Conta e Dados
          </button>
        </div>
      </div>
    </div>
  );
}
