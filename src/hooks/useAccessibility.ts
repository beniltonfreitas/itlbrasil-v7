import { useState, useEffect, useCallback } from 'react';

export interface AccessibilitySettings {
  vlibrasEnabled: boolean;
  fontScale: number;
  highContrast: boolean;
  dyslexicFont: boolean;
  lineSpacing: '1.0' | '1.5' | '2.0';
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  vlibrasEnabled: false,
  fontScale: 1.0,
  highContrast: false,
  dyslexicFont: false,
  lineSpacing: '1.5',
};

export const useAccessibility = () => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    try {
      const saved = localStorage.getItem('accessibilitySettings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Aplicar configurações ao DOM
  useEffect(() => {
    const root = document.documentElement;
    
    // Font Scale
    root.style.fontSize = `${settings.fontScale * 16}px`;
    
    // High Contrast
    if (settings.highContrast) {
      root.classList.add('theme-high-contrast');
    } else {
      root.classList.remove('theme-high-contrast');
    }
    
    // Dyslexic Font
    if (settings.dyslexicFont) {
      root.classList.add('font-dyslexic');
    } else {
      root.classList.remove('font-dyslexic');
    }
    
    // Line Spacing
    root.classList.remove('line-spacing-normal', 'line-spacing-relaxed', 'line-spacing-loose');
    if (settings.lineSpacing === '1.0') {
      root.classList.add('line-spacing-normal');
    } else if (settings.lineSpacing === '1.5') {
      root.classList.add('line-spacing-relaxed');
    } else if (settings.lineSpacing === '2.0') {
      root.classList.add('line-spacing-loose');
    }
    
    // Salvar no localStorage
    localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = useCallback((updates: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const toggleVLibras = useCallback(() => {
    setSettings(prev => ({ ...prev, vlibrasEnabled: !prev.vlibrasEnabled }));
  }, []);

  const adjustFontSize = useCallback((increment: boolean) => {
    setSettings(prev => {
      const newScale = increment 
        ? Math.min(prev.fontScale + 0.1, 1.6)
        : Math.max(prev.fontScale - 0.1, 0.9);
      return { ...prev, fontScale: Number(newScale.toFixed(1)) };
    });
  }, []);

  const toggleHighContrast = useCallback(() => {
    setSettings(prev => ({ ...prev, highContrast: !prev.highContrast }));
  }, []);

  const toggleDyslexicFont = useCallback(() => {
    setSettings(prev => ({ ...prev, dyslexicFont: !prev.dyslexicFont }));
  }, []);

  const setLineSpacing = useCallback((spacing: '1.0' | '1.5' | '2.0') => {
    setSettings(prev => ({ ...prev, lineSpacing: spacing }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return {
    settings,
    updateSettings,
    toggleVLibras,
    adjustFontSize,
    toggleHighContrast,
    toggleDyslexicFont,
    setLineSpacing,
    resetSettings,
  };
};
