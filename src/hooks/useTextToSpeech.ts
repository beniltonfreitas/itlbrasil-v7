import { useState, useEffect, useCallback, useRef } from 'react';

export type SpeechStatus = 'idle' | 'playing' | 'paused' | 'ended';

interface UseTextToSpeechReturn {
  speak: (text: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  status: SpeechStatus;
  isSupported: boolean;
  rate: number;
  setRate: (rate: number) => void;
  volume: number;
  setVolume: (volume: number) => void;
  progress: number;
  currentTime: number;
  estimatedDuration: number;
}

// Average reading speed: ~150 words per minute
const WORDS_PER_MINUTE = 150;

const countWords = (text: string): number => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

const estimateDuration = (text: string): number => {
  const wordCount = countWords(text);
  return (wordCount / WORDS_PER_MINUTE) * 60; // Duration in seconds
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const useTextToSpeech = (): UseTextToSpeechReturn => {
  const [status, setStatus] = useState<SpeechStatus>('idle');
  const [rate, setRate] = useState(1.0);
  const [volume, setVolumeState] = useState(1.0);
  const [isSupported, setIsSupported] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [estimatedDuration, setEstimatedDuration] = useState(0);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const textRef = useRef<string>('');

  useEffect(() => {
    setIsSupported('speechSynthesis' in window);
    
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const startProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    progressIntervalRef.current = setInterval(() => {
      if (status === 'playing' && estimatedDuration > 0) {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        const adjustedElapsed = elapsed * rate; // Adjust for speech rate
        const newProgress = Math.min((adjustedElapsed / estimatedDuration) * 100, 100);
        setProgress(newProgress);
        setCurrentTime(Math.min(adjustedElapsed, estimatedDuration));
      }
    }, 100);
  }, [status, estimatedDuration, rate]);

  const stopProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!isSupported || !text) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    stopProgressTracking();

    // Store text and calculate duration
    textRef.current = text;
    const duration = estimateDuration(text) / rate;
    setEstimatedDuration(duration);
    setProgress(0);
    setCurrentTime(0);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = rate;
    utterance.pitch = 1.0;
    utterance.volume = volume;

    // Try to select a Brazilian Portuguese voice
    const voices = window.speechSynthesis.getVoices();
    const ptBRVoice = voices.find(v => v.lang === 'pt-BR') || 
                      voices.find(v => v.lang.startsWith('pt'));
    if (ptBRVoice) {
      utterance.voice = ptBRVoice;
    }

    utterance.onstart = () => {
      setStatus('playing');
      startTimeRef.current = Date.now();
      startProgressTracking();
    };
    
    utterance.onend = () => {
      setStatus('ended');
      setProgress(100);
      setCurrentTime(estimatedDuration);
      stopProgressTracking();
    };
    
    utterance.onerror = () => {
      setStatus('idle');
      stopProgressTracking();
    };
    
    utterance.onpause = () => {
      setStatus('paused');
      pausedTimeRef.current = Date.now();
      stopProgressTracking();
    };
    
    utterance.onresume = () => {
      setStatus('playing');
      // Adjust start time to account for paused duration
      startTimeRef.current += Date.now() - pausedTimeRef.current;
      startProgressTracking();
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSupported, rate, volume, startProgressTracking, stopProgressTracking]);

  const pause = useCallback(() => {
    if (isSupported && window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
    }
  }, [isSupported]);

  const resume = useCallback(() => {
    if (isSupported && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }, [isSupported]);

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setStatus('idle');
      setProgress(0);
      setCurrentTime(0);
      stopProgressTracking();
    }
  }, [isSupported, stopProgressTracking]);

  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(newVolume);
    if (utteranceRef.current) {
      utteranceRef.current.volume = newVolume;
    }
  }, []);

  return {
    speak,
    pause,
    resume,
    stop,
    status,
    isSupported,
    rate,
    setRate,
    volume,
    setVolume,
    progress,
    currentTime,
    estimatedDuration,
  };
};

export { formatTime };
