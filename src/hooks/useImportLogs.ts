import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ImportLog {
  id: string;
  feed_id: string | null;
  status: 'success' | 'error' | 'processing';
  articles_imported: number;
  error_message: string | null;
  import_mode: 'manual' | 'automatic' | null;
  started_at: string;
  completed_at: string | null;
  rss_feeds?: {
    name: string;
    url: string;
  };
}

export const useImportLogs = (limit: number = 50) => {
  return useQuery({
    queryKey: ['import-logs', limit],
    queryFn: async (): Promise<ImportLog[]> => {
      const { data, error } = await supabase
        .from('import_logs')
        .select(`
          *,
          rss_feeds:feed_id (
            name,
            url
          )
        `)
        .order('started_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to fetch import logs: ${error.message}`);
      }

      return (data || []) as ImportLog[];
    },
  });
};

export const useImportLogsByFeed = (feedId: string) => {
  return useQuery({
    queryKey: ['import-logs', 'feed', feedId],
    queryFn: async (): Promise<ImportLog[]> => {
      const { data, error } = await supabase
        .from('import_logs')
        .select('*')
        .eq('feed_id', feedId)
        .order('started_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch import logs for feed: ${error.message}`);
      }

      return (data || []) as ImportLog[];
    },
    enabled: !!feedId,
  });
};