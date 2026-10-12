'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  Bell,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Save,
  Sparkles,
} from 'lucide-react';

interface NotificationPrefs {
  dueDay: boolean;
  twoDaysBefore: boolean;
  overdueBills: boolean;
  dailyLimitExceeded: boolean;
  safetyReserveTouched: boolean;
  weeklySummary: boolean;
  preferredHour: string;
}

const DEFAULT_PREFS: NotificationPrefs = {
  dueDay: true,
  twoDaysBefore: true,
  overdueBills: true,
  dailyLimitExceeded: true,
  safetyReserveTouched: true,
  weeklySummary: false,
  preferredHour: '09:00',
};

const STORAGE_KEY = 'ate_o_fim_do_mes_notification_prefs';

export default function NotificacoesPage() {
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(saved) });
        } catch {}
      }
    }
  }, []);

  const handleToggle = (key: keyof NotificationPrefs) => {
    setPrefs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
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
            Preferências de Notificação
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure quando e como deseja ser avisado sobre contas e saldo
          </p>
        </div>
      </div>

      {isSaved && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Preferências de notificação salvas com sucesso!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        {/* Lembretes de Vencimentos */}
        <div className="bg-white dark:bg-[#121324] border border-slate-100 dark:border-slate-800/80 rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-violet-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white font-sora">
              Vencimento de Contas
            </h2>
          </div>

          <div className="space-y-3 divide-y divide-slate-100 dark:divide-white/5">
            <label className="flex items-center justify-between pt-2 cursor-pointer">
              <div className="pr-4">
                <span className="block text-xs font-semibold text-slate-900 dark:text-white">
                  No dia do vencimento
                </span>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                  Alerta logo pela manhã no dia que a conta vence
                </span>
              </div>
              <input
                type="checkbox"
                checked={prefs.dueDay}
                onChange={() => handleToggle('dueDay')}
                className="h-5 w-5 rounded-md accent-violet-600 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between pt-3 cursor-pointer">
              <div className="pr-4">
                <span className="block text-xs font-semibold text-slate-900 dark:text-white">
                  2 dias antes do vencimento
                </span>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                  Lembrete antecipado para planejar transferências e saldo
                </span>
              </div>
              <input
                type="checkbox"
                checked={prefs.twoDaysBefore}
                onChange={() => handleToggle('twoDaysBefore')}
                className="h-5 w-5 rounded-md accent-violet-600 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between pt-3 cursor-pointer">
              <div className="pr-4">
                <span className="block text-xs font-semibold text-slate-900 dark:text-white">
                  Aviso de contas atrasadas
                </span>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                  Lembrete diário caso haja conta pendente vencida
                </span>
              </div>
              <input
                type="checkbox"
                checked={prefs.overdueBills}
                onChange={() => handleToggle('overdueBills')}
                className="h-5 w-5 rounded-md accent-violet-600 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Orçamento e Limites Diários */}
        <div className="bg-white dark:bg-[#121324] border border-slate-100 dark:border-slate-800/80 rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white font-sora">
              Orçamento e Limites
            </h2>
          </div>

          <div className="space-y-3 divide-y divide-slate-100 dark:divide-white/5">
            <label className="flex items-center justify-between pt-2 cursor-pointer">
              <div className="pr-4">
                <span className="block text-xs font-semibold text-slate-900 dark:text-white">
                  Limite diário ultrapassado
                </span>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                  Aviso ao registrar gastos maiores que a cota diária disponível
                </span>
              </div>
              <input
                type="checkbox"
                checked={prefs.dailyLimitExceeded}
                onChange={() => handleToggle('dailyLimitExceeded')}
                className="h-5 w-5 rounded-md accent-violet-600 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between pt-3 cursor-pointer">
              <div className="pr-4">
                <span className="block text-xs font-semibold text-slate-900 dark:text-white">
                  Reserva de emergência acionada
                </span>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                  Alerta caso o saldo em conta fique abaixo da reserva protegida
                </span>
              </div>
              <input
                type="checkbox"
                checked={prefs.safetyReserveTouched}
                onChange={() => handleToggle('safetyReserveTouched')}
                className="h-5 w-5 rounded-md accent-violet-600 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between pt-3 cursor-pointer">
              <div className="pr-4">
                <span className="block text-xs font-semibold text-slate-900 dark:text-white">
                  Resumo semanal aos domingos
                </span>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                  Panorama de gastos dos últimos 7 dias e metas alcançadas
                </span>
              </div>
              <input
                type="checkbox"
                checked={prefs.weeklySummary}
                onChange={() => handleToggle('weeklySummary')}
                className="h-5 w-5 rounded-md accent-violet-600 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Horário preferido */}
        <div className="bg-white dark:bg-[#121324] border border-slate-100 dark:border-slate-800/80 rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-emerald-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white font-sora">
              Horário Preferido para Lembretes
            </h2>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              Horário da Notificação
            </label>
            <select
              value={prefs.preferredHour}
              onChange={(e) => setPrefs({ ...prefs, preferredHour: e.target.value })}
              className="w-full h-11 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 px-4 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="08:00">08:00 (Logo cedo)</option>
              <option value="09:00">09:00 (Início da manhã - Recomendado)</option>
              <option value="12:00">12:00 (Meio-dia)</option>
              <option value="18:00">18:00 (Final do expediente)</option>
              <option value="20:00">20:00 (Noite)</option>
            </select>
          </div>
        </div>

        {/* Botão de Salvar */}
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
