import { useState, useEffect, useCallback } from 'react';

export type UserLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface Milestone {
  id: string;
  name: string;
  description: string;
  points: number;
  category: 'basics' | 'processing' | 'import' | 'advanced';
}

export interface MilestoneProgress {
  completed: boolean;
  completedAt?: string;
}

export interface OnboardingProgress {
  milestones: Record<string, MilestoneProgress>;
  totalPoints: number;
  level: UserLevel;
  lastUpdated: string;
}

export const MILESTONES: Milestone[] = [
  { id: 'first_visit', name: 'Primeiro Acesso', description: 'Acessou o Notícias AI', points: 5, category: 'basics' },
  { id: 'tour_completed', name: 'Tour Concluído', description: 'Completou o tour guiado', points: 10, category: 'basics' },
  { id: 'first_text', name: 'Primeira Notícia', description: 'Processou um texto', points: 15, category: 'processing' },
  { id: 'first_link', name: 'Primeira URL', description: 'Processou uma URL', points: 15, category: 'processing' },
  { id: 'first_exclusiva', name: 'Modo EXCLUSIVA', description: 'Usou modo EXCLUSIVA', points: 20, category: 'processing' },
  { id: 'first_json', name: 'Primeiro JSON', description: 'Gerou JSON com sucesso', points: 20, category: 'processing' },
  { id: 'first_import', name: 'Primeira Importação', description: 'Importou artigo no site', points: 25, category: 'import' },
  { id: 'first_batch', name: 'Modo Lote', description: 'Processou múltiplas URLs', points: 30, category: 'import' },
  { id: 'first_image', name: 'Upload de Imagem', description: 'Enviou uma imagem', points: 15, category: 'basics' },
  { id: 'viewed_history', name: 'Histórico', description: 'Visualizou aba Histórico', points: 10, category: 'basics' },
  { id: 'viewed_stats', name: 'Estatísticas', description: 'Visualizou aba Estatísticas', points: 10, category: 'basics' },
  { id: 'created_source', name: 'Fonte Personalizada', description: 'Criou uma fonte', points: 25, category: 'advanced' },
  { id: 'created_schedule', name: 'Agendamento', description: 'Criou agendamento automático', points: 30, category: 'advanced' },
  { id: 'ten_imports', name: '10 Importações', description: 'Importou 10+ artigos', points: 50, category: 'import' },
  { id: 'fifty_imports', name: '50 Importações', description: 'Importou 50+ artigos', points: 100, category: 'import' },
];

const LEVEL_THRESHOLDS: Record<UserLevel, number> = {
  beginner: 0,
  intermediate: 51,
  advanced: 101,
  expert: 151,
};

const STORAGE_KEY = 'noticias-ai-onboarding-progress';

const calculateLevel = (points: number): UserLevel => {
  if (points >= LEVEL_THRESHOLDS.expert) return 'expert';
  if (points >= LEVEL_THRESHOLDS.advanced) return 'advanced';
  if (points >= LEVEL_THRESHOLDS.intermediate) return 'intermediate';
  return 'beginner';
};

const getNextLevelThreshold = (level: UserLevel): number => {
  switch (level) {
    case 'beginner': return LEVEL_THRESHOLDS.intermediate;
    case 'intermediate': return LEVEL_THRESHOLDS.advanced;
    case 'advanced': return LEVEL_THRESHOLDS.expert;
    case 'expert': return LEVEL_THRESHOLDS.expert + 50;
  }
};

const getLevelName = (level: UserLevel): string => {
  switch (level) {
    case 'beginner': return 'Iniciante';
    case 'intermediate': return 'Intermediário';
    case 'advanced': return 'Avançado';
    case 'expert': return 'Expert';
  }
};

const getDefaultProgress = (): OnboardingProgress => ({
  milestones: {},
  totalPoints: 0,
  level: 'beginner',
  lastUpdated: new Date().toISOString(),
});

