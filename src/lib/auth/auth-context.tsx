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
  signup: (email: string, password?: string, displayName?: string) => Promise<{ error?: string }>;
  loginAsDemo: () => void;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  completeOnboarding: (settings: Partial<FinancialSettings>) => void;
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
            const profile = StorageRepository.getProfile(session.user.id);
            setUser(profile || {
              id: session.user.id,
              email: session.user.email || '',
              displayName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Usuário',
              isOnboarded: false,
              createdAt: session.user.created_at,
            });
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
          setUser(profile);
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
    if (isSupabaseConfigured && supabase && password) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setIsLoading(false);
        return { error: error.message };
      }
      if (data.user) {
        let profile = StorageRepository.getProfile(data.user.id);
        if (!profile) {
          const initial = createInitialUserData(data.user.id, email, email.split('@')[0]);
          StorageRepository.saveUserData(data.user.id, initial);
          profile = initial.profile;
        }
        setUser(profile);
        setIsDemoMode(false);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
        setIsLoading(false);
        return {};
      }
    }

    // Local authentication: strictly verify that account exists and credentials match
    const verification = StorageRepository.verifyCredentials(email, password);
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

  const signup = async (email: string, password?: string, displayName?: string): Promise<{ error?: string }> => {
    setIsLoading(true);
    if (isSupabaseConfigured && supabase && password) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: displayName || email.split('@')[0] },
        },
      });
      if (error) {
        setIsLoading(false);
        return { error: error.message };
      }
      if (data.user) {
        const initial = createInitialUserData(data.user.id, email, displayName || email.split('@')[0]);
        StorageRepository.saveUserData(data.user.id, initial);
        setUser(initial.profile);
        setIsDemoMode(false);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(initial.profile));
        setIsLoading(false);
        return {};
      }
    }

    // Local signup: register account and disallow duplicate emails
    if (!password || password.length < 6) {
      setIsLoading(false);
      return { error: 'A senha deve conter no mínimo 6 caracteres.' };
    }

    const reg = StorageRepository.registerAccount(email, password, displayName || email.split('@')[0]);
    if (reg.error || !reg.account) {
      setIsLoading(false);
      return { error: reg.error || 'Erro ao criar conta.' };
    }

    const userId = reg.account.userId;
    const initial = createInitialUserData(userId, email, displayName || email.split('@')[0]);
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
    if (!user) return;
    const updatedSettings = StorageRepository.updateSettings(user.id, settingsUpdates);
    const updatedProfile = StorageRepository.updateProfile(user.id, { isOnboarded: true });
    if (isSupabaseConfigured && user.id !== 'demo-user') {
      SupabaseDb.updateProfile(user.id, { isOnboarded: true }).catch(console.error);
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
