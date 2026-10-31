import { TextStyle } from 'react-native';

export const COLORS = {
  primary: '#B91C1C',
  primaryDark: '#991B1B',
  primaryLight: '#FEE2E2',
  secondary: '#1D4ED8',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F5F9',
  textPrimary: '#0F172A',
  textSecondary: '#334155',
  textMuted: '#475569',
  border: '#CBD5E1',
  error: '#B91C1C',
  errorBackground: '#FEF2F2',
  success: '#15803D',
  successBackground: '#DCFCE7',
  warning: '#B45309',
  starActive: '#D97706',
  starInactive: '#94A3B8',
  favoriteActive: '#DC2626',
  white: '#FFFFFF',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const SHADOWS = {
  card: '0 1px 3px rgba(15, 23, 42, 0.08)',
  raised: '0 4px 12px rgba(15, 23, 42, 0.10)',
} as const;

export const TYPOGRAPHY = {
  largeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headline: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    color: COLORS.textSecondary,
  },
  caption: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
} as const satisfies Record<string, TextStyle>;

export const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  normal: { bg: '#E2E8F0', text: '#1E293B' },
  fire: { bg: '#FFEDD5', text: '#9A3412' },
  water: { bg: '#DBEAFE', text: '#1E40AF' },
  electric: { bg: '#FEF9C3', text: '#854D0E' },
  grass: { bg: '#DCFCE7', text: '#166534' },
  ice: { bg: '#CFFAFE', text: '#155E75' },
  fighting: { bg: '#FEE2E2', text: '#991B1B' },
  poison: { bg: '#F3E8FF', text: '#6B21A8' },
  ground: { bg: '#FEF3C7', text: '#92400E' },
  flying: { bg: '#E0E7FF', text: '#3730A3' },
  psychic: { bg: '#FCE7F3', text: '#9D174D' },
  bug: { bg: '#ECFCCB', text: '#3F6212' },
  rock: { bg: '#F5F5F4', text: '#44403C' },
  ghost: { bg: '#EDE9FE', text: '#5B21B6' },
  dragon: { bg: '#E0E7FF', text: '#312E81' },
  dark: { bg: '#E2E8F0', text: '#0F172A' },
  steel: { bg: '#F1F5F9', text: '#334155' },
  fairy: { bg: '#FCE7F3', text: '#831843' },
};

export function getTypeColor(type: string): { bg: string; text: string } {
  return TYPE_COLORS[type.toLowerCase()] || { bg: '#E2E8F0', text: '#1E293B' };
}
