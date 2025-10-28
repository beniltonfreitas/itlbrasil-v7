import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ArticleQueue {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  source_url: string | null;
  source_name: string | null;
  category_id: string | null;
  feed_id: string | null;
  featured_image: string | null;
  tags: string[] | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string[] | null;
  read_time: number;
  import_mode: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

export const useArticlesQueue = (status?: string) => {
  return useQuery({
    queryKey: ['articles-queue', status],
    queryFn: async (): Promise<ArticleQueue[]> => {
      let query = supabase
        .from('articles_queue')
        .select('*')
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch articles queue: ${error.message}`);
      }

      return (data || []) as ArticleQueue[];
    },
  });
};

export const useApproveArticle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ articleId, userId }: { articleId: string; userId?: string }) => {
      // Get article from queue
      const { data: queueArticle, error: fetchError } = await supabase
        .from('articles_queue')
        .select('*')
        .eq('id', articleId)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch article: ${fetchError.message}`);
      }

      // Generate slug from title
      const slug = queueArticle.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();

      // Create article
      const { data: article, error: createError } = await supabase
        .from('articles')
        .insert([{
          title: queueArticle.title,
          content: queueArticle.content,
          excerpt: queueArticle.excerpt,
          slug: slug,
          source_url: queueArticle.source_url,
          source_name: queueArticle.source_name,
          category_id: queueArticle.category_id,
          featured_image: queueArticle.featured_image,
          tags: queueArticle.tags,
          meta_title: queueArticle.meta_title,
          meta_description: queueArticle.meta_description,
          meta_keywords: queueArticle.meta_keywords,
          read_time: queueArticle.read_time,
          import_mode: queueArticle.import_mode,
          status: 'published',
          published_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (createError) {
        throw new Error(`Failed to create article: ${createError.message}`);
      }

      // Update queue item
      const { error: updateError } = await supabase
        .from('articles_queue')
        .update({ 
          status: 'approved', 
          reviewed_at: new Date().toISOString(),
          reviewed_by: userId 
        })
        .eq('id', articleId);

      if (updateError) {
        throw new Error(`Failed to update queue: ${updateError.message}`);
      }

      return article;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles-queue'] });
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
};

export const useRejectArticle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ articleId, userId }: { articleId: string; userId?: string }) => {
      const { error } = await supabase
        .from('articles_queue')
        .update({ 
          status: 'rejected', 
          reviewed_at: new Date().toISOString(),
          reviewed_by: userId 
        })
        .eq('id', articleId);

      if (error) {
        throw new Error(`Failed to reject article: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles-queue'] });
    },
  });
};

export const useDeleteQueueArticle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (articleId: string) => {
      const { error } = await supabase
        .from('articles_queue')
        .delete()
        .eq('id', articleId);

      if (error) {
        throw new Error(`Failed to delete article: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles-queue'] });
    },
  });
};