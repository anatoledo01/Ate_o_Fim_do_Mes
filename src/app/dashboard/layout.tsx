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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#07081a]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-600 border-t-transparent shadow-md" />
          <span className="text-xs text-slate-500">Carregando telemetria financeira...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f7fb] dark:bg-[#07081a] transition-colors duration-200">
      <AppHeader />
      <main className="flex-1 pb-20">{children}</main>
      <CreditFooter variant="app" className="pb-24 text-center" />
      <CurvedNavBar />
    </div>
  );
}
