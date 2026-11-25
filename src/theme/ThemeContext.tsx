import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import NativeStepCounter from '../specs/NativeStepCounter';
import { darkColors, lightColors, Palette } from './theme';

const KEY = 'theme_mode'; // stored as 'dark' | 'light'; empty = never chosen

type ThemeValue = {
  isDark: boolean;
  colors: Palette;
  setDark: (value: boolean) => void;
};

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [saved, setSaved] = useState<'dark' | 'light' | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    NativeStepCounter.getItem(KEY)
      .then(value => {
        if (!cancelled && (value === 'dark' || value === 'light')) {
          setSaved(value);
        }
      })
      .catch(() => {})
      .finally(() => !cancelled && setReady(true));
    return () => {
      cancelled = true;
    };
  }, []);

  const setDark = useCallback((value: boolean) => {
    const mode = value ? 'dark' : 'light';
    setSaved(mode);
    NativeStepCounter.setItem(KEY, mode);
  }, []);

  const isDark = saved ? saved === 'dark' : system === 'dark';

  const value = useMemo<ThemeValue>(
    () => ({ isDark, colors: isDark ? darkColors : lightColors, setDark }),
    [isDark, setDark],
  );

  // Wait for the saved choice so the app never flashes the wrong theme.
  if (!ready) {
    return null;
  }
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside ThemeProvider.');
  }
  return ctx;
}
