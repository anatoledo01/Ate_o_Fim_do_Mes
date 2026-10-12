'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { compressImageFile } from '@/lib/utils/image';
import {
  ChevronLeft,
  Camera,
  CheckCircle2,
  AlertCircle,
  User,
  Lock,
  Trash2,
  Save,
} from 'lucide-react';

export default function EditarPerfilPage() {
  const router = useRouter();
  const { user, updateUserProfile, updatePassword } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingAvatar(true);
      setErrorMessage(null);
      const compressedDataUrl = await compressImageFile(file, 320, 0.85);
      updateUserProfile({ avatarUrl: compressedDataUrl });
      setSuccessToast('Foto de perfil atualizada com sucesso!');
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao processar imagem.';
      setErrorMessage(msg);
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = () => {
    updateUserProfile({ avatarUrl: undefined });
    setSuccessToast('Foto de perfil removida!');
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessToast(null);

    if (!displayName.trim()) {
      setErrorMessage('Por favor, informe seu nome.');
      return;
    }

    setIsSaving(true);
    try {
      // 1. Atualizar dados básicos
      updateUserProfile({
        displayName: displayName.trim(),
        email: email.trim().toLowerCase(),
      });

      // 2. Se informou nova senha, atualiza
      if (newPassword) {
        if (newPassword.length < 6) {
          setErrorMessage('A nova senha deve ter no mínimo 6 caracteres.');
          setIsSaving(false);
          return;
        }
        if (newPassword !== confirmPassword) {
          setErrorMessage('A confirmação da nova senha não confere.');
          setIsSaving(false);
          return;
        }
        const pwdRes = await updatePassword(currentPassword, newPassword);
        if (pwdRes.error) {
          setErrorMessage(pwdRes.error);
          setIsSaving(false);
          return;
        }
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }

      setSuccessToast('Perfil atualizado com sucesso!');
      setTimeout(() => {
        setSuccessToast(null);
      }, 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar perfil.';
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-5 space-y-5 pb-28">
      {/* Header com seta de voltar */}
      <div className="flex items-center gap-3 pt-1">
        <Link
          href="/dashboard/configuracoes"
          className="p-1 rounded-full text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-sora">
            Editar Perfil
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Atualize sua foto, dados pessoais e senha de acesso
          </p>
        </div>
      </div>

      {/* Alertas */}
      {successToast && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 rounded-2xl p-3 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2 animate-fade-in">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Card de Foto de Perfil */}
      <div className="bg-white dark:bg-[#121324] border border-slate-100 dark:border-slate-800/80 rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
        <div className="relative group shrink-0">
          <div className="h-20 w-20 rounded-full bg-slate-100 dark:bg-white/10 border-2 border-violet-500/20 dark:border-white/10 flex items-center justify-center text-xl font-bold text-slate-700 dark:text-white overflow-hidden shadow-inner">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.displayName || 'Avatar'}
                className="h-full w-full object-cover"
              />
            ) : user?.displayName ? (
              user.displayName.slice(0, 2).toUpperCase()
            ) : (
              'AT'
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingAvatar}
            title="Alterar foto"
            className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-[#121324] dark:bg-violet-600 text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition cursor-pointer"
          >
            <Camera className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="space-y-1.5 flex-1">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white font-sora">
            Foto do Perfil
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Envie uma foto em formato JPG ou PNG (redimensionamento automático).
          </p>
          <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 hover:bg-violet-100 transition cursor-pointer"
            >
              {isUploadingAvatar ? 'Processando...' : 'Carregar nova foto'}
            </button>
            {user?.avatarUrl && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="px-3 py-1.5 rounded-full text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remover
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarFileSelect}
            className="hidden"
          />
        </div>
      </div>

      {/* Formulário de Dados Pessoais & Senha */}
      <form onSubmit={handleSaveProfile} className="space-y-4">
        {/* Card Dados Pessoais */}
        <div className="bg-white dark:bg-[#121324] border border-slate-100 dark:border-slate-800/80 rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white font-sora flex items-center gap-2">
            <User className="h-4 w-4 text-violet-500" /> Informações Básicas
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Nome Completo
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Seu nome completo"
                  required
                  className="w-full h-11 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 px-4 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                E-mail
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full h-11 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 px-4 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card Alterar Senha */}
        <div className="bg-white dark:bg-[#121324] border border-slate-100 dark:border-slate-800/80 rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white font-sora flex items-center gap-2">
            <Lock className="h-4 w-4 text-amber-500" /> Alterar Senha (Opcional)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Deixe em branco se você não deseja alterar a senha atual.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Senha Atual
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Informe sua senha atual"
                className="w-full h-11 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 px-4 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Nova Senha
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full h-11 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 px-4 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="w-full h-11 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 px-4 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Botão de Salvar */}
        <div className="flex gap-3 pt-2">
          <Link
            href="/dashboard/configuracoes"
            className="flex-1 rounded-2xl border border-slate-200 dark:border-white/10 bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 font-semibold text-xs py-3.5 text-center transition cursor-pointer"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 rounded-2xl bg-[#121324] dark:bg-violet-600 text-white font-semibold text-xs py-3.5 shadow-md hover:bg-[#1e2038] dark:hover:bg-violet-700 active:scale-98 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
