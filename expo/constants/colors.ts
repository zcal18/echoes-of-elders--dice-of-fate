export default {
  // Primary colors
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  
  // Secondary colors
  secondary: '#F59E0B',
  secondaryLight: '#FCD34D',
  secondaryDark: '#D97706',
  
  // Background colors
  background: '#0F172A',
  surface: '#1E293B',
  surfaceLight: '#334155',
  surfaceDark: '#0F172A',
  
  // Text colors
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#64748B',
  
  // Status colors
  success: '#10B981',
  successLight: '#D1FAE5',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  info: '#3B82F6',
  infoLight: '#DBEAFE',
  
  // Game-specific colors
  health: '#EF4444',
  mana: '#3B82F6',
  experience: '#F59E0B',
  gold: '#FCD34D',
  
  // Item rarity colors
  common: '#9CA3AF',
  uncommon: '#10B981',
  rare: '#3B82F6',
  epic: '#9333EA',
  legendary: '#F59E0B',
  
  // UI colors
  border: '#334155',
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',
  
  // Additional colors
  gray: '#6B7280',
  violet: '#8B5CF6',
  
  // Kingdom/Territory colors
  royal: '#9333EA',
  royalLight: '#C084FC',
  water: '#0EA5E9',
  waterLight: '#38BDF8',
  forest: '#059669',
  forestLight: '#10B981',
  mountain: '#6B7280',
  mountainLight: '#9CA3AF',
  desert: '#D97706',
  desertLight: '#F59E0B',
  castle: '#7C3AED',
  castleLight: '#8B5CF6',
} as const;