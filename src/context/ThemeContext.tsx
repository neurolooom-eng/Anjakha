import { createContext, useContext, useEffect, useState } from 'react'

export interface ThemeDef {
  id: string
  label: string
  swatch: string
  mode: 'light' | 'dark'
}

export const THEMES: ThemeDef[] = [
  { id: 'anjakha-light', label: 'Anjakha Light', swatch: '#0d9488', mode: 'light' },
  { id: 'anjakha-dark', label: 'Anjakha Dark', swatch: '#2dd4bf', mode: 'dark' },
  { id: 'ocean', label: 'Ocean', swatch: '#0284c7', mode: 'light' },
  { id: 'midnight', label: 'Midnight', swatch: '#818cf8', mode: 'dark' },
  { id: 'emerald', label: 'Emerald', swatch: '#059669', mode: 'light' },
  { id: 'contrast', label: 'High Contrast', swatch: '#facc15', mode: 'dark' },
]

const LS_THEME = 'ui.theme'
const DEFAULT_THEME = 'anjakha-light'

interface ThemeContextValue {
  theme: string
  setTheme: (id: string) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<string>(() => localStorage.getItem(LS_THEME) || DEFAULT_THEME)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(LS_THEME, theme)
  }, [theme])

  function setTheme(id: string) {
    setThemeState(id)
  }

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
