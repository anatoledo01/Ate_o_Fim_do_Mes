'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart3, Receipt, Target, User } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Início', icon: Home },
  { href: '/dashboard/transacoes', label: 'Extrato', icon: BarChart3 },
  { href: '/dashboard/contas', label: 'Contas', icon: Receipt },
  { href: '/dashboard/metas', label: 'Metas', icon: Target },
  { href: '/dashboard/configuracoes', label: 'Perfil', icon: User },
];

export function CurvedNavBar() {
  const pathname = usePathname();

  // Find active index based on route
  const activeIndex = NAV_ITEMS.findIndex((item) => {
    if (item.href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(item.href);
  });

  const currentIndex = activeIndex >= 0 ? activeIndex : 0;

  // cx coordinate in SVG viewBox (0 to 1000)
  // Each tab occupies 200 units (1000 / 5)
  // Center of tab i is (i * 200) + 100
  const cx = currentIndex * 200 + 100;

  // Smooth SVG curve path with a concave dip at cx
  const pathD = `
    M 28 22
    L ${cx - 46} 22
    C ${cx - 30} 22, ${cx - 25} 62, ${cx} 62
    C ${cx + 25} 62, ${cx + 30} 22, ${cx + 46} 22
    L 972 22
    Q 996 22 996 44
    L 996 76
    Q 996 100 972 100
    L 28 100
    Q 4 100 4 76
    L 4 44
    Q 4 22 28 22
    Z
  `;

  return (
    <div className="fixed bottom-3 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
      <div className="relative w-full max-w-md h-[72px] pointer-events-auto">
        {/* 1. Curved SVG Background Pill with Neon Glow Shadow */}
        <div className="absolute inset-0 drop-shadow-[0_10px_28px_rgba(34,255,180,0.12)]">
          <svg
            viewBox="0 0 1000 100"
            preserveAspectRatio="none"
            className="w-full h-full fill-[#0d0f28] stroke-white/10 stroke-1"
          >
            <path
              d={pathD}
              className="transition-[d] duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            />
          </svg>
        </div>

        {/* 2. Elevated Floating Circle Indicator - Sleek & Proportional */}
        <div
          className="absolute -top-2 -translate-x-1/2 transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] pointer-events-none"
          style={{ left: `${(currentIndex + 0.5) * 20}%` }}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#07081a] shadow-[0_0_18px_rgba(34,255,180,0.4)] ring-2 ring-[#22ffb4] border border-white/20">
            {React.createElement(NAV_ITEMS[currentIndex].icon, {
              className: 'h-4.5 w-4.5 text-[#22ffb4] stroke-[2.2]',
            })}
          </div>
        </div>

        {/* 3. Interactive Tab Buttons Grid */}
        <nav className="relative h-full grid grid-cols-5 pt-2 z-10">
          {NAV_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            const isActive = idx === currentIndex;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-end pb-2.5 group focus:outline-hidden"
              >
                {!isActive ? (
                  <div className="flex flex-col items-center gap-1 transition-transform group-active:scale-90">
                    <Icon className="h-4.5 w-4.5 text-[#a9a8c6] stroke-[1.8] transition-colors group-hover:text-white" />
                    <span className="text-[10px] font-mono-tech font-medium text-[#a9a8c6] transition-colors group-hover:text-white">
                      {item.label}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center animate-fade-in">
                    <span className="text-[10px] font-mono-tech font-bold text-[#22ffb4] tracking-tight">
                      {item.label}
                    </span>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
