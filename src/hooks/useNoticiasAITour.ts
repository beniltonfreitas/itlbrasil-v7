import { useState, useEffect, useCallback } from 'react';

export interface TourStep {
  target: string;
  content: string;
  title?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  disableBeacon?: boolean;
  spotlightClicks?: boolean;
}

const TOUR_STEPS: TourStep[] = [
  {
    target: '.noticias-ai-input',
    title: 'Área de Entrada',
    content: 'Digite ou cole o conteúdo da notícia aqui. Você pode colar textos, URLs ou usar comandos especiais como EXCLUSIVA, JSON ou LOTE.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '.noticias-ai-badges',
    title: 'Modos de Processamento',
    content: 'Clique em um badge para inserir o modo desejado. EXCLUSIVA preserva o texto original, JSON gera formato para importação, LOTE processa múltiplas URLs.',
    placement: 'bottom',
  },
  {
    target: '.noticias-ai-upload',
    title: 'Upload de Imagem',
    content: 'Envie uma imagem e a URL será automaticamente inserida no campo de texto. Suporta JPG, PNG, WEBP e GIF.',
    placement: 'bottom',
  },
  {
    target: '.noticias-ai-generate',
    title: 'Processar Conteúdo',
    content: 'Clique aqui para processar o conteúdo inserido. O sistema irá analisar e gerar os campos formatados automaticamente.',
    placement: 'top',
  },
  {
    target: '.noticias-ai-tabs',
    title: 'Abas de Resultado',
    content: 'Navegue entre as abas: Manual (campos separados), JSON (importação automática), Histórico, Estatísticas, Fontes e Agendamentos.',
    placement: 'top',
  },
  {
    target: '.noticias-ai-tab-manual',
    title: 'Aba Manual',
    content: 'Veja todos os campos gerados separadamente. Use os botões de copiar para transferir para outros sistemas.',
    placement: 'bottom',
  },
  {
    target: '.noticias-ai-tab-json',
    title: 'Aba JSON',
    content: 'Visualize o JSON gerado e use "Importar Notícias" para publicar automaticamente. A auto-correção do lide pode ser ativada.',
    placement: 'bottom',
  },
  {
    target: '.noticias-ai-tab-historico',
    title: 'Histórico de Importações',
    content: 'Veja todas as importações realizadas, status de sucesso/erro e links para editar os artigos.',
    placement: 'bottom',
  },
  {
    target: '.noticias-ai-tab-stats',
    title: 'Estatísticas',
    content: 'Acompanhe métricas de importação: total, taxa de sucesso, distribuição por fonte e gráficos de tendência.',
    placement: 'bottom',
  },
  {
    target: '.noticias-ai-tutorial-btn',
    title: 'Tutorial Completo',
    content: 'Acesse o tutorial completo a qualquer momento para ver explicações detalhadas de cada funcionalidade!',
    placement: 'left',
  },
];

const STORAGE_KEY = 'noticias-ai-tour-completed';
const TOUR_VERSION = '1.0';

export const useNoticiasAITour = () => {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [tourCompleted, setTourCompleted] = useState(false);

  // Check if tour was completed
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.version === TOUR_VERSION && parsed.completed) {
          setTourCompleted(true);
        }
      } catch {
        // Invalid stored value, will show tour
      }
    }
  }, []);

  // Auto-start tour on first visit
  useEffect(() => {
    if (!tourCompleted) {
      // Small delay to ensure elements are rendered
      const timer = setTimeout(() => {
        setRun(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [tourCompleted]);

  const startTour = useCallback(() => {
    setStepIndex(0);
    setRun(true);
  }, []);

  const stopTour = useCallback(() => {
    setRun(false);
  }, []);

  const completeTour = useCallback(() => {
    setRun(false);
    setTourCompleted(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: TOUR_VERSION,
      completed: true,
      completedAt: new Date().toISOString(),
    }));
  }, []);

  const resetTour = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setTourCompleted(false);
    setStepIndex(0);
  }, []);

  const handleJoyrideCallback = useCallback((data: {
    action: string;
    index: number;
    status: string;
    type: string;
  }) => {
    const { action, index, status, type } = data;

    if (status === 'finished' || status === 'skipped') {
      completeTour();
    } else if (type === 'step:after') {
      setStepIndex(index + 1);
    }
  }, [completeTour]);

  return {
    run,
    stepIndex,
    steps: TOUR_STEPS,
    tourCompleted,
    startTour,
    stopTour,
    completeTour,
    resetTour,
    handleJoyrideCallback,
  };
};
