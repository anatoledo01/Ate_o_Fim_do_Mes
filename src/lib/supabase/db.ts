import { supabase, isSupabaseConfigured } from './client';
import {
  FinancialSettings,
  Transaction,
  FinancialBill,
  FinancialGoal,
  UserProfile,
} from '../types';

/**
 * Service to sync financial data directly with Supabase Postgres tables.
 */
export const SupabaseDb = {
  // Profiles
  async getProfile(userId: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) return null;
    return {
      id: data.id,
      email: data.email,
      displayName: data.display_name || data.email.split('@')[0],
      avatarUrl: data.avatar_url,
      isOnboarded: data.is_onboarded,
      createdAt: data.created_at,
    };
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    await supabase
      .from('profiles')
      .update({
        display_name: updates.displayName,
        is_onboarded: updates.isOnboarded,
      })
      .eq('id', userId);
  },

  // Settings
  async getSettings(userId: string): Promise<FinancialSettings | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data, error } = await supabase
      .from('financial_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) return null;
    return {
      id: data.id,
      userId: data.user_id,
      primaryIncomeCents: Number(data.primary_income_cents),
      incomeFrequency: data.income_frequency,
      nextPayday: data.next_payday,
      currentBalanceCents: Number(data.current_balance_cents),
      safetyReserveCents: Number(data.safety_reserve_cents),
      monthlyBudgetLimitCents: data.monthly_budget_limit_cents ? Number(data.monthly_budget_limit_cents) : undefined,
      updatedAt: data.updated_at,
    };
  },

  async saveSettings(settings: FinancialSettings): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    await supabase.from('financial_settings').upsert({
      user_id: settings.userId,
      primary_income_cents: settings.primaryIncomeCents,
      income_frequency: settings.incomeFrequency,
      next_payday: settings.nextPayday,
      current_balance_cents: settings.currentBalanceCents,
      safety_reserve_cents: settings.safetyReserveCents,
      monthly_budget_limit_cents: settings.monthlyBudgetLimitCents || 0,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
  },

  // Transactions
  async getTransactions(userId: string): Promise<Transaction[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error || !data) return [];
    return data.map((t) => ({
      id: t.id,
      userId: t.user_id,
      type: t.type,
      amountCents: Number(t.amount_cents),
      description: t.description,
      categoryId: t.category_id,
      date: t.date,
      notes: t.notes,
      billId: t.bill_id,
      createdAt: t.created_at,
    }));
  },

  async addTransaction(tx: Transaction): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    await supabase.from('transactions').insert({
      id: tx.id.startsWith('tx-') ? undefined : tx.id,
      user_id: tx.userId,
      type: tx.type,
      amount_cents: tx.amountCents,
      description: tx.description,
      category_id: tx.categoryId,
      date: tx.date,
      notes: tx.notes,
      bill_id: tx.billId,
    });
  },

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    const mapped: Record<string, unknown> = {};
    if (updates.type !== undefined) mapped.type = updates.type;
    if (updates.amountCents !== undefined) mapped.amount_cents = updates.amountCents;
    if (updates.description !== undefined) mapped.description = updates.description;
    if (updates.categoryId !== undefined) mapped.category_id = updates.categoryId;
    if (updates.date !== undefined) mapped.date = updates.date;
    if (updates.notes !== undefined) mapped.notes = updates.notes;
    if (updates.billId !== undefined) mapped.bill_id = updates.billId;
    if (Object.keys(mapped).length === 0) return;

    await supabase.from('transactions').update(mapped).eq('id', id);
  },

  async deleteTransaction(id: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    await supabase.from('transactions').delete().eq('id', id);
  },

  // Bills
  async getBills(userId: string): Promise<FinancialBill[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    const { data, error } = await supabase
      .from('financial_bills')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true });

    if (error || !data) return [];
    return data.map((b) => ({
      id: b.id,
      userId: b.user_id,
      type: b.type,
      amountCents: Number(b.amount_cents),
      description: b.description,
      dueDate: b.due_date,
      categoryId: b.category_id,
      recurrence: b.recurrence,
      status: b.status,
      paidTransactionId: b.paid_transaction_id,
      paidAt: b.paid_at,
      createdAt: b.created_at,
    }));
  },

  async addBill(bill: FinancialBill): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    await supabase.from('financial_bills').insert({
      id: bill.id.startsWith('bill-') ? undefined : bill.id,
      user_id: bill.userId,
      type: bill.type,
      amount_cents: bill.amountCents,
      description: bill.description,
      due_date: bill.dueDate,
      category_id: bill.categoryId,
      recurrence: bill.recurrence,
      status: bill.status,
    });
  },

  async updateBill(id: string, updates: Partial<FinancialBill>): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    const mapped: Record<string, unknown> = {};
    if (updates.status) mapped.status = updates.status;
    if (updates.paidAt) mapped.paid_at = updates.paidAt;
    if (updates.paidTransactionId) mapped.paid_transaction_id = updates.paidTransactionId;
    if (updates.amountCents) mapped.amount_cents = updates.amountCents;
    if (updates.description) mapped.description = updates.description;
    if (updates.dueDate) mapped.due_date = updates.dueDate;

    await supabase.from('financial_bills').update(mapped).eq('id', id);
  },

  async deleteBill(id: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    await supabase.from('financial_bills').delete().eq('id', id);
  },

  // Goals
  async getGoals(userId: string): Promise<FinancialGoal[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    const { data, error } = await supabase
      .from('financial_goals')
      .select('*')
      .eq('user_id', userId);

    if (error || !data) return [];
    return data.map((g) => ({
      id: g.id,
      userId: g.user_id,
      title: g.title,
      targetAmountCents: Number(g.target_amount_cents),
      currentAmountCents: Number(g.current_amount_cents),
      targetDate: g.target_date,
      category: g.category,
      createdAt: g.created_at,
    }));
  },

  async addGoal(goal: FinancialGoal): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    await supabase.from('financial_goals').insert({
      id: goal.id.startsWith('goal-') ? undefined : goal.id,
      user_id: goal.userId,
      title: goal.title,
      target_amount_cents: goal.targetAmountCents,
      current_amount_cents: goal.currentAmountCents,
      target_date: goal.targetDate,
      category: goal.category,
    });
  },

  async updateGoal(id: string, updates: Partial<FinancialGoal>): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    const mapped: Record<string, unknown> = {};
    if (updates.currentAmountCents !== undefined) mapped.current_amount_cents = updates.currentAmountCents;
    if (updates.targetAmountCents !== undefined) mapped.target_amount_cents = updates.targetAmountCents;
    if (updates.title) mapped.title = updates.title;

    await supabase.from('financial_goals').update(mapped).eq('id', id);
  },

  async deleteGoal(id: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    await supabase.from('financial_goals').delete().eq('id', id);
  },
};
