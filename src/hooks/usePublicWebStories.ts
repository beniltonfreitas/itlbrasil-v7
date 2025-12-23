import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PublicWebStory {
  id: string;
  title: string;
  slug: string;
  cover_image: string | null;
  views_count: number | null;
  created_at: string;
}

export const usePublicWebStories = (limit: number = 8) => {
  return useQuery({
    queryKey: ['public-webstories', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('webstories')
        .select('id, title, slug, cover_image, views_count, created_at')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as PublicWebStory[];
    },
  });
};
