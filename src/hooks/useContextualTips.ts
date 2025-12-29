import { useState, useEffect, useCallback } from 'react';

export interface ContextualTip {
  id: string;
  targetSelector: string;
  title: string;
  message: string;
  triggerEvent?: 'mount' | 'click' | 'focus' | 'hover';
  showOnce: boolean;
  delay?: number;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const NOTICIAS_AI_TIPS: ContextualTip[] = [
  {
    id: 'welcome',
    targetSelector: '.noticias-ai-input',
    title: 'Bem-vindo ao Notícias AI!',
    message: 'Digite ou cole conteúdo aqui. Use EXCLUSIVA, JSON ou cole URLs direto!',
    triggerEvent: 'mount',
    showOnce: true,
    delay: 2000,
    position: 'bottom',
  },
  {
    id: 'batch-mode',
    targetSelector: '.noticias-ai-badge-lote',
    title: 'Modo Lote',
    message: 'Você pode colar até 10 URLs para processar em paralelo!',
    triggerEvent: 'click',
    showOnce: true,
    position: 'bottom',
  },
  {
    id: 'first-json',
    targetSelector: '.noticias-ai-import-btn',
    title: 'Pronto para importar!',
    message: 'Clique em "Importar Notícias" para publicar automaticamente no site!',
    triggerEvent: 'mount',
    showOnce: true,
    delay: 500,
    position: 'top',
  },
  {
    id: 'image-uploaded',
    targetSelector: '.noticias-ai-input',
    title: 'Imagem enviada!',
    message: 'A URL da imagem foi inserida. Continue digitando sua notícia.',
    triggerEvent: 'mount',
    showOnce: false,
    delay: 100,
    position: 'top',
  },
  {
    id: 'history-tab',
    targetSelector: '.noticias-ai-tab-historico',
    title: 'Histórico de Importações',
    message: 'Todas as importações ficam salvas aqui. Veja erros e edite artigos.',
    triggerEvent: 'click',
    showOnce: true,
    position: 'bottom',
  },
  {
    id: 'sources-tab',
    targetSelector: '.noticias-ai-tab-sources',
    title: 'Gerenciador de Fontes',
    message: 'Configure templates personalizados para sites específicos.',
    triggerEvent: 'click',
    showOnce: true,
    position: 'bottom',
  },
  {
    id: 'schedules-tab',
    targetSelector: '.noticias-ai-tab-schedules',
    title: 'Agendamentos Automáticos',
    message: 'Crie importações automáticas em intervalos regulares.',
    triggerEvent: 'click',
    showOnce: true,
    position: 'bottom',
  },
];

const STORAGE_KEY = 'noticias-ai-tips-seen';

export const useContextualTips = () => {
  const [seenTips, setSeenTips] = useState<Set<string>>(new Set());
  const [activeTip, setActiveTip] = useState<ContextualTip | null>(null);
  const [tipVisible, setTipVisible] = useState(false);

  // Load seen tips from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSeenTips(new Set(parsed));
      } catch {
        // Invalid stored value
      }
    }
  }, []);

  const markTipAsSeen = useCallback((tipId: string) => {
    setSeenTips(prev => {
      const updated = new Set(prev);
      updated.add(tipId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...updated]));
      return updated;
    });
  }, []);

  const showTip = useCallback((tipId: string) => {
    const tip = NOTICIAS_AI_TIPS.find(t => t.id === tipId);
    if (!tip) return;
    
    // Check if already seen (for showOnce tips)
    if (tip.showOnce && seenTips.has(tipId)) return;
    
    // Check if target element exists
    const targetElement = document.querySelector(tip.targetSelector);
    if (!targetElement) return;
    
    // Delay showing the tip
    const delay = tip.delay || 0;
    setTimeout(() => {
      setActiveTip(tip);
      setTipVisible(true);
    }, delay);
  }, [seenTips]);

  const dismissTip = useCallback(() => {
    if (activeTip) {
      if (activeTip.showOnce) {
        markTipAsSeen(activeTip.id);
      }
      setTipVisible(false);
      setTimeout(() => setActiveTip(null), 300);
    }
  }, [activeTip, markTipAsSeen]);

  const dismissPermanently = useCallback(() => {
    if (activeTip) {
      markTipAsSeen(activeTip.id);
      setTipVisible(false);
      setTimeout(() => setActiveTip(null), 300);
    }
  }, [activeTip, markTipAsSeen]);

  const resetAllTips = useCallback(() => {
    setSeenTips(new Set());
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Check for welcome tip on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!seenTips.has('welcome')) {
        showTip('welcome');
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [seenTips, showTip]);

  return {
    tips: NOTICIAS_AI_TIPS,
    seenTips,
    activeTip,
    tipVisible,
    showTip,
    dismissTip,
    dismissPermanently,
    markTipAsSeen,
    resetAllTips,
  };
};
