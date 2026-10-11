'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ArrowLeftRight, Receipt, Target, Plus } from 'lucide-react';
import { TransactionModal } from './modals/transaction-modal';

export function MobileNav() {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navItems = [
    { href: '/dashboard', label: 'Início', icon: LayoutDashboard },
    { href: '/dashboard/transacoes', label: 'Extrato', icon: ArrowLeftRight },
    { action: true }, // Central Add Button
    { href: '/dashboard/contas', label: 'Contas', icon: Receipt },
    { href: '/dashboard/metas', label: 'Metas', icon: Target },
  ];

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/80 bg-white/95 backdrop-blur-lg safe-pb transition-colors dark:border-slate-800 dark:bg-[#151627]/95">
        <div className="flex h-16 items-center justify-around px-2">
          {navItems.map((item, idx) => {
            if (item.action) {
              return (
                <button
                  key="add-btn"
                  onClick={() => setIsModalOpen(true)}
                  aria-label="Registrar Despesa"
                  className="-mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#17182B] text-white shadow-lg ring-4 ring-[#F6F5F2] transition active:scale-90 dark:bg-[#C4B5FD] dark:text-[#17182B] dark:ring-[#0D0E1A]"
                >
                  <Plus className="h-6 w-6 stroke-[2.5]" />
                </button>
              );
            }

            const Icon = item.icon!;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href || idx}
                href={item.href!}
                className={`flex flex-col items-center justify-center gap-1 py-1 px-3 text-[10px] font-medium transition ${
                  isActive
                    ? 'text-[#17182B] font-bold dark:text-[#C4B5FD]'
                    : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.2]' : 'stroke-1.5'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
