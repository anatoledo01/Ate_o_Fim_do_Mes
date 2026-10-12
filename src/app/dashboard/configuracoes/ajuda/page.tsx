'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronDown,
  HelpCircle,
  MessageCircle,
  Mail,
  Send,
  CheckCircle2,
  BookOpen,
  Sparkles,
} from 'lucide-react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    id: 'calc',
    question: 'Como o Até o Fim do Mês calcula o valor diário disponível?',
    answer:
      'O cálculo considera seu saldo atual em conta menos as contas pendentes até o próximo salário e sua reserva de emergência. O valor líquido resultante é dividido exatamente pela quantidade de dias restantes até o próximo recebimento, dando a você um teto seguro para gastar por dia.',
  },
  {
    id: 'bills',
    question: 'O que acontece ao clicar em "Pagar" numa conta?',
    answer:
      'A conta é marcada como quitada e deixa de comprometer seu saldo futuro. Você pode conferir todas as contas pagas a qualquer momento na aba Contas > Pagas ou reabrí-las caso tenha marcado por engano.',
  },
  {
    id: 'goals',
    question: 'Como funcionam as Metas de Economia?',
    answer:
      'Você pode criar metas para objetivos como Reserva de Emergência, Viagens ou Compras. O valor poupado é acompanhado com barra de progresso visual em tempo real e percentual alcançado.',
  },
  {
    id: 'security',
    question: 'Meus dados bancários e transações estão seguros?',
    answer:
      'Sim! O aplicativo não exige nem compartilha senhas bancárias reais. Todos os dados são armazenados localmente e/ou em nuvem com criptografia segura, em total conformidade com a LGPD.',
  },
  {
    id: 'backup',
    question: 'Como faço para salvar um backup dos meus dados?',
    answer:
      'Vá em Configurações > Sobre o app e clique em "Exportar Meus Dados (JSON)". Um arquivo com todas as suas contas, transações e metas será baixado no seu dispositivo.',
  },
];

export default function AjudaPage() {
  const [openFaq, setOpenFaq] = useState<string | null>('calc');
  const [feedbackSubject, setFeedbackSubject] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const toggleFaq = (id: string) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) return;
    setFeedbackSent(true);
    setFeedbackSubject('');
    setFeedbackMessage('');
    setTimeout(() => setFeedbackSent(false), 4000);
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
            Ajuda e Suporte
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tire suas dúvidas e fale com nossa equipe de suporte
          </p>
        </div>
      </div>

      {feedbackSent && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Sua mensagem foi enviada com sucesso! Responderemos em breve.</span>
        </div>
      )}

      {/* Canais Rápidos de Atendimento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <a
          href="https://wa.me/5511999999999?text=Ol%C3%A1!%20Preciso%20de%20ajuda%20com%20o%20app%20At%C3%A9%20o%20Fim%20do%20M%C3%AAs"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white dark:bg-[#121324] border border-slate-100 dark:border-slate-800/80 rounded-3xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center gap-3 hover:border-emerald-300 dark:hover:border-emerald-500/40 transition group cursor-pointer"
        >
          <div className="h-10 w-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white font-sora">
              WhatsApp Suporte
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Atendimento em tempo real
            </div>
          </div>
        </a>

        <a
          href="mailto:suporte@ateofimdames.com.br?subject=Duvida%20no%20App%20Ate%20o%20Fim%20do%20Mes"
          className="bg-white dark:bg-[#121324] border border-slate-100 dark:border-slate-800/80 rounded-3xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center gap-3 hover:border-violet-300 dark:hover:border-violet-500/40 transition group cursor-pointer"
        >
          <div className="h-10 w-10 rounded-2xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white font-sora">
              E-mail de Suporte
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              suporte@ateofimdames.com.br
            </div>
          </div>
        </a>
      </div>

      {/* Perguntas Frequentes (FAQ) */}
      <div className="bg-white dark:bg-[#121324] border border-slate-100 dark:border-slate-800/80 rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="h-4 w-4 text-violet-500" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white font-sora">
            Perguntas Frequentes
          </h2>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-white/5">
          {FAQS.map((faq) => {
            const isOpen = openFaq === faq.id;
            return (
              <div key={faq.id} className="py-2.5">
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full flex items-center justify-between text-left text-xs font-semibold text-slate-900 dark:text-white hover:text-violet-600 dark:hover:text-violet-400 transition cursor-pointer py-1"
                >
                  <span className="pr-2">{faq.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-violet-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="pt-2 pb-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed animate-fade-in pl-1">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Enviar Mensagem Direta */}
      <div className="bg-white dark:bg-[#121324] border border-slate-100 dark:border-slate-800/80 rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3">
        <div className="flex items-center gap-2">
          <Send className="h-4 w-4 text-emerald-500" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white font-sora">
            Envie sua Mensagem ou Sugestão
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Tem alguma dúvida específica ou sugestão de melhoria? Escreva abaixo:
        </p>

        <form onSubmit={handleSendFeedback} className="space-y-3 pt-1">
          <div>
            <input
              type="text"
              value={feedbackSubject}
              onChange={(e) => setFeedbackSubject(e.target.value)}
              placeholder="Assunto (ex: Dúvida sobre vencimento)"
              className="w-full h-11 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 px-4 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div>
            <textarea
              rows={3}
              value={feedbackMessage}
              onChange={(e) => setFeedbackMessage(e.target.value)}
              placeholder="Escreva sua mensagem com detalhes..."
              required
              className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 p-4 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-[#121324] dark:bg-violet-600 text-white font-semibold text-xs py-3 shadow-md hover:bg-[#1e2038] dark:hover:bg-violet-700 active:scale-98 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Send className="h-4 w-4" />
            <span>Enviar Mensagem</span>
          </button>
        </form>
      </div>
    </div>
  );
}
