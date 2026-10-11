/**
 * Formatters for currency and dates conforming to Brazilian standards (PT-BR, BRL).
 */

/**
 * Format cents to Brazilian Real (R$ 1.234,56).
 * Handles negative values gracefully.
 */
export function formatCurrency(cents: number): string {
  const value = cents / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Real-time currency mask for BRL inputs (e.g. typing digits produces "1.234,56").
 * Formats user input as cents shifted into Brazilian Real decimal string.
 */
export function formatCurrencyInput(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits || digits === '0' || digits === '00') return '';
  
  const cents = parseInt(digits, 10);
  if (isNaN(cents) || cents === 0) return '';
  
  return (cents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Parses user input currency (e.g., "1.234,56" or "1234,56" or "100.50") into integer cents.
 */
export function parseCurrencyToCents(input: string | number): number {
  if (typeof input === 'number') {
    return Math.round(input * 100);
  }
  if (!input) return 0;
  
  // Clean string
  const cleaned = input.replace(/[^\d,-]/g, '').replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : Math.round(parsed * 100);
}

/**
 * Formats a Date object or YYYY-MM-DD string into DD/MM/AAAA.
 */
export function formatDateBR(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '';
  
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    const [year, month, day] = dateInput.split('-');
    return `${day}/${month}/${year}`;
  }
  
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '';
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  }).format(date);
}

/**
 * Returns current date in YYYY-MM-DD formatted in America/Sao_Paulo timezone.
 */
export function getTodayDateString(): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(now); // en-CA gives YYYY-MM-DD
}
