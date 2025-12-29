import { Check, Circle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOnboardingProgress, type Milestone } from "@/hooks/useOnboardingProgress";

interface OnboardingChecklistProps {
  maxItems?: number;
  showCompleted?: boolean;
  className?: string;
}

const CHECKLIST_ORDER = [
  'tour_completed',
  'first_text',
  'first_image',
  'first_link',
  'first_exclusiva',
  'first_json',
  'first_import',
  'first_batch',
  'viewed_history',
  'viewed_stats',
  'created_source',
  'created_schedule',
];

export const OnboardingChecklist = ({
  maxItems = 5,
  showCompleted = true,
  className,
}: OnboardingChecklistProps) => {
  const { isMilestoneCompleted, MILESTONES } = useOnboardingProgress();

  // Sort milestones by our predefined order
  const orderedMilestones = CHECKLIST_ORDER
    .map(id => MILESTONES.find(m => m.id === id))
    .filter((m): m is Milestone => m !== undefined);

  // Get items to display
  const completedItems = orderedMilestones.filter(m => isMilestoneCompleted(m.id));
  const pendingItems = orderedMilestones.filter(m => !isMilestoneCompleted(m.id));

  let displayItems: { milestone: Milestone; completed: boolean }[] = [];

  if (showCompleted) {
    // Show recent completed + pending, limited to maxItems
    const recentCompleted = completedItems.slice(-2).map(m => ({ milestone: m, completed: true }));
    const nextPending = pendingItems.slice(0, maxItems - recentCompleted.length).map(m => ({ milestone: m, completed: false }));
    displayItems = [...recentCompleted, ...nextPending];
  } else {
    displayItems = pendingItems.slice(0, maxItems).map(m => ({ milestone: m, completed: false }));
  }

  if (displayItems.length === 0) {
    return (
      <div className={cn("text-center py-4 text-muted-foreground text-sm", className)}>
        🎉 Todas as tarefas concluídas!
      </div>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      {displayItems.map(({ milestone, completed }) => (
        <div
          key={milestone.id}
          className={cn(
            "flex items-center gap-2 p-2 rounded-md text-sm transition-colors",
            completed
              ? "bg-primary/10 text-foreground"
              : "bg-muted/50 text-muted-foreground hover:bg-muted"
          )}
        >
          {completed ? (
            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
          ) : (
            <Circle className="h-4 w-4 flex-shrink-0" />
          )}
          <span className={cn("flex-1", completed && "line-through opacity-70")}>
            {milestone.name}
          </span>
          {!completed && (
            <span className="text-xs text-primary">+{milestone.points}</span>
          )}
        </div>
      ))}

      {pendingItems.length > maxItems && (
        <p className="text-xs text-muted-foreground text-center pt-1">
          +{pendingItems.length - maxItems} objetivos restantes
        </p>
      )}
    </div>
  );
};

export default OnboardingChecklist;
