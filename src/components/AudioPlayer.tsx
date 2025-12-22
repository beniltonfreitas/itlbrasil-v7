import React, { useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { stripHtml } from '@/lib/textUtils';

interface AudioPlayerProps {
  title: string;
  content: string;
  excerpt?: string | null;
  className?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  title,
  content,
  excerpt,
  className = '',
}) => {
  const { speak, pause, resume, stop, status, isSupported } = useTextToSpeech();

  const processedText = useMemo(() => {
    // Combine title, excerpt, and content with natural pauses
    const parts = [
      title,
      excerpt ? stripHtml(excerpt) : null,
      stripHtml(content),
    ].filter(Boolean);

    return parts.join('. ');
  }, [title, content, excerpt]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stop();
    };
  }, [stop]);

  const handlePlayPause = () => {
    if (status === 'idle' || status === 'ended') {
      speak(processedText);
    } else if (status === 'playing') {
      pause();
    } else if (status === 'paused') {
      resume();
    }
  };

  if (!isSupported) {
    return (
      <div className={`flex items-center gap-2 text-muted-foreground text-sm ${className}`}>
        <VolumeX className="w-4 h-4" />
        <span>Seu navegador não suporta leitura em áudio</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 py-3 border-y border-border ${className}`}>
      <Volume2 className="w-4 h-4 text-primary flex-shrink-0" />
      <span className="text-sm text-foreground font-medium">Versão em áudio</span>
      <Button
        onClick={handlePlayPause}
        size="sm"
        variant="ghost"
        className="h-7 px-3 text-xs gap-1.5 text-primary hover:text-primary hover:bg-primary/10"
        aria-label={status === 'playing' ? 'Pausar' : 'Reproduzir'}
      >
        {status === 'playing' ? (
          <>
            <Pause className="w-3.5 h-3.5" />
            Pausar
          </>
        ) : (
          <>
            <Play className="w-3.5 h-3.5" />
            {status === 'paused' ? 'Continuar' : 'Ouvir'}
          </>
        )}
      </Button>
      {status === 'playing' && (
        <span className="text-xs text-muted-foreground animate-pulse">
          Reproduzindo...
        </span>
      )}
      {status === 'paused' && (
        <span className="text-xs text-muted-foreground">
          Pausado
        </span>
      )}
    </div>
  );
};
