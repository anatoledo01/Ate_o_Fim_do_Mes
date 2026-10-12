'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ArrowLeftRight, Receipt, Target, User } from 'lucide-react';

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
        {/* 1. Curved SVG Background Pill */}
        <div className="absolute inset-0 nav-curved-container">
          <svg
            viewBox="0 0 1000 100"
            preserveAspectRatio="none"
            className="w-full h-full nav-curved-svg stroke-1"
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
          <div className="flex h-10 w-10 items-center justify-center rounded-full nav-floating-indicator">
            {React.createElement(NAV_ITEMS[currentIndex].icon, {
              className: 'h-4.5 w-4.5 nav-floating-icon stroke-[2.2]',
            })}
          </div>
        </div>

        {/* 3. Interactive Tab Buttons Grid - Pure Icons, No Text Labels */}
        <nav className="relative h-full grid grid-cols-5 z-10 items-center">
          {NAV_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            const isActive = idx === currentIndex;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                title={item.label}
                className="flex items-center justify-center h-full group focus:outline-hidden"
              >
                {!isActive ? (
                  <div className="flex items-center justify-center transition-transform duration-200 group-hover:scale-115 group-active:scale-90">
                    <Icon className="h-5 w-5 nav-inactive-icon stroke-[2] transition-colors" />
                  </div>
                ) : (
                  <div className="w-5 h-5 opacity-0 pointer-events-none" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
