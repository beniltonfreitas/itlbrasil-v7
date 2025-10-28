import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Author {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  email: string | null;
  avatar_url: string | null;
  social_links: any;
  created_at: string;
  updated_at: string;
  _count?: {
    articles: number;
  };
}

export interface CreateAuthorData {
  name: string;
  slug: string;
  bio?: string;
  email?: string;
  avatar_url?: string;
  social_links?: any;
}

export interface UpdateAuthorData extends CreateAuthorData {
  id: string;
}

export const useAuthors = () => {
  return useQuery({
    queryKey: ['authors'],
    queryFn: async (): Promise<Author[]> => {
      const { data, error } = await supabase
        .from('authors')
        .select('*')
        .order('name');

      if (error) {
        throw new Error(`Failed to fetch authors: ${error.message}`);
      }

      // Fetch article counts for each author
      const authorsWithCounts = await Promise.all(
        (data || []).map(async (author) => {
          const { count } = await supabase
            .from('articles')
            .select('id', { count: 'exact' })
            .eq('author_id', author.id)
            .not('published_at', 'is', null);

          return {
            ...author,
            _count: {
              articles: count || 0
            }
          };
        })
      );

      return authorsWithCounts;
    },
  });
};

export const useCreateAuthor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAuthorData): Promise<Author> => {
      const { data: author, error } = await supabase
        .from('authors')
        .insert([data])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create author: ${error.message}`);
      }

      return author;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authors'] });
      toast({
        title: "Sucesso",
        description: "Autor criado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateAuthor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateAuthorData): Promise<Author> => {
      const { data: author, error } = await supabase
        .from('authors')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update author: ${error.message}`);
      }

      return author;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authors'] });
      toast({
        title: "Sucesso",
        description: "Autor atualizado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteAuthor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('authors')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete author: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authors'] });
      toast({
        title: "Sucesso",
        description: "Autor excluído com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};