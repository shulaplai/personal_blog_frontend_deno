import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { storage } from '@/utils/storage';

const ThemeContext = createContext(undefined);

/**
 * Provides darkMode state and toggle function to the entire app,
 * eliminating the need to prop-drill through route and layout components.
 */
export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage first; if unset, respect system preference
    const stored = storage.getDarkMode();
    if (stored === null) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return stored;
  });

  // Sync dark class and meta theme-color
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', darkMode ? '#0B0B10' : '#FCFCFD');
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      storage.setDarkMode(next);
      return next;
    });
  };

  const value = useMemo(() => ({ darkMode, toggleDarkMode }), [darkMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useDarkMode() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a ThemeProvider');
  }
  return context;
}
