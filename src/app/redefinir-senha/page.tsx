'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CreditFooter } from '@/components/credit-footer';
import { ArrowLeft, Lock, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

function RedefinirSenhaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    async function verifyToken() {
      if (!isSupabaseConfigured || !supabase) {
        setVerifying(false);
        return;
      }

      if (tokenHash && type === 'recovery') {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'recovery',
        });
        if (verifyError) {
          setError('O link de recuperação expirou ou é inválido. Solicite um novo link.');
        }
      }
      setVerifying(false);
    }

    verifyToken();
  }, [tokenHash, type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('A senha deve conter no mínimo 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    if (isSupabaseConfigured && supabase) {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0e1026]/90 p-7 sm:p-9 shadow-[0_30px_90px_rgba(0,0,0,0.8)] backdrop-blur-2xl beam-card">
      <div className="text-center">
        <h1 className="text-2xl font-extrabold tracking-tight text-white font-sora">
          Criar Nova Senha
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Defina sua nova credencial de segurança para acessar sua conta.
        </p>
      </div>

      {verifying ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#22ffb4] border-t-transparent" />
          <span className="text-xs text-slate-400 font-mono">Verificando autorização...</span>
        </div>
      ) : submitted ? (
        <div className="mt-6 rounded-2xl bg-[#22ffb4]/10 border border-[#22ffb4]/30 p-5 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-[#22ffb4]" />
          <h3 className="mt-2 text-sm font-bold text-white font-sora">
            Senha atualizada com sucesso!
          </h3>
          <p className="mt-1 text-xs text-slate-300">
            Sua nova senha já está ativa. Você pode fazer login agora mesmo.
          </p>
          <Link
            href="/login"
            className="mt-5 inline-block rounded-xl bg-[#22ffb4] px-5 py-2.5 text-xs font-mono font-bold text-[#05060f] transition hover:bg-[#34ffbf] shadow-[0_0_20px_rgba(34,255,180,0.3)]"
          >
            Acessar Conta
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs font-mono text-rose-300">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold font-mono text-slate-400 mb-1.5">
              Nova Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo de 6 caracteres"
                required
                autoFocus
                className="w-full rounded-xl border border-white/10 bg-[#07081a] py-2.5 pl-10 pr-10 text-xs text-white placeholder:text-slate-600 focus:border-[#5b8cff] focus:outline-hidden transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold font-mono text-slate-400 mb-1.5">
              Confirmar Nova Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova senha"
                required
                className="w-full rounded-xl border border-white/10 bg-[#07081a] py-2.5 pl-10 pr-3.5 text-xs text-white placeholder:text-slate-600 focus:border-[#5b8cff] focus:outline-hidden transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#22ffb4] py-3 text-xs font-mono font-bold text-[#05060f] transition hover:bg-[#34ffbf] shadow-[0_0_20px_rgba(34,255,180,0.3)] active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Salvando...' : 'Redefinir e Entrar'}
          </button>
        </form>
      )}
    </div>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <div className="dark min-h-screen flex flex-col justify-between bg-[#07081a] text-[#f2f1fa] relative overflow-hidden">
      <div className="ambient-glow -z-10" />

      <header className="p-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao login
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <Suspense
          fallback={
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#22ffb4] border-t-transparent" />
              <span className="text-xs text-slate-400 font-mono">Carregando formulário...</span>
            </div>
          }
        >
          <RedefinirSenhaForm />
        </Suspense>
      </main>

      <CreditFooter variant="app" />
    </div>
  );
}
