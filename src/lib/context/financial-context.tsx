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
    if (!user) {
      setSettings(null);
      setTransactions([]);
      setBills([]);
      setGoals([]);
      setCategories([]);
      setIsLoading(false);
      return;
    }

    // 1. Instant local load
    let loadedSettings = StorageRepository.getSettings(user.id);
    let loadedTx = StorageRepository.getTransactions(user.id);
    let loadedBills = StorageRepository.getBills(user.id);
    let loadedGoals = StorageRepository.getGoals(user.id);
    const loadedCats = StorageRepository.getAllCategories(user.id);

    // 2. If Supabase is configured, load from PostgreSQL tables and update cache
    if (isSupabaseConfigured && user.id !== 'demo-user') {
      try {
        const [cloudSettings, cloudTx, cloudBills, cloudGoals] = await Promise.all([
          SupabaseDb.getSettings(user.id),
          SupabaseDb.getTransactions(user.id),
          SupabaseDb.getBills(user.id),
          SupabaseDb.getGoals(user.id),
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

  // Transaction mutations
  const addTransaction = (tx: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) throw new Error('Usuário não autenticado');
    const created = StorageRepository.addTransaction(user.id, tx);
    if (isSupabaseConfigured && user.id !== 'demo-user') {
      SupabaseDb.addTransaction(created).catch(console.error);
    }
    refreshData();
    return created;
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    if (!user) return;
    StorageRepository.updateTransaction(user.id, id, updates);
    refreshData();
  };

  const deleteTransaction = (id: string) => {
    if (!user) return;
    StorageRepository.deleteTransaction(user.id, id);
    if (isSupabaseConfigured && user.id !== 'demo-user') {
      SupabaseDb.deleteTransaction(id).catch(console.error);
    }
    refreshData();
  };

  // Bills mutations
  const addBill = (bill: Omit<FinancialBill, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) throw new Error('Usuário não autenticado');
    const created = StorageRepository.addBill(user.id, bill);
    if (isSupabaseConfigured && user.id !== 'demo-user') {
      SupabaseDb.addBill(created).catch(console.error);
    }
    refreshData();
    return created;
  };

  const updateBill = (id: string, updates: Partial<FinancialBill>) => {
    if (!user) return;
    StorageRepository.updateBill(user.id, id, updates);
    if (isSupabaseConfigured && user.id !== 'demo-user') {
      SupabaseDb.updateBill(id, updates).catch(console.error);
    }
    refreshData();
  };

  const deleteBill = (id: string) => {
    if (!user) return;
    StorageRepository.deleteBill(user.id, id);
    if (isSupabaseConfigured && user.id !== 'demo-user') {
      SupabaseDb.deleteBill(id).catch(console.error);
    }
    refreshData();
  };

  const markBillAsPaid = (billId: string) => {
    if (!user) return null;
    const result = StorageRepository.markBillAsPaid(user.id, billId);
    if (result) {
      if (isSupabaseConfigured && user.id !== 'demo-user') {
        SupabaseDb.updateBill(billId, {
          status: result.bill.status,
          paidAt: result.bill.paidAt,
          paidTransactionId: result.bill.paidTransactionId,
        }).catch(console.error);
        SupabaseDb.addTransaction(result.transaction).catch(console.error);
      }
      refreshData();
    }
    return result;
  };

  // Goals mutations
  const addGoal = (goal: Omit<FinancialGoal, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) throw new Error('Usuário não autenticado');
    const created = StorageRepository.addGoal(user.id, goal);
    if (isSupabaseConfigured && user.id !== 'demo-user') {
      SupabaseDb.addGoal(created).catch(console.error);
    }
    refreshData();
    return created;
  };

  const updateGoal = (id: string, updates: Partial<FinancialGoal>) => {
    if (!user) return;
    StorageRepository.updateGoal(user.id, id, updates);
    if (isSupabaseConfigured && user.id !== 'demo-user') {
      SupabaseDb.updateGoal(id, updates).catch(console.error);
    }
    refreshData();
  };

  const deleteGoal = (id: string) => {
    if (!user) return;
    StorageRepository.deleteGoal(user.id, id);
    if (isSupabaseConfigured && user.id !== 'demo-user') {
      SupabaseDb.deleteGoal(id).catch(console.error);
    }
    refreshData();
  };

  // Settings
  const updateSettings = (updates: Partial<FinancialSettings>) => {
    if (!user) return;
    const updated = StorageRepository.updateSettings(user.id, updates);
    if (isSupabaseConfigured && user.id !== 'demo-user') {
      SupabaseDb.saveSettings(updated).catch(console.error);
    }
    refreshData();
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
