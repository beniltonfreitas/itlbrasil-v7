import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, VolumeX, Volume1, Headphones, X } from 'lucide-react';
import { useTextToSpeech, formatTime } from '@/hooks/useTextToSpeech';
import { stripHtml } from '@/lib/textUtils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Componente de ondas sonoras animadas
const SoundWaveAnimation: React.FC<{ isPlaying: boolean; mini?: boolean }> = ({ isPlaying, mini = false }) => {
  const bars = mini ? [1, 2, 3, 4] : [1, 2, 3, 4, 5];
  
  return (
    <div className={`flex items-center gap-[2px] ${mini ? 'h-3' : 'h-4'}`}>
      {bars.map((bar) => (
        <div
          key={bar}
          className={`${mini ? 'w-[2px]' : 'w-[3px]'} ${mini ? 'bg-primary-foreground' : 'bg-primary'} rounded-full transition-all ${
            isPlaying ? (mini ? 'sound-wave-bar-mini' : 'sound-wave-bar') : 'h-1'
          }`}
          style={{
            animationDelay: isPlaying ? `${(bar - 1) * 0.1}s` : '0s',
          }}
        />
      ))}
    </div>
  );
};

// Velocidades disponíveis
const SPEED_OPTIONS = [
  { value: 0.5, label: '0.5x' },
  { value: 0.75, label: '0.75x' },
  { value: 1, label: '1x' },
  { value: 1.25, label: '1.25x' },
  { value: 1.5, label: '1.5x' },
  { value: 2, label: '2x' },
];

interface AudioPlayerProps {
  title: string;
  content: string;
  excerpt?: string | null;
  className?: string;
}

