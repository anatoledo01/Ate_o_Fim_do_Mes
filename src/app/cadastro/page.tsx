'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { CreditFooter } from '@/components/credit-footer';
import { Wallet, Sparkles, ArrowRight, Lock, Mail, User } from 'lucide-react';

export default function CadastroPage() {
  const router = useRouter();
  const { signup, loginAsDemo } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Por favor, informe seu nome.');
      return;
    }
    if (!email.includes('@')) {
      setError('Por favor, informe um e-mail válido.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve conter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    const res = await signup(email, password, name.trim());
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      router.push('/onboarding');
    }
  };

  const handleDemo = () => {
    loginAsDemo();
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#07081a] text-[#f2f1fa] relative overflow-hidden">
      <div className="ambient-glow -z-10" />

      <header className="p-6">
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#22ffb4] to-[#5b8cff] text-[#04110c] shadow-[0_0_16px_rgba(34,255,180,0.35)]">
            <Wallet className="h-5 w-5 stroke-[2.5]" />
          </div>
          <span className="font-extrabold text-sm tracking-tight text-white">Até o Fim do Mês</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0e1026]/90 p-7 sm:p-9 shadow-[0_30px_90px_rgba(0,0,0,0.8)] backdrop-blur-2xl beam-card">
          <div className="text-center">
            <div className="tech-pill !py-1 !px-3 !text-xs mb-3">
              <span className="tech-led" />
              <span>CADASTRO RÁPIDO</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              Crie sua conta gratuita
            </h1>
            <p className="mt-1 text-xs text-[#a9a8c6]">
              Comece a planejar seus gastos diários em menos de 2 minutos.
            </p>
          </div>

          {error && (
            <div className="mt-5 rounded-2xl bg-rose-950/50 border border-rose-500/30 p-3 text-xs font-medium text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-mono-tech uppercase tracking-wider text-[#a9a8c6] mb-1.5">
                Nome completo
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a9a8c6]" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  required
                  className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-10 pr-3.5 text-sm text-white focus:border-[#22ffb4] focus:ring-2 focus:ring-[#22ffb4]/20 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono-tech uppercase tracking-wider text-[#a9a8c6] mb-1.5">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a9a8c6]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-10 pr-3.5 text-sm text-white focus:border-[#22ffb4] focus:ring-2 focus:ring-[#22ffb4]/20 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono-tech uppercase tracking-wider text-[#a9a8c6] mb-1.5">
                Senha (mínimo 6 dígitos)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a9a8c6]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-10 pr-3.5 text-sm text-white focus:border-[#22ffb4] focus:ring-2 focus:ring-[#22ffb4]/20 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono-tech uppercase tracking-wider text-[#a9a8c6] mb-1.5">
                Confirme sua senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a9a8c6]" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-10 pr-3.5 text-sm text-white focus:border-[#22ffb4] focus:ring-2 focus:ring-[#22ffb4]/20 focus:outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-tech-primary w-full !mt-3"
            >
              {loading ? 'Criando conta...' : 'Cadastrar e Iniciar'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-8 flex flex-col items-center gap-3 border-t border-white/10 pt-6 text-center text-xs">
            <span className="text-[#a9a8c6]">
              Já possui uma conta?{' '}
              <Link href="/login" className="font-bold text-[#22ffb4] hover:underline">
                Fazer login
              </Link>
            </span>

            <button
              type="button"
              onClick={handleDemo}
              className="inline-flex items-center gap-1.5 text-xs font-mono-tech text-[#a9a8c6] hover:text-[#22ffb4] transition"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#22ffb4]" />
              Experimentar sem cadastro (Modo Demo)
            </button>
          </div>
        </div>
      </main>

      <CreditFooter variant="app" />
    </div>
  );
}
