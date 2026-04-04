/**
 * @houselevi/config/brand
 * Brand design system
 */

export const BRAND = {
  colors: {
    primary: '#E8DCC4',
    primaryDark: '#D4AF37',
    secondary: '#000000',
    accent: '#D4AF37',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    sizes: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
    },
  },
  spacing: {
    0: '0',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    6: '24px',
    8: '32px',
  },
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },
} as const;
