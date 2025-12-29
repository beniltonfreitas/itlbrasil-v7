import { Trophy, Star, Lock, ChevronRight, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useOnboardingProgress, type Milestone, type UserLevel } from "@/hooks/useOnboardingProgress";
import { cn } from "@/lib/utils";

const levelColors: Record<UserLevel, string> = {
  beginner: "bg-slate-500",
  intermediate: "bg-blue-500",
  advanced: "bg-purple-500",
  expert: "bg-amber-500",
};

const levelIcons: Record<UserLevel, string> = {
  beginner: "🌱",
  intermediate: "⭐",
  advanced: "🚀",
  expert: "👑",
};

interface OnboardingProgressProps {
  compact?: boolean;
}

export const OnboardingProgress = ({ compact = false }: OnboardingProgressProps) => {
  const {
    level,
    levelName,
    totalPoints,
    levelProgress,
    nextLevelThreshold,
    getCompletedMilestones,
    getPendingMilestones,
    getSuggestedMilestones,
  } = useOnboardingProgress();

  const completedMilestones = getCompletedMilestones();
  const suggestedMilestones = getSuggestedMilestones();

  if (compact) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            <span className="text-lg">{levelIcons[level]}</span>
            <Badge variant="secondary" className={cn("text-white", levelColors[level])}>
              {levelName}
            </Badge>
            <Progress value={levelProgress} className="w-16 h-2" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Seu Progresso
            </DialogTitle>
          </DialogHeader>
          <OnboardingProgressContent />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="h-4 w-4 text-primary" />
          Seu Progresso
        </CardTitle>
      </CardHeader>
      <CardContent>
        <OnboardingProgressContent />
      </CardContent>
    </Card>
  );
};

const OnboardingProgressContent = () => {
  const {
    level,
    levelName,
    totalPoints,
    levelProgress,
    nextLevelThreshold,
    getCompletedMilestones,
    getSuggestedMilestones,
  } = useOnboardingProgress();

  const completedMilestones = getCompletedMilestones();
  const suggestedMilestones = getSuggestedMilestones();

  return (
    <div className="space-y-4">
      {/* Level and Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{levelIcons[level]}</span>
            <div>
              <p className="font-semibold">{levelName}</p>
              <p className="text-xs text-muted-foreground">
                {totalPoints} / {nextLevelThreshold} pontos
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {levelProgress}%
          </Badge>
        </div>
        <Progress value={levelProgress} className="h-2" />
      </div>

      {/* Suggested Next Steps */}
      {suggestedMilestones.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium flex items-center gap-1">
            <Target className="h-3 w-3" />
            Próximos Objetivos
          </p>
          <div className="space-y-1">
            {suggestedMilestones.map((milestone) => (
              <div
                key={milestone.id}
                className="flex items-center justify-between p-2 rounded-md bg-muted/50 text-sm"
              >
                <div className="flex items-center gap-2">
                  <Star className="h-3 w-3 text-muted-foreground" />
                  <span>{milestone.name}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  +{milestone.points} pts
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Achievements */}
      {completedMilestones.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Conquistas ({completedMilestones.length})</p>
          <ScrollArea className="h-32">
            <div className="space-y-1">
              {completedMilestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className="flex items-center gap-2 p-2 rounded-md bg-primary/10 text-sm"
                >
                  <span className="text-green-500">✓</span>
                  <span>{milestone.name}</span>
                  <Badge variant="outline" className="ml-auto text-xs">
                    +{milestone.points}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Locked Features (for non-expert levels) */}
      {level !== 'expert' && (
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Lock className="h-3 w-3" />
            {level === 'beginner' && 'Desbloqueie Modo Lote no nível Intermediário'}
            {level === 'intermediate' && 'Desbloqueie Fontes e Agendamentos no nível Avançado'}
            {level === 'advanced' && 'Continue para se tornar Expert!'}
          </p>
        </div>
      )}
    </div>
  );
};

export default OnboardingProgress;
