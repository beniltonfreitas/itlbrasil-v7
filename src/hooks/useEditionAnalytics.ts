import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EditionAnalytics {
  id: string;
  edition_id: string;
  event_type: string;
  pagina?: number;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export const useTrackEditionEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      editionId,
      eventType,
      pagina,
    }: {
      editionId: string;
      eventType: 'visualizacao' | 'pagina_lida' | 'download_pdf' | 'download_epub';
      pagina?: number;
    }) => {
      // Track via edge function
      const { data, error } = await supabase.functions.invoke('track-edition-analytics', {
        body: {
          edition_id: editionId,
          event_type: eventType,
          pagina,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['edition-metrics'] });
    },
  });
};

export const useEditionMetrics = (editionId?: string) => {
  return useQuery({
    queryKey: ['edition-metrics', editionId],
    enabled: !!editionId,
    queryFn: async () => {
      if (!editionId) return null;

      const { data, error } = await supabase
        .from('edition_analytics')
        .select('*')
        .eq('edition_id', editionId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calcular métricas
      const visualizacoes = data.filter(e => e.event_type === 'visualizacao').length;
      const downloadsPdf = data.filter(e => e.event_type === 'download_pdf').length;
      const downloadsEpub = data.filter(e => e.event_type === 'download_epub').length;

      // Páginas mais lidas
      const paginasLidas = data
        .filter(e => e.event_type === 'pagina_lida' && e.pagina)
        .reduce((acc, curr) => {
          const pagina = curr.pagina!;
          acc[pagina] = (acc[pagina] || 0) + 1;
          return acc;
        }, {} as Record<number, number>);

      return {
        visualizacoes,
        downloadsPdf,
        downloadsEpub,
        paginasLidas,
        eventos: data as EditionAnalytics[],
      };
    },
  });
};
