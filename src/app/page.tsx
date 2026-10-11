'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { CreditFooter } from '@/components/credit-footer';
import {
  Wallet,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Smartphone,
  Clock,
  Lock,
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { loginAsDemo, user } = useAuth();

  const handleDemoClick = () => {
    loginAsDemo();
    router.push('/dashboard');
  };

  const marqueeItems = [
    'Dinheiro livre real',
    'Limite diário sugerido',
    'Sem dupla dedução em contas fixas',
    'Reserva de emergência blindada',
    'PWA instalável no celular',
    'Privacidade total e dados isolados',
    'Avisos de déficit transparentes',
    'Exportação em JSON e CSV (LGPD)',
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#07081a] text-[#f2f1fa] selection:bg-[#22ffb4]/30 selection:text-[#22ffb4] relative overflow-hidden">
      {/* Ambient background glows and streaks */}
      <div className="ambient-glow -z-10" />

      {/* Topbar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#07081ac7] backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#22ffb4] to-[#5b8cff] text-[#04110c] shadow-[0_0_20px_rgba(34,255,180,0.35)] transition group-hover:scale-105">
              <Wallet className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="block text-base font-extrabold tracking-tight text-white">
                Até o Fim do Mês
              </span>
              <span className="hidden sm:block text-[10px] font-mono-tech uppercase tracking-widest text-[#a9a8c6]">
                Planejamento Diário Inteligente
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#a9a8c6]">
            <a href="#como-funciona" className="hover:text-[#22ffb4] transition">
              Como Funciona
            </a>
            <a href="#beneficios" className="hover:text-[#22ffb4] transition">
              Benefícios
            </a>
            <a href="#funcionalidades" className="hover:text-[#22ffb4] transition">
              Recursos
            </a>
            <a href="#faq" className="hover:text-[#22ffb4] transition">
              Dúvidas
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <Link href="/dashboard" className="btn-tech-primary !py-2.5 !px-4 !text-xs">
                Acessar Meu Painel
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-full px-4 py-2 text-xs font-semibold text-[#c9c8e2] hover:text-white transition"
                >
                  Entrar
                </Link>
                <Link href="/cadastro" className="btn-tech-primary !py-2.5 !px-4 !text-xs">
                  Começar Grátis
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 overflow-hidden">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          {/* LED Pill Badge */}
          <div className="tech-pill">
            <span className="tech-led" />
            <span className="shimmer-text">Seu salário tem um plano. Agora você também.</span>
          </div>

          <h1 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-white max-w-4xl mx-auto leading-[1.12]">
            Seu dinheiro precisa durar <br />
            <span className="grad-line">até o próximo salário.</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-[#c9c8e2] max-w-2xl mx-auto leading-relaxed">
            Descubra todos os dias exatamente <strong>quanto você pode gastar hoje</strong> sem
            comprometer as contas que ainda vão vencer ou o resto do seu mês.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/cadastro" className="btn-tech-primary w-full sm:w-auto">
              Começar Gratuitamente
              <ArrowRight className="h-4 w-4" />
            </Link>

            <button onClick={handleDemoClick} className="btn-tech-ghost w-full sm:w-auto">
              <Sparkles className="h-4 w-4 text-[#22ffb4]" />
              Explorar Demonstração Interativa
            </button>
          </div>

          {/* Interactive Futuristic Card Mockup */}
          <div className="mt-16 mx-auto max-w-4xl rounded-3xl border border-white/10 bg-[#0e1026]/90 p-5 sm:p-7 shadow-[0_24px_80px_rgba(0,0,0,0.8)] backdrop-blur-2xl beam-card text-left">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[#ff4fd8]" />
                <div className="h-3 w-3 rounded-full bg-[#5b8cff]" />
                <div className="h-3 w-3 rounded-full bg-[#22ffb4]" />
                <span className="ml-2 text-xs font-mono-tech text-[#a9a8c6]">
                  PAINEL DIÁRIO · PRÓXIMO SALÁRIO EM 14 DIAS
                </span>
              </div>
              <span className="tech-pill !py-1 !px-2.5 !text-[11px] !border-[#22ffb4]/30 text-[#22ffb4]">
                Orçamento Equilibrado
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Card 1 */}
              <div className="tech-card p-6 border-white/10 bg-white/5">
                <span className="font-mono-tech text-xs uppercase tracking-wider text-[#a9a8c6]">
                  Dinheiro Disponível no Mês
                </span>
                <div className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
                  R$ 1.680,00
                </div>
                <p className="mt-2 text-xs text-[#c9c8e2] leading-relaxed">
                  Saldo real já deduzindo R$ 970,00 de faturas pendentes até o dia 25 e reserva blindada.
                </p>
              </div>

              {/* Card 2 */}
              <div className="tech-card p-6 border-[#22ffb4]/30 bg-gradient-to-br from-[#0e1026] to-[#161c42]">
                <div className="flex items-center justify-between">
                  <span className="font-mono-tech text-xs uppercase tracking-wider text-[#22ffb4]">
                    Limite Diário Sugerido
                  </span>
                  <span className="tech-pill !py-0.5 !px-2 !text-[10px] text-[#22ffb4]">
                    14 dias restantes
                  </span>
                </div>
                <div className="mt-2 text-3xl sm:text-4xl font-extrabold text-[#22ffb4]">
                  R$ 120,00
                  <span className="text-sm font-normal text-[#c9c8e2]"> / dia</span>
                </div>
                <p className="mt-2 text-xs text-[#c9c8e2] leading-relaxed">
                  Gaste até esse valor hoje para chegar ao próximo pagamento com tranquilidade e sem sustos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Infinite Marquee Ribbon */}
      <section className="marquee-ribbon border-y border-white/10 bg-[#07081a]/80 py-4">
        <div className="marquee-track">
          {[...marqueeItems, ...marqueeItems].map((item, idx) => (
            <div key={idx} className="flex items-center gap-6 px-6">
              <span className="font-mono-tech text-xs uppercase tracking-widest text-[#a9a8c6] whitespace-nowrap">
                {item}
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#22ffb4] shadow-[0_0_8px_#22ffb4]" />
            </div>
          ))}
        </div>
      </section>

      {/* Como Funciona em 3 Etapas */}
      <section id="como-funciona" className="py-24 relative">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="tech-pill">MÉTODO INTELIGENTE</span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white">
              Como funciona em 3 passos práticos
            </h2>
            <p className="mt-3 text-sm text-[#c9c8e2]">
              Sem planilhas intermináveis ou conceitos contábeis complexos. Apenas a clareza que você precisa no dia a dia.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="tech-card p-6">
              <div className="dot-chip" style={{ '--c': '#22ffb4' } as React.CSSProperties}>
                01
              </div>
              <h3 className="mt-5 text-lg font-bold text-white">Cadastre sua renda e data</h3>
              <p className="mt-2 text-xs text-[#c9c8e2] leading-relaxed">
                Informe o quanto você ganha (mensal, quinzenal, semanal ou variável) e em que dia você recebe o próximo salário.
              </p>
            </div>

            <div className="tech-card p-6">
              <div className="dot-chip" style={{ '--c': '#5b8cff' } as React.CSSProperties}>
                02
              </div>
              <h3 className="mt-5 text-lg font-bold text-white">Liste seus compromissos</h3>
              <p className="mt-2 text-xs text-[#c9c8e2] leading-relaxed">
                Adicione aluguel, luz, internet e faturas. O sistema reserva esses valores para que você nunca gaste o que já está comprometido.
              </p>
            </div>

            <div className="tech-card p-6">
              <div className="dot-chip" style={{ '--c': '#c058ff' } as React.CSSProperties}>
                03
              </div>
              <h3 className="mt-5 text-lg font-bold text-white">Acompanhe seu limite diário</h3>
              <p className="mt-2 text-xs text-[#c9c8e2] leading-relaxed">
                Abra o aplicativo todo dia para ver seu limite sugerido. Registre gastos em 5 segundos e viva sem ansiedade financeira.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefícios Reais */}
      <section id="beneficios" className="py-24 border-t border-white/10 bg-[#07081a]/50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="tech-pill">BENEFÍCIOS COMPROVADOS</span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white">
              Por que usar o Até o Fim do Mês?
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="tech-card p-6 flex gap-4">
              <div className="dot-chip !w-12 !h-12 !text-xs" style={{ '--c': '#5b8cff' } as React.CSSProperties}>
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Resposta rápida para decisões imediatas</h3>
                <p className="mt-2 text-xs text-[#c9c8e2] leading-relaxed">
                  Na dúvida se pode aceitar aquele jantar ou comprar algo novo? Uma olhada rápida no limite diário responde na hora sem planilhas.
                </p>
              </div>
            </div>

            <div className="tech-card p-6 flex gap-4">
              <div className="dot-chip !w-12 !h-12 !text-xs" style={{ '--c': '#22ffb4' } as React.CSSProperties}>
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Cálculo sem dupla dedução</h3>
                <p className="mt-2 text-xs text-[#c9c8e2] leading-relaxed">
                  Quando você paga uma conta agendada, o valor é liquidado de forma limpa, sem subtrair duas vezes do seu dinheiro disponível.
                </p>
              </div>
            </div>

            <div className="tech-card p-6 flex gap-4">
              <div className="dot-chip !w-12 !h-12 !text-xs" style={{ '--c': '#c058ff' } as React.CSSProperties}>
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Instale como aplicativo (PWA)</h3>
                <p className="mt-2 text-xs text-[#c9c8e2] leading-relaxed">
                  Adicione direto à tela inicial do celular. Funciona com rapidez nativa e permite registros até mesmo se você estiver sem sinal de internet.
                </p>
              </div>
            </div>

            <div className="tech-card p-6 flex gap-4">
              <div className="dot-chip !w-12 !h-12 !text-xs" style={{ '--c': '#ff4fd8' } as React.CSSProperties}>
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Privacidade total e exportação LGPD</h3>
                <p className="mt-2 text-xs text-[#c9c8e2] leading-relaxed">
                  Seus dados são estritamente isolados. Você pode exportar seu histórico completo ou excluir sua conta a qualquer momento em um clique.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 border-t border-white/10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="text-center">
            <span className="tech-pill">TIRE SUAS DÚVIDAS</span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white">
              Perguntas Frequentes
            </h2>
          </div>

          <div className="mt-12 space-y-4">
            <div className="tech-card p-6">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#22ffb4] shadow-[0_0_8px_#22ffb4]" />
                Como o aplicativo calcula o meu limite diário?
              </h3>
              <p className="mt-2 text-xs text-[#c9c8e2] leading-relaxed pl-4">
                Ele pega o seu saldo atual, soma eventuais entradas previstas, subtrai as contas que ainda vão vencer antes do próximo salário e desconta sua reserva de segurança. O valor resultante é dividido pelo número exato de dias restantes até o recebimento.
              </p>
            </div>

            <div className="tech-card p-6">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#5b8cff] shadow-[0_0_8px_#5b8cff]" />
                Preciso conectar minhas contas bancárias?
              </h3>
              <p className="mt-2 text-xs text-[#c9c8e2] leading-relaxed pl-4">
                Não! O Até o Fim do Mês não exige e não realiza conexões bancárias ou Open Finance. Você tem controle manual direto, garantindo 100% de privacidade sem expor senhas bancárias.
              </p>
            </div>

            <div className="tech-card p-6">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#c058ff] shadow-[0_0_8px_#c058ff]" />
                E se meu saldo for negativo ou as contas superarem a renda?
              </h3>
              <p className="mt-2 text-xs text-[#c9c8e2] leading-relaxed pl-4">
                O aplicativo nunca exibirá um limite diário positivo falso quando o orçamento estiver deficitário. Ele mostrará um aviso neutro sobre o déficit previsto para que você possa se reprogramar.
              </p>
            </div>

            <div className="tech-card p-6">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#ff4fd8] shadow-[0_0_8px_#ff4fd8]" />
                Posso instalar no meu iPhone ou Android?
              </h3>
              <p className="mt-2 text-xs text-[#c9c8e2] leading-relaxed pl-4">
                Sim! Sendo um PWA moderno, basta clicar em &quot;Adicionar à tela de início&quot; no Safari (iOS) ou &quot;Instalar aplicativo&quot; no Chrome (Android) para usar como um app nativo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 border-t border-white/10 bg-gradient-to-b from-[#07081a] to-[#0c0e2a] text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Chega de passar aperto antes do pagamento.
          </h2>
          <p className="mt-3 text-sm text-[#c9c8e2] max-w-lg mx-auto">
            Comece hoje mesmo e tenha clareza absoluta sobre suas decisões financeiras diárias.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/cadastro" className="btn-tech-primary">
              Criar Conta Gratuita
            </Link>
            <button onClick={handleDemoClick} className="btn-tech-ghost">
              Explorar Versão Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer with author credit */}
      <CreditFooter variant="landing" />
    </div>
  );
}
