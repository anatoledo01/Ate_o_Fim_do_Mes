'use client';

import React from 'react';
import { formatCurrency } from '@/lib/formatters';

interface CategoryItem {
  id: string;
  name: string;
  color?: string;
  totalCents: number;
  percentage: number;
}

interface CategoryDonutChartProps {
  categories: CategoryItem[];
  totalCents: number;
  hideValues?: boolean;
  onAddExpense?: () => void;
}

const DEFAULT_PALETTE = [
  '#8b5cf6', // Violet/Purple (Mobills/Nubank style)
  '#22ffb4', // Neon Mint
  '#5b8cff', // Electric Blue
  '#ff4fd8', // Magenta/Pink
  '#f59e0b', // Amber/Orange
  '#06b6d4', // Cyan
  '#64748b', // Slate
];

export function CategoryDonutChart({
  categories,
  totalCents,
  hideValues = false,
  onAddExpense,
}: CategoryDonutChartProps) {
  if (!categories || categories.length === 0 || totalCents === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <div className="relative flex h-32 w-32 items-center justify-center">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              className="donut-base-track"
              strokeWidth="14"
            />
          </svg>
          <span className="absolute text-[11px] font-mono-tech text-[#8f8ea8]">
            0%
          </span>
        </div>
        <p className="mt-3 text-xs text-[#a9a8c6]">Nenhuma despesa no período</p>
        {onAddExpense && (
          <button
            type="button"
            onClick={onAddExpense}
            className="mt-2.5 rounded-full bg-white/5 border border-white/10 px-3.5 py-1.5 text-[11px] font-mono-tech text-[#22ffb4] hover:bg-white/10 transition"
          >
            + Adicionar Gasto
          </button>
        )}
      </div>
    );
  }

  // Pre-process categories: top 4 + "Outros" if more than 4
  const topCategories = categories.slice(0, 4);
  const remaining = categories.slice(4);

  const displayItems = [...topCategories];
  if (remaining.length > 0) {
    const remainingTotal = remaining.reduce((acc, c) => acc + c.totalCents, 0);
    const remainingPct = remaining.reduce((acc, c) => acc + c.percentage, 0);
    displayItems.push({
      id: 'outros-agrupados',
      name: 'Outros',
      color: '#64748b',
      totalCents: remainingTotal,
      percentage: remainingPct,
    });
  }

  // SVG Donut calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius; // ~238.76
  let accumulatedPercent = 0;

  const slices = displayItems.map((cat, idx) => {
    const color = cat.color || DEFAULT_PALETTE[idx % DEFAULT_PALETTE.length];
    const pct = Math.max(0, cat.percentage);
    const strokeDasharray = `${(pct / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
    accumulatedPercent += pct;

    return {
      ...cat,
      color,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-2">
      {/* 1. Left side: Donut Chart SVG */}
      <div className="relative flex h-36 w-36 shrink-0 items-center justify-center">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          {/* Base track */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            className="donut-base-track"
            strokeWidth="14"
          />
          {/* Slices */}
          {slices.map((slice) => (
            <circle
              key={slice.id}
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={slice.color}
              strokeWidth="14"
              strokeDasharray={slice.strokeDasharray}
              strokeDashoffset={slice.strokeDashoffset}
              strokeLinecap="butt"
              className="transition-all duration-500 ease-out"
            />
          ))}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] uppercase font-mono-tech tracking-wider text-[#8f8ea8]">
            Despesas
          </span>
          <span className="text-xs font-bold text-white font-mono-tech">
            {hideValues ? '••••' : '100%'}
          </span>
        </div>
      </div>

      {/* 2. Right side: Categories legend with colored dots and values */}
      <div className="w-full flex-1 space-y-2.5">
        {displayItems.map((item, idx) => {
          const color = item.color || DEFAULT_PALETTE[idx % DEFAULT_PALETTE.length];
          return (
            <div
              key={item.id}
              className="flex items-center justify-between text-xs py-0.5 group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full shadow-xs"
                  style={{ backgroundColor: color }}
                />
                <span className="truncate font-medium text-[#f2f1fa] text-xs">
                  {item.name}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0 font-mono-tech text-right">
                <span className="font-semibold text-white">
                  {hideValues ? '••••••' : formatCurrency(item.totalCents)}
                </span>
                <span className="text-[10px] text-[#8f8ea8] w-7 text-right">
                  {item.percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
