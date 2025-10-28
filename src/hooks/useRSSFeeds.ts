import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RSSFeed {
  id: string;
  name: string;
  url: string;
  category_id?: string | null;
  is_native?: boolean;
  active: boolean;
  last_fetched?: string | null;
  created_at: string;
  updated_at: string;
}

export const useRSSFeeds = () => {
  return useQuery({
    queryKey: ['rss-feeds'],
    queryFn: async (): Promise<RSSFeed[]> => {
      const { data, error } = await supabase
        .from('rss_feeds')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch RSS feeds: ${error.message}`);
      }

      return (data || []) as RSSFeed[];
    },
  });
};

export const useCreateRSSFeed = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (feedData: Omit<RSSFeed, 'id' | 'created_at' | 'updated_at' | 'last_import'>) => {
      const { data, error } = await supabase
        .from('rss_feeds')
        .insert([feedData])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create RSS feed: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rss-feeds'] });
    },
  });
};

export const useUpdateRSSFeed = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<RSSFeed> & { id: string }) => {
      const { data, error } = await supabase
        .from('rss_feeds')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update RSS feed: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rss-feeds'] });
    },
  });
};

export const useDeleteRSSFeed = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('rss_feeds')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete RSS feed: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rss-feeds'] });
    },
  });
};