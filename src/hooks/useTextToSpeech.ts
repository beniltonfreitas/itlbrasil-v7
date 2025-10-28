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
}

export const useTextToSpeech = (): UseTextToSpeechReturn => {
  const [status, setStatus] = useState<SpeechStatus>('idle');
  const [rate, setRate] = useState(1.0);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setIsSupported('speechSynthesis' in window);
    
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback((text: string) => {
    if (!isSupported || !text) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = rate;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setStatus('playing');
    utterance.onend = () => setStatus('ended');
    utterance.onerror = () => setStatus('idle');
    utterance.onpause = () => setStatus('paused');
    utterance.onresume = () => setStatus('playing');

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setStatus('playing');
  }, [isSupported, rate]);

  const pause = useCallback(() => {
    if (isSupported && window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setStatus('paused');
    }
  }, [isSupported]);

  const resume = useCallback(() => {
    if (isSupported && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setStatus('playing');
    }
  }, [isSupported]);

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setStatus('idle');
    }
  }, [isSupported]);

  return {
    speak,
    pause,
    resume,
    stop,
    status,
    isSupported,
    rate,
    setRate,
  };
};
