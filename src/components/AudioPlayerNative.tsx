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
  const [hasRequested, setHasRequested] = useState(false);

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

  const generateAudio = async () => {
    if (isLoading || audioUrl) return;

    setIsLoading(true);
    setError(null);
    setHasRequested(true);

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
            voice: 'alloy', // Neutral voice for news
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

  return (
    <div 
      className={className}
      style={{
        margin: '16px 0 24px 0',
        padding: '12px 16px',
        border: '1px solid #e5e7eb',
        background: '#ffffff',
      }}
    >
      <p style={{ 
        fontSize: '14px', 
        fontWeight: 600, 
        marginBottom: '6px', 
        color: '#111827' 
      }}>
        Versão em áudio
      </p>

      {!hasRequested ? (
        <button
          onClick={generateAudio}
          style={{
            padding: '8px 16px',
            background: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#374151',
          }}
        >
          Clique para gerar áudio
        </button>
      ) : isLoading ? (
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
          <button
            onClick={generateAudio}
            style={{
              marginLeft: '12px',
              padding: '4px 12px',
              background: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            Tentar novamente
          </button>
        </div>
      ) : audioUrl ? (
        <audio 
          controls 
          style={{ width: '100%' }}
          preload="metadata"
        >
          <source src={audioUrl} type="audio/mpeg" />
          Seu navegador não suporta o elemento de áudio.
        </audio>
      ) : null}
    </div>
  );
};
