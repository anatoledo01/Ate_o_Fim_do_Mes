'use client';

import React from 'react';
import { useAuth } from '../lib/auth/auth-context';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export function DemoBadge() {
  const { isDemoMode } = useAuth();

  if (!isDemoMode) return null;

  return (
    <div className="border-b border-amber-500/30 bg-[#161208]/90 px-4 py-2 text-xs text-amber-200 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 shrink-0 text-amber-400" />
          <span>
            <strong className="font-mono-tech text-amber-300">MODO DEMO ATIVO:</strong> Dados de demonstração para explorar o aplicativo.
          </span>
        </div>
        <Link
          href="/cadastro"
          className="shrink-0 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-1 text-xs font-bold text-black transition hover:brightness-110"
        >
          Criar minha conta real
        </Link>
      </div>
    </div>
  );
}
