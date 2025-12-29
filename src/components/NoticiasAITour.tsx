import Joyride, { CallBackProps, STATUS, ACTIONS, EVENTS } from 'react-joyride';
import { useNoticiasAITour } from '@/hooks/useNoticiasAITour';

interface NoticiasAITourProps {
  run: boolean;
  stepIndex: number;
  onCallback: (data: CallBackProps) => void;
}

export const NoticiasAITour = ({ run, stepIndex, onCallback }: NoticiasAITourProps) => {
  const { steps } = useNoticiasAITour();

  const handleCallback = (data: CallBackProps) => {
    const { action, index, status, type } = data;
    
    onCallback({
      action,
      index,
      status,
      type,
    } as CallBackProps);
  };

  return (
    <Joyride
      steps={steps.map(step => ({
        ...step,
        disableBeacon: step.disableBeacon ?? true,
        spotlightClicks: step.spotlightClicks ?? true,
      }))}
      run={run}
      stepIndex={stepIndex}
      callback={handleCallback}
      continuous
      showProgress
      showSkipButton
      hideCloseButton={false}
      disableOverlayClose={false}
      spotlightPadding={8}
      floaterProps={{
        disableAnimation: false,
      }}
      styles={{
        options: {
          primaryColor: 'hsl(var(--primary))',
          textColor: 'hsl(var(--foreground))',
          backgroundColor: 'hsl(var(--background))',
          arrowColor: 'hsl(var(--background))',
          overlayColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: 12,
          padding: 16,
          boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.3)',
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        tooltipTitle: {
          fontSize: 16,
          fontWeight: 600,
          marginBottom: 8,
        },
        tooltipContent: {
          fontSize: 14,
          lineHeight: 1.5,
          padding: '8px 0',
        },
        buttonNext: {
          backgroundColor: 'hsl(var(--primary))',
          borderRadius: 8,
          padding: '8px 16px',
          fontSize: 14,
          fontWeight: 500,
        },
        buttonBack: {
          color: 'hsl(var(--muted-foreground))',
          marginRight: 8,
        },
        buttonSkip: {
          color: 'hsl(var(--muted-foreground))',
          fontSize: 13,
        },
        spotlight: {
          borderRadius: 8,
        },
        overlay: {
          mixBlendMode: 'normal' as const,
        },
      }}
      locale={{
        back: 'Anterior',
        close: 'Fechar',
        last: 'Finalizar',
        next: 'Próximo',
        skip: 'Pular tour',
      }}
    />
  );
};
