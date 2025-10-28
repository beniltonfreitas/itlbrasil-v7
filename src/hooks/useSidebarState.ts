import { useState, useEffect, useCallback } from 'react';

interface UseSidebarStateReturn {
  collapsed: boolean;
  pinned: boolean;
  isMobile: boolean;
  toggle: () => void;
  togglePin: () => void;
  close: () => void;
}

export const useSidebarState = (): UseSidebarStateReturn => {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true';
  });
  
  const [pinned, setPinned] = useState<boolean>(() => {
    const saved = localStorage.getItem('sidebarPinned');
    return saved === 'true';
  });

  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== 'undefined' && window.innerWidth < 1024
  );

  // Detectar mudanças no tamanho da tela
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      // Em mobile, sempre colapsado quando não pinned
      if (mobile && !pinned) {
        setCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [pinned]);

  // Salvar estado no localStorage
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', collapsed.toString());
  }, [collapsed]);

  useEffect(() => {
    localStorage.setItem('sidebarPinned', pinned.toString());
  }, [pinned]);

  const toggle = useCallback(() => {
    setCollapsed(prev => !prev);
  }, []);

  const togglePin = useCallback(() => {
    setPinned(prev => !prev);
  }, []);

  const close = useCallback(() => {
    setCollapsed(true);
  }, []);

  // Atalho de teclado Ctrl+/
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        toggle();
      }
      
      // Esc fecha em mobile
      if (e.key === 'Escape' && isMobile && !collapsed) {
        close();
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [toggle, close, isMobile, collapsed]);

  return {
    collapsed,
    pinned,
    isMobile,
    toggle,
    togglePin,
    close,
  };
};
