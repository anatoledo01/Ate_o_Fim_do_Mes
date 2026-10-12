'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { useFinancial } from '@/lib/context/financial-context';
import { parseCurrencyToCents, formatCurrencyInput } from '@/lib/formatters';
import { compressImageFile } from '@/lib/utils/image';
import { IncomeFrequency } from '@/lib/types';
import Link from 'next/link';
import {
  DollarSign,
  Download,
  Trash2,
  CheckCircle2,
  Tag,
  Bell,
  Camera,
  ChevronLeft,
  ChevronRight,
  Landmark,
  Lock,
  HelpCircle,
  Info,
  LogOut,
} from 'lucide-react';

export default function ConfiguracoesPage() {
  const router = useRouter();
  const { user, updateUserProfile, logout } = useAuth();
  const {
    settings,
    updateSettings,
    exportDataJSON,
    deleteAccount,
  } = useFinancial();

  // Avatar upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarToast, setAvatarToast] = useState<string | null>(null);
  const [showAdvancedParams, setShowAdvancedParams] = useState(false);

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

  const handleLogout = async () => {
    await logout();
    router.push('/');
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
    <div className="mx-auto max-w-xl px-4 py-5 space-y-4 pb-28">
      {/* Header: Back arrow + Configurações (Screen 8) */}
      <div className="flex items-center gap-2 pt-1">
        <Link
          href="/dashboard"
          className="p-1 rounded-full text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-sora">
          Configurações
        </h1>
      </div>

      {/* User Profile Card (Screen 8: Clean white card with avatar, name, email, chevron) */}
      <div className="bg-white dark:bg-[#121324] border border-slate-100 dark:border-slate-800/80 rounded-3xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center justify-between">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative group shrink-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-700 dark:text-white overflow-hidden">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.displayName || 'Avatar'}
                  className="h-full w-full object-cover"
                />
              ) : user?.displayName ? (
                user.displayName.slice(0, 2).toUpperCase()
              ) : (
                'AT'
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              title="Trocar foto"
              className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate font-sora">
              {user?.displayName || 'Ana Toledo'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {user?.email || 'ana@email.com'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
          title="Alterar avatar"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarFileSelect}
          className="hidden"
        />
      </div>

      {avatarToast && (
        <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 px-2 animate-fade-in">
          <CheckCircle2 className="h-4 w-4" /> {avatarToast}
        </div>
      )}

      {/* Options List (Screen 8: Contas conectadas, Notificações, Metas e limites, Segurança, Ajuda, Sobre) */}
      <div className="bg-white dark:bg-[#121324] border border-slate-100 dark:border-slate-800/80 rounded-3xl p-2 sm:p-3 divide-y divide-slate-100 dark:divide-white/5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        {/* Contas conectadas */}
        <div className="flex items-center justify-between p-3 text-xs hover:bg-slate-50/50 dark:hover:bg-white/[0.02] rounded-2xl transition cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200">
              <Landmark className="h-4 w-4" />
            </div>
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">Contas conectadas</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Nubank • Conta principal</div>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </div>

        {/* Preferências de notificação */}
        <div className="flex items-center justify-between p-3 text-xs hover:bg-slate-50/50 dark:hover:bg-white/[0.02] rounded-2xl transition cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200">
              <Bell className="h-4 w-4" />
            </div>
            <div className="font-semibold text-slate-900 dark:text-white">
              Preferências de notificação
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </div>

        {/* Metas e limites */}
        <Link
          href="/dashboard/metas"
          className="flex items-center justify-between p-3 text-xs hover:bg-slate-50/50 dark:hover:bg-white/[0.02] rounded-2xl transition"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200">
              <Tag className="h-4 w-4" />
            </div>
            <div className="font-semibold text-slate-900 dark:text-white">
              Metas e limites
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </Link>

        {/* Segurança */}
        <div className="flex items-center justify-between p-3 text-xs hover:bg-slate-50/50 dark:hover:bg-white/[0.02] rounded-2xl transition cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200">
              <Lock className="h-4 w-4" />
            </div>
            <div className="font-semibold text-slate-900 dark:text-white">
              Segurança
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </div>

        {/* Ajuda e suporte */}
        <div className="flex items-center justify-between p-3 text-xs hover:bg-slate-50/50 dark:hover:bg-white/[0.02] rounded-2xl transition cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200">
              <HelpCircle className="h-4 w-4" />
            </div>
            <div className="font-semibold text-slate-900 dark:text-white">
              Ajuda e suporte
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </div>

        {/* Sobre o app */}
        <div className="flex items-center justify-between p-3 text-xs hover:bg-slate-50/50 dark:hover:bg-white/[0.02] rounded-2xl transition cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200">
              <Info className="h-4 w-4" />
            </div>
            <div className="font-semibold text-slate-900 dark:text-white">
              Sobre o app
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </div>
      </div>

      {/* Button: Desconectar banco / Sair (Screen 8: Red outline rounded button) */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-2xl border border-rose-300 dark:border-rose-900/40 bg-transparent hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 font-semibold text-xs py-3 px-4 transition active:scale-98 cursor-pointer flex items-center justify-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          <span>Desconectar banco</span>
        </button>
      </div>

      {/* Toggle to view Financial Parameters & LGPD */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowAdvancedParams(!showAdvancedParams)}
          className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 underline cursor-pointer w-full text-center"
        >
          {showAdvancedParams ? 'Ocultar parâmetros financeiros' : 'Ver parâmetros de salário e dados'}
        </button>
      </div>

      {/* Advanced Financial Parameters form */}
      {showAdvancedParams && (
        <div className="space-y-4 pt-2">
          <div className="bg-white dark:bg-[#121324] border border-slate-100 dark:border-slate-800/80 rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-600" /> Parâmetros Salariais
            </h3>

            <form onSubmit={handleSaveFinancial} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Salário / Renda Principal
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={incomeStr}
                    onChange={(e) => setIncomeStr(formatCurrencyInput(e.target.value))}
                    className="w-full h-10 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 py-2 px-3 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Próximo Salário
                  </label>
                  <input
                    type="date"
                    value={nextPayday}
                    onChange={(e) => setNextPayday(e.target.value)}
                    className="w-full h-10 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 py-2 px-3 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Frequência
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as IncomeFrequency)}
                    className="w-full h-10 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 py-2 px-3 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="mensal">Mensal</option>
                    <option value="quinzenal">Quinzenal</option>
                    <option value="semanal">Semanal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Saldo Atual em Conta
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={balanceStr}
                    onChange={(e) => setBalanceStr(formatCurrencyInput(e.target.value))}
                    className="w-full h-10 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 py-2 px-3 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Reserva de Emergência
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={reserveStr}
                    onChange={(e) => setReserveStr(formatCurrencyInput(e.target.value))}
                    className="w-full h-10 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 py-2 px-3 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-[#121324] dark:bg-violet-600 text-white py-2.5 text-xs font-semibold cursor-pointer"
              >
                Salvar Parâmetros
              </button>
              {settingsSaved && (
                <div className="text-xs font-semibold text-emerald-600 text-center">
                  ✓ Salvo com sucesso!
                </div>
              )}
            </form>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleExportJSON}
              className="flex-1 rounded-2xl border border-slate-200 dark:border-white/10 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="h-4 w-4" /> Exportar Dados (JSON)
            </button>
            <button
              type="button"
              onClick={handleDeleteAccount}
              className="rounded-2xl border border-rose-300 dark:border-rose-900/40 py-2.5 px-3 text-xs font-semibold text-rose-500 flex items-center justify-center gap-1 cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
