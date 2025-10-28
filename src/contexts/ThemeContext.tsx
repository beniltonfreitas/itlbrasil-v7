import React, { createContext, useContext } from 'react';
import { useThemeLoader } from '@/hooks/useThemeLoader';

interface ThemeContextType {
  currentTheme: any;
  currentThemeId: string;
  isLoading: boolean;
  availableThemes: any[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const themeData = useThemeLoader();

  return (
    <ThemeContext.Provider value={themeData}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};