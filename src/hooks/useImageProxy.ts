import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useImageProxy = (originalUrl: string | null) => {
  const [cachedUrl, setCachedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!originalUrl || !originalUrl.startsWith('http')) {
      setCachedUrl(originalUrl);
      return;
    }

    // Se já for uma URL do Supabase, usa direto
    if (originalUrl.includes('supabase.co')) {
      setCachedUrl(originalUrl);
      return;
    }

    // ESTRATÉGIA OTIMIZADA: Tentar URL original primeiro
    // O navegador tem melhor suporte a CORS e autenticação de domínio
    // que chamadas de servidor. Só usar proxy se necessário.
    setCachedUrl(originalUrl);
    setIsLoading(false);
  }, [originalUrl]);

  return { cachedUrl, isLoading, error };
};
