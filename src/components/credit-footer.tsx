import React from 'react';

interface CreditFooterProps {
  variant?: 'landing' | 'app';
  className?: string;
}

import { Heart } from 'lucide-react';

export function CreditFooter({ variant = 'app', className = '' }: CreditFooterProps) {
  if (variant === 'landing') {
    return (
      <footer className={`border-t border-white/10 bg-[#07081a]/90 backdrop-blur-xl py-12 relative overflow-hidden ${className}`}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600 text-xs font-black text-white shadow-sm">
                AF
              </div>
              <span className="font-bold tracking-tight text-white">
                Até o Fim do Mês
              </span>
            </div>

            <div className="text-xs text-[#a9a8c6] tracking-wider">
              © {new Date().getFullYear()} Até o Fim do Mês · Inteligência Financeira Pessoal
            </div>

            <div className="text-xs text-[#a9a8c6] flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5 text-rose-400" />
              <span>Desenvolvido por <strong className="text-white">Ana Toledo</strong></span>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className={`mt-auto py-4 text-center text-xs text-[#a9a8c6] ${className}`}>
      <div className="px-4 flex items-center justify-center gap-1.5 text-slate-400">
        <Heart className="h-3.5 w-3.5 text-slate-400" />
        <span>Desenvolvido por </span>
        <span className="font-semibold text-slate-200">Ana Toledo</span>
      </div>
    </footer>
  );
}
