'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CreditFooter } from '@/components/credit-footer';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.includes('@')) {
      setError('Por favor, informe um e-mail válido.');
      return;
    }

    setLoading(true);
    if (isSupabaseConfigured) {
      try {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || 'Não foi possível enviar o e-mail. Tente novamente.');
          setLoading(false);
          return;
        }
      } catch {
        setError('Falha de conexão. Verifique sua internet e tente novamente.');
        setLoading(false);
        return;
      }
    }
    setLoading(false);
    setSubmitted(true);
  };

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
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0e1026]/90 p-7 sm:p-9 shadow-[0_30px_90px_rgba(0,0,0,0.8)] backdrop-blur-2xl beam-card">
          <div className="text-center">
            <h1 className="text-2xl font-extrabold tracking-tight text-white font-sora">
              Recuperar senha
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              Digite seu e-mail para receber as instruções de redefinição de acesso.
            </p>
          </div>

          {submitted ? (
            <div className="mt-6 rounded-2xl bg-[#22ffb4]/10 border border-[#22ffb4]/30 p-5 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-[#22ffb4]" />
              <h3 className="mt-2 text-sm font-bold text-white font-sora">
                E-mail de recuperação enviado
              </h3>
              <p className="mt-1 text-xs text-slate-300">
                Se houver uma conta associada a <span className="font-mono text-[#22ffb4]">{email}</span>, você receberá um link seguro em instantes.
              </p>
              <Link
                href="/login"
                className="mt-5 inline-block rounded-xl bg-[#22ffb4] px-5 py-2.5 text-xs font-mono font-bold text-[#05060f] transition hover:bg-[#34ffbf] shadow-[0_0_20px_rgba(34,255,180,0.3)]"
              >
                Retornar ao Login
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
                  E-mail cadastrado
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    autoFocus
                    className="w-full rounded-xl border border-white/10 bg-[#07081a] py-2.5 pl-10 pr-3.5 text-xs text-white placeholder:text-slate-600 focus:border-[#5b8cff] focus:outline-hidden transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#5b8cff] py-3 text-xs font-mono font-bold text-white transition hover:bg-[#6e9aff] shadow-[0_0_20px_rgba(91,140,255,0.3)] active:scale-98 disabled:opacity-50"
              >
                {loading ? 'Enviando...' : 'Enviar link de recuperação'}
              </button>
            </form>
          )}
        </div>
      </main>

      <CreditFooter variant="app" />
    </div>
  );
}
