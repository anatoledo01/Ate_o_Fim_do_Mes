'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { useFinancial } from '@/lib/context/financial-context';
import { useTheme } from '@/lib/context/theme-context';
import { parseCurrencyToCents, formatCurrencyInput } from '@/lib/formatters';
import { compressImageFile } from '@/lib/utils/image';
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
  Camera,
  Upload,
  Sun,
  Moon,
} from 'lucide-react';

export default function ConfiguracoesPage() {
  const router = useRouter();
  const { user, updateUserProfile, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const {
    settings,
    updateSettings,
    categories,
    exportDataJSON,
    deleteAccount,
  } = useFinancial();

  // Avatar upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarToast, setAvatarToast] = useState<string | null>(null);

  // Profile state
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [profileSaved, setProfileSaved] = useState(false);

  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingAvatar(true);
      const compressedDataUrl = await compressImageFile(file, 320, 0.85);
      updateUserProfile({ avatarUrl: compressedDataUrl });
      setAvatarToast('Foto de perfil atualizada!');
      setTimeout(() => setAvatarToast(null), 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao processar imagem.';
      alert(msg);
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = () => {
    updateUserProfile({ avatarUrl: '' });
    setAvatarToast('Foto removida!');
    setTimeout(() => setAvatarToast(null), 3000);
  };

  // Financial settings state
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
      <div className="flex items-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#22ffb4]/20 to-[#5b8cff]/20 text-[#22ffb4] border border-[#22ffb4]/30 shadow-xs">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white font-sora">
            Configurações
          </h1>
          <span className="text-xs font-mono-tech text-[#8f8ea8]">
            Perfil e Parâmetros
          </span>
        </div>
      </div>

      {/* 1. Perfil do Usuário */}
      <div className="tech-card p-4 sm:p-5 space-y-4">
        <h3 className="text-xs sm:text-sm font-bold text-white font-sora flex items-center gap-2">
          <User className="h-4 w-4 text-[#5b8cff]" />
          Perfil
        </h3>

        {/* Avatar Upload Block */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pb-4 border-b border-white/10">
          <div className="relative group shrink-0">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#22ffb4]/20 via-[#5b8cff]/20 to-[#8b5cf6]/30 border-2 border-[#22ffb4]/50 shadow-[0_0_20px_rgba(34,255,180,0.25)] text-lg font-bold text-white overflow-hidden">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.displayName || 'Avatar'}
                  className="h-full w-full object-cover"
                />
              ) : (
                user?.displayName ? user.displayName.slice(0, 2).toUpperCase() : 'AT'
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              title="Alterar foto de perfil"
              className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
            >
              <Camera className="h-6 w-6" />
            </button>
          </div>

          <div className="flex flex-col items-center sm:items-start gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="inline-flex items-center gap-2 rounded-xl bg-[#22ffb4] hover:bg-[#5fffc8] text-[#04110c] px-3.5 py-1.5 text-xs font-bold shadow-xs transition active:scale-95 disabled:opacity-60 cursor-pointer"
              >
                {isUploadingAvatar ? (
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#04110c] border-t-transparent" />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}
                <span>{isUploadingAvatar ? 'Processando...' : 'Carregar Foto'}</span>
              </button>

              {user?.avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 px-3 py-1.5 text-xs font-mono transition active:scale-95 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Remover</span>
                </button>
              )}
            </div>
            <span className="text-[11px] font-mono-tech text-[#8f8ea8]">
              Formatos JPG, PNG ou WebP. Compactada automaticamente para navegação instantânea.
            </span>
            {avatarToast && (
              <span className="text-xs font-semibold font-mono text-[#22ffb4] flex items-center gap-1 animate-fade-in">
                <CheckCircle2 className="h-3.5 w-3.5" /> {avatarToast}
              </span>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarFileSelect}
              className="hidden"
            />
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-3">
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
                className="w-full rounded-xl border border-white/10 tech-input py-2.5 px-3.5 text-xs text-white placeholder:text-slate-500 focus:border-[#5b8cff] focus:outline-hidden transition"
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
              className="rounded-xl border border-[#5b8cff]/40 bg-[#5b8cff]/15 px-4 py-2 text-xs font-semibold text-[#5b8cff] hover:bg-[#5b8cff]/25 active:scale-95 transition font-mono cursor-pointer"
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

      {/* 2. Aparência e Tema (Modo Claro / Escuro) */}
      <div className="tech-card p-4 sm:p-5">
        <h3 className="text-xs sm:text-sm font-bold text-white font-sora flex items-center gap-2">
          {theme === 'dark' ? (
            <Moon className="h-4 w-4 text-indigo-400" />
          ) : (
            <Sun className="h-4 w-4 text-amber-400" />
          )}
          Aparência e Tema
        </h3>
        <p className="mt-1 text-xs font-mono-tech text-[#8f8ea8]">
          Escolha entre o modo escuro (neon / fintech cyberpunk) ou modo claro (clean / moderno).
        </p>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Card Modo Escuro */}
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`flex items-center gap-3.5 p-3.5 rounded-2xl border transition text-left cursor-pointer ${
              theme === 'dark'
                ? 'border-[#22ffb4] bg-[#22ffb4]/10 shadow-[0_0_15px_rgba(34,255,180,0.15)] ring-1 ring-[#22ffb4]'
                : 'border-white/10 bg-white/5 hover:border-white/20'
            }`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#07081a] border border-white/15 text-[#22ffb4]">
              <Moon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white text-xs sm:text-sm">Modo Escuro</span>
                {theme === 'dark' && (
                  <span className="rounded-full bg-[#22ffb4] text-[#04110c] text-[10px] font-bold px-2 py-0.5 font-mono-tech">
                    Ativo
                  </span>
                )}
              </div>
              <span className="text-[11px] font-mono-tech text-[#8f8ea8] block mt-0.5">
                Tons escuros, neon e alto contraste
              </span>
            </div>
          </button>

          {/* Card Modo Claro */}
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`flex items-center gap-3.5 p-3.5 rounded-2xl border transition text-left cursor-pointer ${
              theme === 'light'
                ? 'border-[#5b8cff] bg-[#5b8cff]/10 shadow-[0_0_15px_rgba(91,140,255,0.2)] ring-1 ring-[#5b8cff]'
                : 'border-white/10 bg-white/5 hover:border-white/20'
            }`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200 text-amber-500 shadow-sm">
              <Sun className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white text-xs sm:text-sm">Modo Claro</span>
                {theme === 'light' && (
                  <span className="rounded-full bg-[#5b8cff] text-white text-[10px] font-bold px-2 py-0.5 font-mono-tech">
                    Ativo
                  </span>
                )}
              </div>
              <span className="text-[11px] font-mono-tech text-[#8f8ea8] block mt-0.5">
                Interface clara, limpa e nítida
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* 2. Parâmetros Financeiros */}
      <div className="tech-card p-4 sm:p-5">
        <h3 className="text-xs sm:text-sm font-bold text-white font-sora flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-[#22ffb4]" />
          Parâmetros Financeiros
        </h3>

        <form onSubmit={handleSaveFinancial} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold font-mono text-slate-400 mb-2">
                Renda Principal Líquida (R$)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={incomeStr}
                onChange={(e) => setIncomeStr(formatCurrencyInput(e.target.value))}
                placeholder="Ex: 5.000,00"
                className="w-full h-11 rounded-xl border border-white/10 tech-input px-3.5 text-xs font-mono text-white placeholder:text-slate-500 focus:border-[#22ffb4] focus:outline-hidden transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold font-mono text-slate-400 mb-2">
                Frequência de Recebimento
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as IncomeFrequency)}
                className="w-full h-11 rounded-xl border border-white/10 tech-input px-3.5 text-xs text-white focus:border-[#22ffb4] focus:outline-hidden transition"
              >
                <option value="mensal">Mensal</option>
                <option value="quinzenal">Quinzenal</option>
                <option value="semanal">Semanal</option>
                <option value="variavel">Renda Variável</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold font-mono text-slate-400 mb-2">
                Próxima Data de Recebimento
              </label>
              <input
                type="date"
                value={nextPayday}
                onChange={(e) => setNextPayday(e.target.value)}
                className="w-full h-11 rounded-xl border border-white/10 tech-input px-3.5 text-xs font-mono text-white focus:border-[#22ffb4] focus:outline-hidden transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold font-mono text-slate-400 mb-2">
                Saldo Atual em Conta (R$)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={balanceStr}
                onChange={(e) => setBalanceStr(formatCurrencyInput(e.target.value))}
                placeholder="Ex: 1.200,00"
                className="w-full h-11 rounded-xl border border-white/10 tech-input px-3.5 text-xs font-mono text-white placeholder:text-slate-500 focus:border-[#22ffb4] focus:outline-hidden transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold font-mono text-slate-400 mb-2">
                Reserva de Segurança Blindada (R$)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={reserveStr}
                onChange={(e) => setReserveStr(formatCurrencyInput(e.target.value))}
                placeholder="Ex: 500,00"
                className="w-full h-11 rounded-xl border border-white/10 tech-input px-3.5 text-xs font-mono text-white placeholder:text-slate-500 focus:border-[#22ffb4] focus:outline-hidden transition"
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
      <div className="tech-card p-4 sm:p-5">
        <h3 className="text-xs sm:text-sm font-bold text-white font-sora flex items-center gap-2">
          <Tag className="h-4 w-4 text-[#c058ff]" />
          Categorias ({categories.length})
        </h3>

        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((c) => (
            <div
              key={c.id}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-mono-tech text-[#c9c8e2] hover:border-white/20 transition"
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
      <div className="tech-card p-4 sm:p-5">
        <h3 className="text-xs sm:text-sm font-bold text-white font-sora flex items-center gap-2">
          <Bell className="h-4 w-4 text-[#f59e0b]" />
          Notificações
        </h3>

        <div className="mt-4 space-y-4">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={dailyReminder}
              onChange={(e) => setDailyReminder(e.target.checked)}
              className="h-4 w-4 rounded-sm accent-[#22ffb4]"
            />
            <span className="text-xs font-mono-tech text-[#8f8ea8] group-hover:text-white transition">
              Lembrete matinal do limite diário
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={billAlerts}
              onChange={(e) => setBillAlerts(e.target.checked)}
              className="h-4 w-4 rounded-sm accent-[#22ffb4]"
            />
            <span className="text-xs font-mono-tech text-[#8f8ea8] group-hover:text-white transition">
              Aviso de contas a vencer em 48h
            </span>
          </label>
        </div>
      </div>

      {/* 5. Privacidade, Exportação LGPD & Exclusão */}
      <div className="tech-card p-4 sm:p-5">
        <h3 className="text-xs sm:text-sm font-bold text-white font-sora flex items-center gap-2">
          <Shield className="h-4 w-4 text-[#5b8cff]" />
          Privacidade e Dados
        </h3>

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
