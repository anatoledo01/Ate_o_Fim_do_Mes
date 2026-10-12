'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  FinancialSettings,
  Transaction,
  FinancialBill,
  FinancialGoal,
  Category,
  FinancialOverview,
} from '../types';
import { StorageRepository } from '../storage';
import { calculateFinancialOverview } from '../financial-engine';
import { useAuth } from '../auth/auth-context';
import { SupabaseDb } from '../supabase/db';
import { isSupabaseConfigured } from '../supabase/client';
import { getTodayDateString } from '../formatters';

interface FinancialContextType {
  settings: FinancialSettings | null;
  transactions: Transaction[];
  bills: FinancialBill[];
  goals: FinancialGoal[];
  categories: Category[];
  overview: FinancialOverview;
  isLoading: boolean;
  refreshData: () => Promise<void>;
  // Transactions
  addTransaction: (tx: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => Transaction;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  // Bills
  addBill: (bill: Omit<FinancialBill, 'id' | 'userId' | 'createdAt'>) => FinancialBill;
  updateBill: (id: string, updates: Partial<FinancialBill>) => void;
  deleteBill: (id: string) => void;
  markBillAsPaid: (billId: string) => { bill: FinancialBill; transaction: Transaction } | null;
  // Goals
  addGoal: (goal: Omit<FinancialGoal, 'id' | 'userId' | 'createdAt'>) => FinancialGoal;
  updateGoal: (id: string, updates: Partial<FinancialGoal>) => void;
  deleteGoal: (id: string) => void;
  // Settings & Account
  updateSettings: (updates: Partial<FinancialSettings>) => void;
  exportDataJSON: () => string;
  deleteAccount: () => void;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export function FinancialProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<FinancialSettings | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bills, setBills] = useState<FinancialBill[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = useCallback(async () => {
    const currentUserId =
      user?.id ||
      (typeof window !== 'undefined' &&
        JSON.parse(localStorage.getItem('ate_o_fim_do_mes_current_session') || '{}')?.id);

    if (!currentUserId) {
      setSettings(null);
      setTransactions([]);
      setBills([]);
      setGoals([]);
      setCategories([]);
      setIsLoading(false);
      return;
    }

    // 1. Instant local load
    let loadedSettings = StorageRepository.getSettings(currentUserId);
    let loadedTx = StorageRepository.getTransactions(currentUserId);
    let loadedBills = StorageRepository.getBills(currentUserId);
    let loadedGoals = StorageRepository.getGoals(currentUserId);
    const loadedCats = StorageRepository.getAllCategories(currentUserId);

    // 2. If Supabase is configured, load from PostgreSQL tables and update cache
    if (isSupabaseConfigured && currentUserId !== 'demo-user') {
      try {
        const [cloudSettings, cloudTx, cloudBills, cloudGoals] = await Promise.all([
          SupabaseDb.getSettings(currentUserId),
          SupabaseDb.getTransactions(currentUserId),
          SupabaseDb.getBills(currentUserId),
          SupabaseDb.getGoals(currentUserId),
        ]);

        if (cloudSettings) loadedSettings = cloudSettings;
        if (cloudTx && cloudTx.length > 0) loadedTx = cloudTx;
        if (cloudBills && cloudBills.length > 0) loadedBills = cloudBills;
        if (cloudGoals && cloudGoals.length > 0) loadedGoals = cloudGoals;
      } catch (err) {
        console.warn('Supabase fetch failed, continuing with local store', err);
      }
    }

    setSettings(loadedSettings);
    setTransactions(loadedTx);
    setBills(loadedBills);
    setGoals(loadedGoals);
    setCategories(loadedCats);
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Recalculate overview dynamically whenever data changes
  const overview = useMemo<FinancialOverview>(() => {
    if (!settings) {
      return {
        currentBalanceCents: 0,
        plannedIncomesCents: 0,
        pendingBillsCents: 0,
        safetyReserveCents: 0,
        availableForPlanningCents: 0,
        isDeficit: false,
        daysRemaining: 1,
        suggestedDailyLimitCents: 0,
        expensesInPeriodCents: 0,
        incomesInPeriodCents: 0,
        calculationFormula: {
          currentBalance: 0,
          plannedIncomes: 0,
          pendingBills: 0,
          safetyReserve: 0,
          result: 0,
        },
      };
    }

    return calculateFinancialOverview({
      settings,
      transactions,
      bills,
    });
  }, [settings, transactions, bills]);

  // Transaction mutations - Instant Optimistic State Updates
  const addTransaction = (tx: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => {
    const currentUserId =
      user?.id ||
      (typeof window !== 'undefined' &&
        JSON.parse(localStorage.getItem('ate_o_fim_do_mes_current_session') || '{}')?.id);
    if (!currentUserId) {
      console.warn('Operação cancelada: usuário não identificado.');
      return { ...tx, id: 'temp-' + Date.now(), userId: '', createdAt: new Date().toISOString() };
    }
    const created = StorageRepository.addTransaction(currentUserId, tx);
    // Atualização imediata no estado do React
    setTransactions((prev) => [created, ...prev]);
    if (isSupabaseConfigured && currentUserId !== 'demo-user') {
      SupabaseDb.addTransaction(created).catch(console.error);
    }
    return created;
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    const currentUserId =
      user?.id ||
      (typeof window !== 'undefined' &&
        JSON.parse(localStorage.getItem('ate_o_fim_do_mes_current_session') || '{}')?.id);
    if (!currentUserId) return;
    StorageRepository.updateTransaction(currentUserId, id, updates);
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
    if (isSupabaseConfigured && currentUserId !== 'demo-user') {
      SupabaseDb.updateTransaction(id, updates).catch(console.error);
    }
  };

  const deleteTransaction = (id: string) => {
    const currentUserId =
      user?.id ||
      (typeof window !== 'undefined' &&
        JSON.parse(localStorage.getItem('ate_o_fim_do_mes_current_session') || '{}')?.id);
    if (!currentUserId) return;
    StorageRepository.deleteTransaction(currentUserId, id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    if (isSupabaseConfigured && currentUserId !== 'demo-user') {
      SupabaseDb.deleteTransaction(id).catch(console.error);
    }
  };

  // Bills mutations - Instant Optimistic State Updates
  const addBill = (bill: Omit<FinancialBill, 'id' | 'userId' | 'createdAt'>) => {
    const currentUserId =
      user?.id ||
      (typeof window !== 'undefined' &&
        JSON.parse(localStorage.getItem('ate_o_fim_do_mes_current_session') || '{}')?.id);
    if (!currentUserId) {
      console.warn('Operação cancelada: usuário não identificado.');
      return { ...bill, id: 'temp-' + Date.now(), userId: '', createdAt: new Date().toISOString() };
    }
    const created = StorageRepository.addBill(currentUserId, {
      ...bill,
      status: bill.status || 'pending',
    });
    // Atualização imediata no estado do React
    setBills((prev) => [...prev, created]);
    if (isSupabaseConfigured && currentUserId !== 'demo-user') {
      SupabaseDb.addBill(created).catch(console.error);
    }
    return created;
  };

  const updateBill = (id: string, updates: Partial<FinancialBill>) => {
    const currentUserId =
      user?.id ||
      (typeof window !== 'undefined' &&
        JSON.parse(localStorage.getItem('ate_o_fim_do_mes_current_session') || '{}')?.id);
    if (!currentUserId) return;
    StorageRepository.updateBill(currentUserId, id, updates);
    setBills((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
    if (isSupabaseConfigured && currentUserId !== 'demo-user') {
      SupabaseDb.updateBill(id, updates).catch(console.error);
    }
  };

  const deleteBill = (id: string) => {
    const currentUserId =
      user?.id ||
      (typeof window !== 'undefined' &&
        JSON.parse(localStorage.getItem('ate_o_fim_do_mes_current_session') || '{}')?.id);
    if (!currentUserId) return;
    StorageRepository.deleteBill(currentUserId, id);
    setBills((prev) => prev.filter((b) => b.id !== id));
    if (isSupabaseConfigured && currentUserId !== 'demo-user') {
      SupabaseDb.deleteBill(id).catch(console.error);
    }
  };

  const markBillAsPaid = (billId: string) => {
    const currentUserId =
      user?.id ||
      (typeof window !== 'undefined' &&
        JSON.parse(localStorage.getItem('ate_o_fim_do_mes_current_session') || '{}')?.id);
    if (!currentUserId) return null;

    const targetBill = bills.find((b) => b.id === billId);

    // 1. Atualização otimista imediata no estado local do React
    setBills((prev) =>
      prev.map((b) =>
        b.id === billId
          ? {
              ...b,
              status: b.type === 'payable' ? 'paid' : 'received',
              paidAt: new Date().toISOString(),
            }
          : b
      )
    );

    if (targetBill) {
      const optimisticTx: Transaction = {
        id: 'tx-bill-' + Math.random().toString(36).substring(2, 9),
        userId: currentUserId,
        type: targetBill.type === 'payable' ? 'expense' : 'income',
        amountCents: targetBill.amountCents,
        description: `Pagamento: ${targetBill.description}`,
        categoryId: targetBill.categoryId,
        date: getTodayDateString(),
        billId: targetBill.id,
        notes: `Liquidado da conta "${targetBill.description}"`,
        createdAt: new Date().toISOString(),
      };
      setTransactions((prev) => [optimisticTx, ...prev.filter((t) => t.billId !== billId)]);
    }

    // 2. Persistência no armazenamento
    const result = StorageRepository.markBillAsPaid(currentUserId, billId);

    // 3. Sincronização em segundo plano no Supabase
    if (result && isSupabaseConfigured && currentUserId !== 'demo-user') {
      SupabaseDb.updateBill(billId, {
        status: result.bill.status,
        paidAt: result.bill.paidAt,
        paidTransactionId: result.bill.paidTransactionId,
      }).catch(console.error);
      SupabaseDb.addTransaction(result.transaction).catch(console.error);
    }

    return result || (targetBill ? { bill: { ...targetBill, status: 'paid' }, transaction: {} as Transaction } : null);
  };

  // Goals mutations - Instant Optimistic State Updates
  const addGoal = (goal: Omit<FinancialGoal, 'id' | 'userId' | 'createdAt'>) => {
    const currentUserId =
      user?.id ||
      (typeof window !== 'undefined' &&
        JSON.parse(localStorage.getItem('ate_o_fim_do_mes_current_session') || '{}')?.id);
    if (!currentUserId) {
      console.warn('Operação cancelada: usuário não identificado.');
      return { ...goal, id: 'temp-' + Date.now(), userId: '', createdAt: new Date().toISOString() };
    }
    const created = StorageRepository.addGoal(currentUserId, goal);
    // Atualização imediata no estado do React
    setGoals((prev) => [...prev, created]);
    if (isSupabaseConfigured && currentUserId !== 'demo-user') {
      SupabaseDb.addGoal(created).catch(console.error);
    }
    return created;
  };

  const updateGoal = (id: string, updates: Partial<FinancialGoal>) => {
    const currentUserId =
      user?.id ||
      (typeof window !== 'undefined' &&
        JSON.parse(localStorage.getItem('ate_o_fim_do_mes_current_session') || '{}')?.id);
    if (!currentUserId) return;
    StorageRepository.updateGoal(currentUserId, id, updates);
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates } : g))
    );
    if (isSupabaseConfigured && currentUserId !== 'demo-user') {
      SupabaseDb.updateGoal(id, updates).catch(console.error);
    }
  };

  const deleteGoal = (id: string) => {
    const currentUserId =
      user?.id ||
      (typeof window !== 'undefined' &&
        JSON.parse(localStorage.getItem('ate_o_fim_do_mes_current_session') || '{}')?.id);
    if (!currentUserId) return;
    StorageRepository.deleteGoal(currentUserId, id);
    setGoals((prev) => prev.filter((g) => g.id !== id));
    if (isSupabaseConfigured && currentUserId !== 'demo-user') {
      SupabaseDb.deleteGoal(id).catch(console.error);
    }
  };

  // Settings - Instant Optimistic State Updates
  const updateSettings = (updates: Partial<FinancialSettings>) => {
    const currentUserId =
      user?.id ||
      (typeof window !== 'undefined' &&
        JSON.parse(localStorage.getItem('ate_o_fim_do_mes_current_session') || '{}')?.id);
    if (!currentUserId) return;
    const updated = StorageRepository.updateSettings(currentUserId, updates);
    setSettings(updated);
    if (isSupabaseConfigured && currentUserId !== 'demo-user') {
      SupabaseDb.saveSettings(updated).catch(console.error);
    }
  };

  // Export
  const exportDataJSON = () => {
    if (!user) return '{}';
    return StorageRepository.exportUserDataJSON(user.id);
  };

  // Delete
  const deleteAccount = () => {
    if (!user) return;
    StorageRepository.deleteAccountData(user.id);
  };

  return (
    <FinancialContext.Provider
      value={{
        settings,
        transactions,
        bills,
        goals,
        categories,
        overview,
        isLoading,
        refreshData,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addBill,
        updateBill,
        deleteBill,
        markBillAsPaid,
        addGoal,
        updateGoal,
        deleteGoal,
        updateSettings,
        exportDataJSON,
        deleteAccount,
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
}

export function useFinancial() {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
}
