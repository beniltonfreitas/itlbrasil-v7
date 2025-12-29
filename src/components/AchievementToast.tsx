import { useEffect, useState } from "react";
import { Trophy, Star, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Milestone } from "@/hooks/useOnboardingProgress";

interface AchievementToastProps {
  achievement: Milestone | null;
  leveledUp: boolean;
  newLevel?: string;
  onDismiss: () => void;
}

export const AchievementToast = ({
  achievement,
  leveledUp,
  newLevel,
  onDismiss,
}: AchievementToastProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (achievement || leveledUp) {
      setIsVisible(true);
      setIsExiting(false);
    }
  }, [achievement, leveledUp]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss();
    }, 300);
  };

  if (!isVisible || (!achievement && !leveledUp)) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-[100] max-w-sm",
        "transition-all duration-300 ease-out",
        isExiting ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-lg border shadow-lg",
          leveledUp
            ? "bg-gradient-to-r from-purple-500/10 to-amber-500/10 border-amber-500/50"
            : "bg-gradient-to-r from-primary/10 to-primary/5 border-primary/50"
        )}
      >
        {/* Sparkle animation overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <Sparkles className="absolute top-2 right-8 h-4 w-4 text-amber-400 animate-pulse" />
          <Sparkles className="absolute bottom-3 left-4 h-3 w-3 text-primary animate-pulse delay-100" />
        </div>

        <div className="relative p-4">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6"
            onClick={handleDismiss}
          >
            <X className="h-3 w-3" />
          </Button>

          <div className="flex items-start gap-3 pr-6">
            <div
              className={cn(
                "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                leveledUp ? "bg-amber-500/20" : "bg-primary/20"
              )}
            >
              {leveledUp ? (
                <Star className="h-5 w-5 text-amber-500" />
              ) : (
                <Trophy className="h-5 w-5 text-primary" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              {leveledUp && (
                <div className="mb-2">
                  <p className="font-bold text-amber-600 dark:text-amber-400">
                    🎉 Level Up!
                  </p>
                  <p className="text-sm text-foreground">
                    Você alcançou o nível <strong>{newLevel}</strong>!
                  </p>
                </div>
              )}

              {achievement && (
                <div>
                  <p className="font-semibold text-foreground">
                    {leveledUp ? "" : "🏆 "}Conquista Desbloqueada!
                  </p>
                  <p className="text-sm text-foreground font-medium">
                    {achievement.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {achievement.description}
                  </p>
                  <p className="text-xs text-primary font-medium mt-1">
                    +{achievement.points} pontos
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress bar animation */}
        <div className="h-1 bg-muted">
          <div
            className={cn(
              "h-full transition-all duration-[5000ms] ease-linear",
              leveledUp ? "bg-amber-500" : "bg-primary"
            )}
            style={{ width: isExiting ? "0%" : "100%" }}
          />
        </div>
      </div>
    </div>
  );
};

export default AchievementToast;
