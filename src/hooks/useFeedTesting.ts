import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FeedTestResult {
  id: string;
  feed_id: string;
  test_date: string;
  status: string; // Alterado para string genérica para compatibilidade com Supabase
  http_status?: number | null;
  response_time_ms: number;
  error_message?: string | null;
  content_preview?: string | null;
  articles_found: number;
  last_article_date?: string | null;
  created_at: string;
}

export interface FeedWithTestResult {
  id: string;
  name: string;
  url: string;
  is_native: boolean;
  active: boolean;
  latest_test?: FeedTestResult;
}

// Hook para buscar resultados de teste dos feeds
export const useFeedTestResults = () => {
  return useQuery({
    queryKey: ['feed-test-results'],
    queryFn: async (): Promise<FeedTestResult[]> => {
      const { data, error } = await supabase
        .from('feed_test_results')
        .select('*')
        .order('test_date', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch test results: ${error.message}`);
      }

      return data || [];
    },
  });
};

// Hook para buscar feeds com seus últimos resultados de teste
export const useFeedsWithTestResults = () => {
  return useQuery({
    queryKey: ['feeds-with-test-results'],
    queryFn: async (): Promise<FeedWithTestResult[]> => {
      // Buscar todos os feeds nativos
      const { data: feeds, error: feedsError } = await supabase
        .from('rss_feeds')
        .select('id, name, url, is_native, active')
        .eq('is_native', true)
        .order('name');

      if (feedsError) {
        throw new Error(`Failed to fetch feeds: ${feedsError.message}`);
      }

      // Para cada feed, buscar o último resultado de teste
      const feedsWithTests: FeedWithTestResult[] = [];
      
      for (const feed of feeds) {
        const { data: testResult } = await supabase
          .from('feed_test_results')
          .select('*')
          .eq('feed_id', feed.id)
          .order('test_date', { ascending: false })
          .limit(1)
          .maybeSingle();

        feedsWithTests.push({
          ...feed,
          latest_test: testResult || undefined
        });
      }

      return feedsWithTests;
    },
  });
};

// Hook para testar um feed específico
export const useTestSingleFeed = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ feedId, feedUrl }: { feedId: string; feedUrl: string }) => {
      const { data, error } = await supabase.functions.invoke('test-rss-feed', {
        body: { feedId, feedUrl }
      });

      if (error) {
        throw new Error(`Erro ao testar feed: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['feed-test-results'] });
      queryClient.invalidateQueries({ queryKey: ['feeds-with-test-results'] });
    },
  });
};

// Hook para testar todos os feeds
export const useTestAllFeeds = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('test-rss-feed', {
        body: { testAll: true }
      });

      if (error) {
        throw new Error(`Erro ao testar todos os feeds: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['feed-test-results'] });
      queryClient.invalidateQueries({ queryKey: ['feeds-with-test-results'] });
    },
  });
};

// Hook para deletar feeds problemáticos
export const useDeleteProblematicFeeds = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (feedIds: string[]) => {
      const { error } = await supabase
        .from('rss_feeds')
        .delete()
        .in('id', feedIds);

      if (error) {
        throw new Error(`Erro ao deletar feeds: ${error.message}`);
      }

      return { deleted: feedIds.length };
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['rss-feeds'] });
      queryClient.invalidateQueries({ queryKey: ['feeds-with-test-results'] });
      queryClient.invalidateQueries({ queryKey: ['rss-feed-validation'] });
    },
  });
};

// Hook para reativar feeds selecionados
export const useReactivateFeeds = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (feedIds: string[]) => {
      const { error } = await supabase
        .from('rss_feeds')
        .update({ active: true })
        .in('id', feedIds);

      if (error) {
        throw new Error(`Erro ao reativar feeds: ${error.message}`);
      }

      return { reactivated: feedIds.length };
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['rss-feeds'] });
      queryClient.invalidateQueries({ queryKey: ['feeds-with-test-results'] });
    },
  });
};