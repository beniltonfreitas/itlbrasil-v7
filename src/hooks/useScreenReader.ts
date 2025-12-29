import { useState, useEffect, useCallback } from 'react';

export interface ScreenReaderSettings {
  enabled: boolean;
  announceImages: boolean;
  enhancedFocus: boolean;
  headingNavigation: boolean;
}

const DEFAULT_SETTINGS: ScreenReaderSettings = {
  enabled: false,
  announceImages: true,
  enhancedFocus: true,
  headingNavigation: true,
};

export const useScreenReader = () => {
  const [settings, setSettings] = useState<ScreenReaderSettings>(() => {
    try {
      const saved = localStorage.getItem('screenReaderSettings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Aplicar classe de modo leitor ao DOM
  useEffect(() => {
    const root = document.documentElement;
    
    if (settings.enabled) {
      root.classList.add('screen-reader-mode');
      
      if (settings.enhancedFocus) {
        root.classList.add('enhanced-focus');
      }
    } else {
      root.classList.remove('screen-reader-mode', 'enhanced-focus');
    }

    // Salvar configurações
    localStorage.setItem('screenReaderSettings', JSON.stringify(settings));
  }, [settings]);

  // Anunciar texto para leitores de tela
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  // Ler descrição de imagem
  const readImageDescription = useCallback((img: HTMLImageElement) => {
    if (!settings.enabled || !settings.announceImages) return;
    
    const alt = img.alt || 'Imagem sem descrição';
    announce(`Imagem: ${alt}`);
  }, [settings, announce]);

  // Navegar para próximo heading
  const navigateToHeading = useCallback((direction: 'next' | 'prev') => {
    if (!settings.enabled || !settings.headingNavigation) return;

    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    const currentFocus = document.activeElement;
    
    let currentIndex = headings.findIndex(h => h === currentFocus || h.contains(currentFocus));
    
    if (direction === 'next') {
      currentIndex = currentIndex < headings.length - 1 ? currentIndex + 1 : 0;
    } else {
      currentIndex = currentIndex > 0 ? currentIndex - 1 : headings.length - 1;
    }

    const targetHeading = headings[currentIndex] as HTMLElement;
    if (targetHeading) {
      targetHeading.setAttribute('tabindex', '-1');
      targetHeading.focus();
      announce(targetHeading.textContent || 'Título');
    }
  }, [settings, announce]);

  // Toggle do modo leitor de tela
  const toggleScreenReader = useCallback(() => {
    setSettings(prev => {
      const newEnabled = !prev.enabled;
      return { ...prev, enabled: newEnabled };
    });
  }, []);

  // Atualizar configurações específicas
  const updateSettings = useCallback((updates: Partial<ScreenReaderSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  // Keyboard navigation para headings
  useEffect(() => {
    if (!settings.enabled || !settings.headingNavigation) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // H para próximo heading, Shift+H para anterior
      if (event.key.toLowerCase() === 'h' && !event.ctrlKey && !event.metaKey) {
        const target = event.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
          return;
        }
        
        event.preventDefault();
        navigateToHeading(event.shiftKey ? 'prev' : 'next');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [settings, navigateToHeading]);

  // Adicionar listeners para imagens quando modo está ativo
  useEffect(() => {
    if (!settings.enabled || !settings.announceImages) return;

    const handleImageFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'IMG') {
        readImageDescription(target as HTMLImageElement);
      }
    };

    document.addEventListener('focusin', handleImageFocus);
    return () => document.removeEventListener('focusin', handleImageFocus);
  }, [settings, readImageDescription]);

  return {
    settings,
    toggleScreenReader,
    updateSettings,
    announce,
    readImageDescription,
    navigateToHeading,
  };
};
