import React, { useState, useEffect, useMemo } from 'react';
import { stripHtml } from '@/lib/textUtils';
import { Loader2 } from 'lucide-react';

interface AudioPlayerNativeProps {
  title: string;
  content: string;
  excerpt?: string | null;
  className?: string;
}

export const AudioPlayerNative: React.FC<AudioPlayerNativeProps> = ({
  title,
  content,
  excerpt,
  className = '',
}) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Process text for TTS
  const processedText = useMemo(() => {
    const parts = [
      title,
      excerpt ? stripHtml(excerpt) : null,
      stripHtml(content),
    ].filter(Boolean);

    return parts.join('. ');
  }, [title, content, excerpt]);

  // Cleanup URL on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // Auto-generate audio on mount
  useEffect(() => {
    const generateAudio = async () => {
      if (isLoading || audioUrl) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          'https://kzbseckjublnjrxzktux.supabase.co/functions/v1/text-to-speech',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6YnNlY2tqdWJsbmpyeHprdHV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MzM2MzksImV4cCI6MjA3NDMwOTYzOX0.bmMbndzkIZRoiarRcoSMRrHYdVLqRkYYRUtofiYXOPE',
            },
            body: JSON.stringify({
              text: processedText,
              voice: 'alloy',
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Erro ao gerar áudio: ${response.status}`);
        }

        const audioBlob = await response.blob();
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      } catch (err) {
        console.error('Erro ao gerar áudio:', err);
        setError(err instanceof Error ? err.message : 'Erro ao gerar áudio');
      } finally {
        setIsLoading(false);
      }
    };

    generateAudio();
  }, [processedText]);

  return (
    <div className={className}>
      <p style={{ 
        fontSize: '14px', 
        fontWeight: 500, 
        marginBottom: '8px', 
        color: '#374151' 
      }}>
        Versão em áudio
      </p>

      {isLoading ? (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          color: '#6b7280',
          fontSize: '14px',
        }}>
          <Loader2 className="h-4 w-4 animate-spin" />
          Gerando áudio...
        </div>
      ) : error ? (
        <div style={{ color: '#dc2626', fontSize: '14px' }}>
          {error}
        </div>
      ) : audioUrl ? (
        <audio 
          controls 
          controlsList="nodownload"
          style={{ 
            width: '100%',
            height: '30px',
            borderRadius: '20px',
          }}
          preload="metadata"
        >
          <source src={audioUrl} type="audio/mpeg" />
          Seu navegador não suporta o elemento de áudio.
        </audio>
      ) : null}
    </div>
  );
};
