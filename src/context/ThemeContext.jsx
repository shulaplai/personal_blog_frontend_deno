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

  const [themeStyle, setThemeStyle] = useState(() => {
    return storage.getThemeStyle() || 'default';
  });

  // Sync dark class and meta theme-color
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    const isJoye = themeStyle === 'joye';
    let color;
    if (isJoye) {
      color = darkMode ? '#0a0a10' : '#f8f9fb';
    } else {
      color = darkMode ? '#0B0B10' : '#FCFCFD';
    }
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color);
  }, [darkMode, themeStyle]);

  // Sync data-theme-style attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme-style', themeStyle);
  }, [themeStyle]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      storage.setDarkMode(next);
      return next;
    });
  };

  const toggleThemeStyle = () => {
    setThemeStyle((prev) => {
      const next = prev === 'joye' ? 'default' : 'joye';
      storage.setThemeStyle(next);
      return next;
    });
  };

  const value = useMemo(
    () => ({ darkMode, toggleDarkMode, themeStyle, toggleThemeStyle }),
    [darkMode, themeStyle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useDarkMode() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a ThemeProvider');
  }
  return context;
}

export function useThemeStyle() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeStyle must be used within a ThemeProvider');
  }
  return { themeStyle: context.themeStyle, toggleThemeStyle: context.toggleThemeStyle };
}
