'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { useFinancial } from '@/lib/context/financial-context';
import {
  ChevronLeft,
  Info,
  Shield,
  Download,
  Trash2,
  FileText,
  Sparkles,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

export default function SobreAppPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const { exportDataJSON, deleteAccount } = useFinancial();

  const [showTermsModal, setShowTermsModal] = useState(false);
  const [exportToast, setExportToast] = useState(false);

  const handleExportJSON = () => {
    const jsonString = exportDataJSON();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `ate_o_fim_do_mes_export_${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setExportToast(true);
    setTimeout(() => setExportToast(false), 3000);
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
            Sobre o App
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Informações sobre a plataforma, termos de uso e privacidade
          </p>
        </div>
      </div>

      {exportToast && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Backup JSON exportado com sucesso!</span>
        </div>
      )}

      {/* App Identity Card */}
      <div className="bg-white dark:bg-[#121324] border border-slate-100 dark:border-slate-800/80 rounded-3xl p-6 text-center shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3">
        <div className="mx-auto h-16 w-16 rounded-3xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
          <Sparkles className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-sora">
            Até o Fim do Mês
          </h2>
          <p className="text-xs font-medium text-violet-600 dark:text-violet-400">
            Versão 2.4.0 • Release Oficial
          </p>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
          Seu assistente financeiro inteligente feito para calcular exatamente quanto você pode gastar por dia e garantir que seu dinheiro dure até o próximo pagamento.
        </p>
      </div>

      {/* Termos & Políticas */}
      <div className="bg-white dark:bg-[#121324] border border-slate-100 dark:border-slate-800/80 rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-violet-500" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white font-sora">
            Privacidade e Legal
          </h2>
        </div>

        <div className="space-y-2 text-xs">
          <button
            type="button"
            onClick={() => setShowTermsModal(true)}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer text-left font-medium text-slate-900 dark:text-white"
          >
            <div className="flex items-center gap-2.5">
              <FileText className="h-4 w-4 text-slate-400" />
              <span>Termos de Uso e Política de Privacidade</span>
            </div>
            <ExternalLink className="h-4 w-4 text-slate-400" />
          </button>

          <div className="p-3.5 rounded-2xl bg-violet-50/50 dark:bg-violet-950/20 border border-violet-100/60 dark:border-violet-900/40 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
            <span className="font-semibold text-violet-700 dark:text-violet-300 block mb-0.5">
              Compromisso LGPD:
            </span>
            Seus dados são 100% confidenciais. Não compartilhamos, vendemos ou monetizamos suas informações financeiras com terceiros.
          </div>
        </div>
      </div>

      {/* Exportar Dados & Gestão de Conta */}
      <div className="bg-white dark:bg-[#121324] border border-slate-100 dark:border-slate-800/80 rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white font-sora">
          Gestão de Dados
        </h2>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={handleExportJSON}
            className="flex-1 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 py-3 px-4 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 cursor-pointer transition active:scale-98"
          >
            <Download className="h-4 w-4" />
            <span>Exportar Dados (JSON)</span>
          </button>

          <button
            type="button"
            onClick={handleDeleteAccount}
            className="rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 py-3 px-4 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center justify-center gap-2 cursor-pointer transition active:scale-98"
          >
            <Trash2 className="h-4 w-4" />
            <span>Excluir Conta</span>
          </button>
        </div>
      </div>

      {/* Modal de Termos de Uso */}
      {showTermsModal && (
        <div className="fixed inset-0 z-[100] app-modal-backdrop flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-[#121324] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 my-auto max-h-[calc(100dvh-1.5rem)] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-sora">
              Termos de Uso e Privacidade
            </h3>
            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
              <p>
                <strong>1. Finalidade:</strong> O <em>Até o Fim do Mês</em> é uma ferramenta de auxílio ao planejamento e controle financeiro pessoal, calculando estimativas e projeções com base nos valores informados pelo próprio usuário.
              </p>
              <p>
                <strong>2. Segurança e LGPD:</strong> Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você possui o direito de exportar, retificar e excluir integralmente seus dados a qualquer instante.
              </p>
              <p>
                <strong>3. Sem vínculo bancário direto:</strong> O aplicativo não realiza transações financeiras reais, TED, Pix ou pagamentos sem sua autorização bancária externa.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowTermsModal(false)}
              className="w-full rounded-2xl bg-[#121324] dark:bg-violet-600 text-white font-semibold text-xs py-3 cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
