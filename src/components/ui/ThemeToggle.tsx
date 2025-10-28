import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();
  
  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:bg-white/10 backdrop-blur-sm border border-white/10"
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
      }}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 text-[#00C2FF]" />
      ) : (
        <Moon className="h-5 w-5 text-[#00C2FF]" />
      )}
    </button>
  );
};
