import React from 'react';

interface CreditFooterProps {
  variant?: 'landing' | 'app';
  className?: string;
}

export function CreditFooter({ variant = 'app', className = '' }: CreditFooterProps) {
  if (variant === 'landing') {
    return (
      <footer className={`border-t border-white/10 bg-[#07081a]/90 backdrop-blur-xl py-12 relative overflow-hidden ${className}`}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#22ffb4] to-[#5b8cff] text-xs font-black text-[#04110c] shadow-[0_0_16px_rgba(34,255,180,0.4)]">
                AF
              </div>
              <span className="font-bold tracking-tight text-white">
                Até o Fim do Mês
              </span>
            </div>

            <div className="text-xs text-[#a9a8c6] font-mono-tech tracking-wider">
              © {new Date().getFullYear()} Até o Fim do Mês · Inteligência Financeira Pessoal
            </div>

            <div className="text-xs font-mono-tech uppercase tracking-widest text-[#a9a8c6] flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#22ffb4] shadow-[0_0_10px_#22ffb4]" />
              Desenvolvido por <strong className="text-white hover:text-[#22ffb4] transition">Ana Toledo</strong>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className={`mt-auto border-t border-white/5 py-4 text-center text-xs text-[#a9a8c6] font-mono-tech ${className}`}>
      <div className="px-4 flex items-center justify-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[#22ffb4] shadow-[0_0_8px_#22ffb4]" />
        <span>Desenvolvido por </span>
        <span className="font-semibold text-white">Ana Toledo</span>
      </div>
    </footer>
  );
}
