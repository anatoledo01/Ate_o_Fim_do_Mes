'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { CreditFooter } from '@/components/credit-footer';
import { formatCurrency, parseCurrencyToCents, formatCurrencyInput } from '@/lib/formatters';
import { StorageRepository } from '@/lib/storage';
import { IncomeFrequency } from '@/lib/types';
import confetti from 'canvas-confetti';
import {
  Wallet,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Plus,
  Trash2,
  Sparkles,
} from 'lucide-react';

interface QuickBill {
  description: string;
  amountStr: string;
  dueDate: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoading, completeOnboarding } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user?.isOnboarded && !isSubmitting) {
      router.replace('/dashboard');
    }
  }, [user, isLoading, isSubmitting, router]);

  const [step, setStep] = useState(1);
  const totalSteps = 7;

  // Form states
  const [incomeStr, setIncomeStr] = useState('3.500,00');
  const [frequency, setFrequency] = useState<IncomeFrequency>('mensal');
  const [nextPayday, setNextPayday] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 15);
    return today.toISOString().split('T')[0];
  });
  const [currentBalanceStr, setCurrentBalanceStr] = useState('2.200,00');
  const [safetyReserveStr, setSafetyReserveStr] = useState('200,00');
  
  // Quick bills list
  const [billsList, setBillsList] = useState<QuickBill[]>([
    { description: 'Aluguel / Moradia', amountStr: '800,00', dueDate: nextPayday },
    { description: 'Contas (Água/Luz/Net)', amountStr: '150,00', dueDate: nextPayday },
  ]);
  const [newBillDesc, setNewBillDesc] = useState('');
  const [newBillAmount, setNewBillAmount] = useState('');

  const handleAddBill = () => {
    if (!newBillDesc.trim() || !newBillAmount.trim()) return;
    setBillsList([
      ...billsList,
      {
        description: newBillDesc.trim(),
        amountStr: newBillAmount.trim(),
        dueDate: nextPayday,
      },
    ]);
    setNewBillDesc('');
    setNewBillAmount('');
  };

  const handleRemoveBill = (index: number) => {
    setBillsList(billsList.filter((_, i) => i !== index));
  };

  const handleFinish = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const primaryIncomeCents = parseCurrencyToCents(incomeStr);
      const currentBalanceCents = parseCurrencyToCents(currentBalanceStr);
      const safetyReserveCents = parseCurrencyToCents(safetyReserveStr);

      // Identificar ou recuperar usuário ativo com segurança
      let targetUserId = user?.id;
      if (!targetUserId && typeof window !== 'undefined') {
        const raw = localStorage.getItem('ate_o_fim_do_mes_current_session');
        if (raw) {
          try {
            targetUserId = JSON.parse(raw).id;
          } catch {}
        }
      }
      if (!targetUserId) {
        targetUserId = 'usr_' + Math.random().toString(36).substring(2, 10);
        const initial = StorageRepository.loadUserData(targetUserId);
        StorageRepository.saveUserData(targetUserId, initial);
      }

      // 1. Salvar as contas cadastradas diretamente no repositório local
      for (const b of billsList) {
        const amountCents = parseCurrencyToCents(b.amountStr);
        if (amountCents > 0 && targetUserId) {
          try {
            StorageRepository.addBill(targetUserId, {
              type: 'payable',
              amountCents,
              description: b.description,
              dueDate: b.dueDate || nextPayday,
              categoryId: 'contas',
              recurrence: 'monthly',
              status: 'pending',
            });
          } catch (err) {
            console.warn('Erro ao salvar conta no onboarding:', err);
          }
        }
      }

      // 2. Concluir onboarding e salvar dados financeiros
      completeOnboarding({
        primaryIncomeCents,
        incomeFrequency: frequency,
        nextPayday,
        currentBalanceCents,
        safetyReserveCents,
        monthlyBudgetLimitCents: primaryIncomeCents,
      });

      // 3. Efeito visual comemorativo
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}

      // 4. Navegação infalível para o Dashboard
      router.replace('/dashboard');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 200);
    } catch (err) {
      console.error('Erro ao finalizar onboarding:', err);
      window.location.href = '/dashboard';
    }
  };

  const parsedBalance = parseCurrencyToCents(currentBalanceStr);
  const parsedBills = billsList.reduce((acc, b) => acc + parseCurrencyToCents(b.amountStr), 0);
  const parsedReserve = parseCurrencyToCents(safetyReserveStr);
  const previewAvailable = parsedBalance - parsedBills - parsedReserve;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#07081a] text-[#f2f1fa] relative overflow-hidden">
      <div className="ambient-glow -z-10" />

      {/* Top Bar with Step Progress */}
      <header className="border-b border-white/10 bg-[#07081ac7] backdrop-blur-xl px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#22ffb4] to-[#5b8cff] text-[#04110c] shadow-[0_0_14px_rgba(34,255,180,0.35)]">
              <Wallet className="h-4 w-4 stroke-[2.5]" />
            </div>
            <span className="font-bold text-xs tracking-tight text-white">Até o Fim do Mês</span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono-tech text-[#a9a8c6]">
            <span>Passo {step} de {totalSteps}</span>
            <div className="h-2 w-28 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#22ffb4] to-[#5b8cff] transition-all duration-300"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Wizard Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#0e1026]/90 p-7 sm:p-9 shadow-[0_30px_90px_rgba(0,0,0,0.8)] backdrop-blur-2xl beam-card">
          
          {/* STEP 1: Boas-vindas */}
          {step === 1 && (
            <div className="text-center py-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#22ffb4]/10 border border-[#22ffb4]/30 text-[#22ffb4] shadow-[0_0_24px_rgba(34,255,180,0.3)]">
                <Sparkles className="h-8 w-8 text-[#22ffb4]" />
              </div>
              <h2 className="mt-5 text-2xl font-extrabold text-white">
                Bem-vindo ao Até o Fim do Mês
              </h2>
              <p className="mt-2 text-sm text-[#c9c8e2] max-w-md mx-auto leading-relaxed">
                Vamos configurar suas preferências financeiras em poucas perguntas simples para responder:
              </p>
              <div className="my-6 rounded-2xl border border-[#22ffb4]/30 bg-[#22ffb4]/5 p-4 text-sm font-bold text-[#22ffb4] font-mono-tech shadow-[0_0_20px_rgba(34,255,180,0.15)]">
                &quot;Quanto eu posso gastar hoje sem passar aperto?&quot;
              </div>
              <p className="text-xs text-[#a9a8c6]">
                Leva menos de 2 minutos e você pode alterar qualquer informação mais tarde.
              </p>
            </div>
          )}

          {/* STEP 2: Renda Principal */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-white">
                Qual é a sua renda média principal?
              </h2>
              <p className="mt-1 text-xs text-[#a9a8c6]">
                Informe o valor líquido aproximado que costuma receber.
              </p>

              <div className="mt-6">
                <label className="block text-xs font-mono-tech uppercase tracking-wider text-[#a9a8c6] mb-1.5">
                  Valor da renda (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-[#a9a8c6]">
                    R$
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={incomeStr}
                    onChange={(e) => setIncomeStr(formatCurrencyInput(e.target.value))}
                    placeholder="3.500,00"
                    autoFocus
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-2xl font-bold text-white focus:border-[#22ffb4] focus:ring-2 focus:ring-[#22ffb4]/20 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Frequência e Próxima Data de Recebimento */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold text-white">
                Com que frequência e quando você recebe?
              </h2>
              <p className="mt-1 text-xs text-[#a9a8c6]">
                Isso ajuda a calcular exatamente a quantidade de dias até o próximo pagamento.
              </p>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-mono-tech uppercase tracking-wider text-[#a9a8c6] mb-2">
                    Frequência de recebimento
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['mensal', 'quinzenal', 'semanal', 'variavel'] as IncomeFrequency[]).map((freq) => (
                      <button
                        key={freq}
                        type="button"
                        onClick={() => setFrequency(freq)}
                        className={`rounded-2xl border p-3 text-xs font-mono-tech capitalize text-left transition ${
                          frequency === freq
                            ? 'border-[#22ffb4] bg-[#22ffb4]/15 text-[#22ffb4] shadow-[0_0_16px_rgba(34,255,180,0.25)]'
                            : 'border-white/10 bg-white/5 text-[#c9c8e2] hover:bg-white/10'
                        }`}
                      >
                        {freq === 'variavel' ? 'Renda Variável' : freq}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono-tech uppercase tracking-wider text-[#a9a8c6] mb-1.5">
                    Próxima data de recebimento
                  </label>
                  <input
                    type="date"
                    value={nextPayday}
                    onChange={(e) => setNextPayday(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 px-3.5 text-sm font-mono-tech text-white focus:border-[#22ffb4] focus:ring-2 focus:ring-[#22ffb4]/20 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Saldo Inicial Disponível */}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-bold text-white">
                Quanto você tem em conta hoje?
              </h2>
              <p className="mt-1 text-xs text-[#a9a8c6]">
                Seu saldo real neste momento para gerenciar até o próximo salário.
              </p>

              <div className="mt-6">
                <label className="block text-xs font-mono-tech uppercase tracking-wider text-[#a9a8c6] mb-1.5">
                  Saldo disponível agora (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-[#a9a8c6]">
                    R$
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={currentBalanceStr}
                    onChange={(e) => setCurrentBalanceStr(formatCurrencyInput(e.target.value))}
                    placeholder="2.200,00"
                    autoFocus
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-2xl font-bold text-white focus:border-[#22ffb4] focus:ring-2 focus:ring-[#22ffb4]/20 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Contas Fixas e Compromissos */}
          {step === 5 && (
            <div>
              <h2 className="text-xl font-bold text-white">
                Contas que ainda vão vencer
              </h2>
              <p className="mt-1 text-xs text-[#a9a8c6]">
                Valores que devem ser reservados para não serem gastos por engano.
              </p>

              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={newBillDesc}
                  onChange={(e) => setNewBillDesc(e.target.value)}
                  placeholder="Nome (Ex: Luz)"
                  className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-2.5 px-3 text-xs text-white focus:border-[#22ffb4] focus:outline-hidden"
                />
                <input
                  type="text"
                  inputMode="numeric"
                  value={newBillAmount}
                  onChange={(e) => setNewBillAmount(formatCurrencyInput(e.target.value))}
                  placeholder="Valor (R$)"
                  className="w-28 rounded-2xl border border-white/10 bg-white/5 py-2.5 px-3 text-xs text-white focus:border-[#22ffb4] focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleAddBill}
                  className="btn-tech-primary !py-2 !px-3"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 max-h-48 overflow-y-auto space-y-2 pr-1">
                {billsList.map((bill, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs"
                  >
                    <span className="font-medium text-white">{bill.description}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono-tech font-bold text-rose-400">
                        {formatCurrency(parseCurrencyToCents(bill.amountStr))}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveBill(index)}
                        className="text-[#a9a8c6] hover:text-rose-400 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6: Reserva de Segurança */}
          {step === 6 && (
            <div>
              <h2 className="text-xl font-bold text-white">
                Deseja definir uma reserva de segurança?
              </h2>
              <p className="mt-1 text-xs text-[#a9a8c6]">
                Um valor intocável para imprevistos. O aplicativo não permitirá que ele seja gasto no limite diário.
              </p>

              <div className="mt-6">
                <label className="block text-xs font-mono-tech uppercase tracking-wider text-[#a9a8c6] mb-1.5">
                  Reserva de segurança (Opcional)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-[#a9a8c6]">
                    R$
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={safetyReserveStr}
                    onChange={(e) => setSafetyReserveStr(formatCurrencyInput(e.target.value))}
                    placeholder="200,00"
                    autoFocus
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-2xl font-bold text-white focus:border-[#22ffb4] focus:ring-2 focus:ring-[#22ffb4]/20 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: Resumo antes de concluir */}
          {step === 7 && (
            <div>
              <h2 className="text-xl font-bold text-white">
                Resumo do seu planejamento
              </h2>
              <p className="mt-1 text-xs text-[#a9a8c6]">
                Veja como ficou o cálculo inicial do seu dinheiro disponível:
              </p>

              <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2.5 text-xs font-mono-tech">
                <div className="flex justify-between">
                  <span className="text-[#a9a8c6]">Saldo atual informado:</span>
                  <span className="font-bold text-white">{formatCurrency(parsedBalance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#a9a8c6]">Contas reservadas ({billsList.length}):</span>
                  <span className="font-bold text-rose-400">- {formatCurrency(parsedBills)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#a9a8c6]">Reserva de emergência:</span>
                  <span className="font-bold text-amber-300">- {formatCurrency(parsedReserve)}</span>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between font-bold text-sm">
                  <span className="text-white">Dinheiro livre no mês:</span>
                  <span className={previewAvailable >= 0 ? 'text-[#22ffb4]' : 'text-rose-400'}>
                    {formatCurrency(previewAvailable)}
                  </span>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-[#22ffb4]/30 bg-[#22ffb4]/10 p-3.5 text-white font-mono-tech">
                <span className="text-[10px] uppercase tracking-wider text-[#22ffb4]">
                  DATA DO PRÓXIMO RECEBIMENTO
                </span>
                <div className="text-base font-bold text-white mt-0.5">
                  {nextPayday ? nextPayday.split('-').reverse().join('/') : 'Não informada'}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="btn-tech-ghost !py-2.5 !px-4 !text-xs"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </button>
            ) : (
              <div />
            )}

            {step < totalSteps ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="btn-tech-primary !py-2.5 !px-5 !text-xs"
              >
                Avançar
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                disabled={isSubmitting}
                className="btn-tech-primary !py-2.5 !px-6 !text-xs disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <span>Acessando Painel...</span>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#04110c] border-t-transparent" />
                  </>
                ) : (
                  <>
                    <span>Acessar Meu Painel</span>
                    <CheckCircle2 className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>

      <CreditFooter variant="app" />
    </div>
  );
}
