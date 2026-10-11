'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, FinancialSettings } from '../types';
import { StorageRepository, createDemoUserData, createInitialUserData } from '../storage';
import { supabase, isSupabaseConfigured } from '../supabase/client';
import { SupabaseDb } from '../supabase/db';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isDemoMode: boolean;
  login: (email: string, password?: string) => Promise<{ error?: string }>;
  signup: (
    email: string,
    password?: string,
    displayName?: string,
    overwriteExisting?: boolean
  ) => Promise<{ error?: string }>;
  loginAsDemo: () => void;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  completeOnboarding: (settings: Partial<FinancialSettings>) => void;
  deleteRegisteredAccount: (email: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'ate_o_fim_do_mes_current_session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    async function initAuth() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            let profile = StorageRepository.getProfile(session.user.id);
            if (!profile) {
              profile = {
                id: session.user.id,
                email: session.user.email || '',
                displayName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Usuário',
                isOnboarded: false,
                createdAt: session.user.created_at,
              };
              const initial = createInitialUserData(session.user.id, profile.email, profile.displayName);
              StorageRepository.saveUserData(session.user.id, initial);
            }

            // Registrar a conta no armazenamento local para validação de duplicidade
            const accounts = StorageRepository.getRegisteredAccounts();
            const norm = (session.user.email || '').toLowerCase().trim();
            if (norm && !accounts[norm]) {
              accounts[norm] = {
                userId: session.user.id,
                email: norm,
                passwordHash: '',
                displayName: profile.displayName,
                createdAt: session.user.created_at || new Date().toISOString(),
              };
              localStorage.setItem('ate_o_fim_do_mes_auth_accounts', JSON.stringify(accounts));
            }

            setUser(profile);
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Supabase auth session error, falling back to local session', e);
        }
      }

      // Local / Offline session restoration
      const savedSession = localStorage.getItem(CURRENT_USER_KEY);
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession);
          if (parsed.id === 'demo-user') {
            setIsDemoMode(true);
          }
          const profile = StorageRepository.getProfile(parsed.id);
          setUser(profile || parsed);
        } catch {
          localStorage.removeItem(CURRENT_USER_KEY);
        }
      }
      setIsLoading(false);
    }

    initAuth();
  }, []);

  const login = async (email: string, password?: string): Promise<{ error?: string }> => {
    setIsLoading(true);
    const normalizedEmail = email.toLowerCase().trim();

    if (isSupabaseConfigured && supabase && password) {
      const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
      if (error) {
        setIsLoading(false);
        const msg = error.message.toLowerCase();
        if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
          return { error: 'E-mail ou senha incorretos. Tente novamente.' };
        }
        return { error: error.message };
      }
      if (data.user) {
        let profile = StorageRepository.getProfile(data.user.id);
        if (!profile) {
          const initial = createInitialUserData(data.user.id, normalizedEmail, normalizedEmail.split('@')[0]);
          StorageRepository.saveUserData(data.user.id, initial);
          profile = initial.profile;
        }

        // Garantir que a conta esteja registrada localmente
        const accounts = StorageRepository.getRegisteredAccounts();
        if (!accounts[normalizedEmail]) {
          accounts[normalizedEmail] = {
            userId: data.user.id,
            email: normalizedEmail,
            passwordHash: password ? btoa(password) : '',
            displayName: profile.displayName || normalizedEmail.split('@')[0],
            createdAt: new Date().toISOString(),
          };
          localStorage.setItem('ate_o_fim_do_mes_auth_accounts', JSON.stringify(accounts));
        }

        setUser(profile);
        setIsDemoMode(false);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
        setIsLoading(false);
        return {};
      }
    }

    // Local authentication: strictly verify that account exists and credentials match
    const verification = StorageRepository.verifyCredentials(normalizedEmail, password);
    if (verification.error || !verification.account) {
      setIsLoading(false);
      return { error: verification.error || 'Credenciais inválidas.' };
    }

    const userId = verification.account.userId;
    let profile = StorageRepository.getProfile(userId);
    if (!profile || !profile.email) {
      const initial = createInitialUserData(userId, verification.account.email, verification.account.displayName);
      StorageRepository.saveUserData(userId, initial);
      profile = initial.profile;
    }

    setUser(profile);
    setIsDemoMode(false);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
    setIsLoading(false);
    return {};
  };

  const signup = async (
    email: string,
    password?: string,
    displayName?: string,
    overwriteExisting: boolean = false
  ): Promise<{ error?: string }> => {
    setIsLoading(true);
    const normalizedEmail = email.toLowerCase().trim();

    // Se o usuário solicitou sobrescrever, limpa registros prévios desse e-mail
    if (overwriteExisting) {
      StorageRepository.deleteRegisteredAccount(normalizedEmail);
    }

    // 1. Bloqueio prévio: verificar se o e-mail já existe no dispositivo local
    if (!overwriteExisting && StorageRepository.isEmailRegistered(normalizedEmail)) {
      setIsLoading(false);
      return { error: 'Este e-mail já está cadastrado. Faça login na sua conta.' };
    }

    // 2. Cadastro no Supabase com proteção estrita contra duplicidade
    if (isSupabaseConfigured && supabase && password) {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: { full_name: displayName || normalizedEmail.split('@')[0] },
        },
      });

      if (error && !overwriteExisting) {
        setIsLoading(false);
        const errMsg = error.message.toLowerCase();
        if (
          errMsg.includes('already registered') ||
          errMsg.includes('already exists') ||
          errMsg.includes('unique') ||
          errMsg.includes('duplicate') ||
          error.status === 422 ||
          error.status === 400
        ) {
          return { error: 'Este e-mail já está cadastrado. Faça login na sua conta.' };
        }
        return { error: error.message };
      }

      // Detecção de duplicidade do Supabase Auth (anti-user enumeration):
      if (!overwriteExisting && data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        setIsLoading(false);
        return { error: 'Este e-mail já está cadastrado. Faça login na sua conta.' };
      }

      if (data.user) {
        // Registrar a conta no armazenamento local para impedir qualquer tentativa futura de duplicidade
        StorageRepository.registerAccount(
          normalizedEmail,
          password,
          displayName || normalizedEmail.split('@')[0],
          data.user.id,
          overwriteExisting
        );

        const initial = createInitialUserData(data.user.id, normalizedEmail, displayName || normalizedEmail.split('@')[0]);
        StorageRepository.saveUserData(data.user.id, initial);
        setUser(initial.profile);
        setIsDemoMode(false);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(initial.profile));
        setIsLoading(false);
        return {};
      }
    }

    // 3. Cadastro local (quando Supabase não configurado ou offline)
    if (!password || password.length < 6) {
      setIsLoading(false);
      return { error: 'A senha deve conter no mínimo 6 caracteres.' };
    }

    const reg = StorageRepository.registerAccount(
      normalizedEmail,
      password,
      displayName || normalizedEmail.split('@')[0],
      undefined,
      overwriteExisting
    );
    if (reg.error || !reg.account) {
      setIsLoading(false);
      return { error: reg.error || 'Erro ao criar conta.' };
    }

    const userId = reg.account.userId;
    const initial = createInitialUserData(userId, normalizedEmail, displayName || normalizedEmail.split('@')[0]);
    StorageRepository.saveUserData(userId, initial);
    setUser(initial.profile);
    setIsDemoMode(false);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(initial.profile));
    setIsLoading(false);
    return {};
  };

  const loginAsDemo = () => {
    setIsLoading(true);
    const demoData = createDemoUserData('demo-user');
    StorageRepository.saveUserData('demo-user', demoData);
    setUser(demoData.profile);
    setIsDemoMode(true);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(demoData.profile));
    setIsLoading(false);
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(CURRENT_USER_KEY);
    setUser(null);
    setIsDemoMode(false);
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = StorageRepository.updateProfile(user.id, updates);
    if (isSupabaseConfigured && user.id !== 'demo-user') {
      SupabaseDb.updateProfile(user.id, updates).catch(console.error);
    }
    setUser(updated);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));
  };

  const completeOnboarding = (settingsUpdates: Partial<FinancialSettings>) => {
    let currentUser = user;
    if (!currentUser && typeof window !== 'undefined') {
      const raw = localStorage.getItem(CURRENT_USER_KEY);
      if (raw) {
        try {
          currentUser = JSON.parse(raw);
        } catch {}
      }
    }
    if (!currentUser) {
      const guestId = 'usr_' + Math.random().toString(36).substring(2, 10);
      const initial = createInitialUserData(guestId, 'meu.acesso@local.app', 'Você');
      StorageRepository.saveUserData(guestId, initial);
      currentUser = initial.profile;
    }

    const updatedSettings = StorageRepository.updateSettings(currentUser.id, settingsUpdates);
    const updatedProfile = StorageRepository.updateProfile(currentUser.id, { isOnboarded: true });
    if (isSupabaseConfigured && currentUser.id !== 'demo-user') {
      SupabaseDb.updateProfile(currentUser.id, { isOnboarded: true }).catch(console.error);
      SupabaseDb.saveSettings(updatedSettings).catch(console.error);
    }
    setUser(updatedProfile);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedProfile));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isDemoMode,
        login,
        signup,
        loginAsDemo,
        logout,
        updateUserProfile,
        completeOnboarding,
        deleteRegisteredAccount: (email: string) => {
          StorageRepository.deleteRegisteredAccount(email);
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
