/** @type {import('tailwindcss').Config} */
const v = (name) => ({ opacityValue }) =>
  opacityValue === undefined ? `rgb(var(${name}))` : `rgb(var(${name}) / ${opacityValue})`

export default {
  darkMode: ['selector', '[data-theme$="dark"]'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: v('--c-bg'),
        surface: v('--c-surface'),
        'surface-2': v('--c-surface-2'),
        border: v('--c-border'),
        text: v('--c-text'),
        muted: v('--c-muted'),
        primary: v('--c-primary'),
        'primary-fg': v('--c-primary-fg'),
        accent: v('--c-accent'),
        success: v('--c-success'),
        warning: v('--c-warning'),
        danger: v('--c-danger'),
        info: v('--c-info'),
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      boxShadow: {
        card: '0 1px 2px -1px rgb(15 23 42 / .06), 0 2px 8px -2px rgb(15 23 42 / .08)',
        'card-hover': '0 4px 10px -3px rgb(15 23 42 / .10), 0 12px 28px -8px rgb(15 23 42 / .16)',
        elevated: '0 12px 34px -10px rgb(15 23 42 / .22), 0 6px 14px -6px rgb(15 23 42 / .14)',
      },
      borderRadius: { xl: '0.875rem', '2xl': '1.125rem' },
    },
  },
  plugins: [],
}
