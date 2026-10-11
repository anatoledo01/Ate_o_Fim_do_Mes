'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import {
  LayoutDashboard,
  Receipt,
  ArrowLeftRight,
  Target,
  Settings,
  Plus,
  LogOut,
  Wallet,
} from 'lucide-react';
import { TransactionModal } from './modals/transaction-modal';

export function AppHeader() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/transacoes', label: 'Transações', icon: ArrowLeftRight },
    { href: '/dashboard/contas', label: 'Contas', icon: Receipt },
    { href: '/dashboard/metas', label: 'Metas', icon: Target },
    { href: '/dashboard/configuracoes', label: 'Ajustes', icon: Settings },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#07081ac7] backdrop-blur-xl transition-colors">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#22ffb4] to-[#5b8cff] text-[#04110c] shadow-[0_0_20px_rgba(34,255,180,0.35)] transition group-hover:scale-105">
                <Wallet className="h-5 w-5 stroke-[2.5]" />
              </div>
              <div>
                <span className="block text-base font-extrabold tracking-tight text-white">
                  Até o Fim do Mês
                </span>
                <span className="hidden sm:block text-[11px] font-mono-tech text-[#a9a8c6] uppercase tracking-wider">
                  Controle de Gastos Diário
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2 pl-4">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                      isActive
                        ? 'bg-white/10 text-[#22ffb4] shadow-[inset_0_0_0_1px_rgba(34,255,180,0.3)]'
                        : 'text-[#c9c8e2] hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Quick Actions & User */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-tech-primary !py-2.5 !px-4 !text-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Nova Despesa</span>
            </button>

            {/* User info / Logout */}
            <div className="flex items-center gap-2 pl-3 border-l border-white/10">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-white leading-tight">
                  {user?.displayName || 'Usuário'}
                </span>
                <span className="text-[10px] font-mono-tech text-[#a9a8c6] truncate max-w-[120px]">
                  {user?.email}
                </span>
              </div>

              <button
                onClick={logout}
                title="Sair da conta"
                className="rounded-xl p-2 text-[#a9a8c6] hover:bg-white/10 hover:text-rose-400 transition"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Transaction Modal */}
      <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
