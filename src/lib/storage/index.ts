import {
  UserProfile,
  FinancialSettings,
  Transaction,
  FinancialBill,
  FinancialGoal,
  Category,
  IncomeFrequency,
} from '../types';
import { DEFAULT_CATEGORIES } from '../constants';
import { getTodayDateString } from '../formatters';

interface UserDataStore {
  profile: UserProfile;
  settings: FinancialSettings;
  transactions: Transaction[];
  bills: FinancialBill[];
  goals: FinancialGoal[];
  customCategories: Category[];
}

const STORAGE_PREFIX = 'ate_o_fim_do_mes_user_';

function getStorageKey(userId: string): string {
  return `${STORAGE_PREFIX}${userId}`;
}

/**
 * Creates default demo data for new exploration or demo accounts
 */
export function createInitialUserData(userId: string, email: string, displayName: string): UserDataStore {
  const today = getTodayDateString();
  const [year, month] = today.split('-').map(Number);
  
  // Calculate next payday (end of current month or next 5th)
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const nextPayday = `${nextYear}-${String(nextMonth).padStart(2, '0')}-05`;

  return {
    profile: {
      id: userId,
      email,
      displayName,
      isOnboarded: false,
      createdAt: new Date().toISOString(),
    },
    settings: {
      userId,
      primaryIncomeCents: 450000, // R$ 4.500,00
      incomeFrequency: 'mensal',
      nextPayday,
      currentBalanceCents: 280000, // R$ 2.800,00
      safetyReserveCents: 30000,  // R$ 300,00
      monthlyBudgetLimitCents: 400000,
      updatedAt: new Date().toISOString(),
    },
    transactions: [],
    bills: [],
    goals: [],
    customCategories: [],
  };
}

/**
 * Creates seed demonstration data for a quick interactive preview
 */
