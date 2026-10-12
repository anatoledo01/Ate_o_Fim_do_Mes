'use client';

import React, { useRef } from 'react';
import { Calendar } from 'lucide-react';
import { formatDateBR } from '@/lib/formatters';

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  min?: string;
  max?: string;
  className?: string;
  id?: string;
  name?: string;
  placeholder?: string;
  disabled?: boolean;
  accentColor?: 'emerald' | 'violet';
}

export function DateInput({
  value,
  onChange,
  required,
  min,
  max,
  className = '',
  id,
  name,
  placeholder = 'DD/MM/AAAA',
  disabled = false,
  accentColor = 'emerald',
}: DateInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) return;
    if (e.target === inputRef.current) return;
    try {
      if (inputRef.current && 'showPicker' in HTMLInputElement.prototype) {
        inputRef.current.showPicker();
      } else {
        inputRef.current?.focus();
      }
    } catch {
      inputRef.current?.focus();
    }
  };

  const formattedDisplay = value ? formatDateBR(value) : '';
  const focusRing =
    accentColor === 'violet'
      ? 'group-focus-within:ring-2 group-focus-within:ring-violet-500'
      : 'group-focus-within:ring-2 group-focus-within:ring-emerald-500';

  return (
    <div
      onClick={handleClick}
      className={`relative w-full group ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div
        className={`w-full h-11 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 pl-10 pr-4 flex items-center justify-between transition ${focusRing} ${className}`}
      >
        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition shrink-0 pointer-events-none" />
        <span
          className={`text-xs sm:text-sm font-semibold truncate select-none ${
            formattedDisplay
              ? 'text-slate-900 dark:text-white'
              : 'text-slate-400 dark:text-slate-500 font-normal'
          }`}
        >
          {formattedDisplay || placeholder}
        </span>
      </div>

      <input
        ref={inputRef}
        type="date"
        id={id}
        name={name}
        value={value}
        min={min}
        max={max}
        required={required}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
        tabIndex={disabled ? -1 : 0}
      />
    </div>
  );
}
