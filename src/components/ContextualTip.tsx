import { useEffect, useState, useRef } from 'react';
import { X, Lightbulb, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ContextualTip as TipType } from '@/hooks/useContextualTips';

interface ContextualTipProps {
  tip: TipType | null;
  visible: boolean;
  onDismiss: () => void;
  onDismissPermanently: () => void;
}

export const ContextualTip = ({ 
  tip, 
  visible, 
  onDismiss, 
  onDismissPermanently 
}: ContextualTipProps) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [arrowPosition, setArrowPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('top');
  const tipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tip || !visible) return;

    const calculatePosition = () => {
      const targetElement = document.querySelector(tip.targetSelector);
      if (!targetElement || !tipRef.current) return;

      const targetRect = targetElement.getBoundingClientRect();
      const tipRect = tipRef.current.getBoundingClientRect();
      const padding = 12;

      let top = 0;
      let left = 0;
      let arrow: 'top' | 'bottom' | 'left' | 'right' = 'top';

      switch (tip.position || 'bottom') {
        case 'top':
          top = targetRect.top - tipRect.height - padding;
          left = targetRect.left + (targetRect.width / 2) - (tipRect.width / 2);
          arrow = 'bottom';
          break;
        case 'bottom':
          top = targetRect.bottom + padding;
          left = targetRect.left + (targetRect.width / 2) - (tipRect.width / 2);
          arrow = 'top';
          break;
        case 'left':
          top = targetRect.top + (targetRect.height / 2) - (tipRect.height / 2);
          left = targetRect.left - tipRect.width - padding;
          arrow = 'right';
          break;
        case 'right':
          top = targetRect.top + (targetRect.height / 2) - (tipRect.height / 2);
          left = targetRect.right + padding;
          arrow = 'left';
          break;
      }

      // Boundary checks
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      if (left < padding) left = padding;
      if (left + tipRect.width > viewportWidth - padding) {
        left = viewportWidth - tipRect.width - padding;
      }
      if (top < padding) top = padding;
      if (top + tipRect.height > viewportHeight - padding) {
        top = viewportHeight - tipRect.height - padding;
      }

      setPosition({ top, left });
      setArrowPosition(arrow);
    };

    // Initial calculation
    calculatePosition();

    // Recalculate on resize/scroll
    window.addEventListener('resize', calculatePosition);
    window.addEventListener('scroll', calculatePosition, true);

    // Auto-dismiss after 10 seconds
    const autoDismissTimer = setTimeout(onDismiss, 10000);

    return () => {
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition, true);
      clearTimeout(autoDismissTimer);
    };
  }, [tip, visible, onDismiss]);

  if (!tip || !visible) return null;

  const arrowClasses = {
    top: 'before:absolute before:-top-2 before:left-1/2 before:-translate-x-1/2 before:border-8 before:border-transparent before:border-b-primary/90',
    bottom: 'before:absolute before:-bottom-2 before:left-1/2 before:-translate-x-1/2 before:border-8 before:border-transparent before:border-t-primary/90',
    left: 'before:absolute before:top-1/2 before:-left-2 before:-translate-y-1/2 before:border-8 before:border-transparent before:border-r-primary/90',
    right: 'before:absolute before:top-1/2 before:-right-2 before:-translate-y-1/2 before:border-8 before:border-transparent before:border-l-primary/90',
  };

  return (
    <div
      ref={tipRef}
      className={cn(
        'fixed z-[9999] max-w-xs bg-primary/90 text-primary-foreground rounded-lg shadow-xl backdrop-blur-sm',
        'transition-all duration-300 ease-out',
        arrowClasses[arrowPosition],
        visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
      )}
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      {/* Close button */}
      <button
        onClick={onDismiss}
        className="absolute -top-2 -right-2 p-1 bg-background border border-border rounded-full shadow-md hover:bg-muted transition-colors"
        aria-label="Fechar dica"
      >
        <X className="h-3 w-3 text-foreground" />
      </button>

      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-1.5 bg-primary-foreground/20 rounded-md">
            <Lightbulb className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm mb-1">{tip.title}</h4>
            <p className="text-xs opacity-90 leading-relaxed">{tip.message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-primary-foreground/20">
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismissPermanently}
            className="h-6 px-2 text-xs text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
          >
            <XCircle className="h-3 w-3 mr-1" />
            Não mostrar mais
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-6 px-2 text-xs text-primary-foreground hover:bg-primary-foreground/10"
          >
            Entendi
          </Button>
        </div>
      </div>
    </div>
  );
};
