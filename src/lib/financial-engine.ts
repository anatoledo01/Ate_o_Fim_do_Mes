import { FinancialSettings, Transaction, FinancialBill, FinancialOverview } from './types';
import { getTodayDateString } from './formatters';

export interface FinancialEngineInput {
  settings: FinancialSettings;
  transactions: Transaction[];
  bills: FinancialBill[];
  currentDate?: string; // YYYY-MM-DD, defaults to Sao Paulo today
}

/**
 * Calculates days remaining between today and the target payday.
 * Guaranteed to return an integer >= 1 to prevent division by zero.
 */
export function calculateDaysRemaining(nextPaydayStr: string, todayStr: string = getTodayDateString()): number {
  if (!nextPaydayStr) return 1;

  const [pYear, pMonth, pDay] = nextPaydayStr.split('-').map(Number);
  const [tYear, tMonth, tDay] = todayStr.split('-').map(Number);

  if (!pYear || !pMonth || !pDay || !tYear || !tMonth || !tDay) {
    return 1;
  }

  // Create date objects at midnight local time to avoid timezone drift
  const targetDate = new Date(pYear, pMonth - 1, pDay);
  const currentDate = new Date(tYear, tMonth - 1, tDay);

  const diffMs = targetDate.getTime() - currentDate.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  // If payday is today or in the past, treat as 1 day remaining (payday arrival)
  return diffDays > 0 ? diffDays : 1;
}

/**
 * Calculates the current real balance from the initial reference balance
 * and all completed transactions.
 */
export function calculateCurrentBalance(
  referenceBalanceCents: number,
  transactions: Transaction[]
): number {
  const netTransactions = transactions.reduce((acc, tx) => {
    if (tx.type === 'income') {
      return acc + tx.amountCents;
    } else if (tx.type === 'expense') {
      return acc - tx.amountCents;
    }
    return acc;
  }, 0);

  return referenceBalanceCents + netTransactions;
}

/**
 * Core Financial Calculation Engine:
 * Answers: "Quanto eu posso gastar hoje sem comprometer o resto do meu mês?"
 * 
 * Rules applied:
 * 1. Dinheiro disponível para planejamento = 
 *    saldo financeiro atual 
 *    + entradas previstas até o próximo recebimento 
 *    - compromissos financeiros ainda não pagos no período 
 *    - reserva de segurança.
 * 
 * 2. Limite diário sugerido = 
 *    dinheiro disponível para planejamento / quantidade de dias restantes até o próximo recebimento.
 * 
 * 3. Never divides by zero.
 * 4. Never displays positive daily limit if available money is negative or zero.
 * 5. Paid bills are excluded from pending bills (no double deductions).
 */
export function calculateFinancialOverview(input: FinancialEngineInput): FinancialOverview {
  const { settings, transactions, bills, currentDate = getTodayDateString() } = input;

  // 1. Current real balance
  const currentBalanceCents = calculateCurrentBalance(settings.currentBalanceCents, transactions);

  // 2. Filter pending commitments up to next payday
  // Only consider bills that are still 'pending' and due on or before nextPayday
  const nextPayday = settings.nextPayday;

  const pendingPayables = bills.filter(
    (b) => b.type === 'payable' && b.status === 'pending' && (!nextPayday || b.dueDate <= nextPayday)
  );
  const pendingBillsCents = pendingPayables.reduce((acc, b) => acc + b.amountCents, 0);

  // 3. Planned incomes up to next payday (pending receivables)
  const pendingReceivables = bills.filter(
    (b) => b.type === 'receivable' && b.status === 'pending' && (!nextPayday || b.dueDate <= nextPayday)
  );
  const plannedIncomesCents = pendingReceivables.reduce((acc, b) => acc + b.amountCents, 0);

  // 4. Safety reserve
  const safetyReserveCents = Math.max(0, settings.safetyReserveCents || 0);

  // 5. Available money for planning
  const availableForPlanningCents =
    currentBalanceCents + plannedIncomesCents - pendingBillsCents - safetyReserveCents;

  const isDeficit = availableForPlanningCents < 0;

  // 6. Days remaining until next payday
  const daysRemaining = calculateDaysRemaining(nextPayday, currentDate);

  // 7. Suggested daily limit
  let suggestedDailyLimitCents = 0;
  if (!isDeficit && availableForPlanningCents > 0) {
    suggestedDailyLimitCents = Math.floor(availableForPlanningCents / daysRemaining);
  }

  // 8. Period stats (transactions within current cycle)
  const expensesInPeriodCents = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((acc, tx) => acc + tx.amountCents, 0);

  const incomesInPeriodCents = transactions
    .filter((tx) => tx.type === 'income')
    .reduce((acc, tx) => acc + tx.amountCents, 0);

  return {
    currentBalanceCents,
    plannedIncomesCents,
    pendingBillsCents,
    safetyReserveCents,
    availableForPlanningCents,
    isDeficit,
    daysRemaining,
    suggestedDailyLimitCents,
    expensesInPeriodCents,
    incomesInPeriodCents,
    calculationFormula: {
      currentBalance: currentBalanceCents,
      plannedIncomes: plannedIncomesCents,
      pendingBills: pendingBillsCents,
      safetyReserve: safetyReserveCents,
      result: availableForPlanningCents,
    },
  };
}

/**
 * Calculates expenses grouped by category with totals and percentages.
 */
export function calculateCategoryBreakdown(
  transactions: Transaction[],
  categories: { id: string; name: string; color: string }[]
) {
  const expenseTransactions = transactions.filter((tx) => tx.type === 'expense');
  const totalExpenseCents = expenseTransactions.reduce((acc, tx) => acc + tx.amountCents, 0);

  const categoryMap = new Map<string, { id: string; name: string; color: string; totalCents: number }>();

  for (const cat of categories) {
    categoryMap.set(cat.id, {
      id: cat.id,
      name: cat.name,
      color: cat.color,
      totalCents: 0,
    });
  }

  for (const tx of expenseTransactions) {
    const entry = categoryMap.get(tx.categoryId) || {
      id: tx.categoryId,
      name: 'Outros',
      color: '#94A3B8',
      totalCents: 0,
    };
    entry.totalCents += tx.amountCents;
    categoryMap.set(tx.categoryId, entry);
  }

  return Array.from(categoryMap.values())
    .filter((c) => c.totalCents > 0)
    .sort((a, b) => b.totalCents - a.totalCents)
    .map((c) => ({
      ...c,
      percentage: totalExpenseCents > 0 ? Math.round((c.totalCents / totalExpenseCents) * 100) : 0,
    }));
}
