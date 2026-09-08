'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Sun, Moon } from 'lucide-react';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');

  // Synchronize state with DOM and localStorage on mount
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem('theme') as Theme | null;
      let initialTheme: Theme;

      if (storedTheme === 'dark' || storedTheme === 'light') {
        initialTheme = storedTheme;
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        initialTheme = prefersDark ? 'dark' : 'light';
        localStorage.setItem('theme', initialTheme);
      }

      setThemeState(initialTheme);
      if (initialTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.error('Failed to initialize theme from localStorage:', e);
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('theme', newTheme);
    } catch (e) {
      console.error('Failed to save theme to localStorage:', e);
    }

    if (typeof document !== 'undefined') {
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const toggleTheme = () => {
    // Check actual DOM element class list as source of truth to avoid stale closure state
    const isCurrentlyDark = typeof document !== 'undefined'
      ? document.documentElement.classList.contains('dark')
      : theme === 'dark';

    const nextTheme: Theme = isCurrentlyDark ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

/**
 * Sun/Moon Theme Toggle Button Component
 * Small icon button for switching between Light and Dark mode.
 * Safe against SSR hydration mismatches.
 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/20"
      title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
      aria-label={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-amber-400" />
      ) : (
        <Moon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
      )}
    </button>
  );
}