export function createDemoUserData(userId: string = 'demo-user'): UserDataStore {
  const today = getTodayDateString();
  const [y, m, d] = today.split('-').map(Number);
  
  // Set payday 12 days in the future
  const futureDate = new Date(y, m - 1, d + 12);
  const nextPayday = futureDate.toISOString().split('T')[0];

  return {
    profile: {
      id: userId,
      email: 'demo@ateofimdomes.com.br',
      displayName: 'Usuário Demo',
      isOnboarded: true,
      createdAt: new Date().toISOString(),
    },
    settings: {
      userId,
      primaryIncomeCents: 520000, // R$ 5.200,00
      incomeFrequency: 'mensal' as IncomeFrequency,
      nextPayday,
      currentBalanceCents: 315000, // R$ 3.150,00
      safetyReserveCents: 40000,  // R$ 400,00
      monthlyBudgetLimitCents: 450000,
      updatedAt: new Date().toISOString(),
    },
    transactions: [
      {
        id: 'tx-1',
        userId,
        type: 'expense',
        amountCents: 8550, // R$ 85,50
        description: 'Supermercado da semana',
        categoryId: 'alimentacao',
        date: today,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'tx-2',
        userId,
        type: 'expense',
        amountCents: 3200, // R$ 32,00
        description: 'Transporte por app',
        categoryId: 'transporte',
        date: today,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'tx-3',
        userId,
        type: 'expense',
        amountCents: 5490, // R$ 54,90
        description: 'Farmácia',
        categoryId: 'saude',
        date: today,
        createdAt: new Date().toISOString(),
      },
    ],
    bills: [
      {
        id: 'bill-1',
        userId,
        type: 'payable',
        amountCents: 85000, // R$ 850,00
        description: 'Aluguel & Condomínio',
        dueDate: nextPayday,
        categoryId: 'moradia',
        recurrence: 'monthly',
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'bill-2',
        userId,
        type: 'payable',
        amountCents: 12000, // R$ 120,00
        description: 'Internet Fibra',
        dueDate: today,
        categoryId: 'contas',
        recurrence: 'monthly',
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'bill-3',
        userId,
        type: 'payable',
        amountCents: 3990, // R$ 39,90
        description: 'Streaming de Música',
        dueDate: today,
        categoryId: 'assinaturas',
        recurrence: 'monthly',
        status: 'paid',
        paidAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
    ],
    goals: [
      {
        id: 'goal-1',
        userId,
        title: 'Reserva de Emergência (6 meses)',
        targetAmountCents: 1500000, // R$ 15.000,00
        currentAmountCents: 620000,  // R$ 6.200,00
        targetDate: `${y + 1}-06-30`,
        category: 'Segurança',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'goal-2',
        userId,
        title: 'Curso de Especialização UX',
        targetAmountCents: 240000, // R$ 2.400,00
        currentAmountCents: 180000, // R$ 1.800,00
        targetDate: `${y}-12-15`,
        category: 'Educação',
        createdAt: new Date().toISOString(),
      },
    ],
    customCategories: [],
  };
}

/**
 * Storage Repository for reading and persisting user financial data.
 */
export const StorageRepository = {
  loadUserData(userId: string): UserDataStore {
    if (typeof window === 'undefined') {
      return createDemoUserData(userId);
    }
    const key = getStorageKey(userId);
    const data = localStorage.getItem(key);
    if (!data) {
      const initial = userId === 'demo-user' ? createDemoUserData(userId) : createInitialUserData(userId, '', '');
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    try {
      return JSON.parse(data);
    } catch {
      const initial = createDemoUserData(userId);
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
  },

  saveUserData(userId: string, data: UserDataStore): void {
    if (typeof window === 'undefined') return;
    const key = getStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(data));
  },

  // Profile
  getProfile(userId: string): UserProfile {
    return this.loadUserData(userId).profile;
  },

  updateProfile(userId: string, updates: Partial<UserProfile>): UserProfile {
    const data = this.loadUserData(userId);
    data.profile = { ...data.profile, ...updates };
    this.saveUserData(userId, data);
    return data.profile;
  },

  // Settings
  getSettings(userId: string): FinancialSettings {
    return this.loadUserData(userId).settings;
  },

  updateSettings(userId: string, updates: Partial<FinancialSettings>): FinancialSettings {
    const data = this.loadUserData(userId);
    data.settings = { ...data.settings, ...updates, updatedAt: new Date().toISOString() };
    this.saveUserData(userId, data);
    return data.settings;
  },

  // Transactions
  getTransactions(userId: string): Transaction[] {
    return this.loadUserData(userId).transactions;
  },

  addTransaction(userId: string, tx: Omit<Transaction, 'id' | 'userId' | 'createdAt'>): Transaction {
    const data = this.loadUserData(userId);
    const newTx: Transaction = {
      ...tx,
      id: 'tx-' + Math.random().toString(36).substring(2, 9),
      userId,
      createdAt: new Date().toISOString(),
    };
    data.transactions.unshift(newTx);
    this.saveUserData(userId, data);
    return newTx;
  },

  updateTransaction(userId: string, id: string, updates: Partial<Transaction>): Transaction | null {
    const data = this.loadUserData(userId);
    const index = data.transactions.findIndex((t) => t.id === id);
    if (index === -1) return null;
    data.transactions[index] = { ...data.transactions[index], ...updates };
    this.saveUserData(userId, data);
    return data.transactions[index];
  },

  deleteTransaction(userId: string, id: string): boolean {
    const data = this.loadUserData(userId);
    const prevLen = data.transactions.length;
    data.transactions = data.transactions.filter((t) => t.id !== id);
    if (data.transactions.length !== prevLen) {
      this.saveUserData(userId, data);
      return true;
    }
    return false;
  },

  // Bills
  getBills(userId: string): FinancialBill[] {
    return this.loadUserData(userId).bills;
  },

  addBill(userId: string, bill: Omit<FinancialBill, 'id' | 'userId' | 'createdAt'>): FinancialBill {
    const data = this.loadUserData(userId);
    const newBill: FinancialBill = {
      ...bill,
      id: 'bill-' + Math.random().toString(36).substring(2, 9),
      userId,
      createdAt: new Date().toISOString(),
    };
    data.bills.push(newBill);
    this.saveUserData(userId, data);
    return newBill;
  },

  updateBill(userId: string, id: string, updates: Partial<FinancialBill>): FinancialBill | null {
    const data = this.loadUserData(userId);
    const index = data.bills.findIndex((b) => b.id === id);
    if (index === -1) return null;
    data.bills[index] = { ...data.bills[index], ...updates };
    this.saveUserData(userId, data);
    return data.bills[index];
  },

  deleteBill(userId: string, id: string): boolean {
    const data = this.loadUserData(userId);
    const prevLen = data.bills.length;
    data.bills = data.bills.filter((b) => b.id !== id);
    if (data.bills.length !== prevLen) {
      this.saveUserData(userId, data);
      return true;
    }
    return false;
  },

  /**
   * Marks a bill as paid (or received).
   * Atomically:
   * 1. Updates bill status to 'paid' (or 'received')
   * 2. Creates a corresponding transaction so it impacts the real balance
   * 3. Prevents duplicate transactions if already paid
   */
  markBillAsPaid(userId: string, billId: string): { bill: FinancialBill; transaction: Transaction } | null {
    const data = this.loadUserData(userId);
    const bill = data.bills.find((b) => b.id === billId);
    if (!bill || bill.status === 'paid' || bill.status === 'received') {
      return null;
    }

    const txType = bill.type === 'payable' ? 'expense' : 'income';
    const txId = 'tx-bill-' + Math.random().toString(36).substring(2, 9);

    const newTx: Transaction = {
      id: txId,
      userId,
      type: txType,
      amountCents: bill.amountCents,
      description: `Pagamento: ${bill.description}`,
      categoryId: bill.categoryId,
      date: getTodayDateString(),
      billId: bill.id,
      notes: `Liquidado da conta "${bill.description}"`,
      createdAt: new Date().toISOString(),
    };

    bill.status = bill.type === 'payable' ? 'paid' : 'received';
    bill.paidTransactionId = txId;
    bill.paidAt = new Date().toISOString();

    data.transactions.unshift(newTx);
    this.saveUserData(userId, data);

    return { bill, transaction: newTx };
  },

  // Goals
  getGoals(userId: string): FinancialGoal[] {
    return this.loadUserData(userId).goals;
  },

  addGoal(userId: string, goal: Omit<FinancialGoal, 'id' | 'userId' | 'createdAt'>): FinancialGoal {
    const data = this.loadUserData(userId);
    const newGoal: FinancialGoal = {
      ...goal,
      id: 'goal-' + Math.random().toString(36).substring(2, 9),
      userId,
      createdAt: new Date().toISOString(),
    };
    data.goals.push(newGoal);
    this.saveUserData(userId, data);
    return newGoal;
  },

  updateGoal(userId: string, id: string, updates: Partial<FinancialGoal>): FinancialGoal | null {
    const data = this.loadUserData(userId);
    const index = data.goals.findIndex((g) => g.id === id);
    if (index === -1) return null;
    data.goals[index] = { ...data.goals[index], ...updates };
    this.saveUserData(userId, data);
    return data.goals[index];
  },

  deleteGoal(userId: string, id: string): boolean {
    const data = this.loadUserData(userId);
    const prevLen = data.goals.length;
    data.goals = data.goals.filter((g) => g.id !== id);
    if (data.goals.length !== prevLen) {
      this.saveUserData(userId, data);
      return true;
    }
    return false;
  },

  // Categories
  getAllCategories(userId: string): Category[] {
    const data = this.loadUserData(userId);
    return [...DEFAULT_CATEGORIES, ...(data.customCategories || [])];
  },

  addCustomCategory(userId: string, category: Omit<Category, 'id' | 'isCustom'>): Category {
    const data = this.loadUserData(userId);
    const newCat: Category = {
      ...category,
      id: 'cat-' + Math.random().toString(36).substring(2, 9),
      isCustom: true,
    };
    data.customCategories.push(newCat);
    this.saveUserData(userId, data);
    return newCat;
  },

  // Reset or delete user data
  deleteAccountData(userId: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(getStorageKey(userId));
    // Also remove from registered accounts
    const accounts = this.getRegisteredAccounts();
    let updated = false;
    for (const email of Object.keys(accounts)) {
      if (accounts[email].userId === userId) {
        delete accounts[email];
        updated = true;
      }
    }
    if (updated) {
      localStorage.setItem('ate_o_fim_do_mes_auth_accounts', JSON.stringify(accounts));
    }
  },

  // Export data (LGPD compliance)
  exportUserDataJSON(userId: string): string {
    const data = this.loadUserData(userId);
    return JSON.stringify(data, null, 2);
  },

  // Registered Accounts for Local/Offline Auth
  getRegisteredAccounts(): Record<string, { userId: string; email: string; passwordHash: string; displayName: string; createdAt: string }> {
    if (typeof window === 'undefined') return {};
    const raw = localStorage.getItem('ate_o_fim_do_mes_auth_accounts');
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  },

  findRegisteredAccount(email: string) {
    if (!email) return null;
    const accounts = this.getRegisteredAccounts();
    return accounts[email.toLowerCase().trim()] || null;
  },

  isEmailRegistered(email: string): boolean {
    return !!this.findRegisteredAccount(email);
  },

  registerAccount(
    email: string,
    password?: string,
    displayName?: string,
    customUserId?: string
  ): { account?: { userId: string; email: string; passwordHash: string; displayName: string; createdAt: string }; error?: string } {
    if (typeof window === 'undefined') return { error: 'Ambiente inválido' };
    const normalizedEmail = email.toLowerCase().trim();
    if (!normalizedEmail) {
      return { error: 'E-mail inválido.' };
    }
    const accounts = this.getRegisteredAccounts();
    if (accounts[normalizedEmail]) {
      return { error: 'Este e-mail já está cadastrado. Faça login na sua conta.' };
    }
    const userId = customUserId || ('usr_' + Math.random().toString(36).substring(2, 10));
    const newAccount = {
      userId,
      email: normalizedEmail,
      passwordHash: password ? btoa(password) : '',
      displayName: displayName || normalizedEmail.split('@')[0],
      createdAt: new Date().toISOString(),
    };
    accounts[normalizedEmail] = newAccount;
    localStorage.setItem('ate_o_fim_do_mes_auth_accounts', JSON.stringify(accounts));
    return { account: newAccount };
  },

  verifyCredentials(email: string, password?: string): { account?: { userId: string; email: string; displayName: string }; error?: string } {
    const normalizedEmail = email.toLowerCase().trim();
    const account = this.findRegisteredAccount(normalizedEmail);
    if (!account) {
      return { error: 'E-mail não encontrado. Por favor, crie uma conta antes de entrar.' };
    }
    if (!password) {
      return { error: 'Por favor, informe sua senha.' };
    }
    if (account.passwordHash !== btoa(password)) {
      return { error: 'Senha incorreta. Tente novamente.' };
    }
    return { account };
  },
};
