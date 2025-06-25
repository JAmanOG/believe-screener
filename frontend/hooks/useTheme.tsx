import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isSystemTheme: boolean;
  setSystemTheme: (useSystem: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [manualTheme, setManualTheme] = useState<Theme>('dark');
  const [isSystemTheme, setIsSystemTheme] = useState(true);

  const theme = isSystemTheme ? (systemColorScheme ?? 'dark') : manualTheme;

  const toggleTheme = () => {
    if (isSystemTheme) {
      setIsSystemTheme(false);
      setManualTheme(theme === 'dark' ? 'light' : 'dark');
    } else {
      setManualTheme(manualTheme === 'dark' ? 'light' : 'dark');
    }
  };

  const setSystemTheme = (useSystem: boolean) => {
    setIsSystemTheme(useSystem);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isSystemTheme, setSystemTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}