/**
 * Design System Constants
 * Central source of truth for colors, spacing, typography
 */

export const designSystem = {
  colors: {
    // Semantic colors
    background: 'var(--background)',
    foreground: 'var(--foreground)',
    accent: 'var(--accent)',
    accentForeground: 'var(--accent-foreground)',
    muted: 'var(--muted)',
    mutedForeground: 'var(--muted-foreground)',
    border: 'var(--border)',
    input: 'var(--input)',
    ring: 'var(--ring)',
    destructive: 'var(--destructive)',
    card: 'var(--card)',
    cardForeground: 'var(--card-foreground)',

    // Explicitly semantic
    primary: 'var(--primary)',
    primaryForeground: 'var(--primary-foreground)',
    secondary: 'var(--secondary)',
    secondaryForeground: 'var(--secondary-foreground)',
  },

  spacing: {
    xs: 'var(--space-xs)',
    sm: 'var(--space-sm)',
    md: 'var(--space-md)',
    lg: 'var(--space-lg)',
    xl: 'var(--space-xl)',
    '2xl': 'var(--space-2xl)',
    '3xl': 'var(--space-3xl)',
    '4xl': 'var(--space-4xl)',
    '5xl': 'var(--space-5xl)',
  },

  typography: {
    fonts: {
      sans: 'var(--font-sans)',
      mono: 'var(--font-mono)',
    },
    sizes: {
      h1: '48px',
      h2: '32px',
      h3: '24px',
      body: '16px',
      small: '14px',
      tiny: '12px',
    },
    lineHeights: {
      tight: 1.1,
      heading: 1.2,
      normal: 1.5,
      relaxed: 1.6,
    },
    weights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },

  radius: {
    none: '0px',
    sm: 'calc(var(--radius) - 4px)',
    md: 'calc(var(--radius) - 2px)',
    lg: 'var(--radius)',
    xl: 'calc(var(--radius) + 4px)',
    '2xl': 'calc(var(--radius) + 8px)',
    '3xl': 'calc(var(--radius) + 12px)',
    '4xl': 'calc(var(--radius) + 16px)',
    full: '9999px',
  },

  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },

  transitions: {
    fast: '0.2s ease-out',
    normal: '0.3s ease-out',
    slow: '0.5s ease-out',
  },

  breakpoints: {
    xs: '0px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

// Export type for strict typing
export type DesignSystem = typeof designSystem;
