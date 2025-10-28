import React, { useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, Square, Volume2, VolumeX } from 'lucide-react';
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

  const handleStop = () => {
    stop();
  };

  if (!isSupported) {
    return (
      <Card className={`p-4 bg-muted/50 ${className}`}>
        <div className="flex items-center gap-2 text-muted-foreground">
          <VolumeX className="w-5 h-5" />
          <span className="text-sm">
            Seu navegador não suporta a leitura em áudio
          </span>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-4 bg-card border ${className}`}>
      <div className="flex items-center gap-3">
        <Volume2 className="w-5 h-5 text-primary" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold mb-1">Versão em áudio</h3>
          <p className="text-xs text-muted-foreground">
            {status === 'playing' && 'Reproduzindo...'}
            {status === 'paused' && 'Pausado'}
            {(status === 'idle' || status === 'ended') && 'Ouça esta notícia'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handlePlayPause}
            size="sm"
            variant="default"
            className="gap-2"
            aria-label={status === 'playing' ? 'Pausar' : 'Reproduzir'}
          >
            {status === 'playing' ? (
              <>
                <Pause className="w-4 h-4" />
                Pausar
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                {status === 'paused' ? 'Continuar' : 'Ouvir'}
              </>
            )}
          </Button>
          {(status === 'playing' || status === 'paused') && (
            <Button
              onClick={handleStop}
              size="sm"
              variant="outline"
              aria-label="Parar"
            >
              <Square className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
