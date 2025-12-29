import { useEffect, useCallback } from 'react';

interface AccessibilityShortcutsCallbacks {
  onToggleMenu: () => void;
  onToggleVLibras: () => void;
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
  onToggleHighContrast: () => void;
  onToggleTextToSpeech: () => void;
  onToggleScreenReader: () => void;
}

export const ACCESSIBILITY_SHORTCUTS = [
  { key: 'A', description: 'Abrir/fechar menu de acessibilidade' },
  { key: 'V', description: 'Ativar/desativar VLibras' },
  { key: '+', description: 'Aumentar tamanho da fonte' },
  { key: '-', description: 'Diminuir tamanho da fonte' },
  { key: 'C', description: 'Alternar alto contraste' },
  { key: 'L', description: 'Iniciar/pausar leitura de texto' },
  { key: 'R', description: 'Alternar modo leitor de tela' },
];

export const useAccessibilityShortcuts = (callbacks: AccessibilityShortcutsCallbacks) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Verificar se Alt está pressionado
    if (!event.altKey) return;
    
    // Ignorar se estiver em campo de input
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    const key = event.key.toUpperCase();

    switch (key) {
      case 'A':
        event.preventDefault();
        callbacks.onToggleMenu();
        break;
      case 'V':
        event.preventDefault();
        callbacks.onToggleVLibras();
        break;
      case '+':
      case '=':
        event.preventDefault();
        callbacks.onIncreaseFontSize();
        break;
      case '-':
        event.preventDefault();
        callbacks.onDecreaseFontSize();
        break;
      case 'C':
        event.preventDefault();
        callbacks.onToggleHighContrast();
        break;
      case 'L':
        event.preventDefault();
        callbacks.onToggleTextToSpeech();
        break;
      case 'R':
        event.preventDefault();
        callbacks.onToggleScreenReader();
        break;
    }
  }, [callbacks]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};
