import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GeneratedNews {
  noticias: Array<{
    categoria: string;
    titulo: string;
    slug: string;
    resumo: string;
    conteudo: string;
    imagem: string;
    tags: string[];
    seo: {
      meta_titulo: string;
      meta_descricao: string;
    };
  }>;
}

export const useJornalistaProTools = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateJson = async (urls: string[]): Promise<GeneratedNews> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke(
        'jornalista-pro-tools',
        {
          body: { urls },
        }
      );

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (!data || !data.noticias) {
        throw new Error('Formato de resposta inválido');
      }

      return data as GeneratedNews;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateJson,
    isLoading,
    error,
  };
};
