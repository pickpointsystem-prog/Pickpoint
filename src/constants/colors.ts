// Brand Color Palette - Pickpoint Professional Theme
export const BRAND_COLORS = {
  // Primary Brand Colors
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',   // Main primary
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  
  // Status Colors
  status: {
    arrived: {
      bg: '#DBEAFE',
      text: '#1E40AF',
      border: '#93C5FD',
      gradient: 'from-blue-500 to-blue-600'
    },
    picked: {
      bg: '#D1FAE5',
      text: '#065F46',
      border: '#6EE7B7',
      gradient: 'from-green-500 to-green-600'
    },
    destroyed: {
      bg: '#FEE2E2',
      text: '#991B1B',
      border: '#FCA5A5',
      gradient: 'from-red-500 to-red-600'
    }
  },
  
  // Functional Colors
  success: {
    50: '#ECFDF5',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
  },
  warning: {
    50: '#FEF3C7',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
  },
  danger: {
    50: '#FEE2E2',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
  },
  
  // Neutral/Gray Scale
  neutral: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
  
  // Gradient Definitions
  gradients: {
    primary: 'bg-gradient-to-br from-blue-500 to-blue-700',
    success: 'bg-gradient-to-br from-green-500 to-green-700',
    warning: 'bg-gradient-to-br from-orange-500 to-orange-700',
    danger: 'bg-gradient-to-br from-red-500 to-red-700',
    dark: 'bg-gradient-to-br from-slate-800 to-slate-900',
    purple: 'bg-gradient-to-br from-purple-500 to-purple-700',
    indigo: 'bg-gradient-to-br from-indigo-500 to-indigo-700',
  }
} as const;

// Utility function to get status color
export const getStatusColor = (status: 'ARRIVED' | 'PICKED' | 'DESTROYED') => {
  switch (status) {
    case 'ARRIVED':
      return BRAND_COLORS.status.arrived;
    case 'PICKED':
      return BRAND_COLORS.status.picked;
    case 'DESTROYED':
      return BRAND_COLORS.status.destroyed;
    default:
      return BRAND_COLORS.status.arrived;
  }
};
