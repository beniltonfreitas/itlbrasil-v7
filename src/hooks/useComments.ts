import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Comment {
  id: string;
  article_id: string;
  parent_id?: string;
  author_name: string;
  author_email: string;
  content: string;
  status: 'approved' | 'pending' | 'rejected';
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
  replies?: Comment[];
}

export const useArticleComments = (articleId: string) => {
  return useQuery({
    queryKey: ['article-comments', articleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('article_comments')
        .select('*')
        .eq('article_id', articleId)
        .eq('status', 'approved')
        .is('parent_id', null)
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(`Erro ao carregar comentários: ${error.message}`);
      }

      // Buscar respostas para cada comentário
      const commentsWithReplies = await Promise.all(
        (data || []).map(async (comment) => {
          const { data: replies } = await supabase
            .from('article_comments')
            .select('*')
            .eq('parent_id', comment.id)
            .eq('status', 'approved')
            .order('created_at', { ascending: true });

          return {
            ...comment,
            replies: replies || []
          };
        })
      );

      return commentsWithReplies as Comment[];
    },
  });
};

export const useAllComments = (status?: string) => {
  return useQuery({
    queryKey: ['all-comments', status],
    queryFn: async () => {
      let query = supabase
        .from('article_comments')
        .select(`
          *,
          articles!inner(title, slug)
        `)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Erro ao carregar comentários: ${error.message}`);
      }

      return data as (Comment & { articles: { title: string; slug: string } })[];
    },
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentData: {
      article_id: string;
      parent_id?: string;
      author_name: string;
      author_email: string;
      content: string;
    }) => {
      const { data, error } = await supabase
        .from('article_comments')
        .insert([{
          ...commentData,
          status: 'pending' as const, // Comentários começam pendentes
        }])
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao criar comentário: ${error.message}`);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['article-comments', data.article_id] });
      queryClient.invalidateQueries({ queryKey: ['all-comments'] });
    },
  });
};

export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Comment> & { id: string }) => {
      const { data, error } = await supabase
        .from('article_comments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao atualizar comentário: ${error.message}`);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['article-comments', data.article_id] });
      queryClient.invalidateQueries({ queryKey: ['all-comments'] });
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string) => {
      // Primeiro buscar o comentário para saber o article_id
      const { data: comment } = await supabase
        .from('article_comments')
        .select('article_id')
        .eq('id', commentId)
        .single();

      const { error } = await supabase
        .from('article_comments')
        .delete()
        .eq('id', commentId);

      if (error) {
        throw new Error(`Erro ao excluir comentário: ${error.message}`);
      }

      return { commentId, articleId: comment?.article_id };
    },
    onSuccess: (data) => {
      if (data.articleId) {
        queryClient.invalidateQueries({ queryKey: ['article-comments', data.articleId] });
      }
      queryClient.invalidateQueries({ queryKey: ['all-comments'] });
    },
  });
};

export const useBulkUpdateComments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { commentIds: string[]; status: 'approved' | 'rejected' }) => {
      const { error } = await supabase
        .from('article_comments')
        .update({ status: data.status })
        .in('id', data.commentIds);

      if (error) {
        throw new Error(`Erro ao atualizar comentários: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['article-comments'] });
      queryClient.invalidateQueries({ queryKey: ['all-comments'] });
    },
  });
};