// Sticky Player Component
const StickyPlayer: React.FC<{
  title: string;
  isPlaying: boolean;
  isPaused: boolean;
  progress: number;
  currentTime: number;
  estimatedDuration: number;
  volume: number;
  rate: number;
  onPlayPause: () => void;
  onClose: () => void;
  onVolumeChange: (volume: number) => void;
  onSpeedChange: (speed: number) => void;
}> = ({
  title,
  isPlaying,
  isPaused,
  progress,
  currentTime,
  estimatedDuration,
  volume,
  rate,
  onPlayPause,
  onClose,
  onVolumeChange,
  onSpeedChange,
}) => {
  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX className="h-3 w-3" />;
    if (volume < 0.5) return <Volume1 className="h-3 w-3" />;
    return <Volume2 className="h-3 w-3" />;
  };

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 bg-primary text-primary-foreground shadow-lg border-t border-primary-light animate-slide-in-bottom"
      role="region"
      aria-label="Player de áudio flutuante"
    >
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center gap-3">
          {/* Sound Wave Animation */}
          <div className="flex-shrink-0 w-8 flex justify-center">
            <SoundWaveAnimation isPlaying={isPlaying} mini />
          </div>

          {/* Title (truncated) */}
          <span className="text-sm font-medium truncate flex-shrink min-w-0 max-w-[200px] sm:max-w-none">
            {title}
          </span>

          {/* Play/Pause Button */}
          <Button
            onClick={onPlayPause}
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground flex-shrink-0"
            aria-label={isPlaying ? 'Pausar áudio' : 'Continuar áudio'}
          >
            {isPlaying ? (
              <Pause className="h-3.5 w-3.5" />
            ) : (
              <Play className="h-3.5 w-3.5 ml-0.5" />
            )}
          </Button>

          {/* Progress Bar */}
          <div className="flex-1 min-w-0 hidden sm:block">
            <Slider
              value={[progress]}
              max={100}
              step={1}
              className="w-full cursor-default [&>span:first-child]:bg-primary-foreground/30 [&_[role=slider]]:bg-primary-foreground [&>span:first-child>span]:bg-primary-foreground"
              disabled
              aria-label="Progresso do áudio"
            />
          </div>

          {/* Time Display */}
          <div className="flex items-center gap-1 text-xs text-primary-foreground/80 whitespace-nowrap">
            <span>{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(estimatedDuration)}</span>
          </div>

          {/* Speed Control */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-1.5 text-xs font-medium text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
              >
                {rate}x
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[70px]">
              {SPEED_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => onSpeedChange(option.value)}
                  className={`text-xs ${rate === option.value ? 'bg-primary/10 text-primary' : ''}`}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Volume Control - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onVolumeChange(volume === 0 ? 1 : 0)}
              className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              aria-label={volume === 0 ? 'Ativar som' : 'Silenciar'}
            >
              {getVolumeIcon()}
            </button>
            <Slider
              value={[volume * 100]}
              max={100}
              step={1}
              className="w-12 [&>span:first-child]:bg-primary-foreground/30 [&_[role=slider]]:bg-primary-foreground [&>span:first-child>span]:bg-primary-foreground"
              onValueChange={(value) => onVolumeChange(value[0] / 100)}
              aria-label="Controle de volume"
            />
          </div>

          {/* Close Button */}
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10 flex-shrink-0"
            aria-label="Fechar player"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  title,
  content,
  excerpt,
  className = '',
}) => {
  const playerRef = useRef<HTMLDivElement>(null);
  const [showSticky, setShowSticky] = useState(false);
  
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
    rate,
    setRate,
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

  const isPlaying = status === 'playing';
  const isPaused = status === 'paused';
  const isActive = isPlaying || isPaused;

  // Observer para detectar quando o player original sai da viewport
  useEffect(() => {
    if (!playerRef.current || !isActive) {
      setShowSticky(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowSticky(!entry.isIntersecting && isActive);
      },
      {
        threshold: 0,
        rootMargin: '-80px 0px 0px 0px',
      }
    );

    observer.observe(playerRef.current);

    return () => observer.disconnect();
  }, [isActive]);

  const handlePlayPause = useCallback(() => {
    if (status === 'idle' || status === 'ended') {
      speak(processedText);
    } else if (status === 'playing') {
      pause();
    } else if (status === 'paused') {
      resume();
    }
  }, [status, processedText, speak, pause, resume]);

  const handleSpeedChange = useCallback((speed: number) => {
    setRate(speed);
    // Se estiver reproduzindo, reinicia com a nova velocidade
    if (status === 'playing' || status === 'paused') {
      stop();
      setTimeout(() => speak(processedText), 100);
    }
  }, [status, setRate, stop, speak, processedText]);

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0] / 100);
  };

  const handleClose = useCallback(() => {
    stop();
    setShowSticky(false);
  }, [stop]);

  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX className="h-3.5 w-3.5" />;
    if (volume < 0.5) return <Volume1 className="h-3.5 w-3.5" />;
    return <Volume2 className="h-3.5 w-3.5" />;
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
    <>
      <div 
        ref={playerRef}
        className={`bg-secondary/50 dark:bg-secondary/30 border border-border rounded-lg px-4 py-3 ${className}`}
        role="region"
        aria-label="Player de áudio da notícia"
      >
        <div className="flex items-center gap-3">
          {/* Sound Wave Animation ou Headphones Icon */}
          <div className="flex-shrink-0 w-10 flex justify-center">
            {isPlaying ? (
              <SoundWaveAnimation isPlaying={isPlaying} />
            ) : (
              <Headphones className="h-5 w-5 text-primary" />
            )}
          </div>

          {/* Label */}
          <span className="text-sm font-medium text-foreground hidden sm:inline whitespace-nowrap">
            {isPlaying ? 'Ouvindo...' : isPaused ? 'Pausado' : 'Ouvir matéria'}
          </span>

          {/* Play/Pause Button */}
          <Button
            onClick={handlePlayPause}
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full border border-border bg-background hover:bg-primary hover:text-primary-foreground flex-shrink-0 transition-colors"
            aria-label={isPlaying ? 'Pausar áudio' : isPaused ? 'Continuar áudio' : 'Reproduzir áudio'}
          >
            {isPlaying ? (
              <Pause className="h-3.5 w-3.5" />
            ) : (
              <Play className="h-3.5 w-3.5 ml-0.5" />
            )}
          </Button>

          {/* Progress Bar */}
          <div className="flex-1 min-w-0">
            <Slider
              value={[progress]}
              max={100}
              step={1}
              className="w-full cursor-default"
              disabled
              aria-label="Progresso do áudio"
            />
          </div>

          {/* Time Display */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
            <span>{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(estimatedDuration)}</span>
          </div>

          {/* Speed Control */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                {rate}x
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[80px]">
              {SPEED_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => handleSpeedChange(option.value)}
                  className={`text-sm ${rate === option.value ? 'bg-primary/10 text-primary' : ''}`}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Volume Control - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => setVolume(volume === 0 ? 1 : 0)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label={volume === 0 ? 'Ativar som' : 'Silenciar'}
            >
              {getVolumeIcon()}
            </button>
            <Slider
              value={[volume * 100]}
              max={100}
              step={1}
              className="w-16"
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

      {/* Sticky Player */}
      {showSticky && (
        <StickyPlayer
          title={title}
          isPlaying={isPlaying}
          isPaused={isPaused}
          progress={progress}
          currentTime={currentTime}
          estimatedDuration={estimatedDuration}
          volume={volume}
          rate={rate}
          onPlayPause={handlePlayPause}
          onClose={handleClose}
          onVolumeChange={setVolume}
          onSpeedChange={handleSpeedChange}
        />
      )}
    </>
  );
};