export const useOnboardingProgress = () => {
  const [progress, setProgress] = useState<OnboardingProgress>(getDefaultProgress);
  const [recentAchievement, setRecentAchievement] = useState<Milestone | null>(null);
  const [leveledUp, setLeveledUp] = useState(false);

  // Load progress from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as OnboardingProgress;
        setProgress(parsed);
      } catch {
        // Invalid stored value
      }
    }
  }, []);

  // Save progress to localStorage
  const saveProgress = useCallback((newProgress: OnboardingProgress) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
    setProgress(newProgress);
  }, []);

  // Complete a milestone
  const completeMilestone = useCallback((milestoneId: string) => {
    const milestone = MILESTONES.find(m => m.id === milestoneId);
    if (!milestone) return;

    setProgress(prev => {
      // Already completed
      if (prev.milestones[milestoneId]?.completed) return prev;

      const newMilestones = {
        ...prev.milestones,
        [milestoneId]: {
          completed: true,
          completedAt: new Date().toISOString(),
        },
      };

      const newTotalPoints = prev.totalPoints + milestone.points;
      const oldLevel = prev.level;
      const newLevel = calculateLevel(newTotalPoints);

      const newProgress: OnboardingProgress = {
        milestones: newMilestones,
        totalPoints: newTotalPoints,
        level: newLevel,
        lastUpdated: new Date().toISOString(),
      };

      // Show achievement toast
      setRecentAchievement(milestone);
      setTimeout(() => setRecentAchievement(null), 5000);

      // Check for level up
      if (newLevel !== oldLevel) {
        setLeveledUp(true);
        setTimeout(() => setLeveledUp(false), 5000);
      }

      saveProgress(newProgress);
      return newProgress;
    });
  }, [saveProgress]);

  // Check if a milestone is completed
  const isMilestoneCompleted = useCallback((milestoneId: string): boolean => {
    return progress.milestones[milestoneId]?.completed || false;
  }, [progress.milestones]);

  // Get completed milestones
  const getCompletedMilestones = useCallback((): Milestone[] => {
    return MILESTONES.filter(m => progress.milestones[m.id]?.completed);
  }, [progress.milestones]);

  // Get pending milestones
  const getPendingMilestones = useCallback((): Milestone[] => {
    return MILESTONES.filter(m => !progress.milestones[m.id]?.completed);
  }, [progress.milestones]);

  // Get suggested next milestones
  const getSuggestedMilestones = useCallback((): Milestone[] => {
    const pending = getPendingMilestones();
    // Prioritize by category order and points
    return pending
      .sort((a, b) => {
        const categoryOrder = { basics: 0, processing: 1, import: 2, advanced: 3 };
        if (categoryOrder[a.category] !== categoryOrder[b.category]) {
          return categoryOrder[a.category] - categoryOrder[b.category];
        }
        return a.points - b.points;
      })
      .slice(0, 3);
  }, [getPendingMilestones]);

  // Calculate progress percentage to next level
  const getLevelProgress = useCallback((): number => {
    const currentThreshold = LEVEL_THRESHOLDS[progress.level];
    const nextThreshold = getNextLevelThreshold(progress.level);
    const range = nextThreshold - currentThreshold;
    const current = progress.totalPoints - currentThreshold;
    return Math.min(100, Math.round((current / range) * 100));
  }, [progress]);

  // Check if feature is unlocked based on level
  const isFeatureUnlocked = useCallback((requiredLevel: UserLevel): boolean => {
    const levels: UserLevel[] = ['beginner', 'intermediate', 'advanced', 'expert'];
    const currentIdx = levels.indexOf(progress.level);
    const requiredIdx = levels.indexOf(requiredLevel);
    return currentIdx >= requiredIdx;
  }, [progress.level]);

  // Reset progress (for testing)
  const resetProgress = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setProgress(getDefaultProgress());
  }, []);

  // Dismiss recent achievement
  const dismissAchievement = useCallback(() => {
    setRecentAchievement(null);
  }, []);

  return {
    progress,
    level: progress.level,
    levelName: getLevelName(progress.level),
    totalPoints: progress.totalPoints,
    levelProgress: getLevelProgress(),
    nextLevelThreshold: getNextLevelThreshold(progress.level),
    recentAchievement,
    leveledUp,
    completeMilestone,
    isMilestoneCompleted,
    getCompletedMilestones,
    getPendingMilestones,
    getSuggestedMilestones,
    isFeatureUnlocked,
    resetProgress,
    dismissAchievement,
    MILESTONES,
  };
};
