export type IncomeFrequency = 'mensal' | 'quinzenal' | 'semanal' | 'variavel';

export type TransactionType = 'expense' | 'income';

export type BillType = 'payable' | 'receivable';

export type BillStatus = 'pending' | 'paid' | 'received';

export type BillRecurrence = 'none' | 'monthly' | 'weekly' | 'yearly';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isCustom?: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  isOnboarded: boolean;
  createdAt: string;
}

export interface FinancialSettings {
  id?: string;
  userId: string;
  primaryIncomeCents: number; // in cents
  incomeFrequency: IncomeFrequency;
  nextPayday: string; // YYYY-MM-DD
  currentBalanceCents: number; // initial reference balance in cents
  safetyReserveCents: number; // in cents
  monthlyBudgetLimitCents?: number; // optional monthly cap
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amountCents: number; // in cents (always positive)
  description: string;
  categoryId: string;
  date: string; // YYYY-MM-DD
  notes?: string;
  billId?: string; // linked bill if created from payment
  createdAt: string;
}

export interface FinancialBill {
  id: string;
  userId: string;
  type: BillType;
  amountCents: number; // in cents
  description: string;
  dueDate: string; // YYYY-MM-DD
  categoryId: string;
  recurrence: BillRecurrence;
  status: BillStatus;
  paidTransactionId?: string;
  paidAt?: string;
  createdAt: string;
}

export interface FinancialGoal {
  id: string;
  userId: string;
  title: string;
  targetAmountCents: number;
  currentAmountCents: number;
  targetDate?: string; // YYYY-MM-DD
  category?: string;
  createdAt: string;
}

export interface FinancialOverview {
  // Balances
  currentBalanceCents: number;
  plannedIncomesCents: number;
  pendingBillsCents: number;
  safetyReserveCents: number;
  
  // Key metrics
  availableForPlanningCents: number; // can be negative if deficit
  isDeficit: boolean;
  daysRemaining: number;
  suggestedDailyLimitCents: number;
  
  // Period stats
  expensesInPeriodCents: number;
  incomesInPeriodCents: number;
  
  // Explanatory breakdown
  calculationFormula: {
    currentBalance: number;
    plannedIncomes: number;
    pendingBills: number;
    safetyReserve: number;
    result: number;
  };
}
