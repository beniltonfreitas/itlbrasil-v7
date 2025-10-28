import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AnalyticsData {
  id: string;
  event_type: string;
  article_id?: string;
  source?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface SiteStatistics {
  id: string;
  metric_name: string;
  metric_value: any;
  recorded_date: string;
  created_at: string;
}

export const useAnalyticsData = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['analytics-data', startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from('article_analytics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      
      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Erro ao carregar dados de analytics: ${error.message}`);
      }

      return data as AnalyticsData[];
    },
  });
};

export const useSiteStatistics = (period?: string) => {
  return useQuery({
    queryKey: ['site-statistics', period],
    queryFn: async () => {
      let query = supabase
        .from('site_statistics')
        .select('*')
        .order('recorded_date', { ascending: false });

      if (period === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        query = query.gte('recorded_date', weekAgo.toISOString().split('T')[0]);
      } else if (period === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        query = query.gte('recorded_date', monthAgo.toISOString().split('T')[0]);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Erro ao carregar estatísticas: ${error.message}`);
      }

      return data as SiteStatistics[];
    },
  });
};

export const useTrackEvent = () => {
  return useMutation({
    mutationFn: async (event: {
      event_type: string;
      article_id?: string;
      source?: string;
      metadata?: any;
    }) => {
      const { error } = await supabase.functions.invoke('collect-analytics', {
        body: event,
      });

      if (error) {
        console.error('Error tracking event:', error);
        throw error;
      }

      return true;
    },
  });
};

export const useCollectDailyStats = () => {
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.functions.invoke('collect-analytics', {
        body: { event_type: 'daily_stats' },
      });

      if (error) {
        throw new Error(`Erro ao coletar estatísticas: ${error.message}`);
      }

      return true;
    },
  });
};

// Hook para dados consolidados do dashboard
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Buscar estatísticas principais
      const [articlesResult, usersResult, subscribersResult, viewsResult] = await Promise.all([
        supabase.from('articles').select('id', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('newsletter_subscribers').select('id', { count: 'exact' }).eq('active', true),
        supabase.from('article_analytics').select('id', { count: 'exact' }).eq('event_type', 'page_view')
      ]);

      // Buscar artigos mais populares (últimos 30 dias)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: popularArticles } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          slug,
          views_count,
          created_at
        `)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('views_count', { ascending: false })
        .limit(5);

      // Estatísticas de crescimento (comparar com período anterior)
      const { data: recentViews } = await supabase
        .from('article_analytics')
        .select('created_at')
        .eq('event_type', 'page_view')
        .gte('created_at', thirtyDaysAgo.toISOString());

      return {
        totalArticles: articlesResult.count || 0,
        totalUsers: usersResult.count || 0,
        totalSubscribers: subscribersResult.count || 0,
        totalViews: viewsResult.count || 0,
        popularArticles: popularArticles || [],
        recentViews: recentViews || [],
        lastUpdated: new Date().toISOString(),
      };
    },
    refetchInterval: 5 * 60 * 1000, // Atualizar a cada 5 minutos
  });
};