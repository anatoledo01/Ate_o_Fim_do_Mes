import { Category } from './types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'moradia', name: 'Moradia', icon: 'Home', color: '#6366F1' },
  { id: 'alimentacao', name: 'Alimentação', icon: 'Utensils', color: '#F59E0B' },
  { id: 'transporte', name: 'Transporte', icon: 'Car', color: '#3B82F6' },
  { id: 'saude', name: 'Saúde', icon: 'HeartPulse', color: '#EC4899' },
  { id: 'educacao', name: 'Educação', icon: 'GraduationCap', color: '#8B5CF6' },
  { id: 'lazer', name: 'Lazer', icon: 'Smile', color: '#10B981' },
  { id: 'compras', name: 'Compras', icon: 'ShoppingBag', color: '#F97316' },
  { id: 'assinaturas', name: 'Assinaturas', icon: 'Tv', color: '#A855F7' },
  { id: 'contas', name: 'Contas e serviços', icon: 'Receipt', color: '#64748B' },
  { id: 'outros', name: 'Outros', icon: 'MoreHorizontal', color: '#94A3B8' },
];

export const FREQUENCY_LABELS: Record<string, string> = {
  mensal: 'Mensal',
  quinzenal: 'Quinzenal',
  semanal: 'Semanal',
  variavel: 'Renda variável',
};

export const RECURRENCE_LABELS: Record<string, string> = {
  none: 'Apenas uma vez',
  monthly: 'Mensal',
  weekly: 'Semanal',
  yearly: 'Anual',
};

export const APP_CREDIT = 'Desenvolvido por Ana Toledo';
export const APP_NAME = 'Até o Fim do Mês';
export const APP_SLOGAN = 'Seu salário tem um plano. Agora você também.';
