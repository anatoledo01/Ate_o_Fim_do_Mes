'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { AppHeader } from '@/components/app-header';
import { CurvedNavBar } from '@/components/curved-nav-bar';
import { CreditFooter } from '@/components/credit-footer';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07081a]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#22ffb4] border-t-transparent shadow-[0_0_15px_rgba(34,255,180,0.4)]" />
          <span className="text-xs font-mono text-slate-400">Carregando telemetria financeira...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden selection:bg-[#22ffb4]/30 selection:text-[#22ffb4] transition-colors duration-200">
      <div className="ambient-glow -z-10" />
      <AppHeader />
      <main className="flex-1 pb-28">{children}</main>
      <CurvedNavBar />
      <CreditFooter variant="app" className="pb-24 text-center" />
    </div>
  );
}
