'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ArrowLeftRight, Receipt, Target, MoreHorizontal } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Início', icon: Home },
  { href: '/dashboard/transacoes', label: 'Transações', icon: ArrowLeftRight },
  { href: '/dashboard/contas', label: 'Contas', icon: Receipt },
  { href: '/dashboard/metas', label: 'Metas', icon: Target },
  { href: '/dashboard/configuracoes', label: 'Mais', icon: MoreHorizontal },
];

export function CurvedNavBar() {
  const pathname = usePathname();

  return (
    <div
      className="bottom-nav-fixed fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#121324]/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 transition-colors shadow-[0_-4px_20px_rgba(0,0,0,0.04)]"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)',
      }}
    >
      <nav className="max-w-md mx-auto grid grid-cols-5 h-16 items-center px-1 pb-[env(safe-area-inset-bottom,0px)]">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={`flex flex-col items-center justify-center h-full py-1 group transition-colors select-none ${
                isActive
                  ? 'text-[#121324] dark:text-white font-bold'
                  : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 font-medium'
              }`}
            >
              <div className="relative flex items-center justify-center mb-0.5">
                <Icon
                  className={`h-5 w-5 transition-transform duration-150 ${
                    isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8] group-hover:scale-105'
                  }`}
                />
                {isActive && (
                  <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-[#121324] dark:bg-white" />
                )}
              </div>
              <span className="text-[10px] leading-none mt-0.5 tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
