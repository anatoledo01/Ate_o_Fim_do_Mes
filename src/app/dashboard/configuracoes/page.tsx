'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Bell,
  Lock,
  HelpCircle,
  Info,
  LogOut,
  DollarSign,
  Tag,
  User,
} from 'lucide-react';

export default function ConfiguracoesPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-5 space-y-4 pb-28">
      {/* Header: Seta voltar + Título Configurações */}
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

      {/* Card Perfil do Usuário - Clicar leva para tela de Editar Perfil */}
      <Link
        href="/dashboard/configuracoes/perfil"
        className="bg-white dark:bg-[#121324] border border-slate-100 dark:border-slate-800/80 rounded-3xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center justify-between hover:border-violet-300 dark:hover:border-violet-500/40 hover:shadow-md transition group cursor-pointer"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-700 dark:text-white overflow-hidden shadow-inner group-hover:scale-105 transition">
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

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate font-sora">
                {user?.displayName || 'Ana Toledo'}
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-300">
                Editar
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {user?.email || 'ana@email.com'}
            </p>
          </div>
        </div>

        <div className="p-1 text-slate-400 group-hover:text-violet-600 dark:group-hover:text-white group-hover:translate-x-0.5 transition">
          <ChevronRight className="h-5 w-5" />
        </div>
      </Link>

      {/* Lista de Opções do Menu */}
      <div className="bg-white dark:bg-[#121324] border border-slate-100 dark:border-slate-800/80 rounded-3xl p-2 sm:p-3 divide-y divide-slate-100 dark:divide-white/5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        {/* Dados Financeiros e Salário */}
        <Link
          href="/dashboard/configuracoes/dados-financeiros"
          className="flex items-center justify-between p-3 text-xs hover:bg-slate-50/70 dark:hover:bg-white/[0.03] rounded-2xl transition cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition">
              <DollarSign className="h-4 w-4" />
            </div>
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">
                Dados Financeiros e Salário
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Salário, ciclo de pagamento e reserva
              </div>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 group-hover:text-slate-600 dark:group-hover:text-white transition" />
        </Link>

        {/* Preferências de notificação */}
        <Link
          href="/dashboard/configuracoes/notificacoes"
          className="flex items-center justify-between p-3 text-xs hover:bg-slate-50/70 dark:hover:bg-white/[0.03] rounded-2xl transition cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 group-hover:scale-105 transition">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">
                Preferências de notificação
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Lembretes de vencimento e limites
              </div>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 group-hover:text-slate-600 dark:group-hover:text-white transition" />
        </Link>

        {/* Metas e limites */}
        <Link
          href="/dashboard/metas"
          className="flex items-center justify-between p-3 text-xs hover:bg-slate-50/70 dark:hover:bg-white/[0.03] rounded-2xl transition cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 group-hover:scale-105 transition">
              <Tag className="h-4 w-4" />
            </div>
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">
                Metas e limites
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Objetivos de economia e teto de gastos
              </div>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 group-hover:text-slate-600 dark:group-hover:text-white transition" />
        </Link>

        {/* Segurança */}
        <Link
          href="/dashboard/configuracoes/seguranca"
          className="flex items-center justify-between p-3 text-xs hover:bg-slate-50/70 dark:hover:bg-white/[0.03] rounded-2xl transition cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 group-hover:scale-105 transition">
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">
                Segurança
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Alteração de senha e sessões
              </div>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 group-hover:text-slate-600 dark:group-hover:text-white transition" />
        </Link>

        {/* Ajuda e suporte */}
        <Link
          href="/dashboard/configuracoes/ajuda"
          className="flex items-center justify-between p-3 text-xs hover:bg-slate-50/70 dark:hover:bg-white/[0.03] rounded-2xl transition cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 group-hover:scale-105 transition">
              <HelpCircle className="h-4 w-4" />
            </div>
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">
                Ajuda e suporte
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Perguntas frequentes e canais de contato
              </div>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 group-hover:text-slate-600 dark:group-hover:text-white transition" />
        </Link>

        {/* Sobre o app */}
        <Link
          href="/dashboard/configuracoes/sobre"
          className="flex items-center justify-between p-3 text-xs hover:bg-slate-50/70 dark:hover:bg-white/[0.03] rounded-2xl transition cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 group-hover:scale-105 transition">
              <Info className="h-4 w-4" />
            </div>
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">
                Sobre o app
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Termos, privacidade e exportação
              </div>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 group-hover:text-slate-600 dark:group-hover:text-white transition" />
        </Link>
      </div>

      {/* Botão Sair da Conta (Logout) */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-2xl border border-rose-300 dark:border-rose-900/40 bg-transparent hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 font-semibold text-xs py-3.5 px-4 transition active:scale-98 cursor-pointer flex items-center justify-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          <span>Sair da conta</span>
        </button>
      </div>
    </div>
  );
}
