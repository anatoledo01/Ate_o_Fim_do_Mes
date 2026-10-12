'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import {
  ChevronLeft,
  Lock,
  EyeOff,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Save,
  KeyRound,
} from 'lucide-react';

interface SecuritySettings {
  hideValuesByDefault: boolean;
  confirmDeleteTx: boolean;
  autoLockMinutes: string;
}

const DEFAULT_SECURITY: SecuritySettings = {
  hideValuesByDefault: false,
  confirmDeleteTx: true,
  autoLockMinutes: '15',
};

const STORAGE_KEY = 'ate_o_fim_do_mes_security_settings';

export default function SegurancaPage() {
  const { user, updatePassword } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(DEFAULT_SECURITY);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          setSecuritySettings({ ...DEFAULT_SECURITY, ...JSON.parse(saved) });
        } catch {}
      }
    }
  }, []);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorToast(null);
    setSuccessToast(null);

    if (!newPassword || newPassword.length < 6) {
      setErrorToast('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorToast('A confirmação da nova senha não confere.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await updatePassword(currentPassword, newPassword);
      if (res.error) {
        setErrorToast(res.error);
      } else {
        setSuccessToast('Senha atualizada com sucesso!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setSuccessToast(null), 3500);
      }
    } catch {
      setErrorToast('Erro ao atualizar senha.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(securitySettings));
    }
    setSuccessToast('Preferências de segurança atualizadas!');
    setTimeout(() => setSuccessToast(null), 3000);
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
            Segurança
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Proteção de acesso, credenciais e privacidade de visualização
          </p>
        </div>
      </div>

      {successToast && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {errorToast && (
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 rounded-2xl p-3 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2 animate-fade-in">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorToast}</span>
        </div>
      )}

      {/* Alterar Senha */}
      <div className="bg-white dark:bg-[#121324] border border-slate-100 dark:border-slate-800/80 rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-violet-500" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white font-sora">
            Alterar Senha
          </h2>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Senha Atual
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Digite sua senha atual"
              required
              className="w-full h-11 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 px-4 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Nova Senha
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 dígitos"
                required
                className="w-full h-11 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 px-4 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Confirmar Nova Senha
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova senha"
                required
                className="w-full h-11 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 px-4 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isUpdatingPassword}
            className="w-full rounded-2xl bg-[#121324] dark:bg-violet-600 text-white font-semibold text-xs py-3 shadow-md hover:bg-[#1e2038] dark:hover:bg-violet-700 active:scale-98 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Lock className="h-4 w-4" />
            <span>{isUpdatingPassword ? 'Atualizando...' : 'Atualizar Senha'}</span>
          </button>
        </form>
      </div>

      {/* Privacidade e Visualização */}
      <form onSubmit={handleSaveSecurity} className="space-y-4">
        <div className="bg-white dark:bg-[#121324] border border-slate-100 dark:border-slate-800/80 rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center gap-2">
            <EyeOff className="h-4 w-4 text-amber-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white font-sora">
              Privacidade da Interface
            </h2>
          </div>

          <div className="space-y-3 divide-y divide-slate-100 dark:divide-white/5">
            <label className="flex items-center justify-between pt-2 cursor-pointer">
              <div className="pr-4">
                <span className="block text-xs font-semibold text-slate-900 dark:text-white">
                  Ocultar valores monetários ao abrir
                </span>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                  Valores aparecem como ••••• até clicar no ícone de olho
                </span>
              </div>
              <input
                type="checkbox"
                checked={securitySettings.hideValuesByDefault}
                onChange={() =>
                  setSecuritySettings({
                    ...securitySettings,
                    hideValuesByDefault: !securitySettings.hideValuesByDefault,
                  })
                }
                className="h-5 w-5 rounded-md accent-violet-600 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between pt-3 cursor-pointer">
              <div className="pr-4">
                <span className="block text-xs font-semibold text-slate-900 dark:text-white">
                  Confirmar antes de excluir transações
                </span>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                  Exibe um modal de confirmação para evitar exclusões acidentais
                </span>
              </div>
              <input
                type="checkbox"
                checked={securitySettings.confirmDeleteTx}
                onChange={() =>
                  setSecuritySettings({
                    ...securitySettings,
                    confirmDeleteTx: !securitySettings.confirmDeleteTx,
                  })
                }
                className="h-5 w-5 rounded-md accent-violet-600 cursor-pointer"
              />
            </label>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              Bloqueio por Inatividade
            </label>
            <select
              value={securitySettings.autoLockMinutes}
              onChange={(e) =>
                setSecuritySettings({
                  ...securitySettings,
                  autoLockMinutes: e.target.value,
                })
              }
              className="w-full h-11 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 px-4 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="5">Após 5 minutos de inatividade</option>
              <option value="15">Após 15 minutos (Padrão)</option>
              <option value="30">Após 30 minutos</option>
              <option value="never">Nunca bloquear automaticamente</option>
            </select>
          </div>
        </div>

        {/* Dispositivos Conectados */}
        <div className="bg-white dark:bg-[#121324] border border-slate-100 dark:border-slate-800/80 rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3">
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-emerald-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white font-sora">
              Sessões Ativas
            </h2>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 dark:bg-white/5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-300">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Este Navegador • Sessão Atual
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {typeof navigator !== 'undefined' ? navigator.platform || 'Web App' : 'Web App'} • Conectado agora
                </div>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
              Ativo
            </span>
          </div>
        </div>

        {/* Botão de Salvar Preferências de Segurança */}
        <div className="flex gap-3 pt-2">
          <Link
            href="/dashboard/configuracoes"
            className="flex-1 rounded-2xl border border-slate-200 dark:border-white/10 bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 font-semibold text-xs py-3.5 text-center transition cursor-pointer"
          >
            Voltar
          </Link>
          <button
            type="submit"
            className="flex-1 rounded-2xl bg-[#121324] dark:bg-violet-600 text-white font-semibold text-xs py-3.5 shadow-md hover:bg-[#1e2038] dark:hover:bg-violet-700 active:scale-98 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Save className="h-4 w-4" />
            <span>Salvar Preferências</span>
          </button>
        </div>
      </form>
    </div>
  );
}
