import React, { useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, VolumeX, Volume1 } from 'lucide-react';
import { useTextToSpeech, formatTime } from '@/hooks/useTextToSpeech';
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
  const { 
    speak, 
    pause, 
    resume, 
    stop, 
    status, 
    isSupported,
    volume,
    setVolume,
    progress,
    currentTime,
    estimatedDuration,
  } = useTextToSpeech();

  const processedText = useMemo(() => {
    const parts = [
      title,
      excerpt ? stripHtml(excerpt) : null,
      stripHtml(content),
    ].filter(Boolean);

    return parts.join('. ');
  }, [title, content, excerpt]);

  useEffect(() => {
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

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0] / 100);
  };

  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX className="h-4 w-4" />;
    if (volume < 0.5) return <Volume1 className="h-4 w-4" />;
    return <Volume2 className="h-4 w-4" />;
  };

  if (!isSupported) {
    return (
      <div className={`flex items-center gap-2 text-muted-foreground text-sm ${className}`}>
        <VolumeX className="w-4 h-4" />
        <span>Seu navegador não suporta leitura em áudio</span>
      </div>
    );
  }

  const isPlaying = status === 'playing';
  const isPaused = status === 'paused';

  return (
    <div 
      className={`bg-white dark:bg-gray-50 border border-gray-200 dark:border-gray-300 rounded p-4 my-6 ${className}`}
      role="region"
      aria-label="Player de áudio da notícia"
    >
      {/* Header */}
      <p className="text-xs font-medium text-gray-500 dark:text-gray-600 mb-3">
        Versão em áudio
      </p>

      {/* Player Controls */}
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <Button
          onClick={handlePlayPause}
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full border border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-200 flex-shrink-0"
          aria-label={isPlaying ? 'Pausar áudio' : isPaused ? 'Continuar áudio' : 'Reproduzir áudio'}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4 text-gray-700" />
          ) : (
            <Play className="h-4 w-4 text-gray-700 ml-0.5" />
          )}
        </Button>

        {/* Progress Section */}
        <div className="flex-1 min-w-0">
          {/* Progress Bar */}
          <Slider
            value={[progress]}
            max={100}
            step={1}
            className="w-full cursor-default"
            disabled
            aria-label="Progresso do áudio"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
          
          {/* Time Display */}
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span aria-label="Tempo decorrido">
              {formatTime(currentTime)}
            </span>
            <span aria-label="Duração total">
              {formatTime(estimatedDuration)}
            </span>
          </div>
        </div>

        {/* Volume Control - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => setVolume(volume === 0 ? 1 : 0)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label={volume === 0 ? 'Ativar som' : 'Silenciar'}
          >
            {getVolumeIcon()}
          </button>
          <Slider
            value={[volume * 100]}
            max={100}
            step={1}
            className="w-20"
            onValueChange={handleVolumeChange}
            aria-label="Controle de volume"
          />
        </div>
      </div>

      {/* Status indicator for screen readers */}
      <span className="sr-only" aria-live="polite">
        {isPlaying && 'Reproduzindo áudio'}
        {isPaused && 'Áudio pausado'}
        {status === 'ended' && 'Áudio finalizado'}
      </span>
    </div>
  );
};
